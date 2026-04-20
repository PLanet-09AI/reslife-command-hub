import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import {
  subscribeNotifications,
  markAsRead,
  type Notification,
} from "@/lib/notification-service";
import { Bell, MessageSquare, AlertTriangle, Upload, CheckCircle2, Check } from "lucide-react";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — DUT ResLife360" },
      { name: "description", content: "Real-time alerts for documents, approvals and workflows." },
    ],
  }),
  component: NotificationsPage,
});

const ICONS = {
  comment: MessageSquare,
  approval: CheckCircle2,
  alert: AlertTriangle,
  upload: Upload,
} as const;

function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeNotifications(user.uid, setNotifications);
    return unsub;
  }, [user]);

  return (
    <AppShell title="Notifications" subtitle="Real-time alerts across the platform">
      <Card>
        <CardContent className="p-0 divide-y divide-border">
          {notifications.length === 0 && (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No notifications yet.
            </div>
          )}
          {notifications.map((n) => {
            const Icon = ICONS[n.type as keyof typeof ICONS] ?? Bell;
            return (
              <div
                key={n.id}
                className={`flex items-start gap-3 p-4 hover:bg-muted/40 transition ${n.read ? "opacity-60" : ""}`}
              >
                <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{n.title}</div>
                  {n.message && (
                    <div className="text-xs text-muted-foreground mt-0.5">{n.message}</div>
                  )}
                </div>
                {!n.read && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 shrink-0"
                    onClick={() => markAsRead(n.id)}
                    title="Mark as read"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </AppShell>
  );
}
