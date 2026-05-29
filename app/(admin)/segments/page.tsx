"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import ClusterList from "@/components/segments/cluster-list";
import ClusterMetricsRow from "@/components/segments/cluster-metrics";
import ClusterScatterPlot from "@/components/segments/scatter-plot";
import { SiteHeader } from "@/components/layout/site-header";
import { useSegments } from "@/contexts/segments-context";

export default function SegmentPage() {
  const { segments, allSegmentData, scatterData, loading, getDistributionAsync } = useSegments();
  const [activeSegmentId, setActiveSegmentId] = useState<string>("all");

  useEffect(() => {
    getDistributionAsync();
  }, [getDistributionAsync]);

  if (loading || !segments || !allSegmentData) {
    return (
      <div className="min-h-svh flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  const activeSegment =
    allSegmentData.find((s) => s.id === activeSegmentId) ||
    allSegmentData[0];

  return (
    <>
      <SiteHeader
        breadcrumbs={[
          { label: "LoyalT", href: "/dashboard" },
          { label: "Customer Segments" },
        ]}
      />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex w-full flex-col gap-6 px-4 lg:px-6">
            <header className="w-full">
              <h1 className="text-xl font-medium tracking-tight text-zinc-900">
                Customer Segmentation
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Fuzzy C-Means cluster analysis based on RFM modeling.
              </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
              <div className="lg:col-span-4 xl:col-span-3 h-full">
                <div className="sticky top-10 h-full max-h-[calc(100vh-10rem)]">
                  <ClusterList
                    segments={segments}
                    activeSegmentId={activeSegmentId}
                    onSelectSegment={setActiveSegmentId}
                  />
                </div>
              </div>

              <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6 h-full">
                {activeSegment && (
                  <div className="shrink-0 animate-in slide-in-from-bottom-2 duration-300">
                    <ClusterMetricsRow activeSegment={activeSegment} />
                  </div>
                )}

                <div className="flex-1 w-full relative">
                  <ClusterScatterPlot
                    data={scatterData || []}
                    segments={segments}
                    activeSegmentId={activeSegmentId}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
