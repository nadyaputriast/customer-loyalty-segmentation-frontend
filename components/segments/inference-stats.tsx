"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ClusterStats } from "@/contexts/segments-context";
import { SegmentationData, SegmentationHistoryItem } from "@/services/segments";

export default function InferenceCharts({ 
  inferenceResult, 
  clusterStats 
}: { 
  inferenceResult: SegmentationData | SegmentationHistoryItem | null, 
  clusterStats: ClusterStats[] 
}) {
  const probabilityData = useMemo(() => {
    if (!inferenceResult?.fuzzy_membership) return [];
    return Object.entries(inferenceResult.fuzzy_membership)
      .map(([key, val]) => ({
        segment: key,
        probabilitas: parseFloat(val as string),
      }))
      .sort((a, b) => b.probabilitas - a.probabilitas);
  }, [inferenceResult]);

  const radarData = useMemo(() => {
    if (!inferenceResult?.lrfm_calculated || !clusterStats) return [];
    
    const stats = clusterStats.find((c) => parseInt(c.id) === inferenceResult.cluster);
    if (!stats) return [];

    const customer = inferenceResult.lrfm_calculated;

    return [
      { metric: "Length", Pelanggan: customer.L, RataRata: stats.meanL, std: stats.stdL },
      { metric: "Recency", Pelanggan: customer.R, RataRata: stats.meanR, std: stats.stdR },
      { metric: "Frequency", Pelanggan: customer.F, RataRata: stats.meanF, std: stats.stdF },
      { metric: "Monetary", Pelanggan: customer.M, RataRata: stats.meanM, std: stats.stdM },
    ];
  }, [inferenceResult, clusterStats]);

  if (!inferenceResult) return null;

  return (
    <div className="flex flex-col gap-6 mt-4 pb-8">
      
      {/* Chart Radar LRFM vs Cluster (Ditaruh di atas karena ini yang paling penting) */}
      {radarData.length > 0 && (
        <Card className="shadow-none border-zinc-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Karakteristik vs Rata-rata Segmen</CardTitle>
            <CardDescription className="text-xs">
              Area hijau adalah rata-rata segmen. Area biru adalah nilai pelanggan ini.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="60%" data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12, fill: "#52525b" }} />
                <PolarRadiusAxis angle={30} domain={['auto', 'auto']} tick={false} axisLine={false} />
                <Radar name="Pelanggan Ini" dataKey="Pelanggan" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                <Radar name="Rata-rata Segmen" dataKey="RataRata" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value, name, props) => {
                    if (name === "Rata-rata Segmen" && props.payload.std !== undefined) {
                      return [`${(value as number).toFixed(2)} (±${props.payload.std.toFixed(2)})`, name];
                    }
                    return [(value as number).toFixed(2), name];
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Chart Probabilitas */}
      <Card className="shadow-none border-zinc-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Detail Persentase Kemiripan</CardTitle>
          <CardDescription className="text-xs">
            Visualisasi tingkat kemiripan gaya belanja dengan segmen lain.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-70 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={probabilityData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e4e4e7" />
              <XAxis type="number" unit="%" domain={[0, 100]} tick={{ fontSize: 12 }} />
              <YAxis dataKey="segment" type="category" width={100} fontSize={11} tick={{ fill: "#52525b" }} />
              <Tooltip cursor={{fill: '#f4f4f5'}} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} formatter={(value) => `${(value as number).toFixed(2)}%`} />
              <Bar dataKey="probabilitas" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

    </div>
  );
}