"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboardIcon,
  MenuIcon,
  SettingsIcon,
  SparklesIcon,
  UsersIcon,
  FileTextIcon,
  HistoryIcon,
  XIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/characters", label: "Characters", icon: UsersIcon },
  { href: "/generate", label: "Generate", icon: SparklesIcon },
  { href: "/templates", label: "Templates", icon: FileTextIcon },
  { href: "/history", label: "History", icon: HistoryIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "text-sidebar-foreground"
                : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
            )}
          >
            {active && (
              <motion.span
                layoutId="active-nav-pill"
                className="absolute inset-0 rounded-lg bg-sidebar-accent"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <Icon className="relative z-10 size-4" />
            <span className="relative z-10">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = React.useState(pathname);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMobileOpen(false);
  }

  return (
    <div className="flex min-h-screen w-full">
      <aside className="bg-sidebar text-sidebar-foreground border-sidebar-border sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r px-4 py-6 md:flex">
        <div className="flex items-center gap-2 px-2 pb-6">
          <div className="bg-accent text-accent-foreground flex size-8 items-center justify-center rounded-lg">
            <SparklesIcon className="size-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight">
            AI UGC Prompt Factory
          </span>
        </div>
        <NavLinks />
        <div className="mt-auto flex items-center justify-between px-2 pt-6">
          <span className="text-muted-foreground text-xs">v1.0.0</span>
          <ThemeToggle />
        </div>
      </aside>

      <div className="flex min-h-screen w-full flex-1 flex-col">
        <header className="bg-background/80 sticky top-0 z-40 flex items-center justify-between border-b px-4 py-3 backdrop-blur-sm md:hidden">
          <div className="flex items-center gap-2">
            <div className="bg-accent text-accent-foreground flex size-7 items-center justify-center rounded-lg">
              <SparklesIcon className="size-3.5" />
            </div>
            <span className="text-sm font-semibold tracking-tight">
              UGC Prompt Factory
            </span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open menu"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? (
                <XIcon className="size-4" />
              ) : (
                <MenuIcon className="size-4" />
              )}
            </Button>
          </div>
        </header>

        {mobileOpen && (
          <div className="bg-sidebar text-sidebar-foreground border-sidebar-border border-b px-4 py-3 md:hidden">
            <NavLinks onNavigate={() => setMobileOpen(false)} />
          </div>
        )}

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
