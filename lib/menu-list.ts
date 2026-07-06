import {
  LucideLayoutDashboard,
  LucideIcon,
  Boxes,
  Clock,
  Sparkles
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
          active: pathname.includes("/dashboard"),
          submenus: []
        },
        {
          href: "/segments",
          label: "Customer Segments",
          icon: Boxes,
          active: pathname.includes("/segments"),
          submenus: []
        },
        {
          href: "/inference",
          label: "Inference",
          icon: Sparkles,
          active: pathname.includes("/inference"),
          submenus: []
        },
        {
          href: "/inference-history",
          label: "Inference History",
          icon: Clock,
          active: pathname.includes("/inference-history"),
          submenus: []
        }
      ]
    }
  ];
}
