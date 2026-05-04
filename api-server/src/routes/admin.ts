import { Router, type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db, submissionsTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const router = Router();

function getSecret() {
  const s = process.env.JWT_SECRET?.trim();
  if (!s) throw new Error("JWT_SECRET not set");
  return s;
}

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token =
    req.headers.authorization?.replace("Bearer ", "") ||
    (req.query.token as string);

  if (!token) {
    res.status(401).json({ error: "يرجى تسجيل الدخول." });
    return;
  }

  try {
    jwt.verify(token, getSecret());
    next();
  } catch {
    res.status(401).json({ error: "جلسة منتهية أو غير صالحة. يرجى إعادة تسجيل الدخول." });
  }
}

router.post("/admin/login", (req, res) => {
  const { username, password } = req.body as {
    username?: string;
    password?: string;
  };

  const adminUser = process.env.ADMIN_USERNAME?.trim();
  const adminPass = process.env.ADMIN_PASSWORD?.trim();

  if (
    !username ||
    !password ||
    username.trim() !== adminUser ||
    password !== adminPass
  ) {
    res.status(401).json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة." });
    return;
  }

  const token = jwt.sign({ role: "admin" }, getSecret(), { expiresIn: "8h" });
  res.json({ token });
});

router.get("/admin/submissions", authMiddleware, async (_req, res) => {
  const rows = await db
    .select()
    .from(submissionsTable)
    .orderBy(desc(submissionsTable.createdAt));
  res.json(rows);
});

export default router;
