import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useBudgetByResidence } from "@/hooks/use-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/residences")({
  head: () => ({
    meta: [
      { title: "Residences — DUT ResLife360" },
      { name: "description", content: "Per-residence dashboards: projects, maintenance, strategies, and budgets." },
    ],
  }),
  component: ResidencesPage,
});

function ResidencesPage() {
  const { budgetByResidence, loading } = useBudgetByResidence();
  return (
    <AppShell title="Residences" subtitle="Operations overview across all six DUT residences">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-xl" />)
          : budgetByResidence.map((r) => {
              const pct = Math.round((r.actual / r.budget) * 100);
              return (
                <Card key={r.residence} className="overflow-hidden hover:shadow-lg transition">
                  <div className="h-24 bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                    <Building2 className="h-10 w-10 text-primary-foreground/90" />
                  </div>
                  <CardContent className="p-5 space-y-3">
                    <div>
                      <div className="font-semibold text-lg">{r.residence}</div>
                      <div className="text-xs text-muted-foreground">Active projects · 4 · Maintenance · 2 open tickets</div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Budget utilization</span>
                        <span className="font-medium">{pct}%</span>
                      </div>
                      <Progress value={pct} className="h-2" />
                      <div className="text-xs text-muted-foreground mt-1">R {r.actual.toLocaleString()} / R {r.budget.toLocaleString()}</div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">Open dashboard <ArrowRight className="h-3.5 w-3.5 ml-1" /></Button>
                  </CardContent>
                </Card>
              );
            })}
      </div>
    </AppShell>
  );
}
