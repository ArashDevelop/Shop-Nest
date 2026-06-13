import { Router, Response } from "express";
import { prisma } from "../index";
import { auth, adminOnly, AuthRequest } from "../middleware/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

const router = Router();

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
  password: z.string().min(6).optional(),
});

router.get(
  "/stats",
  auth,
  adminOnly,
  async (_req: AuthRequest, res: Response) => {
    const [totalUsers, totalProducts, totalOrders, totalRevenue] =
      await Promise.all([
        prisma.user.count(),
        prisma.product.count(),
        prisma.order.count(),
        prisma.order.aggregate({ _sum: { total: true } }),
      ]);

    const ordersByStatus = await prisma.order.groupBy({
      by: ["status"],
      _count: true,
    });

    const recentOrders = await prisma.order.findMany({
      include: {
        user: { select: { id: true, email: true, name: true } },
        items: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      ordersByStatus,
      recentOrders,
    });
  }
);

router.get(
  "/users",
  auth,
  adminOnly,
  async (_req: AuthRequest, res: Response) => {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(users);
  }
);

router.get(
  "/users/:id",
  auth,
  adminOnly,
  async (req: AuthRequest, res: Response) => {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id as string },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(user);
  }
);

router.put(
  "/users/:id",
  auth,
  adminOnly,
  async (req: AuthRequest, res: Response) => {
    const parsed = updateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const data: Record<string, string> = {};
    if (parsed.data.name) data.name = parsed.data.name;
    if (parsed.data.email) data.email = parsed.data.email;
    if (parsed.data.role) data.role = parsed.data.role;
    if (parsed.data.password) data.password = await bcrypt.hash(parsed.data.password, 10);

    try {
      const user = await prisma.user.update({
        where: { id: req.params.id as string },
        data,
        select: { id: true, email: true, name: true, role: true, createdAt: true },
      });
      res.json(user);
    } catch {
      res.status(404).json({ error: "User not found" });
    }
  }
);

router.delete(
  "/users/:id",
  auth,
  adminOnly,
  async (req: AuthRequest, res: Response) => {
    try {
      await prisma.user.delete({ where: { id: req.params.id as string } });
      res.status(204).send();
    } catch {
      res.status(404).json({ error: "User not found" });
    }
  }
);

router.patch(
  "/orders/:id/status",
  auth,
  adminOnly,
  async (req: AuthRequest, res: Response) => {
    const { status } = req.body;
    const validStatuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }

    try {
      const order = await prisma.order.update({
        where: { id: req.params.id as string },
        data: { status },
        include: {
          user: { select: { id: true, email: true, name: true } },
          items: { include: { product: true } },
        },
      });
      res.json(order);
    } catch {
      res.status(404).json({ error: "Order not found" });
    }
  }
);

router.get(
  "/orders",
  auth,
  adminOnly,
  async (_req: AuthRequest, res: Response) => {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { id: true, email: true, name: true } },
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(orders);
  }
);

export default router;
