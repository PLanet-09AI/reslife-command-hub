import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useFloors } from "@/hooks/use-dashboard";

export const Route = createFileRoute("/floorplans")({
  head: () => ({
    meta: [
      { title: "Floorplans — DUT ResLife360" },
      { name: "description", content: "Interactive residence floorplans with live room status." },
    ],
  }),
  component: FloorplansPage,
});

type Room = { id: string; label: string; status: "occupied" | "vacant" | "maintenance" | "reserved" };

const SAMPLE_ROOMS: Room[] = Array.from({ length: 24 }, (_, i) => {
  const r = i % 7;
  const status: Room["status"] = r === 0 ? "vacant" : r === 1 ? "maintenance" : r === 2 ? "reserved" : "occupied";
  return { id: `r${i + 1}`, label: `${100 + i + 1}`, status };
});

const STATUS_FILL: Record<Room["status"], string> = {
  occupied: "fill-primary/80",
  vacant: "fill-success/70",
  maintenance: "fill-warning/80",
  reserved: "fill-info/70",
};

function FloorplansPage() {
  const { floors, loading } = useFloors();
  const [selected, setSelected] = useState<Room | null>(null);
  const [floorIdx, setFloorIdx] = useState(0);
  const floor = floors[floorIdx];

  if (loading) return (
    <AppShell title="Floorplans" subtitle="Interactive room-level view of each residence">
      <Skeleton className="h-96 w-full rounded-xl" />
    </AppShell>
  );

  return (
    <AppShell title="Floorplans" subtitle="Interactive room-level view of each residence">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {floors.map((f, i) => (
              <Button
                key={f.id}
                variant={floorIdx === i ? "default" : "outline"}
                size="sm"
                onClick={() => { setFloorIdx(i); setSelected(null); }}
              >
                {f.residence} · {f.floor}
              </Button>
            ))}
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-3 mb-4 text-xs">
                {(["occupied", "vacant", "maintenance", "reserved"] as const).map((s) => (
                  <span key={s} className="flex items-center gap-1.5 capitalize">
                    <span className={`inline-block h-3 w-3 rounded ${STATUS_FILL[s].replace("fill-", "bg-").replace("/80", "").replace("/70", "")}`} />
                    {s}
                  </span>
                ))}
              </div>
              {floor && (
                <svg viewBox="0 0 600 400" className="w-full h-auto bg-muted/20 rounded-md border border-border">
                  <rect x="10" y="10" width="580" height="380" fill="none" stroke="var(--border)" strokeWidth="2" />
                  {SAMPLE_ROOMS.slice(0, floor.rooms).map((room, i) => {
                    const col = i % 8;
                    const row = Math.floor(i / 8);
                    const x = 30 + col * 70;
                    const y = 30 + row * 115;
                    const isSel = selected?.id === room.id;
                    return (
                      <g key={room.id} onClick={() => setSelected(room)} className="cursor-pointer">
                        <rect
                          x={x}
                          y={y}
                          width="60"
                          height="100"
                          className={`${STATUS_FILL[room.status]} ${isSel ? "stroke-foreground stroke-2" : "stroke-border"}`}
                          rx="4"
                        />
                        <text x={x + 30} y={y + 55} textAnchor="middle" className="fill-primary-foreground text-xs font-semibold">
                          {room.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Room details</div>
            {selected ? (
              <div className="space-y-3">
                <div className="text-2xl font-semibold">Room {selected.label}</div>
                <Badge className="capitalize">{selected.status}</Badge>
                <div className="text-sm text-muted-foreground space-y-1 pt-2 border-t border-border">
                  <div><span className="font-medium text-foreground">Resident:</span> {selected.status === "occupied" ? "Lerato Khumalo" : "—"}</div>
                  <div><span className="font-medium text-foreground">Email:</span> {selected.status === "occupied" ? "21856321@dut.ac.za" : "—"}</div>
                  <div><span className="font-medium text-foreground">Check-in:</span> 15 Feb 2025</div>
                  <div><span className="font-medium text-foreground">Notes:</span> {selected.status === "maintenance" ? "Geyser repair scheduled" : "—"}</div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground py-12 text-center">Click a room to see details</div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
