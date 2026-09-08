# TOEIC Trainer — Luyện thi TOEIC Writing (Part 1 & Part 2)

Ứng dụng web tĩnh luyện thi **TOEIC Writing** chuẩn ETS, gồm **155 câu Part 1 (Mô tả tranh)** và **50 đề Part 2 (Viết email)**. Chạy hoàn toàn trên trình duyệt, không cần server — deploy miễn phí lên Netlify / Cloudflare / GitHub Pages.

> ⚠️ **Bản quyền:** Dữ liệu trong repo chỉ gồm **mã nguồn ứng dụng**. Tài liệu PDF đề gốc & file trích xuất thô KHÔNG được đưa lên (đã loại qua `.gitignore`).

---

## ✨ Tính năng

- **Part 1 — Mô Tả Tranh:** 155 câu (Bộ 100 câu cơ bản + Bộ đề SEC 55 câu), chấm theo thang ETS **0–3**, chế độ thi thử 5 câu / 8 phút.
- **Part 2 — Viết Email:** 50 đề, giao diện "email client" thực tế, chấm theo thang ETS **0–4**, thi thử 2 câu (Q6 & Q7) / 20 phút.
- **Giám khảo AI Gemini (tuỳ chọn):** chấm thông minh, gợi ý viết lại chuẩn bản xứ. Người dùng tự dán API key miễn phí từ [Google AI Studio](https://aistudio.google.com/app/apikey) — key chỉ lưu trong trình duyệt (LocalStorage).
- **Responsive:** tối ưu cho điện thoại, máy tính bảng & desktop.
- **Chế độ sáng/tối** đồng bộ giữa Part 1 & Part 2.

## 📁 Cấu trúc

```
toeic_writing_app/
├── index.html          # Part 1 (155 câu mô tả tranh)
├── app.js              # Controller Part 1
├── evaluator.js        # Engine chấm điểm offline Part 1 (0–3)
├── llm_evaluator.js    # Giám khảo AI Gemini Part 1
├── custom_select.js    # Component dropdown tuỳ chỉnh (dùng chung)
├── toeic_data.js       # Dữ liệu 155 câu (window.TOEIC_PART1_QUESTIONS)
├── styles.css          # Giao diện Part 1 (Light/Dark + Responsive)
├── images/             # 155 ảnh tranh q1.jpg–q155.jpg
├── part2/              # Part 2 (50 đề viết email) — cấu trúc tương tự
├── netlify.toml        # Cấu hình header/bảo mật cho Netlify
└── _redirects          # SPA fallback
```

## 🚀 Chạy local

1. **Cách đơn giản:** mở thẳng `toeic_writing_app/index.html` bằng trình duyệt.
2. **Live Server (khuyên dùng):** cài extension *Live Server* của VS Code → mở `toeic_writing_app/` → bấm *Go Live*.
3. **Python:**
   ```bash
   cd toeic_writing_app
   python -m http.server 8080
   # mở http://localhost:8080
   ```

## 🌐 Deploy & CI/CD

Xem hướng dẫn đầy đủ tại **[docs/plans/deploy.md](docs/plans/deploy.md)** — gồm workflow GitHub Actions `deploy-netlify.yml` deploy tự động mỗi lần push lên nhánh `main`, **không tốn build minutes của Netlify**.

Tóm tắt nhanh:

1. **Tạo site Netlify** (1 lần):
   ```bash
   cd toeic_writing_app
   npx netlify-cli sites:create --name toeic-trainer
   ```
   Ghi lại **Site ID** hiển thị.
2. **Lấy token:** vào <https://app.netlify.com/user/applications#personal-access-tokens> → *New access token*.
3. **Thêm secrets vào GitHub repo** (Settings → Secrets and variables → Actions):
   - `NETLIFY_AUTH_TOKEN` = token ở bước 2
   - `NETLIFY_SITE_ID` = Site ID ở bước 1
4. **Push lên `main`** → GitHub Actions tự deploy. Đường dẫn deploy mặc định: `https://toeic-trainer.netlify.app`

> Mẹo: nếu muốn site đổi tên sau khi tạo, dùng `npx netlify-cli sites:rename`.

## 🔐 Lưu ý bảo mật

- **Không còn API key Gemini hardcode** trong source. Mỗi người dùng tự nhập key của họ (miễn phí) qua nút **cấu hình AI**.
- Các header bảo mật (`X-Frame-Options`, `X-Content-Type-Options`…) được thiết lập trong `netlify.toml`.
