# TOEIC Writing Trainer — Part 1, Part 2 & Part 3 (Chuẩn ETS)

Ứng dụng web tĩnh (không cần server) luyện thi & chấm điểm **TOEIC Writing**:

- **Part 1 — Photos (Mô Tả Tranh):** **155 câu** (Bộ 100 câu cơ bản + **Bộ đề SEC 55 câu mới**). Thi thử 5 câu / 8 phút, chấm thang **0–3**.
- **Part 2 — Email (Viết Email):** **30 đề** chuẩn khảo thí (Q6 & Q7), giao diện email client thực tế. Thi thử 2 câu / 20 phút, chấm thang **0–4**.
- **Part 3 — Essay (Viết Bài Luận):** **Đề thi Question 8** (Opinion Essay), giao diện soạn thảo thi thật, đếm từ, chấm thang **0–5**.

Mọi dữ liệu & thuật toán chấm điểm chạy hoàn toàn trên trình duyệt. Tuỳ chọn bật **Giám khảo AI Gemini** để chấm thông minh hơn (người dùng tự nhập API key miễn phí).

---

## 🚀 Hướng dẫn sử dụng nhanh

### Cách 1: Mở trực tiếp (không cần cài gì)
- Vào thư mục `toeic_writing_app/` → nhấp đúp **`index.html`** (hoặc `part2/index.html` cho Part 2, `part3/index.html` cho Part 3).

### Cách 2: Local web server (khuyên dùng khi phát triển)
```bash
cd toeic_writing_app
python -m http.server 8080
# mở http://localhost:8080
```
Hoặc dùng extension **Live Server** trong VS Code.

### Cách 3: Deploy miễn phí có CI/CD (Netlify + GitHub Actions)
Xem hướng dẫn đầy đủ tại `docs/plans/deploy.md` (ở thư mục gốc repo). Tóm tắt:
1. `npx netlify-cli sites:create --name toeic-trainer` → lấy **Site ID**.
2. Tạo **access token** tại <https://app.netlify.com/user/applications#personal-access-tokens>.
3. Thêm secrets `NETLIFY_AUTH_TOKEN` & `NETLIFY_SITE_ID` vào GitHub repo.
4. Push lên `main` → workflow `.github/workflows/deploy-netlify.yml` tự deploy (không tốn build minutes Netlify).

---

## 🌟 Tính năng nổi bật

### Part 1 — Photos (0–3 điểm)
- **155 câu:** Bộ cơ bản (Q1–100) + Bộ đề SEC (Q101–155), kèm badge `SEC` và bộ lọc riêng.
- **Thi thử chuẩn ETS:** 5 câu / 8 phút, đếm ngược, bảng palette 1–5, tổng kết /15.
- **Chấm điểm ngay:** lọc theo bộ đề, chủ đề (`Tranh Người`, `Tranh Vật & Cảnh`), trạng thái đã làm; tìm kiếm từ khoá & nút ngẫu nhiên.
- **Chấm tự động chuẩn ETS:** nhận diện biến đổi từ khoá (chia thì, số nhiều: *shop → shopping*, *woman → women*), đèn xanh khi gõ đúng từ khoá.
- **Thang điểm:** 3 (dùng đủ 2 từ khoá, 1 câu, đúng ngữ pháp) · 2 (1 lỗi nhỏ) · 1 · 0.

### Part 2 — Email (0–4 điểm)
- **30 đề** chuẩn ETS chất lượng cao (10 đề SEC + 20 đề kinh doanh thực tế phong phú), có bài mẫu chuẩn Score 4/4 (100–125 từ).
- Giao diện **email client** mô phỏng thật: người gửi, người nhận, tiêu đề, nội dung.
- Chấm theo 4 tiêu chí ETS: *Hoàn thành yêu cầu*, *Cấu trúc*, *Từ vựng & Ngữ pháp*, *Giọng điệu*.

### Part 3 — Essay (0–5 điểm)
- Viết bài luận trình bày quan điểm (Opinion Essay) cho **Question 8** chuẩn ETS (30 phút, tối thiểu 300 từ).
- Chấm theo tiêu chí ETS thang điểm 0–5, phân tích cấu trúc luận điểm & hỗ trợ giám khảo AI.

### Giám khảo AI Gemini (tuỳ chọn, miễn phí)
- Chấm thông minh, phân tích lỗi chi tiết, gợi ý **viết lại chuẩn bản xứ**.
- Bấm nút **cấu hình AI** → dán API key miễn phí từ [Google AI Studio](https://aistudio.google.com/app/apikey).
- **Bảo mật:** key chỉ lưu trong LocalStorage trình duyệt của bạn — không có key hardcode trong source.

### Giao diện
- **Responsive:** tối ưu cho điện thoại, máy tính bảng và desktop (không tràn ngang, dropdown vừa khung, textarea ≥16px tránh iOS zoom).
- **Sáng / Tối:** đồng bộ giữa Part 1, Part 2 & Part 3 (mặc định sáng).

---

## 📁 Cấu trúc mã nguồn

```
toeic_writing_app/
├── index.html            # Part 1 — Photos (155 câu)
├── app.js                # Controller Part 1 (thi thử, chấm ngay, timer 8 phút)
├── evaluator.js          # Engine chấm điểm offline Part 1 (0–3)
├── llm_evaluator.js      # Giám khảo AI Gemini Part 1
├── custom_select.js      # Component dropdown dùng chung
├── toeic_data.js         # Dữ liệu 155 câu (window.TOEIC_PART1_QUESTIONS)
├── toeic_questions.json  # Bản sao JSON của dữ liệu (dự phòng fallback)
├── styles.css            # Giao diện Part 1 (Light/Dark + Responsive)
├── images/               # 155 ảnh tranh q1.jpg – q155.jpg
├── netlify.toml          # Header bảo mật & cache khi deploy Netlify
├── _redirects            # SPA fallback cho Netlify
├── part2/
│   ├── index.html        # Part 2 — Email (30 đề)
│   ├── app_p2.js         # Controller Part 2
│   ├── evaluator_p2.js   # Engine chấm điểm offline Part 2 (0–4)
│   ├── llm_evaluator_p2.js # Giám khảo AI Gemini Part 2
│   ├── part2_data.js     # Dữ liệu 30 đề chuẩn ETS
│   └── styles_p2.css     # Giao diện Part 2 (Light/Dark + Responsive)
└── part3/
    ├── index.html        # Part 3 — Essay (Question 8)
    ├── app_p3.js         # Controller Part 3
    ├── evaluator_p3.js   # Engine chấm điểm offline Part 3 (0–5)
    ├── llm_evaluator_p3.js # Giám khảo AI Gemini Part 3
    ├── part3_data.js     # Dữ liệu đề thi Essay
    └── styles_p3.css     # Giao diện Part 3 (Light/Dark + Responsive)
```


