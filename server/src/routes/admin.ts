import { Router, Response } from "express";
import { prisma } from "../index";
import { auth, adminOnly, AuthRequest } from "../middleware/auth";

const router = Router();

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
