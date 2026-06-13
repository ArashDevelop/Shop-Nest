import { Router, Response } from "express";
import { prisma } from "../index";
import { auth, AuthRequest } from "../middleware/auth";
import { cartItemSchema } from "../validators";

const router = Router();

router.get("/", auth, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  let cart = await prisma.cart.findUnique({
    where: { userId: req.userId },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId: req.userId! },
      include: {
        items: {
          include: { product: true },
        },
      },
    });
  }

  res.json(cart);
});

router.post("/add", auth, async (req: AuthRequest, res: Response) => {
  const parsed = cartItemSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { productId, quantity } = parsed.data;

  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  let cart = await prisma.cart.findUnique({
    where: { userId: req.userId },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId: req.userId! },
    });
  }

  const existingItem = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId },
  });

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity },
    });
  }

  const updatedCart = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  res.json(updatedCart);
});

router.patch(
  "/item/:itemId",
  auth,
  async (req: AuthRequest, res: Response) => {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) {
      res.status(400).json({ error: "Quantity must be at least 1" });
      return;
    }

    try {
      const item = await prisma.cartItem.findUnique({
        where: { id: req.params.itemId as string },
        include: { cart: true },
      });

      if (!item || item.cart?.userId !== req.userId) {
        res.status(404).json({ error: "Item not found" });
        return;
      }

      await prisma.cartItem.update({
        where: { id: item.id },
        data: { quantity },
      });

      const updatedCart = await prisma.cart.findUnique({
        where: { id: item.cartId },
        include: {
          items: { include: { product: true } },
        },
      });

      res.json(updatedCart);
    } catch {
      res.status(404).json({ error: "Item not found" });
    }
  }
);

router.delete(
  "/remove/:itemId",
  auth,
  async (req: AuthRequest, res: Response) => {
    try {
      const itemId = req.params.itemId as string;
      const item = await prisma.cartItem.findUnique({
        where: { id: itemId },
        include: { cart: true },
      });

      if (!item || item.cart?.userId !== req.userId) {
        res.status(404).json({ error: "Item not found" });
        return;
      }

      await prisma.cartItem.delete({ where: { id: itemId } });

      const updatedCart = await prisma.cart.findUnique({
        where: { id: item.cartId },
        include: {
          items: {
            include: { product: true },
          },
        },
      });

      res.json(updatedCart);
    } catch {
      res.status(404).json({ error: "Item not found" });
    }
  }
);

export default router;
