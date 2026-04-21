import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { usePendingDocuments } from "@/hooks/use-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
const RESIDENCES = ["Steve Biko", "Campbell", "Corlo Court", "Winterton", "Student Village", "Stratford"] as const;
import { FileText, Filter, Upload, Download, Eye, MessageSquare } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/documents")({
  head: () => ({
    meta: [
      { title: "Documents — DUT ResLife360" },
      { name: "description", content: "Upload, categorize, preview and approve residence documents." },
    ],
  }),
  component: DocumentsPage,
});

const STATUS_TONE: Record<string, string> = {
  Approved: "bg-success/15 text-success",
  Pending: "bg-warning/20 text-warning-foreground",
  "Under Review": "bg-info/15 text-info",
  Rejected: "bg-destructive/15 text-destructive",
};

function DocumentsPage() {
  const [residence, setResidence] = useState<string>("all");
  const [q, setQ] = useState("");
  const { allDocuments, loading } = usePendingDocuments();

  const filtered = allDocuments.filter(
    (d) =>
      (residence === "all" || d.residence === residence) &&
      d.name.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <AppShell title="Documents" subtitle="Centralized document management with approval workflow">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <Input placeholder="Search documents…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
          <Select value={residence} onValueChange={setResidence}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All residences</SelectItem>
              {RESIDENCES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-1" />More filters</Button>
          <div className="ml-auto">
            <Button><Upload className="h-4 w-4 mr-1" />Upload document</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-36 w-full rounded-xl" />)
            : filtered.map((d) => (
                <Card key={d.id} className="hover:shadow-md transition">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{d.name}</div>
                        <div className="text-xs text-muted-foreground">{d.residence} · {d.type}</div>
                      </div>
                      <Badge className={STATUS_TONE[d.status]} variant="secondary">{d.status}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center justify-between">
                      <span>{d.owner}</span>
                      <span>{d.updated} · {d.size}</span>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" variant="outline" className="flex-1"><Eye className="h-3.5 w-3.5 mr-1" />View</Button>
                      <Button size="sm" variant="outline" className="flex-1"><MessageSquare className="h-3.5 w-3.5 mr-1" />Comments</Button>
                      <Button size="sm" variant="ghost" className="px-2"><Download className="h-3.5 w-3.5" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
        </div>
      </div>
    </AppShell>
  );
}
