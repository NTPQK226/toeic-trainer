# Kế Hoạch Deploy — TOEIC Trainer (Free & Nhanh)

**Repo:** `NTPQK226/toeic-trainer` (public)
**Kiến trúc:** static site thuần (không build step, không framework). **Publish dir = `toeic_writing_app/`** (root: Part 1, `/part2/`, `/part3/`).

**2 nền tảng hỗ trợ (đều miễn phí):**

| Nền tảng | URL | Trạng thái |
|---|---|---|
| **Netlify** | `https://toeictraining.netlify.app` (Site ID `734e3d40-895f-467f-ad61-10c2f2da177a`) | Đang chạy |
| **Render** (xem mục 6) | `https://toeic-trainer.onrender.com` | Sẵn sàng qua `render.yaml` |

---

## 1. Quan trọng — Drop folder NÀO?

> ⚠️ **Chỉ drop folder `toeic_writing_app`** (chứa `index.html`, `part2/`, `images/`, `_headers`, `netlify.toml`).
> **KHÔNG drop folder gốc `D:\GIVEAWAY BỘ 100 CÂU TOEIC...`** — folder gốc chứa PDF & tài liệu nguồn → sẽ bị **lộ trên web** và URL bị sai (`/toeic_writing_app/index.html` thay vì `/`).

Khi drop đúng folder `toeic_writing_app`:
- `/` → Part 1 (code mới, 155 câu + Part switcher)
- `/part2/` → Part 2 (30 đề email)
- Không còn file PDF nào trên web.

---

## 2. Cách 1 — Deploy thủ công bằng Netlify Drop (nhanh nhất)

1. Mở <https://app.netlify.com/drop> (đã đăng nhập team `NTPQK226's team`).
2. Kéo thả **folder `toeic_writing_app`** vào vùng drop.
3. Chọn **"Add to an existing project"** → chọn project **`toeictraining`** (thay vì tạo mới) để giữ nguyên domain `toeictraining.netlify.app`.
4. Đợi vài giây → xong.

> Header bảo mật & cache nằm trong `toeic_writing_app/_headers` → được Netlify tự áp dụng dù drop bằng cách nào.
> `_redirects` catch-all (`/* /index.html 200`) **đã bị xoá** vì nó phá đường dẫn `/part2/`.

---

## 3. Cách 2 — CI/CD tự động (GitHub Actions → Netlify CLI)

Workflow đã commit: `.github/workflows/deploy-netlify.yml`. Mỗi push lên `main` sẽ upload `toeic_writing_app/` lên đúng project `toeictraining`.

### Cấu hình 1 lần (~3 phút)

1. **Tạo access token:** vào <https://app.netlify.com/user/applications#personal-access-tokens> → *New access token* (đặt tên `github-actions`) → copy.
2. **Thêm secrets vào GitHub** (repo `NTPQK226/toeic-trainer` → Settings → Secrets and variables → Actions):

| Secret | Giá trị |
|---|---|
| `NETLIFY_AUTH_TOKEN` | token ở bước 1 |
| `NETLIFY_SITE_ID` | `734e3d40-895f-467f-ad61-10c2f2da177a` (đã có sẵn) |

3. **Push để kích hoạt:**
   ```bash
   git add -A && git commit -m "ci: trigger deploy" && git push
   ```
4. Vào GitHub → tab **Actions** → workflow *Deploy to Netlify* chạy xanh → site đã cập nhật.

> Vì app là static thuần, workflow chỉ **upload file** (không chạy build Netlify) → **không tốn build minutes của Netlify**. Dùng GitHub Actions minutes free (2000 phút/tháng cho repo private).

---

## 4. Deploy thủ công bằng CLI (khi cần)

```bash
cd "d:\GIVEAWAY BỘ 100 CÂU TOEIC WRITING PART 1\toeic_writing_app"
npx netlify-cli login          # đăng nhập 1 lần
npx netlify-cli deploy --prod --dir=. --site 734e3d40-895f-467f-ad61-10c2f2da177a
```

---

## 5. Vận hành sau deploy

- **Kiểm tra nhanh:**
  - `https://toeictraining.netlify.app/` → Part 1 mới.
  - `https://toeictraining.netlify.app/part2/` → Part 2.
  - Thử mở `/GIVEAWAY...pdf` → phải **404** (đã hết PDF).
- **Rollback:** Netlify → tab *Deploys* → chọn bản cũ → *Publish deploy*.
- **Domain riêng:** Netlify → *Domain settings* → thêm domain (SSL tự động).
- **Staging mỗi PR (tuỳ chọn):** thêm job thứ 2 deploy không `--prod` → link preview `https://<hash>--toeictraining.netlify.app`.

---

## 6. Deploy bằng Render (Static Site — thêm, miễn phí)

App là **static thuần** nên Render serve thẳng qua CDN, không cần build — **free** (kèm hạn mức băng thông/pipline theo Hobby plan). File cấu hình đã có sẵn: **`render.yaml`** ở gốc repo.

```yaml
services:
  - type: web
    name: toeic-trainer
    runtime: static
    repo: https://github.com/NTPQK226/toeic-trainer
    branch: main
    buildCommand: echo "Static site - no build step"
    staticPublishPath: ./toeic_writing_app
    headers:
      - path: /*
        name: X-Frame-Options
        value: DENY
      # ... (thêm X-Content-Type-Options, cache ảnh...)
    routes:
      - type: redirect
        source: /toeic_writing_app/*
        destination: /:splat
        status: 301
```

### Cấu hình 1 lần (~2 phút)
1. Vào <https://dashboard.render.com> → đăng ký bằng GitHub (cho phép truy cập repo `toeic-trainer`).
2. **New → Blueprint** → chọn repo `NTPQK226/toeic-trainer`.
3. Render đọc `render.yaml` → tạo static site `toeic-trainer` → URL: `https://toeic-trainer.onrender.com`.
4. Mỗi lần **push lên `main`** Render tự deploy lại (atomic, cache invalidation tự động).

### Kết quả sau khi deploy
- `https://toeic-trainer.onrender.com/` → Part 1
- `https://toeic-trainer.onrender.com/part2/` → Part 2
- `https://toeic-trainer.onrender.com/part3/` → Part 3
- Tài liệu PDF không bao giờ được publish (folder gốc không nằm trong `staticPublishPath`).

> **Static hay full web?** — Dùng **Static** là đúng & tối ưu cho app này (không có server/DB). "Full web" (web service) chỉ cần nếu sau này thêm backend/API. Không cần thiết ở đây.

---

## 7. Đổi nền tảng sau này (nếu muốn)

| Nền tảng | CI/CD | Chi phí | Ghi chú |
|---|---|---|---|
| **Netlify** (đang chạy) | GitHub Actions / Drop | Free | `_headers` + `netlify.toml` |
| **Render** (đã thêm) | Tự động qua `render.yaml` | Free | Static site CDN, URL `onrender.com` |
| Cloudflare Pages | GitHub Actions | Free | Cực nhanh toàn cầu |
| GitHub Pages | Actions | Free | Chỉ site public |
| Vercel | GitHub Actions | Free | Tốt nếu thêm framework sau |

> Đổi nền tảng chỉ cần đổi workflow/config — source không đổi (static site).

---

## 8. Việc cần làm

- [x] Dọn PDF khỏi bản deploy (chỉ publish `toeic_writing_app`)
- [x] Xoá `_redirects` catch-all gây lỗi `/part2/`
- [x] Thêm `_headers` (bảo mật + cache)
- [x] Workflow CI/CD Netlify trỏ đúng Site ID `734e3d40-...`
- [x] Thêm `render.yaml` (Render static site)
- [ ] **(Bạn thao tác)** Push lên `main` → GitHub Actions tự deploy Netlify
- [ ] **(Bạn thao tác)** Tạo Blueprint trên Render (mục 6) nếu muốn dùng thêm Render
