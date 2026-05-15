import { SegmentProfile } from "@/lib/mock-api";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag, Clock, ArrowRight } from "lucide-react";

export default function ClusterMetricsRow({ activeSegment }: { activeSegment: SegmentProfile }) {
  const metrics = [
    { label: "Avg Recency", value: activeSegment.avgRecency.toFixed(0), unit: "days", icon: Clock },
    { label: "Avg Frequency", value: activeSegment.avgFrequency.toFixed(1), unit: "purchases", icon: ArrowRight },
    { label: "Avg Monetary", value: `Rp ${(activeSegment.avgMonetary / 1000).toFixed(0)}k`, unit: "avg spend", icon: ShoppingBag },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 w-full">
      {metrics.map((m, i) => {
        const Icon = m.icon;
        return (
          <Card key={i} className="rounded-3xl border-zinc-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.02)] bg-white transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <CardContent className="p-5 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-zinc-500">
                <div className="p-1.5 bg-zinc-50 rounded-lg border border-zinc-100">
                  <Icon className="w-3.5 h-3.5 text-zinc-600" />
                </div>
                <span className="text-[11px] font-medium uppercase tracking-wider">{m.label}</span>
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-semibold tracking-tight text-zinc-900">{m.value}</span>
                <span className="text-xs font-medium text-zinc-400">{m.unit}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}