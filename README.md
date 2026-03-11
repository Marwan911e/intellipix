# IntelliPix Frontend Application

![React](https://img.shields.io/badge/Library-React-blue.svg) ![License](https://img.shields.io/badge/License-MIT-green.svg) ![Vite](https://img.shields.io/badge/Bundler-Vite-yellow.svg)

A sleek single-page application built with React and Tailwind CSS. The frontend offers users a seamless interface to upload images, compare file sizes, and download compressed results powered by the IntelliPix backend.

---

## 🎯 Purpose

This client-facing application demonstrates an intuitive user experience for image compression services. It can be deployed independently or alongside the backend and serves as a marketing demo as well as a fully functional UI for paying customers.

## ✨ Key Features

- Drag-and-drop or form-based image upload
- Live preview of original vs. compressed size
- Download compressed image with a single click
- Responsive layout tailored for desktops and mobile
- Authentication flow with Google OAuth
- Status indicators for trial subscriptions and API keys

## 🧩 Tech Stack

- **Framework**: React 18 with hooks
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **HTTP**: Fetch API with JSON handling in `services/api.js`
- **Payment**: Stripe client SDK for subscription checks

## 🏗 Architecture & Structure

```
frontend/
├── public/                 # static assets and index.html
├── src/
│   ├── App.jsx             # root component & routing
│   ├── components/         # reusable UI components
│   ├── pages/              # route-level page components
│   ├── services/           # API helpers (api.js)
│   └── index.jsx           # entry point
├── package.json
├── vite.config.js
└── tailwind.config.js
```

The app uses React Router for client‑side navigation and central `api.js` for all backend communication.

## 🛠 Prerequisites

- Node.js 18+ (npm or yarn)
- Access to a running IntelliPix backend (defaults to `http://localhost:8081`)

## ▶️ Getting Started

```bash
# from workspace root
cd frontend
npm install             # or yarn install
npm run dev             # start dev server with hot reload
```

The app is available at `http://localhost:3000`. Luxurious user experience with instant reloads on save.

To build for production:

```bash
npm run build
npm run serve          # preview the optimized build
```

## 🖥 UI Walkthrough

1. **Landing page**: brief pitch, login button
2. **Upload page**: drag/drop or select file, press "Compress"
3. **Results panel**: shows original vs compressed sizes, download link
4. **Account page**: view API key, subscription status, request more credits

> _Tip_: Replace the placeholders in `public/media/` with real screenshots for your demo.

## ☁️ Deployment

The frontend is designed to deploy on Vercel, Netlify, or any static‑hosting service.

Add the following to `vercel.json` or your host config:

```json
{
  "builds": [{ "src": "src/index.jsx", "use": "@vercel/static-build", "config": { "distDir": "dist" }}]
}
```

## ⚙️ Environment Variables

- `VITE_BACKEND_URL` – API base URL (default `http://localhost:8081`)
- `VITE_STRIPE_KEY` – publishable key for Stripe usage checks

## 🧪 Testing & Quality

- Use your browser's dev tools to inspect network calls and console logs.
- Run `npm run lint` (if ESLint is configured) and `npm run format`.

## 🤝 Contributing

Feel free to fork this repo, submit issues/PRs, or adapt components for your own projects. The code is modular and welcomes enhancements.

---

For backend details see the [backend README](../backend/README.md) or the [root overview](../README.md).

Looking for help? Reach out at <your-email@example.com>.