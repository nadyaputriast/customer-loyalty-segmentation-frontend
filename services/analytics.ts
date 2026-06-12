import { DateRangeOption } from "@/types";
import axiosInstance from "@/lib/axios";
import { isAxiosError } from "axios";

export const getDashboardKPIs = async () => {
  try {
    const response = await axiosInstance.get('/analytics/kpis');
    return response.data;
  } catch {
    throw new Error("Gagal mengambil data KPI");
  }
};

export const getChartData = async (targetDate: string | Date, dateRange: DateRangeOption) => {
  try {
    const response = await axiosInstance.get("/analytics/charts", {
      params: {
        target_date: targetDate,
        date_range: dateRange
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching chart data:", error);
    throw error;
  }
}

export const getCustomerTableData = async (page: number, perPage: number, search?: string, segment?: string) => {
  try {
    const response = await axiosInstance.get("/analytics/customers", {
      params: {
        page: page,
        per_page: perPage,
        search: search,
        segment: segment
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching customer table data:", error);
    throw error;
  }
}

export const getSegmentTrends = async (startDate?: string, endDate?: string) => {
  try {
    let url = `/analytics/segment-trends`;
    const params = new URLSearchParams();
    
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = isAxiosError(error) 
      ? error.response?.data?.detail 
      : "Gagal mengambil data tren segmen";
      
    return {
      error: true,
      message: errorMessage,
      data: null
    };
  }
};