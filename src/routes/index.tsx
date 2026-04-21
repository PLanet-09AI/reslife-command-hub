import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, PieChart, Pie, Cell, Legend,
} from "recharts";
import { CheckCircle2, Clock, AlertTriangle, Circle, ArrowUpRight, Zap } from "lucide-react";
import { useWorkflowStats } from "@/hooks/use-workflow-stats";
import { useCurrentMember } from "@/hooks/use-team-members";
import type { WfStatus } from "@/lib/workflow-service";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — DUT ResLife360 Command Center" },
      { name: "description", content: "Live workflow & procurement dashboard for DUT Student Housing." },
    ],
  }),
  component: Dashboard,
});

const STATUS_META: Record<WfStatus, { label: string; icon: typeof Circle; color: string; bg: string }> = {
  completed:   { label: "Completed",   icon: CheckCircle2,  color: "text-success",            bg: "bg-success/10" },
  in_progress: { label: "In Progress", icon: Clock,         color: "text-warning-foreground",  bg: "bg-warning/15" },
  delayed:     { label: "Delayed",     icon: AlertTriangle, color: "text-destructive",          bg: "bg-destructive/10" },
  not_started: { label: "Not Started", icon: Circle,        color: "text-muted-foreground",     bg: "bg-muted/60" },
};

const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

function Dashboard() {
  const navigate = useNavigate();
  const { member } = useCurrentMember();
  const { stats, loading } = useWorkflowStats(member?.name);

  const statCards = [
    { key: "total",      label: "Total Workflows",  value: stats.total,      icon: Circle,        bg: "bg-primary/10",     color: "text-primary" },
    { key: "inProgress", label: "In Progress",       value: stats.inProgress, icon: Clock,         bg: "bg-warning/15",     color: "text-warning-foreground" },
    { key: "completed",  label: "Completed",         value: stats.completed,  icon: CheckCircle2,  bg: "bg-success/10",     color: "text-success" },
    { key: "delayed",    label: "Delayed",            value: stats.delayed,    icon: AlertTriangle, bg: "bg-destructive/10", color: "text-destructive" },
  ] as const;

  const stepPieData = (["completed", "in_progress", "delayed", "not_started"] as WfStatus[])
    .map((k) => ({ name: STATUS_META[k].label, value: stats.stepCounts[k] }))
    .filter((d) => d.value > 0);

  const greeting = member ? `Welcome back, ${member.name.split(" ")[0]}. Here's the live procurement status.` : "Live procurement status.";

  return (
    <AppShell title="Dashboard" subtitle={greeting}>
      <div className="space-y-6">

        {/* Stat cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}><CardContent className="p-5"><Skeleton className="h-16 w-full" /></CardContent></Card>
              ))
            : statCards.map((s) => {
                const Icon = s.icon;
                return (
                  <Card key={s.key} className="overflow-hidden">
                    <CardContent className="p-5 flex items-center gap-3">
                      <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
                        <Icon className={`h-5 w-5 ${s.color}`} />
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</div>
                        <div className="text-2xl font-semibold">{s.value}</div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
        </div>

        {/* My steps callout */}
        {!loading && stats.myStepsTotal > 0 && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-sm">
                    You have {stats.myStepsTotal} step{stats.myStepsTotal > 1 ? "s" : ""} waiting for your action
                  </div>
                  <div className="text-xs text-muted-foreground">Go to My Work to complete your part</div>
                </div>
              </div>
              <Button size="sm" onClick={() => navigate({ to: "/my-work" })}>
                My Work <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Charts row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card className="xl:col-span-2">
            <CardHeader><CardTitle className="text-base">Workflows by Residence</CardTitle></CardHeader>
            <CardContent className="h-64">
              {loading ? <Skeleton className="h-full w-full" /> : stats.byResidence.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No workflows yet</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.byResidence}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="residence" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="total" name="Total" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="completed" name="Completed" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="inProgress" name="In Progress" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Step Status Breakdown</CardTitle></CardHeader>
            <CardContent className="h-64">
              {loading ? <Skeleton className="h-full w-full" /> : stepPieData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No steps yet</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stepPieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80}>
                      {stepPieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent updates + health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Step Updates</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/workflows" })}>
                All workflows <ArrowUpRight className="h-3 w-3 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
                : stats.recentUpdates.length === 0
                  ? <div className="text-sm text-muted-foreground py-6 text-center">No updates yet — create a workflow to get started</div>
                  : stats.recentUpdates.map((u, i) => {
                      const m = STATUS_META[u.status];
                      const Icon = m.icon;
                      return (
                        <div key={i} className="flex items-start gap-3 text-sm">
                          <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${m.bg}`}>
                            <Icon className={`h-3.5 w-3.5 ${m.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="truncate font-medium">{u.wfName}</div>
                            <div className="text-xs text-muted-foreground truncate">{u.stepName} · {u.assignee}</div>
                          </div>
                          <div className="text-right shrink-0">
                            <Badge variant="outline" className={`text-[10px] ${m.color}`}>{m.label}</Badge>
                            <div className="text-[10px] text-muted-foreground mt-0.5">{u.updated}</div>
                          </div>
                        </div>
                      );
                    })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Workflow Health</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)
                : (["completed", "in_progress", "delayed", "not_started"] as WfStatus[]).map((k) => {
                    const m = STATUS_META[k];
                    const count =
                      k === "completed" ? stats.completed :
                      k === "in_progress" ? stats.inProgress :
                      k === "delayed" ? stats.delayed :
                      stats.notStarted;
                    const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                    const Icon = m.icon;
                    return (
                      <div key={k}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="flex items-center gap-1.5">
                            <Icon className={`h-3.5 w-3.5 ${m.color}`} />{m.label}
                          </span>
                          <span className="text-muted-foreground">{count} ({pct}%)</span>
                        </div>
                        <Progress value={pct} className="h-1.5" />
                      </div>
                    );
                  })}
            </CardContent>
          </Card>
        </div>

      </div>
    </AppShell>
  );
}
