import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";
import { CAPEX_LINE_ITEMS, BUDGET_BY_RESIDENCE, SPEND_TREND, CATEGORY_SPLIT } from "@/lib/mock-data";
import { Download, Filter } from "lucide-react";

export const Route = createFileRoute("/capex")({
  head: () => ({
    meta: [
      { title: "Capex Dashboard — DUT ResLife360" },
      { name: "description", content: "Interactive capital expenditure dashboard for DUT residences." },
    ],
  }),
  component: CapexPage,
});

const PIE_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function CapexPage() {
  const grandTotal = CAPEX_LINE_ITEMS.reduce((s, i) => s + i.qty * i.unit, 0);
  return (
    <AppShell title="Capex Dashboard" subtitle="FY2025 capital expenditure across all residences">
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0">
          <CardContent className="p-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-wider opacity-80">FY2025 Grand Total</div>
              <div className="text-3xl font-bold mt-1">R {grandTotal.toLocaleString()}</div>
              <div className="text-sm opacity-80 mt-1">{CAPEX_LINE_ITEMS.length} line items · 6 residences</div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary"><Filter className="h-4 w-4 mr-1" />Filter</Button>
              <Button variant="secondary"><Download className="h-4 w-4 mr-1" />Export Excel</Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-base">Budget vs Actual</CardTitle></CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={BUDGET_BY_RESIDENCE}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="residence" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R${v / 1000}k`} />
                  <Tooltip formatter={((v: unknown) => `R ${Number(v).toLocaleString()}`) as never} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="budget" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actual" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Category Split</CardTitle></CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={CATEGORY_SPLIT} dataKey="value" nameKey="name" innerRadius={45} outerRadius={85}>
                    {CATEGORY_SPLIT.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={((v: unknown) => `R ${Number(v).toLocaleString()}`) as never} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Monthly Spend Trend</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={SPEND_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R${v / 1000}k`} />
                <Tooltip formatter={((v: unknown) => `R ${Number(v).toLocaleString()}`) as never} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="spend" stroke="var(--chart-2)" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Capex Line Items</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Residence</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit (R)</TableHead>
                  <TableHead className="text-right">Total (R)</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {CAPEX_LINE_ITEMS.map((i) => (
                  <TableRow key={i.item}>
                    <TableCell className="font-medium">{i.item}</TableCell>
                    <TableCell>{i.category}</TableCell>
                    <TableCell>{i.residence}</TableCell>
                    <TableCell className="text-right">{i.qty}</TableCell>
                    <TableCell className="text-right">{i.unit.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-semibold">{(i.qty * i.unit).toLocaleString()}</TableCell>
                    <TableCell><Badge variant={i.type === "New" ? "default" : "secondary"}>{i.type}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
