import { SegmentProfile, RFMDataPoint } from "@/lib/mock-api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';
import { Activity } from "lucide-react";

export default function ClusterScatterPlot({ 
  data, 
  segments, 
  activeSegmentId 
}: { 
  data: RFMDataPoint[], 
  segments: SegmentProfile[],
  activeSegmentId: string 
}) {
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const segment = segments.find(s => s.id === data.clusterId);
      return (
        <div className="bg-white/95 backdrop-blur-md p-4 border border-zinc-200/80 rounded-2xl shadow-[0_10px_40px_rgb(0,0,0,0.08)] text-xs space-y-2 z-50 min-w-[160px]">
          <div className="font-semibold text-zinc-900 flex items-center gap-2 pb-2 border-b border-zinc-100">
            <div className="w-2.5 h-2.5 rounded-full shadow-inner" style={{ backgroundColor: segment?.color }}/>
            {segment?.name}
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <span className="text-zinc-500">Recency:</span>
            <span className="text-zinc-900 font-medium text-right">{data.recency.toFixed(0)}d</span>
            <span className="text-zinc-500">Frequency:</span>
            <span className="text-zinc-900 font-medium text-right">{data.frequency.toFixed(0)}x</span>
            <span className="text-zinc-500">Monetary:</span>
            <span className="text-zinc-900 font-medium text-right">Rp {(data.monetary/1000).toFixed(0)}k</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="rounded-3xl border-zinc-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-white h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-2 px-8 pt-8 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-medium text-zinc-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-zinc-400" />
            Distribution Analysis
          </CardTitle>
          <CardDescription className="text-sm text-zinc-500 mt-1">
            Recency vs. Frequency mapping. Bubble size correlates to Monetary value.
          </CardDescription>
        </div>
      </CardHeader>
      
      {/* flex-1 allows this container to aggressively grow to fill the parent's height */}
      <CardContent className="flex-1 min-h-[450px] px-4 pb-8 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
            <XAxis 
              type="number" 
              dataKey="recency" 
              name="Recency" 
              unit=" d" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#a1a1aa' }} 
              tickMargin={10}
            />
            <YAxis 
              type="number" 
              dataKey="frequency" 
              name="Frequency" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#a1a1aa' }} 
              tickMargin={10}
            />
            <ZAxis type="number" dataKey="monetary" range={[60, 600]} name="Monetary" />
            
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
                   fillOpacity={activeSegmentId === "all" ? 0.6 : 0.85} // Make colors punchier when isolated
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