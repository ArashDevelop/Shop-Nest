import { Router, Response } from "express";
import { prisma } from "../index";
import { auth, adminOnly, AuthRequest } from "../middleware/auth";
import { productSchema } from "../validators";

const router = Router();

router.get("/", async (_req, res: Response) => {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.json(products);
});

router.get("/:id", async (req, res: Response) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id as string },
  });
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(product);
});

router.post("/", auth, adminOnly, async (req: AuthRequest, res: Response) => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const product = await prisma.product.create({ data: parsed.data });
  res.status(201).json(product);
});

router.put("/:id", auth, adminOnly, async (req: AuthRequest, res: Response) => {
  const parsed = productSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const product = await prisma.product.update({
      where: { id: req.params.id as string },
      data: parsed.data,
    });
    res.json(product);
  } catch {
    res.status(404).json({ error: "Product not found" });
  }
});

router.delete(
  "/:id",
  auth,
  adminOnly,
  async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    try {
      await prisma.product.delete({ where: { id } });
      res.status(204).send();
    } catch {
      res.status(409).json({ error: "Cannot delete product: it is referenced in existing orders" });
    }
  }
);

export default router;
