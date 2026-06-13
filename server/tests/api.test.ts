import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app, prisma } from "../src/index";

let userToken: string;
let adminToken: string;
let userId: string;
let adminId: string;
let productId: string;
let cartItemId: string;
let orderId: string;

beforeAll(async () => {
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe("Health", () => {
  it("GET /api/health returns ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

describe("Auth", () => {
  it("POST /api/auth/register creates a regular user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "testuser@test.com",
      password: "password123",
      name: "Test User",
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.email).toBe("testuser@test.com");
    expect(res.body.user.role).toBe("USER");
    userToken = res.body.token;
    userId = res.body.user.id;
  });

  it("POST /api/auth/register creates an admin user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "admin@test.com",
      password: "admin123",
      name: "Admin User",
    });
    expect(res.status).toBe(201);
    adminId = res.body.user.id;
    await prisma.user.update({
      where: { id: adminId },
      data: { role: "ADMIN" },
    });
    const loginRes = await request(app).post("/api/auth/login").send({
      email: "admin@test.com",
      password: "admin123",
    });
    adminToken = loginRes.body.token;
  });

  it("POST /api/auth/register rejects duplicate email", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "testuser@test.com",
      password: "password123",
      name: "Test User",
    });
    expect(res.status).toBe(409);
  });

  it("POST /api/auth/login with valid credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "testuser@test.com",
      password: "password123",
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.email).toBe("testuser@test.com");
  });

  it("POST /api/auth/login with wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "testuser@test.com",
      password: "wrongpassword",
    });
    expect(res.status).toBe(401);
  });

  it("POST /api/auth/login with unknown email", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "nobody@test.com",
      password: "password123",
    });
    expect(res.status).toBe(401);
  });

  it("POST /api/auth/register rejects invalid email", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "not-an-email",
      password: "password123",
      name: "Bad Email",
    });
    expect(res.status).toBe(400);
  });

  it("POST /api/auth/register rejects short password", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "short@test.com",
      password: "123",
      name: "Short Password",
    });
    expect(res.status).toBe(400);
  });
});

describe("Products", () => {
  it("GET /api/products returns empty array initially", async () => {
    const res = await request(app).get("/api/products");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("POST /api/products requires admin role", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        name: "Test Product",
        description: "A test product",
        price: 29.99,
        stock: 10,
      });
    expect(res.status).toBe(403);
  });

  it("POST /api/products creates product as admin", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Test Product",
        description: "A test product description",
        price: 29.99,
        stock: 10,
      });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Test Product");
    expect(res.body.price).toBe(29.99);
    productId = res.body.id;
  });

  it("POST /api/products requires auth", async () => {
    const res = await request(app).post("/api/products").send({
      name: "No Auth Product",
      description: "Should fail",
      price: 10,
    });
    expect(res.status).toBe(401);
  });

  it("GET /api/products returns created product", async () => {
    const res = await request(app).get("/api/products");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe("Test Product");
  });

  it("GET /api/products/:id returns single product", async () => {
    const res = await request(app).get(`/api/products/${productId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(productId);
  });

  it("GET /api/products/:id returns 404 for unknown", async () => {
    const res = await request(app).get("/api/products/nonexistent");
    expect(res.status).toBe(404);
  });

  it("PUT /api/products/:id updates product as admin", async () => {
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ price: 19.99 });
    expect(res.status).toBe(200);
    expect(res.body.price).toBe(19.99);
  });

  it("PUT /api/products/:id rejects non-admin", async () => {
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ price: 5.0 });
    expect(res.status).toBe(403);
  });

  it("POST /api/products validates required fields", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Incomplete" });
    expect(res.status).toBe(400);
  });
});

describe("Cart", () => {
  it("GET /api/cart returns empty cart for new user", async () => {
    const res = await request(app)
      .get("/api/cart")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.items).toEqual([]);
  });

  it("POST /api/cart/add adds item to cart", async () => {
    const res = await request(app)
      .post("/api/cart/add")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ productId, quantity: 2 });
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].quantity).toBe(2);
    expect(res.body.items[0].productId).toBe(productId);
    cartItemId = res.body.items[0].id;
  });

  it("POST /api/cart/add increments quantity for existing product", async () => {
    const res = await request(app)
      .post("/api/cart/add")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ productId, quantity: 3 });
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].quantity).toBe(5);
  });

  it("GET /api/cart returns cart with items", async () => {
    const res = await request(app)
      .get("/api/cart")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
  });

  it("POST /api/cart/add rejects invalid product", async () => {
    const res = await request(app)
      .post("/api/cart/add")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ productId: "nonexistent", quantity: 1 });
    expect(res.status).toBe(404);
  });

  it("POST /api/cart/add requires auth", async () => {
    const res = await request(app)
      .post("/api/cart/add")
      .send({ productId, quantity: 1 });
    expect(res.status).toBe(401);
  });

  it("DELETE /api/cart/remove/:itemId removes item", async () => {
    const res = await request(app)
      .delete(`/api/cart/remove/${cartItemId}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(0);
  });
});

describe("Orders", () => {
  it("POST /api/orders fails when cart is empty", async () => {
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(400);
  });

  it("POST /api/orders creates order", async () => {
    await request(app)
      .post("/api/cart/add")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ productId, quantity: 1 });

    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(201);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.total).toBe(19.99);
    orderId = res.body.id;
  });

  it("GET /api/orders returns user orders", async () => {
    const res = await request(app)
      .get("/api/orders")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].id).toBe(orderId);
  });

  it("GET /api/orders requires auth", async () => {
    const res = await request(app).get("/api/orders");
    expect(res.status).toBe(401);
  });

  it("GET /api/orders/:id returns order detail", async () => {
    const res = await request(app)
      .get(`/api/orders/${orderId}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(orderId);
    expect(res.body.items).toHaveLength(1);
  });

  it("GET /api/orders/:id returns 404 for unknown order", async () => {
    const res = await request(app)
      .get("/api/orders/nonexistent")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(404);
  });

  it("GET /api/orders/:id blocks other users", async () => {
    const otherRes = await request(app).post("/api/auth/register").send({
      email: "other@test.com",
      password: "password123",
      name: "Other User",
    });
    const otherToken = otherRes.body.token;

    const res = await request(app)
      .get(`/api/orders/${orderId}`)
      .set("Authorization", `Bearer ${otherToken}`);
    expect(res.status).toBe(404);
  });
});

describe("Admin", () => {
  it("GET /api/admin/orders requires admin role", async () => {
    const res = await request(app)
      .get("/api/admin/orders")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it("GET /api/admin/orders returns all orders", async () => {
    const res = await request(app)
      .get("/api/admin/orders")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0].user).toHaveProperty("email");
  });
});
