# Kế Hoạch Triển Khai: Tích Hợp Bộ Đề SEC (55 Câu Mới), Sửa Dark Mode & Chuẩn Hóa Icon

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Tích hợp 55 câu hỏi mới từ tài liệu Word thành Bộ Đề SEC (11 đề thi chuẩn Đề SEC 01 - Đề SEC 11), khắc phục triệt để lỗi màu sắc tương phản nền vàng chữ trắng ở Dark Mode, và thay thế toàn bộ emoji sang hệ thống icon SVG vector / nhãn text chuẩn.

**Architecture:** Sử dụng pipeline Python tự động cắt gọn ảnh (loại bỏ dải viền chữ) và xuất chuẩn dữ liệu JSON/JS gắn nhãn `set: "sec"`. Nâng cấp `app.js` hỗ trợ phân nhóm `<optgroup>` cho Full Test Mode và bộ lọc bộ đề trong Practice Mode. Cập nhật CSS variables cho Dark Mode đạt chuẩn tương phản WCAG AA và thay thế emoji trong HTML/JS bằng inline SVG vector.

**Tech Stack:** Vanilla JavaScript (ES6+), HTML5, CSS3, Python (zipfile, xml, Pillow để crop ảnh chất lượng cao).

---

## Các Nhiệm Vụ Triển Khai (Bite-Sized Tasks)

### Task 1: Pipeline Trích Xuất & Biên Soạn Dữ Liệu 55 Câu Mới (Bộ Đề SEC)
- **Tệp tạo/sửa:**
  - Tạo script: `scratch/process_sec_questions.py`
  - Sinh 55 ảnh: `toeic_writing_app/images/q101.jpg` đến `q155.jpg`
  - Cập nhật dữ liệu: `toeic_writing_app/toeic_questions.json` và `toeic_writing_app/toeic_data.js`
- **Chi tiết:**
  - Cắt viền chữ khỏi ảnh gốc, lưu ảnh chụp người/cảnh sắc nét dạng JPG.
  - Biên soạn câu mẫu chuẩn 3/3 điểm ETS miêu tả sát thực tế bức tranh.
  - Phân loại chính xác Tranh Người vs Tranh Vật - Cảnh kèm Grammar Tip.
  - Đánh số ID từ 101 đến 155, gắn nhãn `set: "sec"`, `sec_id: 1` đến `55`.

### Task 2: Khắc Phục Triệt Để Lỗi Màu Nền Vàng Chữ Trắng Ở Dark Mode
- **Tệp sửa:** `toeic_writing_app/styles.css`
- **Chi tiết:**
  - Định nghĩa lại các biến `--accent`, `--accent-light`, `--warning`, `--warning-light` trong selector `[data-theme="dark"]`.
  - Thiết lập nền tối tương phản cao: `--accent-light: rgba(245, 158, 11, 0.15)`, chữ sáng rõ ràng `#f8fafc` hoặc `#fde68a`.
  - Đảm bảo các khối `.grammar-tip-box`, `.score-2`, `.warning` đọc rõ ràng trên cả 2 giao diện Sáng và Tối.

### Task 3: Chuẩn Hóa Hệ Thống Icon Vector SVG & Text (Loại Bỏ Emoji)
- **Tệp sửa:** `toeic_writing_app/index.html`, `toeic_writing_app/app.js`, `toeic_writing_app/styles.css`
- **Chi tiết:**
  - Thay thế các emoji trên thanh tiêu đề: Thang điểm (Clipboard SVG), Bí kíp (Lightbulb SVG), Giao diện (Sun/Moon SVG), AI (Sparkles SVG).
  - Thay thế các emoji trong tab điều hướng và nút bấm: Play SVG cho "Bắt Đầu Bài Thi", Clock SVG cho đếm ngược, Arrow SVG cho chuyển câu.
  - Thay thế emoji trong phần thống kê viết: Chuyển sang dạng nhãn text gọn gàng `Từ: 0 | Ký tự: 0 | Câu: 0`.
  - Thay thế các emoji trong Chế độ Luyện tập và Báo cáo tổng kết: Search SVG, Dice/Shuffle SVG, Check/Cross SVG, Trophy SVG.

### Task 4: Nâng Cấp Logic Ứng Dụng Hỗ Trợ Bộ Đề SEC
- **Tệp sửa:** `toeic_writing_app/app.js`, `toeic_writing_app/index.html`
- **Chi tiết:**
  - Cập nhật hàm `populateTestSelect()` để hiển thị 2 nhóm `<optgroup>`:
    - Nhóm 1: `Bộ 100 Câu Cơ Bản` (Đề thi số 01 - Đề thi số 20)
    - Nhóm 2: `Bộ Đề SEC (55 Câu Mới)` (Đề SEC 01 - Đề SEC 11)
  - Cập nhật huy hiệu góc câu hỏi trong bài thi: hiển thị rõ `[SEC] Đề 01 • Câu 1/5` đối với bài thi bộ SEC.
  - Cập nhật Chế độ Luyện tập: Thêm bộ lọc `Bộ đề SEC` và hiển thị badge `SEC` cạnh nhãn thể loại tranh.

### Task 5: Kiểm Thử Tự Động & Xác Minh Toàn Diện
- Kiểm tra tính toàn vẹn của 155 câu hỏi trong JSON/JS (không trùng lặp, đầy đủ từ khoá, sample answers).
- Kiểm tra toàn bộ 55 tệp ảnh `q101.jpg` đến `q155.jpg` tồn tại và hiển thị chuẩn.
- Kiểm tra chức năng thi thử Đề SEC 01 đến Đề SEC 11 (8 phút, nộp bài, tính điểm).
- Xác minh độ tương phản trực quan ở cả Dark Mode và Light Mode.

