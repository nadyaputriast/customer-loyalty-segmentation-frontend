import { ChartData,} from "@/lib/mock-api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


export default function ActivityChartSection({ 
  data, 
  timeRange, 
  setTimeRange, 
  segment, 
  setSegment 
}: { 
  data: ChartData[],
  timeRange: string,
  setTimeRange: (val: string) => void,
  segment: string,
  setSegment: (val: string) => void
}) {
  return (
    <Card className="rounded-2xl border-zinc-200/80 shadow-sm bg-white w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-6 pt-6 px-8">
        <div className="space-y-1">
          <CardTitle className="text-lg font-medium text-zinc-900">Customer Activity</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">Customer activity for the selected period</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          
          {/* INTERACTIVE SELECT: Time Range */}
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="h-8 rounded-full text-xs font-medium border-zinc-200 text-zinc-600 hidden sm:flex w-[120px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="1m">Last month</SelectItem>
              <SelectItem value="3m">Last 3 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>

          {/* INTERACTIVE SELECT: Segment */}
          <Select value={segment} onValueChange={setSegment}>
            <SelectTrigger className="h-8 rounded-full text-xs font-medium border-zinc-200 text-zinc-600 hidden sm:flex w-[140px]">
              <SelectValue placeholder="All Segments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All segments</SelectItem>
              <SelectItem value="champions">Champions</SelectItem>
              <SelectItem value="loyal">Loyal Customers</SelectItem>
              <SelectItem value="at_risk">At Risk</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="secondary" size="sm" className="rounded-full h-8 text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-900">View report</Button>
        </div>
      </CardHeader>
      
      <div className="px-8 flex gap-4 text-xs text-muted-foreground mb-4">
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-primary" /> Active Accounts</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-[#FF791B]" /> New Customers</div>
      </div>

      <CardContent className="px-8 pb-8">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#f4f4f5" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#71717a' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#71717a' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                itemStyle={{ color: '#18181b' }}
              />
              <Area type="monotone" dataKey="activeAccounts" stroke="#bb4d00" strokeWidth={2} fillOpacity={0.25} fill="#bb4d00" />
              <Area type="monotone" dataKey="newCustomers" stroke="#FF791B" strokeWidth={2} fillOpacity={0.16} fill="#FF791B" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
