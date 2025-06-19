// src/lib/auth.ts 
import jwt from "jsonwebtoken";

type AdminTokenPayload = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export function getAdminFromToken(token: string): AdminTokenPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as AdminTokenPayload;
  } catch {
    return null;
  }
}