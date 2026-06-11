"use client";

import { useEffect, useState } from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import ActivityChartSection from "@/components/dashboard/activity-chart";
import CustomerTableSection from "@/components/dashboard/customer-table";
import { SiteHeader } from "@/components/layout/site-header";
import { SectionCards } from "@/components/dashboard/section-cards";
import { useAuth } from "@/hooks/use-auth";
import { useAnalytics } from "@/contexts/analytics-context";
import { Calendar } from "@/components/ui/calendar"
import { DateRangeOption } from "@/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    kpis, charts, customerTableData, customerTableMetadata,
    getKPIsAsync, getChartDataAsync, getCustomerTableDataAsync,
    loadingKpis, loadingCharts, loadingTable
  } = useAnalytics();

  const [timeRange, setTimeRange] = useState<DateRangeOption>("last 7 days");
  
  // Default to today instead of 2018
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const [tablePage, setTablePage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    if (user && selectedDate) {
      const dateString = format(selectedDate, "yyyy-MM-dd");

      getKPIsAsync(dateString);
      getChartDataAsync(dateString, timeRange);
    }
  }, [user, selectedDate, timeRange, getKPIsAsync, getChartDataAsync]);

  useEffect(() => {
    if (user) {
      getCustomerTableDataAsync(tablePage, rowsPerPage, debouncedSearch, statusFilter);
    }
  }, [user, tablePage, rowsPerPage, debouncedSearch, statusFilter, getCustomerTableDataAsync])

  return (
    <>
      <SiteHeader breadcrumbs={[{ label: "LoyalT", href: "/dashboard" }, { label: "Dashboard" }]} />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="relative flex w-full flex-col gap-6 px-4 lg:px-6">

            <div className="flex items-center gap-4 w-full">
              <header className="w-full">
                <h1 className="text-xl font-medium tracking-tight text-zinc-900">
                  Welcome back, Admin
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Here is what is happening today.
                </p>
              </header>

              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    data-empty={!selectedDate}
                    className="flex items-center gap-4 justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
                  >
                    {selectedDate ? format(selectedDate, "PP") : <span>Pick a date</span>}
                    <CalendarIcon className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    required
                    // Restrict future dates, but allow everything in the past
                    disabled={{ after: new Date() }}
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        setSelectedDate(date);
                        setIsCalendarOpen(false);
                      }
                    }}
                    defaultMonth={selectedDate}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <SectionCards
              kpis={kpis!}
              isLoading={loadingKpis}
            />

            <ActivityChartSection
              data={charts || []}
              timeRange={timeRange}
              setTimeRange={setTimeRange}
              isLoading={loadingCharts}
            />

            <CustomerTableSection
              customers={customerTableData || []}
              metadata={customerTableMetadata}
              isLoading={loadingTable}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              rowsPerPage={rowsPerPage}
              setRowsPerPage={setRowsPerPage}
              onPageChange={setTablePage}
            />
          </div>
        </div>
      </div>
    </>
  );
}
