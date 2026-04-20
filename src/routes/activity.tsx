import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ACTIVITY } from "@/lib/mock-data";
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

const EXTRA = Array.from({ length: 12 }).map((_, i) => ({
  id: `e${i}`,
  user: ["Alvin Smith", "Sihle Zulu", "Phumlani Mnyango", "Sifiso Mvubu", "Nonhlanhla Mbatha"][i % 5],
  action: ["Viewed", "Edited", "Approved", "Commented", "Downloaded"][i % 5],
  target: ["Capex Q3.xlsx", "Heat Pumps Strategy.docx", "Beds Schedule.xlsx", "Procurement Plan.pdf"][i % 4],
  time: `${i + 2} hours ago`,
}));

function ActivityPage() {
  const all = [...ACTIVITY, ...EXTRA];
  return (
    <AppShell title="Activity Logs" subtitle="Immutable audit trail of every action">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <Input placeholder="Search by user, action or document…" className="max-w-md" />
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
                {all.map((a) => (
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
