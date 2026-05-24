// lib/mock-api.ts

export interface DashboardKPI {
  title: string;
  value: string;
  trend: number;
  trendLabel: string;
  subtext: string;
}

export interface ChartData {
  date: string;
  activeAccounts: number;
  newCustomers: number;
}

export interface SegmentProfile {
  id: string;
  name: string;
  userCount: number;
  avgMonetary: number;
  description: string;
  color: string;
}

export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  status: "Subscribed" | "Inactive" | "Unsubscribed";
  billing: "Paid" | "Pending" | "Overdue";
  segment: string; // Tying back to Fuzzy C-Means
  joinedDate: string;
}

const dashboardKPIs: DashboardKPI[] = [
  { title: "Total Revenue", value: "Rp 124.5M", trend: 12.5, trendLabel: "+12.5%", subtext: "Revenue for the last 6 months" },
  { title: "New Customers", value: "1,234", trend: -20, trendLabel: "-20.0%", subtext: "Acquisition needs attention" },
  { title: "Active Accounts", value: "45,678", trend: 12.5, trendLabel: "+12.5%", subtext: "Engagement exceeds targets" },
  { title: "Growth Rate", value: "4.5%", trend: 4.5, trendLabel: "+4.5%", subtext: "Meets growth projections" },
];

const activityData: ChartData[] = [
  { date: "Mar 1", activeAccounts: 4000, newCustomers: 2400 },
  { date: "Mar 8", activeAccounts: 3000, newCustomers: 1398 },
  { date: "Mar 15", activeAccounts: 2000, newCustomers: 9800 },
  { date: "Mar 22", activeAccounts: 2780, newCustomers: 3908 },
  { date: "Mar 29", activeAccounts: 1890, newCustomers: 4800 },
  { date: "Apr 5", activeAccounts: 2390, newCustomers: 3800 },
  { date: "Apr 12", activeAccounts: 3490, newCustomers: 4300 },
];

const customerRecords: CustomerRecord[] = [
  { id: "#18425", name: "Sarah Parker", email: "sarah@example.com", status: "Subscribed", billing: "Paid", segment: "Champions", joinedDate: "30th April 2026" },
  { id: "#18424", name: "Michael Brown", email: "michael@example.com", status: "Inactive", billing: "Pending", segment: "At Risk", joinedDate: "29th April 2026" },
  { id: "#18423", name: "Linda Chen", email: "linda@example.com", status: "Unsubscribed", billing: "Overdue", segment: "Newbies", joinedDate: "28th April 2026" },
  { id: "#18422", name: "David Lee", email: "david@example.com", status: "Subscribed", billing: "Paid", segment: "Loyal Customers", joinedDate: "27th April 2026" },
];

export interface SegmentProfile {
  id: string;
  name: string;
  userCount: number;
  avgMonetary: number;
  avgRecency: number; // Days since last purchase
  avgFrequency: number; // Purchases per year
  description: string;
  color: string;
}

export interface RFMDataPoint {
  id: string;
  recency: number;
  frequency: number;
  monetary: number;
  clusterId: string;
}

export const customerSegments: SegmentProfile[] = [
  { id: "all", name: "All Segments", userCount: 8234, avgMonetary: 667500, avgRecency: 45, avgFrequency: 8, description: "Overview of all customer clusters.", color: "#71717a" },
  { id: "c1", name: "Champions", userCount: 1240, avgMonetary: 1250000, avgRecency: 12, avgFrequency: 24, description: "Bought recently, buy often, and spend the most.", color: "#18181b" }, 
  { id: "c2", name: "Loyal Customers", userCount: 3120, avgMonetary: 850000, avgRecency: 35, avgFrequency: 15, description: "Spend good money and often. Responsive to promotions.", color: "#f59e0b" },
  { id: "c3", name: "At Risk", userCount: 980, avgMonetary: 420000, avgRecency: 120, avgFrequency: 4, description: "Spent big money, but haven't purchased in a long time.", color: "#ef4444" },
  { id: "c4", name: "Newbies", userCount: 2894, avgMonetary: 150000, avgRecency: 8, avgFrequency: 1, description: "Bought most recently, but not often.", color: "#3b82f6" },
];

const generateScatterData = (): RFMDataPoint[] => {
  const data: RFMDataPoint[] = [];
  // Champions (Low Recency, High Frequency)
  for(let i=0; i<40; i++) data.push({ id: `ch_${i}`, recency: Math.random() * 20, frequency: 18 + Math.random() * 12, monetary: 1000000 + Math.random() * 500000, clusterId: "c1" });
  // Loyal (Medium Recency, Medium/High Frequency)
  for(let i=0; i<60; i++) data.push({ id: `lo_${i}`, recency: 20 + Math.random() * 40, frequency: 10 + Math.random() * 10, monetary: 600000 + Math.random() * 400000, clusterId: "c2" });
  // At Risk (High Recency, Low Frequency)
  for(let i=0; i<30; i++) data.push({ id: `ar_${i}`, recency: 90 + Math.random() * 60, frequency: 1 + Math.random() * 5, monetary: 200000 + Math.random() * 300000, clusterId: "c3" });
  // Newbies (Low Recency, Low Frequency)
  for(let i=0; i<50; i++) data.push({ id: `ne_${i}`, recency: 1 + Math.random() * 15, frequency: 1 + Math.random() * 2, monetary: 50000 + Math.random() * 150000, clusterId: "c4" });
  return data;
};

const scatterPoints = generateScatterData();

export interface DashboardParams {
  timeRange?: string;
  segment?: string;
  search?: string;
  status?: string;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  getDashboardData: async (params?: DashboardParams) => {
    await delay(600); // Simulate network latency for loading states
    console.log("Fetching data with params:", params);
    
    return { 
      kpis: dashboardKPIs, 
      chart: activityData, 
      customers: customerRecords 
    };
  },

  getSegments: async () => {
    await delay(400);
    // Return all segments except the "all" aggregate for the list
    return { 
      segments: customerSegments.filter(s => s.id !== "all"), 
      allSegmentData: customerSegments,
      scatterData: scatterPoints 
    };
  }
};