# Thiết Kế Chi Tiết: Tích Hợp Bộ Đề SEC (55 Câu Mới) & Nâng Cấp UI Giao Diện

**Ngày tạo:** 2026-09-09  
**Chủ đề:** Tích hợp 55 câu hỏi mới từ tài liệu Word (`Copy of WP1 FULL (55 tranh).docx`) thành Bộ Đề SEC, sửa lỗi màu sắc tương phản Dark Mode và thay thế toàn bộ emoji thành icon chuẩn SVG/text.

---

## 1. Mục Tiêu & Phạm Vi
1. **Dữ liệu:**
   - Trích xuất 55 câu hỏi và hình ảnh từ tài liệu Word của người dùng.
   - Cắt viền (crop) phần ảnh chụp người/vật sạch sẽ (loại bỏ lề trắng và từ khoá in sẵn trên ảnh gốc).
   - Biên soạn câu mẫu đạt điểm tối đa 3/3 chuẩn ETS và lời khuyên ngữ pháp (Grammar Tip) cho cả 55 câu.
   - Gắn nhãn bộ đề rõ ràng: `set: "sec"`, `set_name: "Bộ đề SEC"` (ID 101 - 155), phân biệt với bộ 100 câu cơ bản (`set: "core"`).
2. **Trải nghiệm người dùng & Giao diện:**
   - **Full Test Mode:** Phân nhóm `<optgroup>` trong danh sách chọn đề:
     - Nhóm 1: `Bộ 100 Câu Cơ Bản` (Đề 01 - Đề 20)
     - Nhóm 2: `Bộ Đề SEC (55 Câu)` (Đề SEC 01 - Đề SEC 11)
     - Hiển thị badge `SEC` nổi bật trong quá trình làm bài và trong báo cáo kết quả.
   - **Practice Mode:**
     - Bổ sung bộ lọc Bộ đề: `Tất cả` | `Bộ 100 Câu` | `Bộ Đề SEC`.
     - Danh sách chọn câu có tiền tố `[SEC 01] Câu 101 - keyword1 / keyword2`.
   - **Sửa lỗi Dark Mode:**
     - Khắc phục triệt để lỗi nền vàng chữ trắng ở `.grammar-tip-box` và các khối cảnh báo/điểm 2 trong chế độ nền tối bằng cách định nghĩa biến `--accent-light` và `--warning-light` với độ tương phản cao chuẩn WCAG AA (`rgba(245, 158, 11, 0.15)` và chữ sáng `#fef3c7`).
   - **Thay thế Icon/Emoji:**
     - Loại bỏ toàn bộ emoji thiếu đồng bộ (📋, 💡, 🌙, ⏱️, ⚡, 📝, 🔤, 📌, 👁️, 🔄, 🎲, 🏆...) thành icon chuẩn vector SVG (Lucide/React Icon style) hoặc text nhãn rõ ràng, tinh tế.

---

## 2. Kiến Trúc Dữ Liệu Bộ Đề SEC

Mỗi câu hỏi từ 101 đến 155 được cấu trúc chuẩn hóa:
```json
{
  "id": 101,
  "sec_id": 1,
  "set": "sec",
  "set_name": "Bộ đề SEC",
  "page": 1,
  "category": "Tranh Người",
  "category_id": "people",
  "category_en": "People & Action",
  "image": "images/q101.jpg",
  "prompts": [
    {
      "set_index": 1,
      "keywords_display": "before / bus",
      "keywords": ["before", "bus"],
      "sample_answer": "The passengers are waiting in line before boarding the bus."
    }
  ],
  "grammar_tip": "Sử dụng thì Hiện Tại Tiếp Diễn (S + is/are + V-ing) kết hợp liên từ chỉ thời gian 'before' để miêu tả trình tự hành động."
}
```

---

## 3. Kiến Trúc UI & Xử Lý Giao Diện

### 3.1. Sửa Lỗi Tương Phản Dark Mode
Trong `styles.css`:
```css
[data-theme="dark"] {
  --accent: #fbbf24;
  --accent-light: rgba(245, 158, 11, 0.15);
  --warning: #fbbf24;
  --warning-light: rgba(245, 158, 11, 0.15);
}

.grammar-tip-box {
  background: var(--accent-light);
  border-left: 4px solid var(--accent);
  color: var(--text-main);
}
[data-theme="dark"] .grammar-tip-box {
  color: #f8fafc;
}
```

### 3.2. Hệ Thống SVG Icons Chuẩn (Lucide Style)
Thay thế toàn bộ emoji bằng inline SVG:
- **Clipboard / Rubric:** `<svg ... viewBox="0 0 24 24"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>`
- **Lightbulb / Tips:** `<svg ... viewBox="0 0 24 24">...</svg>`
- **Theme (Sun / Moon):** `<svg ... viewBox="0 0 24 24">...</svg>`
- **Play (Bắt đầu thi):** `<svg ... viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`
- **Clock (Đồng hồ 8 phút):** `<svg ... viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`
- **Stats (Từ, ký tự, câu):** Text hiển thị trực tiếp và rõ ràng: `Từ: 0 | Ký tự: 0 | Câu: 0`
- **Trophy / Star / Check / Eye / Refresh:** Vector sắc nét, chuyên nghiệp.

---

## 4. Kế Hoạch Triển Khai Tiếp Theo
Chuyển sang bước lập Implementation Plan chi tiết theo skill `writing-plans`.

