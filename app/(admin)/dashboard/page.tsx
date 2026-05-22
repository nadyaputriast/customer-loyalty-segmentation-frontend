"use client";

import { useEffect, useState } from "react";
import { api, DashboardKPI, ChartData, CustomerRecord } from "@/lib/mock-api";
import { Loader2 } from "lucide-react";
import ActivityChartSection from "@/components/dashboard/activity-chart";
import CustomerTableSection from "@/components/dashboard/customer-table";
import { SiteHeader } from "@/components/layout/site-header";
import { SectionCards } from "@/components/dashboard/section-cards";

export default function DashboardPage() {
  const [data, setData] = useState<{
    kpis: DashboardKPI[];
    chart: ChartData[];
    customers: CustomerRecord[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [timeRange, setTimeRange] = useState("3m");
  const [segmentFilter, setSegmentFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    setIsLoading(true);

    api.getDashboardData({
      timeRange,
      segment: segmentFilter,
      search: searchQuery,
      status: statusFilter,
    }).then((res) => {
      setData(res);
      setIsLoading(false);
    });
  }, [timeRange, segmentFilter, searchQuery, statusFilter]);

  if (!data && isLoading) {
    return (
      <div className="min-h-svh flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <>
      <SiteHeader
        breadcrumbs={[
          { label: "LoyalT", href: "/dashboard" },
          { label: "Dashboard" },
        ]}
      />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="relative flex w-full flex-col gap-6 px-4 lg:px-6">
            {isLoading && data && (
              <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] z-50 flex items-center justify-center transition-all">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-600" />
              </div>
            )}

            <header className="w-full">
              <h1 className="text-xl font-medium tracking-tight text-zinc-900">
                Good evening, Admin
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Here is what is happening today.
              </p>
            </header>

            <SectionCards />

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
      </div>
    </>
  );
}
