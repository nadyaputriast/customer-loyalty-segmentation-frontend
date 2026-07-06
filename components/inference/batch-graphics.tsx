"use client";

import { useMemo } from "react";
import { SegmentationData } from "@/services/segments";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const SEGMENT_COLORS: Record<string, string> = {
  "Uncertain Lost Customers": "#ef4444",
  "Platinum Customers": "#06b6d4",
  "Dormant Lost Customers": "#f97316",
  "High Value Loyal Customers": "#22c55e",
};

export function BatchInferenceGraphics({ data }: { data: SegmentationData[] }) {
  // 1. Data Distribusi Pie Chart
  const distributionData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((item) => {
      counts[item.segment] = (counts[item.segment] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      fill: SEGMENT_COLORS[name] || "#a1a1aa",
    }));
  }, [data]);

  // 2. Data LRFM Averages dengan Dual Axis Logic
  const lrfmAverages = useMemo(() => {
    let totalL = 0, totalR = 0, totalF = 0, totalM = 0;
    let count = 0;

    data.forEach((item) => {
      if (item.lrfm_calculated) {
        totalL += item.lrfm_calculated.L;
        totalR += item.lrfm_calculated.R;
        totalF += item.lrfm_calculated.F;
        totalM += item.lrfm_calculated.M;
        count += 1;
      }
    });

    if (count === 0) return [];

    // Kita pisahkan LRF (angka kecil) dan M (angka besar) ke key yang berbeda
    return [
      { metric: "Length", nilaiLRF: Number((totalL / count).toFixed(2)) },
      { metric: "Recency", nilaiLRF: Number((totalR / count).toFixed(2)) },
      { metric: "Frequency", nilaiLRF: Number((totalF / count).toFixed(2)) },
      { metric: "Monetary", nilaiM: Number((totalM / count).toFixed(2)) }, 
    ];
  }, [data]);

  if (data.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
      {/* KARTU 1: DISTRIBUSI SEGMEN */}
      <Card className="rounded-2xl border-zinc-200/60 shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-lg">Distribusi Segmen</CardTitle>
          <CardDescription>Penyebaran hasil klasifikasi pelanggan dari file ini.</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '12px' }} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* KARTU 2: LRFM DUAL-AXIS BAR CHART */}
      {lrfmAverages.length > 0 && (
        <Card className="rounded-2xl border-zinc-200/60 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Rata-rata LRFM (Batch)</CardTitle>
            <CardDescription>Menggunakan dua sumbu agar nilai uang (Monetary) terlihat jelas.</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lrfmAverages} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5"/>
                <XAxis dataKey="metric" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                
                {/* Sumbu Kiri untuk L, R, F */}
                <YAxis yAxisId="left" orientation="left" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#71717a' }} />
                
                {/* Sumbu Kanan khusus untuk Monetary */}
                <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#10b981' }} 
                  tickFormatter={(val) => `¥${(val / 1000).toFixed(0)}k`} // Format ribuan agar rapi
                />
                
                <RechartsTooltip 
                  cursor={{ fill: '#f4f4f5' }} 
                  contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value: unknown, name: unknown) => {
                    // Cast 'unknown' to standard formats safely
                    const numericValue = Number(value) || 0;
                    const stringName = String(name);
                    
                    // Beri format ¥ untuk nilai Monetary di dalam tooltip
                    if (stringName === "Nilai Monetary (¥)") {
                      return [`¥ ${numericValue.toLocaleString("id-ID")}`, stringName];
                    }
                    return [numericValue, stringName];
                  }}
                />
                
                <Bar yAxisId="left" dataKey="nilaiLRF" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Nilai L/R/F" />
                <Bar yAxisId="right" dataKey="nilaiM" fill="#10b981" radius={[4, 4, 0, 0]} name="Nilai Monetary (¥)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}