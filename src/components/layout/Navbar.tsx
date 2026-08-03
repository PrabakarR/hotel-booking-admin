"use client";

import { Bell, Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { MobileSidebarContent } from "@/components/layout/Sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuthStore } from "@/stores/auth-store";
import { useUiStore } from "@/stores/ui-store";
import { useRouter } from "next/navigation";

const notifications = [
  { id: 1, title: "Check-in due", body: "Room 203 — Aarav Sharma arriving today" },
  { id: 2, title: "Checkout reminder", body: "Room 105 checkout at 11:00 AM" },
  { id: 3, title: "Cleaning complete", body: "Room 302 is ready for booking" },
];

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const mobileOpen = useUiStore((s) => s.mobileSidebarOpen);
  const setMobileSidebarOpen = useUiStore((s) => s.setMobileSidebarOpen);
  const router = useRouter();

  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "AD";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b bg-card/80 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileSidebarOpen(true)}
          aria-label="Open menu"
        >
          <Menu />
        </Button>
        <div>
          <p className="text-sm font-medium">Operations</p>
          <p className="hidden text-xs text-muted-foreground sm:block">
            Manage rooms, guests, and bookings
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Toggle theme"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon" aria-label="Notifications" />}
          >
            <Bell className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              {notifications.map((item) => (
                <DropdownMenuItem key={item.id} className="flex flex-col items-start gap-0.5 py-2">
                  <span className="text-sm font-medium">{item.title}</span>
                  <span className="text-xs text-muted-foreground">{item.body}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" className="gap-2 rounded-2xl px-2" />
            }
          >
            <Avatar size="sm">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span className="hidden max-w-[120px] truncate text-sm md:inline">
              {user?.name ?? "Admin"}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{user?.name}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {user?.email}
                  </span>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  logout();
                  router.replace("/login");
                }}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <MobileSidebarContent />
        </SheetContent>
      </Sheet>
    </header>
  );
}
