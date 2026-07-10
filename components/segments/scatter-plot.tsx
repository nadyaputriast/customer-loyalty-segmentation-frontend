import { useState } from "react";
import { SegmentSummary, RFMDataPoint } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

type ChartView = "lvr" | "lvf" | "lvm" | "rvf" | "rvm" | "fvm";

export default function ClusterScatterPlot({
  data,
  segments,
  activeSegmentId
}: {
  data: RFMDataPoint[],
  segments: SegmentSummary[],
  activeSegmentId: string
}) {
  const [activeView, setActiveView] = useState<ChartView>("rvf");

  const viewConfig = {
    lvr: { x: "length", y: "recency", xName: "Length", yName: "Recency", xUnit: "d", yUnit: "d" },
    lvf: { x: "length", y: "frequency", xName: "Length", yName: "Frequency", xUnit: "d", yUnit: "x" },
    lvm: { x: "length", y: "monetary", xName: "Length", yName: "Monetary", xUnit: "d", yUnit: "¥" },
    rvf: { x: "recency", y: "frequency", xName: "Recency", yName: "Frequency", xUnit: "d", yUnit: "x" },
    rvm: { x: "recency", y: "monetary", xName: "Recency", yName: "Monetary", xUnit: "d", yUnit: "¥" },
    fvm: { x: "frequency", y: "monetary", xName: "Frequency", yName: "Monetary", xUnit: "x", yUnit: "¥" }
  };

  const currentConfig = viewConfig[activeView];

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: RFMDataPoint }[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const segment = segments.find(s => s.id === data.clusterId);
      return (
        <div className="bg-white/95 backdrop-blur-md p-4 border border-zinc-200/80 rounded-2xl shadow-[0_10px_40px_rgb(0,0,0,0.08)] text-xs space-y-2 z-50 min-w-40">
          <div className="font-semibold text-zinc-900 flex items-center gap-2 pb-2 border-b border-zinc-100">
            <div className="w-2.5 h-2.5 rounded-full shadow-inner" style={{ backgroundColor: segment?.color }} />
            {segment?.name}
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <span className="text-zinc-500">Length:</span>
            <span className="text-zinc-900 font-medium text-right">{data.length ? data.length.toFixed(0) : 0}d</span>
            <span className="text-zinc-500">Recency:</span>
            <span className="text-zinc-900 font-medium text-right">{data.recency?.toFixed(0)}d</span>
            <span className="text-zinc-500">Frequency:</span>
            <span className="text-zinc-900 font-medium text-right">{data.frequency?.toFixed(0)}x</span>
            <span className="text-zinc-500">Monetary:</span>
            <span className="text-zinc-900 font-medium text-right">¥{data.monetary?.toFixed(2)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const formatTick = (val: number, unit: string) => {
    if (unit === "¥") return `¥${val.toFixed(0)}`;
    return `${val}${unit}`;
  };

  return (
    <Card className="rounded-3xl border-zinc-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-white h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-2 px-8 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-xl font-medium text-zinc-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-zinc-400" />
            Distribution Analysis
          </CardTitle>
          <CardDescription className="text-sm text-zinc-500 mt-1">
            {currentConfig.xName} vs. {currentConfig.yName} dimension mapping.
          </CardDescription>
        </div>

        <div className="flex flex-wrap gap-1 bg-zinc-50 p-1 rounded-2xl border border-zinc-200/60">
          {(Object.keys(viewConfig) as ChartView[]).map((viewKey) => {
            const labels = { lvr: "L vs R", lvf: "L vs F", lvm: "L vs M", rvf: "R vs F", rvm: "R vs M", fvm: "F vs M" };
            return (
              <Button
                key={viewKey}
                variant="ghost"
                size="sm"
                onClick={() => setActiveView(viewKey)}
                className={`rounded-full h-7 text-xs px-3 transition-all ${activeView === viewKey ? "bg-white shadow-sm text-zinc-900 font-medium" : "text-zinc-500 hover:text-zinc-700"}`}
              >
                {labels[viewKey]}
              </Button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="flex-1 min-h-112.5 px-4 pb-8 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
            <XAxis
              type="number"
              dataKey={currentConfig.x}
              name={currentConfig.xName}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#a1a1aa' }}
              tickMargin={10}
              tickFormatter={(val) => formatTick(val, currentConfig.xUnit)}
            />
            <YAxis
              type="number"
              dataKey={currentConfig.y}
              name={currentConfig.yName}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#a1a1aa' }}
              tickMargin={10}
              scale="log"             
              domain={['auto', 'auto']}
              tickFormatter={(val) => formatTick(val, currentConfig.yUnit)}
            />

            {/* ZAXIS DIHAPUS - TIDAK ADA BUBBLE SIZE LAGI */}

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ strokeDasharray: '3 3', stroke: '#e4e4e7', strokeWidth: 2 }}
            />

            {segments.map((segment) => {
              if (activeSegmentId !== "all" && activeSegmentId !== segment.id) return null;

              const segmentData = data.filter(d => d.clusterId === segment.id);
              return (
                <Scatter
                  key={segment.id}
                  name={segment.name}
                  data={segmentData}
                  fill={segment.color}
                  fillOpacity={activeSegmentId === "all" ? 0.6 : 0.85}
                  stroke={segment.color}
                  strokeWidth={1}
                />
              )
            })}
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}