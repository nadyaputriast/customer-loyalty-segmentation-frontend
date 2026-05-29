import { ChartData, DateRangeOption } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Loader2 } from "lucide-react";

export default function ActivityChartSection({
  data,
  timeRange,
  setTimeRange,
  isLoading = false,
}: {
  data: ChartData[];
  timeRange: DateRangeOption;
  setTimeRange: (val: DateRangeOption) => void;
  isLoading?: boolean;
}) {
  return (
    <Card className="rounded-2xl border-zinc-200/80 shadow-sm bg-white w-full">
      <CardHeader className="flex flex-row items-center justify-between px-8">
        <div className="space-y-1">
          <CardTitle className="text-lg font-medium text-zinc-900">
            Customer Activity
          </CardTitle>
        </div>
        <div className="flex items-center gap-2">
          {/* INTERACTIVE SELECT: Time Range */}
          <Select value={timeRange} onValueChange={setTimeRange} disabled={isLoading}>
            <SelectTrigger className="h-8 rounded-full text-xs font-medium border-zinc-200 text-zinc-600 hidden sm:flex w-50">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="last 7 days">Last 7 days</SelectItem>
              <SelectItem value="this month">This month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="px-8">
        <div className="h-70 w-full relative">
          {isLoading ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-50/50 rounded-xl animate-pulse border border-zinc-100">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-300 mb-2" />
              <span className="text-xs text-zinc-400">Loading chart data...</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 5, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid vertical={false} stroke="#f4f4f5" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#71717a" }}
                  dy={11}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#71717a" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e4e4e7",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    fontSize: "12px",
                  }}
                  itemStyle={{ color: "#18181b" }}
                />
                <Area
                  type="monotone"
                  dataKey="activeAccounts"
                  stroke="#bb4d00"
                  strokeWidth={2}
                  fillOpacity={0.25}
                  fill="#bb4d00"
                />
                <Area
                  type="monotone"
                  dataKey="newCustomers"
                  stroke="#FF791B"
                  strokeWidth={2}
                  fillOpacity={0.16}
                  fill="#FF791B"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>

      <div className="px-8 flex gap-4 text-xs text-muted-foreground pb-6">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-sm bg-primary" /> Active Accounts
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-sm bg-[#FF791B]" /> New Customers
        </div>
      </div>
    </Card>
  );
}
