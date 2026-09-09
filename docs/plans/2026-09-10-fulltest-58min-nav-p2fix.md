# Full Writing Test 58' + Nav Dropdown + P2 ETS 10'/10' — Rollout Log (2026-09-10)

## UX Overhaul (round 2, theo feedback người dùng)
- **Kế thừa CSS hiện tại**: `fulltest/index.html` link `../styles.css` trước rồi `styles_full.css` (override) — toast/confirm/modal/custom-select/timer/nav dùng chung, đồng bộ với các trang part. `styles_full.css` viết lại gọn (chỉ phần layout fulltest + accent màu part).
- **Bỏ emoji**: dẹp hết emoji màu khỏi fulltest (setup/exam/report). Legend dùng chấm màu (`.lg-dot`), nút random dùng icon SVG, nhãn câu trơn. Chỗ quan trọng mới dùng SVG (như nav).
- **AI chấm đã đúng**: fulltest giờ **load 3 file `llm_evaluator*`** (trước thiếu nên luôn chấm local). AI mặc định BẬT + key hệ thống sẵn có. Thêm **modal Cấu hình AI** (giống 3 part). Sửa ảnh P1 khi gọi LLM: prefix `../` vào `question.image`. Verify: chạy thật → báo cáo **20/28, est 160/200** (P1 9/15, P2 8/8, P3 3/5), ghi "AI Gemini chấm chi tiết".
- **Màu nền/UI**: badge part dùng pill màu nhẹ + nền thẻ trắng + **viền top màu phân biệt 3 part + hover nâng**; report hero trung tính (không còn xanh đậm); block-intro trắng. Header fulltest có **đủ 5 nút action** (AI/Luật thi/Hướng dẫn/Góp ý/Theme).
- **0 điểm → 0/200** (bỏ sàn 30 cũ). **Toast/confirm** giờ có style đúng (top-center, không còn chữ đen trôi góc).
- Responsive test: 390/768/1366 không tràn; exam topbar về 1 cột ở mobile.

## Tóm tắt
Big update lần này gồm 3 nhóm chức năng, đã triển khai & verify trên Live Server:

### 1. Full Writing Test mới — `toeic_writing_app/fulltest/`
Trang thi thử đủ **3 phần / 8 câu (Q1–Q8)** theo đúng luật thời gian ETS:
- **Chọn đề**: 3 dropdown riêng (P1 31 đề: 20 core + 11 SEC; P2 15 đề: 5 SEC + 10 core; P3 30 đề) + nút random từng part + "Đề Ngẫu Nhiên Toàn Bộ" + legend luật ETS (8/10/10/30, tổng 58').
- **Đang thi (exam-strict)**: 4 khối thời gian (Part1 Q1–5 chung 8:00 bấm qua lại tự do; Q6 riêng 10:00; Q7 riêng 10:00; Q8 riêng 30:00). Chuyển phần/hết giờ → **khóa vĩnh viễn các câu trước**, không quay lại. Khóa điều hướng header khi đang thi + cảnh báo rời trang. Không chấm/feedback trong lúc thi.
- **Báo cáo (sau nộp)**: điểm thô **x/28** (P1 /15, P2 /8, P3 /5) + **thang 0–200 ước tính** (ghi rõ không chính thức vì ETS không công bố bảng quy đổi; 0 điểm = 0/200). Mở rộng chi tiết từng câu: feedback, tiêu chí, bài mẫu — chỉ hiện sau khi nộp. **AI Gemini tự chấm chi tiết khi nộp** (có sẵn key hệ thống, fallback local nếu lỗi).
- Kiến trúc: import lại 3 file data + 3 evaluator + custom_select + ui_feedback (`../`); **không** load app*.js của từng part. Ảnh P1 render bằng `'../'+q.image`.

Files mới:
- `toeic_writing_app/fulltest/index.html`
- `toeic_writing_app/fulltest/styles_full.css`
- `toeic_writing_app/fulltest/fulltest.js`

### 2. Nav gọn lại (cả 4 trang: P1/P2/P3 + fulltest)
Thay 3 tab part hiện hữu bằng **1 dropdown hover/click** (`.part-dropdown` → menu dọc 3 part, active đánh dấu ✓, transition mượt, ẩn khi không hover) + **nút CTA "Full Writing Test"** cạnh đó (gradient màu part; mobile ≤560px hiện "Full 58'").
- Sửa: `index.html`, `part2/index.html`, `part3/index.html` (+ HTML dropdown + inline PartNav script) và `styles.css`, `part2/styles_p2.css`, `part3/styles_p3.css` (thêm CSS nav v2 + responsive @1240/@960/@560/@480).
- CSS cũ `.part-switcher`/`.part-tab` còn lại trong sheet là vô hại (không còn phần tử).

### 3. Sửa chế độ Thi Thử P2 cho đúng ETS (mỗi câu 10 phút)
- `part2/app_p2.js`: bỏ đồng hồ chung 20:00 → **Q6 & Q7 mỗi câu đồng hồ riêng 10:00** (`testTimers[2]`, `testLocks[2]`, `TEST_Q_SECONDS=600`).
- Chỉ đồng hồ câu **đang active** chạy; chuyển câu thì tạm dừng câu kia (giữ nguyên thời gian còn lại).
- Hết 10' Q6 (đang active) → **khóa Q6**, đẩy sang Q7 (Q7 giữ đồng hồ riêng). Hết 10' Q7 → **tự nộp**. Cả 2 hết → tự nộp.
- Vẫn **bấm qua lại Q6/Q7 tự do** khi chưa khóa (người dùng chọn "không khóa, chỉ tách đồng hồ").
- Palette Q6/Q7 hiện thời gian còn lại từng câu (`.test-timer-caption` chips, active/locked); nút khóa có `.locked` (gạch đứt, disable).
- Nhãn: "Thi Thử 2 Câu (10p+10p)", timer khởi tạo 10:00.
- `part2/index.html` + `part2/styles_p2.css` cập nhật tương ứng.

## Luật ETS đã xác minh (IIBC/ETS)
- Q1–5: 8 phút chung, bấm qua lại trong khối, hết giờ/chuyển là khóa.
- Q6 & Q7: **mỗi câu 10 phút riêng**, không quay lại sau khi chuyển.
- Q8: 30 phút riêng. Tổng task-time = 58:00 ("about 60" gồm ~2 phút hướng dẫn).
- Điểm thô: Q1–5 0–3 ×5 = 15; Q6–7 0–4 ×2 = 8; Q8 0–5 = 5 → 28. Quy đổi 0–200 không công bố → app hiện ước tính (chú thích rõ).

## Verify (Live Server 127.0.0.1:5500)
- Nav 3 part dropdown + CTA đúng trên P1/P2/P3/fulltest; hover/click mở, active ✓, không overflow 390px.
- Fulltest: chọn đề đủ số lượng, Start gated; Q1–5 tự do, khóa đúng khi chuyển (dots disabled); Q6/Q7/Q8 từng khối 10/10/30; nộp → report x/28 + est 0–200; mở chi tiết từng câu OK; Làm Lại/Đề Mới/Về chọn OK; khóa nav khi đang thi + beforeunload OK.
- P2: 2 đồng hồ 10' độc lập xác minh (Q6 đứng yên khi ở Q7; Q7 chạy); Q6 hết giờ khóa + đẩy Q7; không console error.
- Các trang P1/P2/P3 sau khi sửa nav chạy bình thường, không lỗi console.

## Lưu ý triển khai
- `fulltest.js` từng dính lỗi `await` trong `.forEach` → đã đổi sang `for`. `node --check` là chuẩn để xác minh; TS server trong VS Code có thể vẫn báo false-positive "await" dòng ~855 dù chạy tốt — bỏ qua.
- `renderQuestion` KHÔNG được gọi `saveCurrentAnswer()` (textarea cũ chứa text câu trước); lưu live qua input handler, handler chuyển câu tự lưu trước khi đổi activeQ.
- `renderReportLoading` chỉ ghi đè innerHTML của `#reportRawScore`, không ghi đè `.rh-raw`.
