import { User } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: User; // ahora TypeScript sabrá que req.user existe
    }
  }
}

export {};
