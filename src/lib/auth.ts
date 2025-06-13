// src/lib/auth.ts 
import jwt from "jsonwebtoken";

export function getAdminFromToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return decoded as { id: string; email: string; role: string };
  } catch (err) {
    return null;
  }
}
