const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || "Request failed");
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const authApi = {
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (email: string, password: string, name: string) =>
    request<{ token: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    }),
};

export const productsApi = {
  list: () => request<Product[]>("/products"),
  get: (id: string) => request<Product>(`/products/${id}`),
  create: (data: Partial<Product>) =>
    request<Product>("/products", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<Product>) =>
    request<Product>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<void>(`/products/${id}`, { method: "DELETE" }),
};

export const cartApi = {
  get: () => request<Cart>("/cart"),
  add: (productId: string, quantity: number) =>
    request<Cart>("/cart/add", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    }),
  remove: (itemId: string) =>
    request<Cart>(`/cart/remove/${itemId}`, { method: "DELETE" }),
};

export const ordersApi = {
  create: () =>
    request<Order>("/orders", { method: "POST" }),
  list: () => request<Order[]>("/orders"),
  get: (id: string) => request<Order>(`/orders/${id}`),
};

export const adminApi = {
  orders: () => request<Order[]>("/admin/orders"),
};

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  product: Product;
  quantity: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  user?: { id: string; email: string; name: string };
  status: string;
  total: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}
