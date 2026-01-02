// backend/src/modules/navigation/navigation.controller.ts
import { Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware";
import { MenuItem } from "./navigation.types";

const MENU_ITEMS: MenuItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: "home",
    path: "/",
    roles: ["ADMIN", "HR", "SUPERVISOR", "ESS"],
  },
  {
    key: "admin",
    label: "Admin",
    icon: "shield",
    path: "/admin",
    roles: ["ADMIN", "HR"],
  },
  {
    key: "pim",
    label: "PIM",
    icon: "users",
    path: "/pim",
    roles: ["ADMIN", "HR", "SUPERVISOR"],
  },
  {
    key: "leave",
    label: "Leave",
    icon: "calendar",
    path: "/leave",
    roles: ["ADMIN", "HR", "SUPERVISOR", "ESS"],
  },
  {
    key: "time",
    label: "Time",
    icon: "clock",
    path: "/time",
    roles: ["ADMIN", "HR", "SUPERVISOR", "ESS"],
  },
  {
    key: "recruitment",
    label: "Recruitment",
    icon: "briefcase",
    path: "/recruitment",
    roles: ["ADMIN", "HR"],
  },
  {
    key: "myInfo",
    label: "My Info",
    icon: "id",
    path: "/my-info",
    roles: ["ADMIN", "HR", "SUPERVISOR", "ESS"],
  },
  {
    key: "performance",
    label: "Performance",
    icon: "star",
    path: "/performance",
    roles: ["ADMIN", "HR", "SUPERVISOR"],
  },
  {
    key: "directory",
    label: "Directory",
    icon: "directory",
    path: "/directory",
    roles: ["ADMIN", "HR", "SUPERVISOR", "ESS"],
  },
  {
    key: "maintenance",
    label: "Maintenance",
    icon: "wrench",
    path: "/maintenance",
    roles: ["ADMIN"],
  },
  {
    key: "claim",
    label: "Claim",
    icon: "wallet",
    path: "/claim",
    roles: ["ADMIN", "HR", "SUPERVISOR", "ESS"],
  },
  {
    key: "buzz",
    label: "Buzz",
    icon: "buzz",
    path: "/buzz",
    roles: ["ADMIN", "HR", "SUPERVISOR", "ESS"],
  },
];

// export async function getMenu(req: AuthRequest, res: Response) {
//   const role = req.user?.role || "ESS";

//   const filteredItems = MENU_ITEMS.filter((item) => {
//     if (!item.roles || item.roles.length === 0) return true;
//     return item.roles.includes(role as any);
//   });

//   return res.json({ items: filteredItems });
// }

export async function getMenu(req: AuthRequest, res: Response) {
  // Default role should be ESS (safe)
  const rawRole = (req.user?.role as string) || "ESS";

  // ✅ FIX: ESS_VIEWER should still see ESS menu items
  const role = rawRole === "ESS_VIEWER" ? "ESS" : rawRole;

  const filteredItems = (MENU_ITEMS || []).filter((item: any) => {
    // If item has no roles -> visible to all
    if (!item.roles || item.roles.length === 0) return true;

    // roles can be string[] like ["ADMIN","HR",...]
    return item.roles.includes(role);
  });

  return res.json({ items: filteredItems });
}