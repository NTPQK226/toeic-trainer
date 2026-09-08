import os
import io
import re
import sys
import json
import time
import pymupdf
from PIL import Image
import numpy as np
from itertools import groupby
from operator import itemgetter
from rapidocr_onnxruntime import RapidOCR

APP_DIR = r"D:\GIVEAWAY BỘ 100 CÂU TOEIC WRITING PART 1\toeic_writing_app"
JSON_PATH = os.path.join(APP_DIR, "toeic_questions.json")
JS_PATH = os.path.join(APP_DIR, "toeic_data.js")
PDF_PATH = r"D:\GIVEAWAY BỘ 100 CÂU TOEIC WRITING PART 1\ĐÁP ÁN GIVEAWAY BỘ 100 CÂU TOEIC WRITING PART 1 (final).pdf"

def clean_text(text):
    text = text.replace("caf?", "café").replace("caf ", "café ")
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def parse_keywords(kw_raw):
    kw_raw = clean_text(kw_raw)
    parts = [p.strip() for p in re.split(r'[/,]', kw_raw) if p.strip()]
    return parts

# Load existing progress if any
existing_questions = {}
if os.path.exists(JSON_PATH):
    try:
        with open(JSON_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            for item in data:
                if item.get("prompts") and len(item["prompts"]) > 0:
                    existing_questions[item["id"]] = item
        print(f"Found {len(existing_questions)} already extracted questions in {JSON_PATH}")
    except Exception as e:
        print(f"Error loading existing JSON: {e}")

doc = pymupdf.open(PDF_PATH)
engine = RapidOCR()

all_questions = []
global_q_id = 1

for page_idx in range(1, len(doc)): # Page 2 to 52 (0-indexed: 1 to 51)
    page_num = page_idx + 1
    page = doc[page_idx]
    
    # Determine category
    if page_idx < 44:
        category = "Tranh Người"
        category_id = "people"
        category_en = "People & Action"
        grammar_tip = "Sử dụng thì Hiện Tại Tiếp Diễn (S + is/are + V-ing) để miêu tả hành động đang diễn ra của nhân vật. Chú ý mạo từ (a/an/the) và giới từ chỉ nơi chốn."
    else:
        category = "Tranh Vật - Cảnh"
        category_id = "objects_scenes"
        category_en = "Objects & Scenery"
        grammar_tip = "Sử dụng Thể Bị Động (S + is/are + V3/ed hoặc has/have been + V3/ed) hoặc cụm giới từ chỉ vị trí để miêu tả trạng thái sắp đặt của đồ vật/cảnh vật."

    xref = page.get_images()[0][0]
    base_img = doc.extract_image(xref)
    img = Image.open(io.BytesIO(base_img["image"])).convert("RGB")
    
    # Detect horizontal lines
    arr = np.array(img.convert("L"))
    dark = arr < 100
    h_lines = np.where(np.sum(dark[:, 300:3000], axis=1) > 1400)[0]
    h_bands = []
    for k, g in groupby(enumerate(h_lines), lambda ix: ix[0] - ix[1]):
        group = list(map(itemgetter(1), g))
        h_bands.append(int(np.mean(group)))
    
    q_rows = []
    for i in range(len(h_bands) - 1):
        if h_bands[i + 1] - h_bands[i] > 300:
            q_rows.append((h_bands[i], h_bands[i + 1]))
            
    for y_top, y_bot in q_rows:
        qid = global_q_id
        global_q_id += 1
        
        # If already extracted, reuse
        if qid in existing_questions:
            all_questions.append(existing_questions[qid])
            print(f"[Q{qid:03d}] (Cached) Page {page_num}: {len(existing_questions[qid]['prompts'])} prompt set(s)", flush=True)
            continue
            
        row_h = y_bot - y_top
        # Single OCR crop: Col 3 (keywords) + Col 4 (answers)
        text_crop = img.crop((1475, y_top + 4, 3210, y_bot - 4))
        
        t0 = time.time()
        res, _ = engine(np.array(text_crop))
        dur = time.time() - t0
        
        kw_items = []
        ans_items = []
        
        if res:
            for box, text, score in res:
                min_x = min(pt[0] for pt in box)
                min_y = min(pt[1] for pt in box)
                cleaned = clean_text(text)
                if not cleaned:
                    continue
                # X boundary between col 3 and col 4 in cropped image is approx 680-720
                if min_x < 650:
                    kw_items.append((min_y, cleaned))
                else:
                    ans_items.append((min_y, cleaned))
                    
        kw_items.sort(key=lambda x: x[0])
        ans_items.sort(key=lambda x: x[0])
        
        # Determine prompt sets: Top (Y < cutoff) and Bottom (Y >= cutoff)
        cutoff_y = row_h * 0.42
        top_kws = [k[1] for k in kw_items if k[0] < cutoff_y]
        bot_kws = [k[1] for k in kw_items if k[0] >= cutoff_y]
        
        top_ans = [a[1] for a in ans_items if a[0] < cutoff_y]
        bot_ans = [a[1] for a in ans_items if a[0] >= cutoff_y]
        
        prompts = []
        if top_kws:
            kw_str = " ".join(top_kws)
            ans_str = " ".join(top_ans)
            prompts.append({
                "set_index": 1,
                "keywords_display": kw_str,
                "keywords": parse_keywords(kw_str),
                "sample_answer": ans_str
            })
            
        if bot_kws:
            kw_str = " ".join(bot_kws)
            ans_str = " ".join(bot_ans)
            prompts.append({
                "set_index": 2,
                "keywords_display": kw_str,
                "keywords": parse_keywords(kw_str),
                "sample_answer": ans_str
            })
            
        if not prompts and kw_items:
            kw_str = " ".join([k[1] for k in kw_items])
            ans_str = " ".join([a[1] for a in ans_items])
            prompts.append({
                "set_index": 1,
                "keywords_display": kw_str,
                "keywords": parse_keywords(kw_str),
                "sample_answer": ans_str
            })
            
        q_obj = {
            "id": qid,
            "page": page_num,
            "category": category,
            "category_id": category_id,
            "category_en": category_en,
            "image": f"images/q{qid}.jpg",
            "prompts": prompts,
            "grammar_tip": grammar_tip
        }
        
        all_questions.append(q_obj)
        print(f"[Q{qid:03d}] ({dur:.2f}s) Page {page_num}: {len(prompts)} prompt set(s) | KWS: {[p['keywords_display'] for p in prompts]}", flush=True)
        
        # Save after every question
        with open(JSON_PATH, "w", encoding="utf-8") as f:
            json.dump(all_questions, f, ensure_ascii=False, indent=2)

print(f"\nExtraction complete! Total questions: {len(all_questions)}", flush=True)

# Generate toeic_data.js
js_content = f"""/**
 * TOEIC Writing Part 1 - 100 Câu Thực Chiến
 * Phân loại:
 * - Câu 01 - 85: Tranh Người (People & Action)
 * - Câu 86 - 100: Tranh Vật - Cảnh (Objects & Scenery)
 */
window.TOEIC_PART1_QUESTIONS = {json.dumps(all_questions, ensure_ascii=False, indent=2)};
"""

with open(JS_PATH, "w", encoding="utf-8") as f:
    f.write(js_content)

print(f"Generated {JS_PATH} successfully!", flush=True)

