# Kế Hoạch Deploy — TOEIC Trainer (Free & Nhanh)

**Repo:** `NTPQK226/toeic-trainer` (private) · **Kiến trúc:** static site thuần (không build step, không framework).

---

## 1. Tóm tắt chiến lược (đã chọn)

| Hạng mục | Lựa chọn | Vì sao |
|---|---|---|
| Nền tảng | **Netlify** | Free, CDN toàn cầu, custom domain, HTTPS tự động, 100 GB băng thông/tháng |
| CI/CD | **GitHub Actions → Netlify CLI** | Push là deploy. **Không tốn build minutes của Netlify** (chỉ upload file tĩnh). Dùng GitHub Actions minutes free của repo private (2000 phút/tháng) |
| Thời gian deploy | ~20–40 giây | App static, không cài dependency |
| Chi phí | **$0** | Netlify free + GitHub Actions free |
| Dữ liệu nhạy cảm | Loại khỏi repo | PDF gốc, `extracted/`, `temp_inspect/` đã nằm trong `.gitignore` |

### Vì sao không tốn "build minutes" Netlify?
- App **không có framework/build step** → không cần Netlify chạy pipeline build.
- Workflow chỉ gọi `netlify-cli deploy --dir=toeic_writing_app --prod` để **upload thẳng file** lên CDN Netlify qua API.
- Hệ quả: deploy không giới hạn lượt trong gói free (chỉ giới hạn băng thông 100 GB/tháng).

---

## 2. Workflow CI/CD (đã tạo sẵn)

File: `.github/workflows/deploy-netlify.yml`

```yaml
on:
  push:
    branches: [main]
  workflow_dispatch:      # cho phép deploy thủ công từ tab Actions

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - name: Deploy to Netlify (production)
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
        run: npx --yes netlify-cli@17 deploy --dir=toeic_writing_app --prod
```

> Workflow này **đã được commit & push** lên repo. Chỉ cần làm xong bước 3–4 bên dưới là lần push tới sẽ tự deploy.

---

## 3. Cấu hình một lần (5 phút)

### 3.1 Tạo site Netlify

```bash
cd "d:\GIVEAWAY BỘ 100 CÂU TOEIC WRITING PART 1\toeic_writing_app"
npx netlify-cli login
npx netlify-cli sites:create --name toeic-trainer
```

Kết quả hiện ra gồm **Site ID** (dạng `xxxxxxxx-xxxx-...`) và URL mặc định `https://toeic-trainer.netlify.app`.

> Nếu chưa có Node, cài tại <https://nodejs.org> (bản LTS).
> Không cài `netlify-cli` global — dùng `npx` là đủ.

### 3.2 Tạo Personal Access Token (1 lần)

1. Vào <https://app.netlify.com/user/applications#personal-access-tokens>
2. Bấm **New access token**, đặt tên `github-actions`, copy giá trị.

### 3.3 Thêm Secrets vào GitHub (Settings → Secrets and variables → Actions → New repository secret)

| Secret | Giá trị |
|---|---|
| `NETLIFY_AUTH_TOKEN` | Token ở bước 3.2 |
| `NETLIFY_SITE_ID` | Site ID ở bước 3.1 |

### 3.4 Push để kích hoạt

```bash
git add -A && git commit -m "ci: trigger deploy" && git push
```

Vào **Actions** của repo → workflow *Deploy to Netlify* chạy → xong mở URL site.

---

## 4. Deploy thủ công (khi cần)

- **Từ GitHub:** vào tab **Actions** → *Deploy to Netlify* → **Run workflow**.
- **Từ máy local:**
  ```bash
  cd toeic_writing_app
  npx netlify-cli deploy --prod --dir=. --auth $env:NETLIFY_AUTH_TOKEN --site $env:NETLIFY_SITE_ID
  ```

---

## 5. Tuỳ chọn nâng cao (khuyến nghị sau khi chạy ổn)

- **Domain riêng:** Netlify → *Domain settings* → thêm domain bạn sở hữu (free SSL tự động). Có thể mua domain `.com` ~$10/năm nếu muốn.
- **Phòng thủ "staging" tự động cho mỗi PR:** thêm job thứ 2 trong workflow chạy `netlify-cli deploy` (không có `--prod`) → Netlify trả link preview dạng `https://<hash>--toeic-trainer.netlify.app`. Mặc định đã có ở dạng deploy preview nếu bạn connect GitHub qua Netlify UI.
- **Rollback:** Netlify giữ lịch sử deploy — tab *Deploys* → chọn bản cũ → *Publish deploy*.

---

## 6. Nếu sau này muốn đổi nền tảng (so sánh nhanh)

| Nền tảng | CI/CD | Chi phí | Ghi chú |
|---|---|---|---|
| **Netlify** | GitHub Actions (đã setup) | Free | Đã có header bảo mật trong `netlify.toml` |
| Cloudflare Pages | GitHub Actions | Free | Cực nhanh toàn cầu, không giới hạn bandwidth |
| GitHub Pages | Actions `actions/deploy-pages` | Free | Site public dù repo private; không cần tài khoản Netlify |
| Vercel | GitHub Actions | Free | Tốt nếu sau này thêm framework |

> Chuyển nền tảng chỉ cần đổi workflow — source không đổi (static site).

---

## 7. Danh sách việc cần làm còn lại

- [ ] Tạo Netlify site (bước 3.1) → lấy Site ID
- [ ] Tạo access token (bước 3.2)
- [ ] Thêm 2 secrets vào GitHub (bước 3.3)
- [ ] Push 1 commit bất kỳ → xác nhận workflow chạy xanh
- [ ] (Tuỳ chọn) Gắn domain riêng
