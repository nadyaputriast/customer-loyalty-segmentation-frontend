import axiosInstance from "@/lib/axios";

export const getSegmentDistribution = async () => {
  try {
    const response = await axiosInstance.get("/segmentation/distribution");
    return response.data;
  } catch (error) {
    console.error("Error fetching segment distribution:", error);
    throw error;
  }
}