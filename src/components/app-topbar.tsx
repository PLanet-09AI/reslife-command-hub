import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export function AppTopbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { user } = useAuth();
  const initials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : "??";
  const displayName = user?.email?.split("@")[0] ?? "User";

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur px-6 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-lg font-semibold text-foreground truncate">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative hidden lg:block">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search documents, projects…" className="pl-9 w-72 bg-background" />
        </div>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2 pl-2 border-l border-border">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center text-sm font-semibold">{initials}</div>
          <div className="hidden sm:block">
            <div className="text-sm font-medium leading-tight">{displayName}</div>
            <div className="text-[11px] text-muted-foreground">{user?.email ?? ""}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
