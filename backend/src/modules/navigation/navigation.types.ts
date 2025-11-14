// backend/src/modules/navigation/navigation.types.ts
export type MenuItemRole = "ADMIN" | "HR" | "SUPERVISOR" | "ESS";

export interface MenuItem {
  key: string;
  label: string;
  icon?: string; // simple icon name or emoji for now
  path?: string;
  children?: MenuItem[];
  roles?: MenuItemRole[]; // who can see this
}
