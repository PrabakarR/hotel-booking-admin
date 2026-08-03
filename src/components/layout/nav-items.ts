import {
  BedDouble,
  CalendarDays,
  ChartColumn,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";

export const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/rooms", label: "Rooms", icon: BedDouble },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/reports", label: "Reports", icon: ChartColumn },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;
