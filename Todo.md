# shopnest — Online Store

## Project Overview
Full-stack e-commerce platform with product management, shopping cart, orders, and admin panel.

## Tech Stack
Next.js · Express · Supabase

---

## Phases & Tasks

### 1️⃣ Initial Setup
- [ ] Create GitHub repo named "shopnest"
- [ ] Create Next.js project: npx create-next-app@latest
- [ ] Install TypeScript, Tailwind CSS, shadcn/ui
- [ ] Create Express backend in /server folder
- [ ] Install express, cors, dotenv, prisma
- [ ] Create Supabase account and new project
- [ ] Copy DATABASE_URL from Supabase to .env
- [ ] Create .env.example file
- [ ] Create initial README.md with project description

### 2️⃣ Database & Backend
- [ ] Define schema in prisma: User, Product, Order, Cart
- [ ] Run npx prisma migrate dev
- [ ] Build auth routes: register, login with JWT
- [ ] Create middleware to verify token
- [ ] Build CRUD routes for Product
- [ ] Build Cart routes: add, remove, get
- [ ] Build Order routes: create, list, detail
- [ ] Build admin route: list all orders
- [ ] Add validation using zod or express-validator
- [ ] Test all routes with Thunder Client or Postman

### 3️⃣ Frontend
- [ ] Build main layout with header and footer
- [ ] Build home page with product list
- [ ] Build product detail page
- [ ] Build cart sidebar component
- [ ] Build checkout page
- [ ] Build login and register page
- [ ] Build admin panel: product list with add/edit/delete
- [ ] Build orders page for users
- [ ] Add loading state and error handling
- [ ] Make all pages responsive

### 4️⃣ Deployment & Finalization
- [ ] Deploy backend on Render
- [ ] Deploy frontend on Vercel
- [ ] Set environment variables on both platforms
- [ ] Fully test checkout flow on demo
- [ ] Add screenshot and demo link to README
- [ ] Add GitHub badges to README