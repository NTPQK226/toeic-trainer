# Kế Hoạch Deploy — TOEIC Trainer (Free & Nhanh)

**Repo:** `NTPQK226/toeic-trainer` (private)
**Netlify project (đã có sẵn):** `toeictraining` → `https://toeictraining.netlify.app`
**Site ID:** `734e3d40-895f-467f-ad61-10c2f2da177a`
**Kiến trúc:** static site thuần (không build step, không framework). **Publish dir = `toeic_writing_app/`**.

---

## 1. Quan trọng — Drop folder NÀO?

> ⚠️ **Chỉ drop folder `toeic_writing_app`** (chứa `index.html`, `part2/`, `images/`, `_headers`, `netlify.toml`).
> **KHÔNG drop folder gốc `D:\GIVEAWAY BỘ 100 CÂU TOEIC...`** — folder gốc chứa PDF & tài liệu nguồn → sẽ bị **lộ trên web** và URL bị sai (`/toeic_writing_app/index.html` thay vì `/`).

Khi drop đúng folder `toeic_writing_app`:
- `/` → Part 1 (code mới, 155 câu + Part switcher)
- `/part2/` → Part 2 (50 đề email)
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

## 6. Đổi nền tảng sau này (nếu muốn)

| Nền tảng | CI/CD | Chi phí | Ghi chú |
|---|---|---|---|
| **Netlify** (đang dùng) | GitHub Actions | Free | Đã có `_headers`/`netlify.toml` |
| Cloudflare Pages | GitHub Actions | Free | Cực nhanh toàn cầu |
| GitHub Pages | Actions | Free | Site public dù repo private |
| Vercel | GitHub Actions | Free | Tốt nếu thêm framework sau |

> Đổi nền tảng chỉ cần đổi workflow — source không đổi (static site).

---

## 7. Việc cần làm

- [x] Dọn PDF khỏi bản deploy (chỉ drop `toeic_writing_app`)
- [x] Xoá `_redirects` catch-all gây lỗi `/part2/`
- [x] Thêm `_headers` (bảo mật + cache) — Drop-friendly
- [x] Workflow CI/CD trỏ đúng Site ID `734e3d40-...`
- [ ] **(Bạn thao tác)** Drop folder `toeic_writing_app` vào project `toeictraining` (Cách 1) — hoặc thêm 2 secrets + push để chạy CI/CD (Cách 2)
