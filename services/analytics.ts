import { DateRangeOption } from "@/types";
import axiosInstance from "@/lib/axios";

export const getDashboardKPIs = async (targetDate: string | Date) => {
  try {
    const response = await axiosInstance.get("/analytics/kpis", {
      params: {
        target_date: targetDate
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard KPIs:", error);
    throw error;
  }
}

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