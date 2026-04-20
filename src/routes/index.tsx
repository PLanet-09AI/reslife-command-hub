import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  STAT_CARDS,
  BUDGET_BY_RESIDENCE,
  SPEND_TREND,
  CATEGORY_SPLIT,
  ACTIVITY,
  DOCUMENTS,
} from "@/lib/mock-data";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { ArrowUpRight, CheckCircle2, Clock, FileText } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — DUT ResLife360 Command Center" },
      { name: "description", content: "Centralized dashboard for DUT Student Housing & Residence Life management." },
    ],
  }),
  component: Dashboard,
});

const PIE_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

const toneClass = (tone: string) => {
  switch (tone) {
    case "primary": return "bg-primary/10 text-primary";
    case "info": return "bg-info/10 text-info";
    case "success": return "bg-success/10 text-success";
    case "warning": return "bg-warning/20 text-warning-foreground";
    default: return "bg-muted text-foreground";
  }
};

function Dashboard() {
  return (
    <AppShell title="Dashboard" subtitle="Welcome back, Alvin. Here's what's happening today.">
      <div className="space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {STAT_CARDS.map((s) => (
            <Card key={s.label} className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</div>
                    <div className="mt-2 text-2xl font-semibold">{s.value}</div>
                  </div>
                  <span className={`text-[11px] px-2 py-1 rounded-full ${toneClass(s.tone)}`}>{s.delta}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card className="xl:col-span-2">
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Budget vs Actual by Residence</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">FY 2025 — all residences</p>
              </div>
              <Button variant="outline" size="sm">Export</Button>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={BUDGET_BY_RESIDENCE}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="residence" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => `R ${v.toLocaleString()}`}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="budget" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actual" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Spend by Category</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={CATEGORY_SPLIT} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                    {CATEGORY_SPLIT.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => `R ${v.toLocaleString()}`} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Spend trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Spend Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={SPEND_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R${v / 1000}k`} />
                <Tooltip formatter={(v: number) => `R ${v.toLocaleString()}`} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="spend" stroke="var(--chart-1)" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent activity + pending */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Activity</CardTitle>
              <Button variant="ghost" size="sm">View all <ArrowUpRight className="h-3 w-3 ml-1" /></Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {ACTIVITY.slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-start gap-3 text-sm">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-[11px] font-semibold text-muted-foreground shrink-0">
                    {a.user.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate"><span className="font-medium">{a.user}</span> <span className="text-muted-foreground">{a.action.toLowerCase()}</span> <span className="text-foreground">{a.target}</span></div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Clock className="h-3 w-3" />{a.time}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {DOCUMENTS.filter((d) => d.status === "Pending" || d.status === "Under Review").map((d) => (
                <div key={d.id} className="flex items-start gap-3 p-3 rounded-md border border-border hover:bg-muted/40 transition">
                  <FileText className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{d.name}</div>
                    <div className="text-xs text-muted-foreground">{d.residence} · {d.owner}</div>
                  </div>
                  <Badge variant="secondary" className="shrink-0">{d.status}</Badge>
                </div>
              ))}
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                <CheckCircle2 className="h-3 w-3 text-success" /> 11 approved this month
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Residence progress strip */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Residence Capex Utilization</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BUDGET_BY_RESIDENCE.map((r) => {
              const pct = Math.round((r.actual / r.budget) * 100);
              return (
                <div key={r.residence}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{r.residence}</span>
                    <span className="text-muted-foreground">{pct}%</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                  <div className="text-xs text-muted-foreground mt-1">R {r.actual.toLocaleString()} / R {r.budget.toLocaleString()}</div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
