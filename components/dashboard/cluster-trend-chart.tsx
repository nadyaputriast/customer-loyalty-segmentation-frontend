"use client";

import { useEffect, useState } from "react";
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  XAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { format, subDays } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { getSegmentTrends } from "@/services/analytics";

interface TrendData {
  date: string;
  [key: string]: string | number; 
}

const COLOR_PALETTE = [
  "#3b82f6", "#22c55e", "#eab308", "#ef4444", "#a855f7", "#06b6d4", "#f97316"
];

export function ClusterTrendChart() {
  // Default range: Last 30 days
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TrendData[]>([]);
  const [segments, setSegments] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Format dates as YYYY-MM-DD for the backend
        const startStr = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined;
        const endStr = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined;

        const res = await getSegmentTrends(startStr, endStr);
        if (!res.error && res.data) {
          setData(res.data.data);
          setSegments(res.data.segments);
        } else {
            // Handle empty or error states safely
            setData([]);
            setSegments([]);
        }
      } catch (error) {
        console.error("Failed to fetch segment trends:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    
    // Only fetch if we have at least a start date
    if (dateRange?.from) {
        fetchData();
    }
  }, [dateRange]);

  return (
    <Card className="col-span-full shadow-sm rounded-2xl border-zinc-200 bg-white mb-8">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4">
        <div className="space-y-1 mb-4 sm:mb-0">
          <CardTitle className="text-lg font-medium text-zinc-900">
            Tren Agregasi Segmen
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Pergerakan distribusi pelanggan berdasarkan rentang waktu
          </CardDescription>
        </div>
        
        {/* Date Range Picker */}
        <div className="grid gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-65 justify-start text-left font-normal bg-zinc-50 border-zinc-200",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pilih tanggal</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                captionLayout="dropdown"
                startMonth={new Date(2015, 0, 1)}
                endMonth={new Date(new Date().getFullYear() + 2, 11, 31)}
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="h-87.5 w-full flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
          </div>
        ) : data.length === 0 ? (
          <div className="h-87.5 w-full flex items-center justify-center">
            <p className="text-sm text-zinc-500">
              Belum ada data inference pada rentang waktu ini.
            </p>
          </div>
        ) : (
          <div className="h-87.5 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 12 }} 
                  dy={10} 
                />
                <Tooltip 
                  cursor={{ fill: '#f4f4f5' }} 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid #e4e4e7', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '13px'
                  }} 
                />
                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }} />
                
                {segments.map((seg, index) => (
                  <Bar 
                    key={seg} 
                    dataKey={seg} 
                    stackId="a" 
                    fill={COLOR_PALETTE[index % COLOR_PALETTE.length]} 
                    radius={index === segments.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} 
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}