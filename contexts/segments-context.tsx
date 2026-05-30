'use client';

import { createContext, useState, useContext, useCallback, ReactNode } from "react";
import { getSegmentDistribution } from "@/services/segments";
import { SegmentSummary, RFMDataPoint } from "@/types";

interface SegmentsContextType {
  loading: boolean;
  error: string | null;
  segments: SegmentSummary[] | null;
  allSegmentData: SegmentSummary[] | null;
  scatterData: RFMDataPoint[] | null;
  getDistributionAsync: () => Promise<void>;
}

const SegmentsContext = createContext<SegmentsContextType | undefined>(undefined);

export function SegmentsProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [segments, setSegments] = useState<SegmentSummary[] | null>(null);
  const [allSegmentData, setAllSegmentData] = useState<SegmentSummary[] | null>(null);
  const [scatterData, setScatterData] = useState<RFMDataPoint[] | null>(null);

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
      setScatterData(response.data.scatterData);
    } catch (err) {
      setError("Failed to fetch segment distribution");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <SegmentsContext.Provider
      value={{ loading, error, segments, allSegmentData, scatterData, getDistributionAsync }}
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