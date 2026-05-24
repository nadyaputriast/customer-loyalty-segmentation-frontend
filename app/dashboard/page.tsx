"use client";

import { useEffect, useState } from "react";
import { api, DashboardKPI, ChartData, CustomerRecord } from "@/lib/mock-api";
import { Loader2 } from "lucide-react";
import KPICard  from '@/components/dashboard/kpi-card'
import ActivityChartSection from "@/components/dashboard/activity-chart";
import CustomerTableSection from "@/components/dashboard/customer-table";

export default function DashboardPage() {
  // 1. Data State
  const [data, setData] = useState<{ kpis: DashboardKPI[], chart: ChartData[], customers: CustomerRecord[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Filter States (The Single Source of Truth)
  const [timeRange, setTimeRange] = useState("3m");
  const [segmentFilter, setSegmentFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // 3. Fetch Data Effect (Triggers when filters change)
  useEffect(() => {
    setIsLoading(true);
    
    // Pass the states directly to your API contract
    api.getDashboardData({
      timeRange,
      segment: segmentFilter,
      search: searchQuery,
      status: statusFilter
    }).then((res) => {
      setData(res);
      setIsLoading(false);
    });
  }, [timeRange, segmentFilter, searchQuery, statusFilter]);

  if (!data && isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] w-full p-8 md:p-10 animate-in fade-in duration-500 relative">
      
      {/* Subtle loading overlay when refetching data */}
      {isLoading && data && (
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] z-50 flex items-center justify-center transition-all">
           <Loader2 className="w-6 h-6 animate-spin text-zinc-600" />
        </div>
      )}

      <header className="mb-8 w-full">
        <h1 className="text-2xl font-medium tracking-tight text-zinc-900">
          Good evening, Admin (ง🔥ﾛ🔥)ง
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Here is what is happening today.</p>
      </header>

      <div className="w-full flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full">
          {data?.kpis.map((kpi, index) => (
            <KPICard key={kpi.title} kpi={kpi} index={index} />
          ))}
        </div>

        <ActivityChartSection 
          data={data?.chart || []} 
          timeRange={timeRange}
          setTimeRange={setTimeRange}
          segment={segmentFilter}
          setSegment={setSegmentFilter}
        />

        <CustomerTableSection 
          customers={data?.customers || []} 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
      </div>
    </div>
  );
}