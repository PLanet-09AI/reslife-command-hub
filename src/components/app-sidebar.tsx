import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { subscribeNotifications, type Notification } from "@/lib/notification-service";
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Building2,
  Workflow,
  Map,
  Users,
  ScrollText,
  Settings,
  Bell,
  LogOut,
  Zap,
} from "lucide-react";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };
const NAV: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/my-work", label: "My Work", icon: Zap },
  { to: "/documents", label: "Documents", icon: FileText },
  { to: "/capex", label: "Capex", icon: BarChart3 },
  { to: "/workflows", label: "Workflows", icon: Workflow },
  { to: "/residences", label: "Residences", icon: Building2 },
  { to: "/floorplans", label: "Floorplans", icon: Map },
  { to: "/team", label: "Team Members", icon: Users },
  { to: "/activity", label: "Activity Logs", icon: ScrollText },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppSidebar() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeNotifications(user.uid, (notifs: Notification[]) => {
      setUnread(notifs.filter((n) => !n.read).length);
    });
    return unsub;
  }, [user]);

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center font-bold">
            DUT
          </div>
          <div>
            <div className="text-sm font-semibold leading-tight">ResLife360</div>
            <div className="text-[11px] text-sidebar-foreground/60">Command Center</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = item.exact
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                active
                  ? "bg-sidebar-accent text-sidebar-primary font-medium"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1">{item.label}</span>
              {item.to === "/notifications" && unread > 0 && (
                <span className="h-5 min-w-5 px-1 text-[10px] rounded-full bg-destructive text-destructive-foreground flex items-center justify-center">
                  {unread}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="px-2 py-2 border-t border-sidebar-border">
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground w-full transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </button>
      </div>
      <div className="px-4 py-3 border-t border-sidebar-border text-[11px] text-sidebar-foreground/60">
        v1.0 · Durban University of Technology
      </div>
    </aside>
  );
}
