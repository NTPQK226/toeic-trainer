# Ứng Dụng Ôn Luyện & Thi Thử TOEIC Writing Part 1 (100 Câu Chuẩn ETS)

Ứng dụng web chuyên sâu hỗ trợ ôn thi kỹ năng **TOEIC Writing Part 1: Write a Sentence Based on a Picture** (Viết 1 câu miêu tả bức tranh dựa trên 2 từ khoá cho trước), xây dựng dựa trên bộ tài liệu 100 câu trọn bộ của Cô Liên TOEIC (990/990 LR - 400/400 SW).

---

## 🚀 Hướng Dẫn Sử Dụng Nhanh

### Cách 1: Mở trực tiếp trên máy tính (Không cần cài đặt gì)
- Truy cập vào thư mục `toeic_writing_app/`.
- Nhấp đúp chuột vào tệp **`index.html`** để mở trên bất kỳ trình duyệt nào (Google Chrome, Microsoft Edge, Firefox, Brave...).

### Cách 2: Chạy qua Local Web Server
Mở Terminal hoặc PowerShell tại thư mục `toeic_writing_app/` và chạy lệnh:
```bash
python -m http.server 8080
```
Sau đó mở trình duyệt và truy cập: `http://localhost:8080`

### Cách 3: Đưa lên mạng Internet miễn phí qua Netlify (30 giây)
1. Truy cập trang web: [https://app.netlify.com/drop](https://app.netlify.com/drop) (đăng nhập hoặc tạo tài khoản Netlify miễn phí).
2. Kéo thả toàn bộ thư mục **`toeic_writing_app`** vào ô upload trên màn hình Netlify Drop.
3. Netlify sẽ cấp ngay cho bạn một đường link website trực tiếp (ví dụ: `https://toeic-writing-part1.netlify.app`) để bạn có thể học trên điện thoại hoặc máy tính bảng ở mọi nơi!

---

## 🌟 Các Tính Năng Nổi Bật

### 1. 2 Chế Độ Học & Thi Linh Hoạt:
- ⏱️ **Chế Độ Thi Thử 5 Câu (Full Test Simulation - Chuẩn ETS)**:
  - Chia sẵn 20 đề thi chuẩn (Test 01 đến Test 20), mỗi đề đúng 5 câu theo định dạng đề thi thật.
  - Đồng hồ đếm ngược 8 phút cho cả 5 câu (theo đúng chuẩn bài thi thật của Viện Khảo thí Giáo dục Hoa Kỳ ETS).
  - Tự do chuyển đổi qua lại giữa 5 câu trong 8 phút (nút Next/Prev hoặc bảng phím tắt Palette 1-5).
  - Tự động đếm số từ, cảnh báo trực tiếp nếu viết nhiều hơn 1 câu.
  - Nộp bài xuất ngay bảng điểm tổng kết (thang điểm 15), phân tích chi tiết từng câu, nhận xét ngữ pháp và câu mẫu chuẩn điểm 3.
- ⚡ **Chế Độ Chấm Điểm Ngay (Instant Practice)**:
  - Tự do luyện tập 100 câu hỏi theo từng chuyên đề: **Tranh Người (85 câu)** và **Tranh Vật & Cảnh (15 câu)**.
  - Hỗ trợ bộ lọc thông minh: *Tất cả*, *Chưa làm*, *Đạt điểm 3/3*, *Cần sửa lại*.
  - Ô tìm kiếm và nút "🎲 Ngẫu nhiên" giúp đổi mới cảm hứng luyện tập.
  - Bấm **"⚡ KIỂM TRA & CHẤM NGAY"** (hoặc phím tắt `Ctrl + Enter`) để nhận kết quả phân tích trong vòng 50 mili-giây.

### 2. Bộ Máy Chấm Điểm Tự Động Chuẩn Quy Khảo Thí ETS (0 - 3 Điểm):
- **3 Điểm (Tối đa)**: Sử dụng chính xác cả 2 từ khoá bắt buộc; đúng ngữ pháp, câu tự nhiên; liên quan chặt chẽ đến tranh; đúng định dạng 1 câu duy nhất.
- **2 Điểm**: Dùng được 2 từ khoá nhưng mắc lỗi nhỏ về ngữ pháp (chia thì, số ít/nhiều) HOẶC dùng 1 từ khoá với câu hoàn hảo.
- **1 Điểm**: Chỉ dùng được 1 từ khoá và câu còn nhiều lỗi ngữ pháp.
- **0 Điểm**: Bỏ trống, viết nhiều hơn 1 câu, hoặc câu không dùng từ khoá nào.

### 3. Nhận Diện Từ Khoá Thông Minh (Inflection & Morphology):
- Nhận diện linh hoạt các dạng biến đổi của từ khoá theo chuẩn ETS:
  - Chia thì: *shop &rarr; shopping / shopped*, *choose &rarr; choosing / chose / chosen*, *stand &rarr; standing / stood*.
  - Biến đổi số ít/nhiều: *woman &rarr; women*, *man &rarr; men*, *child &rarr; children*.
  - Cụm giới từ và cụm từ: *next to*, *in front of*, *wait for*.
  - Tự động sáng đèn xanh (`✓ matched`) ngay khi bạn gõ từ khoá vào khung viết!

### 4. Giao Diện & Tiện Ích Hiện Đại:
- Hỗ trợ đầy đủ **Dark Mode (Giao diện tối)** và **Light Mode (Giao diện sáng)**, tự động ghi nhớ sở thích của bạn.
- Bảng tra cứu **Thang điểm ETS** (Scoring Rubric) và **5 Bí kíp đạt điểm 3/3**.
- Ảnh chụp sắc nét chuẩn HD cho toàn bộ 100 câu hỏi.

---

## 📁 Cấu Trúc Mã Nguồn

```
toeic_writing_app/
├── index.html            # Giao diện chính của ứng dụng
├── styles.css            # Toàn bộ CSS, hệ thống màu sắc, hiệu ứng, Dark/Light mode
├── app.js                # Bộ điều khiển: Quản lý bài thi, đếm giờ 8 phút, xử lý sự kiện
├── evaluator.js          # Thuật toán chấm điểm chuẩn ETS (0-3đ), nhận diện ngữ pháp & từ khoá
├── toeic_data.js         # Dữ liệu 100 câu hỏi, từ khoá và đáp án mẫu dạng JavaScript Object
├── toeic_questions.json  # Dữ liệu JSON gốc của toàn bộ 100 câu hỏi
├── netlify.toml          # Cấu hình tối ưu hoá CDN khi deploy lên Netlify
├── README.md             # Tài liệu hướng dẫn sử dụng
└── images/               # Thư mục chứa 100 ảnh tranh cắt HD (q1.jpg đến q100.jpg)
```

