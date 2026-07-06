"use client";

import { useEffect } from "react";
import { Users, DollarSign, PieChart, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnalytics } from "@/contexts/analytics-context";

// Fungsi helper untuk menentukan Icon mana yang tampil
const getIcon = (title: string) => {
  if (title.toLowerCase().includes("pelanggan")) return <Users className="h-4 w-4 text-muted-foreground" />;
  if (title.toLowerCase().includes("nilai") || title.toLowerCase().includes("monetary")) return <DollarSign className="h-4 w-4 text-muted-foreground" />;
  if (title.toLowerCase().includes("segmen")) return <PieChart className="h-4 w-4 text-muted-foreground" />;
  return <Activity className="h-4 w-4 text-muted-foreground" />;
};

// Fungsi helper untuk Format Value
const formatValue = (title: string, value: string | number) => {
  if (typeof value === "string") return value;
  
  if (title.includes("Rata-rata Nilai") || title.includes("Monetary")) {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value * 1000); 
  }
  
  return new Intl.NumberFormat('id-ID').format(value);
};

export function SectionCards() {
  // 1. Panggil variabel yang TEPAT dari context
  const { kpis, loadingKpis, getKPIsAsync } = useAnalytics();

  // 2. Trigger fetch data ke Backend saat komponen dimuat
  useEffect(() => {
    getKPIsAsync();
  }, [getKPIsAsync]);

  // 3. Gunakan loadingKpis untuk memunculkan efek skeleton
  if (loadingKpis) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse bg-zinc-50 border-zinc-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
               <div className="h-4 w-1/2 bg-zinc-200 rounded"></div>
               <div className="h-4 w-4 bg-zinc-200 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-3/4 bg-zinc-200 rounded mt-2"></div>
              <div className="h-3 w-1/2 bg-zinc-200 rounded mt-3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Jika data kosong setelah loading selesai, jangan tampilkan apa-apa atau tampilkan fallback
  if (!kpis || kpis.length === 0) {
    return null; 
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {kpis.map((kpi, i) => (
        <Card key={i} className="shadow-sm border-zinc-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600">
              {kpi.title}
            </CardTitle>
            {getIcon(kpi.title)}
          </CardHeader>
          <CardContent>
            {/* Value Utama */}
            <div className="text-2xl font-bold text-zinc-900">
              {formatValue(kpi.title, kpi.value)}
            </div>
            {/* Teks Penjelasan Bawah */}
            <p className="text-xs text-muted-foreground mt-1">
              {typeof kpi.value === "string" 
                ? "Berdasarkan keseluruhan dataset" 
                : "Agregasi dari seluruh histori pelanggan"}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}