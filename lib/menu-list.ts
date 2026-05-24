import {
    LucideLayoutDashboard,
    LucideIcon,
    Boxes
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active?: boolean;
};

type Menu = {
  href: string;
  label: string;
  active?: boolean;
  icon: LucideIcon;
  submenus?: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/dashboard",
          label: "Dashboard",
          icon: LucideLayoutDashboard,
          submenus: []
        },
        {
          href: "/segments",
          label: "Customer Segments",
          icon: Boxes,
          submenus: []
        }
      ]
    }
  ];
}
