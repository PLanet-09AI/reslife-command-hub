import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WORKFLOWS } from "@/lib/mock-data";
import { AlertTriangle, CheckCircle2, Clock, Circle, Plus, Paperclip } from "lucide-react";

export const Route = createFileRoute("/workflows")({
  head: () => ({
    meta: [
      { title: "Project Workflows — DUT ResLife360" },
      { name: "description", content: "Track 7-step procurement workflows with accountability per step." },
    ],
  }),
  component: WorkflowsPage,
});

const STATUS_META: Record<string, { color: string; icon: typeof Circle; label: string }> = {
  completed: { color: "bg-success text-success-foreground", icon: CheckCircle2, label: "Completed" },
  in_progress: { color: "bg-warning text-warning-foreground", icon: Clock, label: "In Progress" },
  delayed: { color: "bg-destructive text-destructive-foreground", icon: AlertTriangle, label: "Delayed" },
  not_started: { color: "bg-muted text-muted-foreground", icon: Circle, label: "Not Started" },
};

function WorkflowsPage() {
  const totals = WORKFLOWS.reduce(
    (acc, w) => {
      w.steps.forEach((s) => acc[s.status]++);
      return acc;
    },
    { completed: 0, in_progress: 0, delayed: 0, not_started: 0 } as Record<string, number>,
  );

  return (
    <AppShell title="Project Workflows" subtitle="7-step procurement pipeline with accountability tracking">
      <div className="space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(["completed", "in_progress", "delayed", "not_started"] as const).map((k) => {
            const m = STATUS_META[k];
            const Icon = m.icon;
            return (
              <Card key={k}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${m.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">{m.label}</div>
                    <div className="text-xl font-semibold">{totals[k]}</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">{WORKFLOWS.length} active workflows</div>
          <Button><Plus className="h-4 w-4 mr-1" />New workflow</Button>
        </div>

        {/* Alert strip */}
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-destructive">Delayed at Finance Processing — Sifiso Mvubu</div>
              <div className="text-xs text-muted-foreground mt-0.5">Bed Replacement – Student Village · DUT 6 outstanding for 8 days</div>
            </div>
            <Button size="sm" variant="outline" className="ml-auto">Notify</Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {WORKFLOWS.map((wf) => (
            <Card key={wf.id}>
              <CardHeader className="flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-base">{wf.name}</CardTitle>
                  <div className="text-xs text-muted-foreground mt-1">{wf.residence} · Budget {wf.budget}</div>
                </div>
                <Badge variant="outline">{wf.steps.filter((s) => s.status === "completed").length}/{wf.steps.length} steps</Badge>
              </CardHeader>
              <CardContent>
                {/* Horizontal tracker */}
                <div className="flex items-center gap-1 overflow-x-auto pb-2">
                  {wf.steps.map((s, i) => {
                    const m = STATUS_META[s.status];
                    const Icon = m.icon;
                    return (
                      <div key={i} className="flex items-center shrink-0">
                        <div className="flex flex-col items-center min-w-[110px]">
                          <div className={`h-9 w-9 rounded-full flex items-center justify-center ${m.color}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="text-[11px] mt-1.5 text-center font-medium leading-tight">{s.name}</div>
                          <div className="text-[10px] text-muted-foreground">{s.assignee}</div>
                        </div>
                        {i < wf.steps.length - 1 && (
                          <div className={`h-0.5 w-8 ${wf.steps[i].status === "completed" ? "bg-success" : "bg-border"}`} />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Step details list */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {wf.steps.filter((s) => s.status !== "not_started").map((s, i) => {
                    const m = STATUS_META[s.status];
                    return (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-md border border-border bg-muted/30">
                        <Badge className={`${m.color} shrink-0`} variant="secondary">{m.label}</Badge>
                        <div className="flex-1 min-w-0 text-sm">
                          <div className="font-medium">{s.name} — {s.assignee}</div>
                          <div className="text-xs text-muted-foreground">{s.action}</div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">Last updated: {s.updated}</div>
                        </div>
                        <Button size="sm" variant="ghost" className="h-7 px-2"><Paperclip className="h-3.5 w-3.5" /></Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
