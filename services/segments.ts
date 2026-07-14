import axiosInstance from "@/lib/axios";

// 1. Base API Response
export interface StandardResponse<T> {
  code: number;
  error: boolean;
  message: string;
  data: T;
}

// 2. LRFM Calculated
export interface LRFMCalculated {
  L: number;
  R: number;
  F: number;
  M: number;
}

/**
 * Single promo recommendation from weighted fuzzy aggregation.
 * promo_type matches ALL_PROMO_TYPES value keys in promo-config-sheet.tsx
 */
export interface RankedPromo {
  promo_type: string;   // "cashback" | "kupon" | "bogo" | "price_off" | "bonus_packs" | "sampling"
  score: number;        // aggregated fuzzy weight, e.g. 0.28
  score_pct: string;    // human-readable, e.g. "28.00%"
}

// 3. Single Segmentation Data Response
export interface SegmentationData {
  customer_id?: string | null;
  cluster: number;
  pattern: string;
  segment: string;
  recommendation: string;
  fuzzy_membership: Record<string, string>;          // {"Segment Name": "28.00%"} — display only
  lrfm_calculated?: LRFMCalculated | null;
}

// 4. Batch Response
export interface BatchSegmentationData {
  status: string;
  total_customers: number;
  batch_id?: string;
  data: SegmentationData[];
}

export type LrfmPayload = {
  L: number;
  R: number;
  F: number;
  M: number;
};

export type TransactionPayload = {
  customer_id: string;
  transaction_date: string;
  invoice_id: string;
  amount: number;
};

export type SegmentationHistoryItem = {
  id: number;
  customer_id?: string | null;
  cluster: number;
  pattern: string;
  segment: string;
  recommendation: string;
  fuzzy_membership: Record<string, string>;
  lrfm_calculated?: LRFMCalculated | null;
  source: string;
  created_at: string;
};

export interface BatchHistoryItem {
  batch_id: string;
  source: string;
  total_customers: number;
  created_at: string;
}

// API calls
export const segmentFromLRFM = async (payload: LrfmPayload): Promise<StandardResponse<SegmentationData>> => {
  try {
    const response = await axiosInstance.post<StandardResponse<SegmentationData>>("/segmentation/lrfm", payload);
    return response.data;
  } catch (error) {
    console.error("Error running LRFM inference:", error);
    throw error;
  }
};

export const segmentFromTransactions = async (payload: TransactionPayload[]): Promise<StandardResponse<SegmentationData>> => {
  try {
    const response = await axiosInstance.post<StandardResponse<SegmentationData>>("/segmentation/transactions", payload);
    return response.data;
  } catch (error) {
    console.error("Error running transaction inference:", error);
    throw error;
  }
};

export const segmentFromFile = async (
  file: File,
  // mapping: Record<string, string>
): Promise<StandardResponse<SegmentationData | BatchSegmentationData>> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    // formData.append("mapping", JSON.stringify(mapping));

    const response = await axiosInstance.post<StandardResponse<SegmentationData | BatchSegmentationData>>(
      "/segmentation/transactions/upload",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    return response.data;
  } catch (error) {
    console.error("Error running file inference:", error);
    throw error;
  }
};

// export const getSegmentationHistory = async (limit = 50): Promise<StandardResponse<SegmentationHistoryItem[]>> => {
//   try {
//     const response = await axiosInstance.get<StandardResponse<SegmentationHistoryItem[]>>(`/segmentation/history?limit=${limit}`);
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching segmentation history:", error);
//     throw error;
//   }
// };
export const getBatchHistoryDetail = async (
  batchId: string,
  limit: number = 50,
  skip: number = 0
) => {
  try {
    const response = await axiosInstance.get(
      `/segmentation/history/batches/${batchId}?limit=${limit}&skip=${skip}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching batch detail:", error);
    throw error;
  }
};

export const getSegmentDistribution = async () => {
  try {
    const response = await axiosInstance.get("/segmentation/distribution");
    return response.data;
  } catch (error) {
    console.error("Error fetching segment distribution:", error);
    throw error;
  }
};

export const getSegmentationHistoryBatches = async (limit = 50): Promise<StandardResponse<BatchHistoryItem[]>> => {
  try {
    const response = await axiosInstance.get<StandardResponse<BatchHistoryItem[]>>(`/segmentation/history/batches?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching batched history:", error);
    throw error;
  }
};

export const getSegmentationHistoryByBatchId = async (
  batchId: string,
  limit: number = 50,
  skip: number = 0
): Promise<StandardResponse<SegmentationHistoryItem[]>> => {
  try {
    const response = await axiosInstance.get<StandardResponse<SegmentationHistoryItem[]>>(
      `/segmentation/history/batches/${batchId}?limit=${limit}&skip=${skip}` 
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching detail for batch ${batchId}:`, error);
    throw error;
  }
};

export const getCustomerDetailInBatch = async (batchId: string, customerId: string) => {
  try {
    const response = await axiosInstance.get(
      `/segmentation/history/batches/${batchId}/customers/${encodeURIComponent(customerId)}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching single customer detail:", error);
    throw error;
  }
};