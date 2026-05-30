import { SegmentSummary } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function ClusterList({
  segments,
  activeSegmentId,
  onSelectSegment
}: {
  segments: SegmentSummary[],
  activeSegmentId: string,
  onSelectSegment: (id: string) => void
}) {
  return (
    <Card className="rounded-3xl border-zinc-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-white/50 backdrop-blur-xl h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-4 border-b border-zinc-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-medium text-zinc-900">Segments</CardTitle>
            <CardDescription className="text-xs mt-1">Select a cluster to isolate</CardDescription>
          </div>
          {activeSegmentId !== "all" && (
            <button
              onClick={() => onSelectSegment("all")}
              className="text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-3 py-1.5 rounded-full font-medium transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-1 overflow-y-auto space-y-3">
        {segments.map((segment) => {
          const isActive = activeSegmentId === segment.id;
          return (
            <div
              key={segment.id}
              onClick={() => onSelectSegment(segment.id)}
              className={`relative group rounded-2xl p-4 transition-all duration-300 cursor-pointer border ${isActive
                ? 'border-zinc-300 shadow-[0_4px_20px_rgb(0,0,0,0.05)] bg-white ring-1 ring-zinc-100'
                : 'border-transparent hover:border-zinc-200/80 hover:bg-white/60 hover:shadow-sm'
                }`}
            >
              {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-zinc-800 rounded-r-full" />}

              <div className="flex justify-between items-start mb-2">
                <h4 className="text-sm font-semibold flex items-center gap-2 text-zinc-900">
                  <div className="w-2.5 h-2.5 rounded-full shadow-inner" style={{ backgroundColor: segment.color }} />
                  {segment.name}
                </h4>
                <div className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 ${isActive ? 'bg-zinc-100 text-zinc-800' : 'bg-zinc-50 text-zinc-500'}`}>
                  <Users className="w-3 h-3" />
                  {segment.userCount.toLocaleString()}
                </div>
              </div>

              <p className="text-[11px] leading-relaxed text-zinc-500 line-clamp-2 mb-3">
                {segment.description}
              </p>

              <div className="flex items-center justify-between text-[10px] text-zinc-400 border-t border-zinc-100 pt-2">
                <span>Avg. Spend</span>
                <span className="font-medium text-zinc-700">${segment.avgMonetary.toFixed(2)}</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}