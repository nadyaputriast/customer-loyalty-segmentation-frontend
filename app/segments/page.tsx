"use client";

import { useEffect, useState } from "react";
import { api, SegmentProfile, RFMDataPoint } from "@/lib/mock-api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';
import { Loader2, Users, ShoppingBag, Clock, ArrowRight, Activity } from "lucide-react";
import ClusterList from '@/components/segments/cluster-list'
import ClusterMetricsRow from "@/components/segments/cluster-metrics"
import ClusterScatterPlot from "@/components/segments/scatter-plot";

export default function SegmentPage() {
  const [data, setData] = useState<{ 
    segments: SegmentProfile[], 
    allSegmentData: SegmentProfile[],
    scatterData: RFMDataPoint[] 
  } | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [activeSegmentId, setActiveSegmentId] = useState<string>("all");

  useEffect(() => {
    api.getSegments().then((res) => {
      setData(res);
      setIsLoading(false);
    });
  }, []);

  if (!data && isLoading) {
    return (
      <div className="min-h-screen bg-[#FBFBFD] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  const activeSegment = data?.allSegmentData.find(s => s.id === activeSegmentId) || data?.allSegmentData[0];

  return (
    // Apple style off-white background
    <div className="min-h-screen bg-[#FBFBFD] w-full p-8 md:p-10 animate-in fade-in duration-500 flex flex-col">
      
      <header className="mb-8 w-full shrink-0">
        <h1 className="text-2xl font-medium tracking-tight text-zinc-900">
          Customer Segmentation
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Fuzzy C-Means cluster analysis based on RFM modeling.
        </p>
      </header>

      {/* This is where the magic happens for vertical real estate. 
        We use flex-1 to make this grid grow to the bottom of the screen. 
      */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full flex-1 min-h-[calc(100vh-12rem)]">
        
        {/* Left Column: Sticky behavior so it doesn't get lost if right side is super tall */}
        <div className="lg:col-span-4 xl:col-span-3 h-full">
          <div className="sticky top-10 h-full max-h-[calc(100vh-8rem)]">
            <ClusterList 
              segments={data?.segments || []} 
              activeSegmentId={activeSegmentId}
              onSelectSegment={setActiveSegmentId}
            />
          </div>
        </div>

        {/* Right Column: Uses flex-col so the chart can be told to flex-grow */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6 h-full">
          
          {activeSegment && (
            <div className="shrink-0 animate-in slide-in-from-bottom-2 duration-300">
              <ClusterMetricsRow activeSegment={activeSegment} />
            </div>
          )}

          <div className="flex-1 w-full relative">
             <ClusterScatterPlot 
               data={data?.scatterData || []} 
               segments={data?.segments || []}
               activeSegmentId={activeSegmentId}
             />
          </div>

        </div>

      </div>
    </div>
  );
}