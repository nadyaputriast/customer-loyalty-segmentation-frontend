'use client';

import { getUserFromCookies } from '@/hooks/use-auth'
import { getCustomerTableData, getChartData, getDashboardKPIs } from "@/services/analytics";
import { CustomerTableMetadata, CustomerRecord, DateRangeOption, ChartData, DashboardKPI, User } from "@/types";
import { createContext, useState, useContext, useCallback, useEffect, ReactNode } from "react";

interface AnalyticsContextType {
  user: User | null;
  loadingKpis: boolean;
  loadingCharts: boolean;
  loadingTable: boolean;
  error: string | null;
  kpis: DashboardKPI[] | null;
  charts: ChartData[] | null;
  customerTableData: CustomerRecord[] | null;
  customerTableMetadata: CustomerTableMetadata | null;
  getKPIsAsync: () => Promise<void>;
  getChartDataAsync: (targetDate: string | Date, dateRange: DateRangeOption) => Promise<void>;
  getCustomerTableDataAsync: (page: number, perPage: number, search?: string, segment?: string) => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Split loading states for localized skeletons
  const [loadingKpis, setLoadingKpis] = useState<boolean>(false);
  const [loadingCharts, setLoadingCharts] = useState<boolean>(false);
  const [loadingTable, setLoadingTable] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);
  const [kpis, setKpis] = useState<DashboardKPI[] | null>(null);
  const [charts, setCharts] = useState<ChartData[] | null>(null);
  const [customerTableData, setCustomerTableData] = useState<CustomerRecord[] | null>(null);
  const [customerTableMetadata, setCustomerTableMetadata] = useState<CustomerTableMetadata | null>(null);

  // Simple in-memory cache dictionaries
  const [kpiCache, setKpiCache] = useState<Record<string, DashboardKPI[]>>({});
  const [chartCache, setChartCache] = useState<Record<string, ChartData[]>>({});

  useEffect(() => {
    const userFromCookie = getUserFromCookies();
    if (userFromCookie) setUser(userFromCookie);
  }, []);

  const getKPIsAsync = useCallback(async () => {
    // Karena KPI sekarang agregat global, kita gunakan cache key statis
    const cacheKey = 'global_kpis';

    if (kpiCache[cacheKey]) {
      setKpis(kpiCache[cacheKey]);
      return;
    }

    setLoadingKpis(true);
    try {
      const response = await getDashboardKPIs();
      if (!response.error && response.data) {
        setKpis(response.data.data);
        setKpiCache(prev => ({ ...prev, [cacheKey]: response.data.data }));
      }
    } catch (err) {
      setError("Failed to fetch KPIs");
      console.error(err);
    } finally {
      setLoadingKpis(false);
    }
  }, [kpiCache]);

  const getChartDataAsync = useCallback(async (targetDate: string | Date, dateRange: DateRangeOption) => {
    const cacheKey = `${new Date(targetDate).toISOString().split('T')[0]}_${dateRange}`;

    if (chartCache[cacheKey]) {
      setCharts(chartCache[cacheKey]);
      return;
    }

    setLoadingCharts(true);
    try {
      const response = await getChartData(targetDate, dateRange);
      if (!response.error && response.data) {
        setCharts(response.data.data);
        setChartCache(prev => ({ ...prev, [cacheKey]: response.data.data }));
      } else {
        setError(response.message || "Failed to fetch chart data");
      }
    } catch {
      setError("Failed to fetch chart data");
    } finally {
      setLoadingCharts(false);
    }
  }, [chartCache]);

  const getCustomerTableDataAsync = useCallback(async (page: number, perPage: number = 10, search?: string, segment?: string) => {
    setLoadingTable(true);
    try {
      const response = await getCustomerTableData(page, perPage, search, segment);
      if (!response.error && response.data) {
        setCustomerTableData(response.data.data);
        setCustomerTableMetadata(response.data.metadata);
      } else {
        setError(response.message || "Failed to fetch customer table data");
      }
    } catch {
      setError("Failed to fetch customer table data");
    } finally {
      setLoadingTable(false);
    }
  }, []);

  return (
    <AnalyticsContext.Provider value={{ user, loadingKpis, loadingCharts, loadingTable, error, kpis, charts, customerTableData, customerTableMetadata, getKPIsAsync, getChartDataAsync, getCustomerTableDataAsync }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) throw new Error("useAnalytics must be used within an AnalyticsProvider");
  return context;
}