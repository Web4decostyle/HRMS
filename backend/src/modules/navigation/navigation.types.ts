// backend/src/modules/navigation/navigation.types.ts

export type MenuItemRole =
  | "ADMIN"
  | "HR"
  | "SUPERVISOR"
  | "ESS"
  | "ESS_VIEWER";

export interface MenuItem {
  key: string;
  label: string;
  icon?: string;
  path: string;
  roles?: MenuItemRole[];
  children?: MenuItem[];
}
