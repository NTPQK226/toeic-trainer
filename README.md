# TOEIC Trainer — Luyện thi TOEIC Writing (Part 1, 2 & 3)

Ứng dụng web tĩnh luyện thi **TOEIC Writing** chuẩn ETS, gồm **155 câu Part 1 (Mô tả tranh)**, **30 đề Part 2 (Viết email)** và **bộ đề Part 3 (Opinion Essay / Q8)**. Chạy hoàn toàn trên trình duyệt, không cần server — deploy miễn phí lên Netlify / Cloudflare / GitHub Pages.

> ⚠️ **Bản quyền:** Dữ liệu trong repo chỉ gồm **mã nguồn ứng dụng**. Tài liệu PDF đề gốc & file trích xuất thô KHÔNG được đưa lên (đã loại qua `.gitignore`).

---

## ✨ Tính năng

- **Part 1 — Mô Tả Tranh:** 155 câu (Bộ 100 câu cơ bản + Bộ đề SEC 55 câu), chấm theo thang ETS **0–3**, chế độ thi thử 5 câu / 8 phút.
- **Part 2 — Viết Email:** 30 đề (10 SEC + 20 kinh doanh), giao diện "email client" thực tế, chấm theo thang ETS **0–4**, thi thử 2 câu (Q6 & Q7) / 20 phút.
- **Part 3 — Viết Bài Luận (Opinion Essay, Q8):** bộ đề opinion essay chuẩn ETS, chấm theo thang **0–5**, thi thử 1 bài / 30 phút, theme **xanh lá** đặc trưng. *(Đang dùng 2 đề mẫu — chờ bổ sung đề thật.)*
- **Giám khảo AI Gemini (tuỳ chọn):** chấm thông minh, gợi ý viết lại chuẩn bản xứ. Người dùng tự dán API key miễn phí từ [Google AI Studio](https://aistudio.google.com/app/apikey) — key chỉ lưu trong trình duyệt (LocalStorage).
- **Responsive:** tối ưu cho điện thoại, máy tính bảng & desktop.
- **Chế độ sáng/tối** đồng bộ giữa 3 phần (Part 1 xanh dương • Part 2 tím • Part 3 xanh lá).

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
├── ui_feedback.js      # Toast & confirm dialog dùng chung (thay alert/confirm)
├── images/             # 155 ảnh tranh q1.jpg–q155.jpg
├── part2/              # Part 2 (30 đề viết email) — cấu trúc tương tự
├── part3/              # Part 3 (Opinion Essay Q8, 0–5, theme xanh lá) — cấu trúc tương tự
└── netlify.toml        # Cấu hình header/bảo mật cho Netlify
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

Repo đã **public** → dễ dàng dùng Blueprint/CI của mọi nền tảng. Xem hướng dẫn đầy đủ tại **[docs/plans/deploy.md](docs/plans/deploy.md)**.

> ⚠️ **Quan trọng:** luôn publish **folder `toeic_writing_app`** làm root. Không publish folder gốc repo (chứa PDF/tài liệu nguồn) vì sẽ bị lộ file trên web.

**Nền tảng 1 — Netlify:** `https://toeictraining.netlify.app` (Site ID `734e3d40-895f-467f-ad61-10c2f2da177a`).
- *Netlify Drop:* kéo thả folder `toeic_writing_app` → project `toeictraining`.
- *CI/CD:* workflow `.github/workflows/deploy-netlify.yml` — push `main` tự deploy. Cần secrets `NETLIFY_AUTH_TOKEN` + `NETLIFY_SITE_ID`.

**Nền tảng 2 — Render (static site, miễn phí):** `https://toeic-trainer.onrender.com`
- File **`render.yaml`** đã sẵn sàng (`runtime: static`, `staticPublishPath: ./toeic_writing_app`).
- Vào <https://dashboard.render.com> → **New → Blueprint** → chọn repo `NTPQK226/toeic-trainer` → Render tự tạo site & auto-deploy mỗi push.

> **Static hay full web?** App này là **static thuần** (không server/DB) nên dùng **Static Site** là đúng & miễn phí. Chỉ cần "web service" nếu sau này thêm backend.

## 🔐 Lưu ý bảo mật

- **Không còn API key Gemini hardcode** trong source. Mỗi người dùng tự nhập key của họ (miễn phí) qua nút **cấu hình AI**.
- Header bảo mật (`X-Frame-Options`, `X-Content-Type-Options`…) thiết lập trong `toeic_writing_app/_headers` + `netlify.toml` + `render.yaml`.
