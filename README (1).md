# TechZone 🖥️
**Your PC. Our Passion.**

TechZone is an e-commerce website for a computer/PC hardware store — laptops, desktops, gaming PCs, components, peripherals, and accessories. Built as a group project using **HTML, CSS (Bootstrap 5), and JavaScript**.

---

## 🎨 Theme Colors

| Color | Hex Code | Usage |
|---|---|---|
| ![#0B1120](https://placehold.co/15x15/0B1120/0B1120.png) Dark Navy | `#0B1120` | Header, footer, background |
| ![#0D1B2A](https://placehold.co/15x15/0D1B2A/0D1B2A.png) Deep Navy | `#0D1B2A` | Hero banner background |
| ![#2D8CFF](https://placehold.co/15x15/2D8CFF/2D8CFF.png) Primary Blue | `#2D8CFF` | Buttons, links, "Gaming PCs" highlight |
| ![#1565C0](https://placehold.co/15x15/1565C0/1565C0.png) Deep Blue | `#1565C0` | Button hover state |
| ![#4FC3F7](https://placehold.co/15x15/4FC3F7/4FC3F7.png) Sky Blue Accent | `#4FC3F7` | Icons, small highlights |
| ![#FFFFFF](https://placehold.co/15x15/FFFFFF/FFFFFF.png) White | `#FFFFFF` | Text on dark background, card backgrounds |
| ![#F5F7FA](https://placehold.co/15x15/F5F7FA/F5F7FA.png) Light Gray | `#F5F7FA` | Page/section background |
| ![#64748B](https://placehold.co/15x15/64748B/64748B.png) Slate Gray | `#64748B` | Muted text, descriptions |
| ![#22C55E](https://placehold.co/15x15/22C55E/22C55E.png) Success Green | `#22C55E` | "New" badge |
| ![#EF4444](https://placehold.co/15x15/EF4444/EF4444.png) Discount Red | `#EF4444` | Discount badges (e.g. -12%, -15%) |
| ![#9333EA](https://placehold.co/15x15/9333EA/9333EA.png) Purple | `#9333EA` | "Popular" badge |

### CSS Variables
Paste this into `assets/css/global.css` so every page shares the same palette:

```css
:root {
  --color-navy-dark: #0B1120;
  --color-navy-deep: #0D1B2A;
  --color-primary: #2D8CFF;
  --color-primary-hover: #1565C0;
  --color-accent: #4FC3F7;
  --color-white: #FFFFFF;
  --color-bg-light: #F5F7FA;
  --color-text-muted: #64748B;
  --color-success: #22C55E;
  --color-discount: #EF4444;
  --color-popular: #9333EA;

  --font-main: 'Poppins', 'Segoe UI', sans-serif;
}
```

---

## 🛠️ Tech Stack
- HTML5
- CSS3 + Bootstrap 5
- JavaScript (Vanilla)
- Git & GitHub (version control)

---

## 📁 Folder Structure

```
techzone/
├── index.html
├── about.html
├── contact.html
├── login.html
├── register.html
├── products/
│   ├── laptops.html
│   ├── desktops.html
│   ├── gaming.html
│   ├── components.html
│   ├── peripherals.html
│   ├── accessories.html
│   └── product-detail.html
├── cart/
│   ├── cart.html
│   └── checkout.html
├── account/
│   ├── profile.html
│   ├── orders.html
│   └── wishlist.html
├── assets/
│   ├── css/
│   │   ├── bootstrap.min.css
│   │   ├── global.css
│   │   └── [page-name].css   (one per page)
│   ├── js/
│   │   ├── bootstrap.bundle.min.js
│   │   ├── global.js
│   │   └── [page-name].js    (one per page)
│   └── images/
│       ├── products/
│       ├── banners/
│       ├── icons/
│       └── logo/
└── README.md
```

**Rule:** every HTML page has a matching CSS/JS file with the same name (e.g. `cart.html` → `cart.css` + `cart.js`).

---

## 👥 Team & Task Assignment

| Name | Role / Pages Assigned |
|---|---|
| Member 1 | Home page, Navbar & Footer (`global.css` / `global.js`) |
| Member 2 | Product listing pages (Laptops, Desktops, Gaming) |
| Member 3 | Product detail page, Components & Peripherals |
| Member 4 | Cart & Checkout |
| Member 5 | Login, Register, Account (Profile / Orders / Wishlist) |

> ✏️ Update names above and adjust as your team decides.

---

## 🔀 Git Workflow

1. Clone the repo:
   ```bash
   git clone https://github.com/your-username/techzone-website.git
   ```
2. Pull latest changes before starting work:
   ```bash
   git pull origin main
   ```
3. Create a branch for your task:
   ```bash
   git checkout -b feature/cart-page
   ```
4. Commit and push your work:
   ```bash
   git add .
   git commit -m "Add cart page layout"
   git push origin feature/cart-page
   ```
5. Open a **Pull Request** on GitHub → get it reviewed → merge into `main`.

⚠️ Do not push directly to `main`. Always work on a branch + PR to avoid overwriting teammates' work.

---

## ✅ Setup Instructions

1. Download/link Bootstrap 5 CSS & JS in `assets/css/` and `assets/js/`.
2. Every HTML page must link files in this order:
   ```html
   <link rel="stylesheet" href="assets/css/bootstrap.min.css">
   <link rel="stylesheet" href="assets/css/global.css">
   <link rel="stylesheet" href="assets/css/[page-name].css">
   ```
   ```html
   <script src="assets/js/bootstrap.bundle.min.js"></script>
   <script src="assets/js/global.js"></script>
   <script src="assets/js/[page-name].js"></script>
   ```
3. `global.css` and `global.js` (navbar, footer, shared styles) should be built **first**, before other pages.

---

## 📄 License
This project is for academic/group project purposes only.
