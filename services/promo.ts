import axiosInstance from "@/lib/axios";
import { StandardResponse } from "./segments";

export interface PromoResponseData {
  id: number;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ActivePromoParams {
  value?: number;
  discount?: number;
  product_name?: string;
  buy_qty?: number;
  get_qty?: number;
}

export interface ActivePromoData {
  id: number;
  promo_type: string;
  cluster_id: number;
  segment_name: string;
  params: ActivePromoParams;
  active: boolean;
}

export interface PromoConfigPayload {
  promo_type: string;
  params: ActivePromoParams;
  active?: boolean;
  start_at?: string;
  end_at?: string;
  cluster_id?: number;
}

export interface ClusterMetadataItem {
  segment_name: string;
  allowed_promos: string[];
}

// GET: Ambil metadata segmentasi untuk kebutuhan dropdown di frontend
export const getPromoMetadata = async (): Promise<StandardResponse<Record<string, ClusterMetadataItem>>> => {
  try {
    const response = await axiosInstance.get<StandardResponse<Record<string, ClusterMetadataItem>>>("/promo/metadata");
    return response.data;
  } catch (error) {
    console.error("Error fetching promo metadata:", error);
    throw error;
  }
};

// POST: Tambah atau update konfigurasi promo baru
export const createPromoConfig = async (
  payload: PromoConfigPayload
): Promise<StandardResponse<PromoResponseData>> => {
  try {
    const response = await axiosInstance.post<StandardResponse<PromoResponseData>>(
      "/promo",
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error creating promo config:", error);
    throw error;
  }
};

// GET: Ambil semua untuk halaman dashboard utama
export const getActivePromoConfigs = async (): Promise<StandardResponse<ActivePromoData[]>> => {
  try {
    const response = await axiosInstance.get<StandardResponse<ActivePromoData[]>>("/promo/active");
    return response.data;
  } catch (error) {
    console.error("Error fetching active promos:", error);
    throw error;
  }
};

// GET: Ambil daftar promo aktif khusus milik 1 cluster id
export const getPromosByCluster = async (clusterId: number): Promise<StandardResponse<ActivePromoData[]>> => {
  try {
    const response = await axiosInstance.get<StandardResponse<ActivePromoData[]>>(`/promo/cluster/${clusterId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching promos by cluster:", error);
    throw error;
  }
};

// DELETE: Hapus promo berdasarkan id
export async function deletePromoConfig(id: number) {
  const res = await fetch(`/promo/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete promo config");
  return res.json();
}