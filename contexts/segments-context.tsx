'use client';

import { createContext, useState, useContext, useCallback, ReactNode } from "react";
import { getSegmentDistribution } from "@/services/segments";
import { SegmentSummary, RFMDataPoint } from "@/types";

interface RawBackendData {
  customer_id?: string;
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
  getDistributionAsync: (force?: boolean) => Promise<void>;
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

const DISTRIBUTION_CACHE_TTL_MS = 60_000; // 1 minute
let distributionCache: {
  segments: SegmentSummary[];
  allSegmentData: SegmentSummary[];
  scatterData: RFMDataPoint[];
  clusterStats: ClusterStats[];
  fetchedAt: number;
} | null = null;

function formatScatterData(rawScatter: RawBackendData[]): RFMDataPoint[] {
  return rawScatter.map((item: RawBackendData) => ({
    customer_id: item.customer_id || "",
    length: item.Length !== undefined ? item.Length : (item.length || 0),
    recency: item.Recency !== undefined ? item.Recency : (item.recency || 0),
    frequency: item.Frequency !== undefined ? item.Frequency : (item.frequency || 0),
    monetary: item.Monetary !== undefined ? item.Monetary : (item.monetary || 0),
    clusterId: String(item.Cluster !== undefined ? item.Cluster : item.clusterId)
  }));
}

export function SegmentsProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [segments, setSegments] = useState<SegmentSummary[] | null>(null);
  const [allSegmentData, setAllSegmentData] = useState<SegmentSummary[] | null>(null);
  const [scatterData, setScatterData] = useState<RFMDataPoint[] | null>(null);
  const [clusterStats, setClusterStats] = useState<ClusterStats[] | null>(null);

  const getDistributionAsync = useCallback(async (force = false) => {
    const isFresh = distributionCache && (Date.now() - distributionCache.fetchedAt) < DISTRIBUTION_CACHE_TTL_MS;
    if (!force && isFresh && distributionCache) {
      setSegments(distributionCache.segments);
      setAllSegmentData(distributionCache.allSegmentData);
      setScatterData(distributionCache.scatterData);
      setClusterStats(distributionCache.clusterStats);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await getSegmentDistribution();
      if (response.error) throw new Error(response.message || 'Failed to fetch segment distribution');

      const formattedScatterData = formatScatterData(response.data.scatterData || []);
      const nextClusterStats = response.data.clusterStats || [];

      distributionCache = {
        segments: response.data.segments,
        allSegmentData: response.data.allSegmentData,
        scatterData: formattedScatterData,
        clusterStats: nextClusterStats,
        fetchedAt: Date.now(),
      };

      setSegments(response.data.segments);
      setAllSegmentData(response.data.allSegmentData);
      setScatterData(formattedScatterData);
      setClusterStats(nextClusterStats);
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