import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useRecentActivity } from "@/hooks/use-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Download } from "lucide-react";

export const Route = createFileRoute("/activity")({
  head: () => ({
    meta: [
      { title: "Activity Logs — DUT ResLife360" },
      { name: "description", content: "Immutable audit trail of every action across the system." },
    ],
  }),
  component: ActivityPage,
});

function ActivityPage() {
  const { activity, loading } = useRecentActivity();
  const [q, setQ] = useState("");
  const filtered = activity.filter(
    (a) =>
      !q ||
      a.user.toLowerCase().includes(q.toLowerCase()) ||
      a.action.toLowerCase().includes(q.toLowerCase()) ||
      a.target.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <AppShell title="Activity Logs" subtitle="Immutable audit trail of every action">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <Input
            placeholder="Search by user, action or document…"
            className="max-w-md"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Button variant="outline" className="ml-auto"><Download className="h-4 w-4 mr-1" />Export CSV</Button>
        </div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Document / Target</TableHead>
                  <TableHead className="text-right">Date & Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                    ))
                  : filtered.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">{a.user}</TableCell>
                        <TableCell><span className="text-sm text-muted-foreground">{a.action}</span></TableCell>
                        <TableCell>{a.target}</TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">{a.time}</TableCell>
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
