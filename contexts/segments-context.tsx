'use client';

import { createContext, useState, useContext, useCallback, ReactNode } from "react";
import { getSegmentDistribution } from "@/services/segments";
import { SegmentSummary, RFMDataPoint } from "@/types";

interface RawBackendData {
  Length?: number;
  length?: number;
  Recency?: number;
  recency?: number;
  Frequency?: number;
  frequency?: number;
  Monetary?: number;
  monetary?: number;
  Cluster?: string | number;
  clusterId?: string | number;
}

interface SegmentsContextType {
  loading: boolean;
  error: string | null;
  segments: SegmentSummary[] | null;
  allSegmentData: SegmentSummary[] | null;
  scatterData: RFMDataPoint[] | null;
  clusterStats: ClusterStats[] | null;
  getDistributionAsync: () => Promise<void>;
}

export interface ClusterStats {
  id: string;
  name: string;
  userCount: number;
  meanL: number;
  stdL: number;
  meanR: number;
  stdR: number;
  meanF: number;
  stdF: number;
  meanM: number;
  stdM: number;
  color: string;
  description: string;
}

const SegmentsContext = createContext<SegmentsContextType | undefined>(undefined);

export function SegmentsProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [segments, setSegments] = useState<SegmentSummary[] | null>(null);
  const [allSegmentData, setAllSegmentData] = useState<SegmentSummary[] | null>(null);
  const [scatterData, setScatterData] = useState<RFMDataPoint[] | null>(null);
  const [clusterStats, setClusterStats] = useState<ClusterStats[] | null>(null);

  const getDistributionAsync = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getSegmentDistribution();

      if (response.error) {
        throw new Error(response.message || 'Failed to fetch segment distribution');
      }

      setSegments(response.data.segments);
      setAllSegmentData(response.data.allSegmentData);

      const rawScatter = response.data.scatterData || [];
      const formattedScatterData = rawScatter.map((item: RawBackendData) => ({
        length: item.Length !== undefined ? item.Length : (item.length || 0),
        recency: item.Recency !== undefined ? item.Recency : (item.recency || 0),
        frequency: item.Frequency !== undefined ? item.Frequency : (item.frequency || 0),
        monetary: item.Monetary !== undefined ? item.Monetary : (item.monetary || 0),
        clusterId: String(item.Cluster !== undefined ? item.Cluster : item.clusterId)
      }));

      setScatterData(formattedScatterData); 
      setClusterStats(response.data.clusterStats || []);
    } catch {
      setError("Failed to fetch segment distribution");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <SegmentsContext.Provider
      value={{ loading, error, segments, allSegmentData, scatterData, clusterStats, getDistributionAsync }}
    >
      {children}
    </SegmentsContext.Provider>
  );
}

export function useSegments() {
  const context = useContext(SegmentsContext);
  if (context === undefined) {
    throw new Error("useSegments must be used within a SegmentsProvider");
  }
  return context;
}