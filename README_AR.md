# MAD Preview Pages (GitHub Pages)

الفكرة: توليد صفحات Preview ثابتة (Static) لكل منتج **باللغتين** بحيث واتساب يعرض كرت Preview (صورة + عنوان + وصف)
بدون ما تودي الزبون على موقع الشراء.

## الروابط التي سيرسلها البوت
- عربي: `https://YOUR_DOMAIN/p/ar/<code_key>/`
- عبري: `https://YOUR_DOMAIN/p/he/<code_key>/`

> استخدم `code_key` (مثل `W183_MAN`) لتفادي تعارض نفس الكود بين رجالي/نسائي.

## مصدر البيانات
السكريبت يسحب المنتجات من Apps Script API تبعك (JSON):
ضع رابط الـ /exec في متغير GitHub Actions اسمه `SHEET_API_URL`.

مثال:
`https://script.google.com/macros/s/XXXXX/exec`

## نشر على GitHub Pages (مختصر)
1) ارفع المشروع على Repo جديد (main).
2) GitHub → Settings → Pages → اختر **GitHub Actions**.
3) GitHub → Settings → Secrets and variables → Actions → Variables:
   - `SHEET_API_URL` = رابط السكربت تبعك `/exec`
   - `SITE_DOMAIN` = الدومين/السب دومين للـPreview (مثال: `preview.madperfume.co.il`)
4) DNS: اعمل CNAME للسب دومين (preview) على: `abomkdad.github.io`
5) بعد نجاح الـworkflow جرّب:
   - `https://preview.madperfume.co.il/p/ar/W183_MAN/`

## ملاحظات مهمة
- Preview في واتساب يعتمد على OG tags داخل `<head>` ولا يعتمد على JavaScript.
- لازم `image` يكون HTTPS ورابط مباشر png/jpg.
