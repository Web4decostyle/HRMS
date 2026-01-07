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

  // ✅ NEW: Approvals (Admin only)
  {
    key: "approvals",
    label: "Approvals",
    icon: "check",
    path: "/admin/approvals",
    roles: ["ADMIN"],
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

export async function getMenu(req: AuthRequest, res: Response) {
  const rawRole = (req.user?.role as string) || "ESS";

  // ✅ ESS_VIEWER sees ESS menu items
  const role = rawRole === "ESS_VIEWER" ? "ESS" : rawRole;

  const filteredItems = (MENU_ITEMS || []).filter((item: any) => {
    if (!item.roles || item.roles.length === 0) return true;
    return item.roles.includes(role);
  });

  return res.json({ items: filteredItems });
}
