export type AuthCookieValue = {
  accessToken: string;
  tokenType?: string;
};

export interface User extends AuthCookieValue {
  id?: string;
  name: string;
  email: string;
  password?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  deletedAt?: string | Date;
}

export type Submenu = {
  href: string;
  label: string;
  active?: boolean;
};

export type Menu = {
  href: string;
  label: string;
  active?: boolean;
  icon: LucideIcon;
  submenus?: Submenu[];
};

export type Group = {
  groupLabel: string;
  menus: Menu[];
};

export type DateRangeOption = 'today' | 'last 7 days' | 'this month';

export interface DashboardKPI {
  title: string;
  value: string;
  trend: number;
}

export interface ChartData {
  date: string;
  activeAccounts: number;
  newCustomers: number;
}

export interface CustomerRecord {
  id: string;
  segment: string;
  orderCount: number;
  orderAmount: number;
  joinedDate: string | Date;
}

export interface CustomerTableMetadata {
  currentPage: number;
  perPage: number;
  totalPages: number;
  totalData: number;
  allSegments: string[];
}

export interface SegmentProfile {
  customer_id: string;
  cluster: number;
  pattern: string;
  segment: string;
  recommendation: string;
  fuzzy_membership: {
    [key: string]: number | string;
  };
  lrfm_calculated: {
    L: number;
    R: number;
    F: number;
    M: number;
  }
}

export interface SegmentSummary {
  id: string;
  name: string;
  userCount: number;
  avgRecency: number;
  avgFrequency: number;
  avgMonetary: number;
  color: string;
  description: string;
}

export interface RFMDataPoint {
  customer_id: string;
  length: number;
  recency: number;
  frequency: number;
  monetary: number;
  clusterId: string;
}
