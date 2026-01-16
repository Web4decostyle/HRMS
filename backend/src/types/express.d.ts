import "express";

declare global {
  namespace Express {
    // ✅ Your app uses id (not _id)
    interface User {
      id: string;
      role: "ADMIN" | "HR" | "SUPERVISOR" | "ESS" | "ESS_VIEWER";
      username?: string;
      email?: string;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
