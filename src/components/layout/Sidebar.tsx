"use client";

import { motion } from "framer-motion";
import { LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { navItems } from "@/components/layout/nav-items";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useUiStore } from "@/stores/ui-store";
import { useSettings } from "@/hooks/use-settings";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const setMobileSidebarOpen = useUiStore((s) => s.setMobileSidebarOpen);
  const logout = useAuthStore((s) => s.logout);
  const { data: settings } = useSettings();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-300 md:flex",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      <div className="flex h-16 items-center justify-between gap-2 px-4">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-w-0"
          >
            <p className="truncate text-sm font-semibold tracking-tight">
              {settings?.hotelName ?? "Cedar Ridge Lodge"}
            </p>
            <p className="text-xs text-muted-foreground">Staff Console</p>
          </motion.div>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
        </Button>
      </div>

      <Separator />

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileSidebarOpen(false)}
              className={cn(
                "group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-2xl bg-sidebar-accent"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className="relative z-10 size-4 shrink-0" />
              {!collapsed && (
                <span className="relative z-10 truncate">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3">
        <Button
          variant="ghost"
          className={cn("w-full justify-start gap-3 rounded-2xl", collapsed && "justify-center px-0")}
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
          {!collapsed && "Logout"}
        </Button>
      </div>
    </aside>
  );
}

export function MobileSidebarContent() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const setMobileSidebarOpen = useUiStore((s) => s.setMobileSidebarOpen);
  const { data: settings } = useSettings();

  return (
    <div className="flex h-full flex-col">
      <div className="px-4 py-5">
        <p className="text-sm font-semibold">{settings?.hotelName ?? "Cedar Ridge Lodge"}</p>
        <p className="text-xs text-muted-foreground">Staff Console</p>
      </div>
      <Separator />
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 rounded-2xl"
          onClick={() => {
            logout();
            setMobileSidebarOpen(false);
            router.replace("/login");
          }}
        >
          <LogOut className="size-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
