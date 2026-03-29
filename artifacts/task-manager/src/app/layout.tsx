import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  KanbanSquare,
  FileCheck2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/todo",
    label: "Kanban",
    icon: KanbanSquare,
  },
  {
    href: "/check-post",
    label: "Check bài đăng",
    icon: FileCheck2,
  },
];

export function AppLayout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-background font-sans">
      {/* Sidebar */}
      <aside
        className={`relative flex flex-col border-r border-border bg-card transition-all duration-300 ease-in-out ${
          collapsed ? "w-16" : "w-56"
        }`}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 h-16 border-b border-border shrink-0 ${collapsed ? "justify-center px-0" : ""}`}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-sm shrink-0">
            <div className="w-3 h-3 bg-white rounded-sm rotate-45" />
          </div>
          {!collapsed && (
            <span className="text-lg font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 whitespace-nowrap">
              TaskFlow
            </span>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-hidden">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/" ? location === "/" : location.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
                  ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }
                  ${collapsed ? "justify-center px-0" : ""}
                `}
                title={collapsed ? label : undefined}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="px-2 pb-4">
          <button
            onClick={() => setCollapsed((v) => !v)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ${
              collapsed ? "justify-center px-0" : ""
            }`}
            title={collapsed ? "Mở rộng" : "Thu gọn"}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Thu gọn</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
