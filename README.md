# ⚡ Zyro Store — Next-Gen Direct WhatsApp E-Commerce Storefront

A modern, responsive e-commerce web application built for frictionless direct-to-WhatsApp ordering. **Zyro Store** features a dark futuristic UI, shopping bag state management, customer delivery intake, and an owner-exclusive admin management suite with zero backend dependencies.

---

## ✨ Features

- **Direct WhatsApp Ordering:** Customers assemble their cart, provide delivery information, and dispatch a structured order receipt straight to the store owner's WhatsApp (`+91 9096925270`).
- **Client-Side Cart Management:** Instant cart calculations, quantity modifications, live subtotal updates, and badge indicators powered by browser `localStorage`.
- **Integrated Delivery Details:** Collects essential buyer info (Full Name, Contact Number, and Full Shipping Address) before opening WhatsApp.
- **Stealth Owner Admin Suite:**
  - Hidden from ordinary buyers by default.
  - Unlockable via **URL trigger** (`?admin=1`) or by **triple-clicking the brand "Z" logo**.
  - Protected with a customizable owner PIN (default: `7020`).
- **Dynamic Inventory Management:**
  - Add, edit, or delete items on the fly.
  - Modify item titles, descriptions, categories, selling prices, and MRP strike-throughs.
  - Dual image input: upload files directly from your device (stored as Base64 Data URLs) or link external image URLs.
- **Fast & Zero Setup:** Pure static single-page application requiring no server setup, database configuration, or npm builds.

---

## 🚀 Live Demo & Deployment

1. Fork or clone this repository.
2. Push `index.html` to your `main` branch.
3. In your GitHub repository, navigate to **Settings** > **Pages**.
4. Set the branch source to **Deploy from a branch (`main` / root)**.
5. Access your live store instantly at:
   ```text
   https://<your-username>.github.io/<repository-name>/
