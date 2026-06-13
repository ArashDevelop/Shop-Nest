# <p align="center">🏪 ShopNest</p>

<p align="center">
  <strong>A high-performance, full-stack E-Commerce platform built with modern technologies.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React">
  <img src="https://img.shields.io/badge/Express-JS-lightgrey?style=for-the-badge&logo=express" alt="Express">
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma" alt="Prisma">
  <img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql" alt="Postgres">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind">
</p>

<p align="center">
  <a href="https://shopnest-demo.vercel.app">
    <img src="https://img.shields.io/badge/🚀%20LIVE%20DEMO-CLICK%20HERE-FF4B4B?style=for-the-badge&logo=rocket" alt="Demo">
  <a href="https://shopnest-demo.vercel.app">
    <img src="https://img.shields.io/badge/🚀%20LIVE%20DEMO-CLICK%20HERE-FF4B4B?style=for-the-badge&logo=rocket" alt="Demo">
  </a>
</p>

---

## 🌟 Overview

ShopNest is a comprehensive e-commerce solution designed for modern web standards. It features a robust **Node.js/Express** backend with **Prisma ORM**, a lightning-fast **Next.js** frontend with **React 19**, and a highly responsive design using **Tailwind CSS**.

The platform supports multiple locales (**English & Persian**), dark mode, real-time cart management, and a full-featured administrative suite.

---

## ✨ Features

### 👤 Customer Features

- **Modern Catalog**: Browse products with instant search and category filtering.
- **Dynamic Shopping Cart**: Real-time quantity management with inline +/- controls in the navbar dropdown.
- **Localization**: Fully localized in English and Persian (RTL support).
- **Smooth UX**: Loading skeletons, animated transitions, and responsive typography.
- **Order Tracking**: Personalized user dashboard to manage purchase history and status.
- **Authentication**: Secure JWT-based login and registration system.

### 🛡️ Admin Suite

- **Advanced Dashboard**: Visualized revenue charts (Last 30 Days) and order status distribution.
- **User Management**: Control user roles (Promote/Demote) and manage account access.
- **Product Management**: Full CRUD operations with image support and stock tracking.
- **Order Management**: Real-time delivery status updates and customer information review.

---

## 🛠️ Tech Stack

| Frontend                               | Backend                            | Database & Auth          |
| :------------------------------------- | :--------------------------------- | :----------------------- |
| **Framework**: Next.js 16 (App Router) | **Environment**: Node.js / Express | **Database**: PostgreSQL |
| **UI Components**: Shadcn/UI           | **Language**: TypeScript           | **ORM**: Prisma          |
| **Styling**: Tailwind CSS v4           | **Middleware**: JWT Auth           | **Security**: Bcrypt.js  |
| **i18n**: next-intl                    | **Validation**: Zod                | **State**: React Context |

---

## 📂 Project Structure

```bash
ShopNest/
├── frontend/             # Next.js Application
│   ├── app/              # App Router Pages & Layouts
│   ├── components/       # UI & Domain Components
│   ├── contexts/         # Auth & Global State
│   ├── messages/         # i18n JSON (EN/FA)
│   └── lib/              # API Clients & Utilities
└── server/               # Express.js Application
    ├── src/              # Source Code
    │   ├── routes/       # API Endpoints
    │   ├── middleware/   # Auth & Validation
    │   └── validators/   # Zod Schemas
    └── prisma/           # Database Schema & Migrations
```

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/YourUsername/ShopNest.git
cd ShopNest
```

### 2. Backend Setup

```bash
cd server
npm install
# Create a .env file and set DATABASE_URL, JWT_SECRET
npm run prisma:migrate
npm run dev
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
# Create a .env.local and set NEXT_PUBLIC_API_URL
npm run dev
```

---

## 📸 Screenshots

<p align="center">
  <kbd><img src="https://i.ibb.co/s95Zb135/1.png" width="800" alt="Hero"></kbd>
  <br><i>Main Catalog & Responsive Navigation</i>
</p>

---

## 📜 License

Distributed under the **ISC License**. See `LICENSE` for more information.

<p align="right">(<a href="#top">back to top</a>)</p>
