import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { NOTIFICATIONS } from "@/lib/mock-data";
import { Bell, MessageSquare, AlertTriangle, Upload, CheckCircle2 } from "lucide-react";

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
  return (
    <AppShell title="Notifications" subtitle="Real-time alerts across the platform">
      <Card>
        <CardContent className="p-0 divide-y divide-border">
          {NOTIFICATIONS.map((n) => {
            const Icon = ICONS[n.type as keyof typeof ICONS] ?? Bell;
            return (
              <div key={n.id} className="flex items-start gap-3 p-4 hover:bg-muted/40 transition">
                <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{n.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{n.time}</div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </AppShell>
  );
}
