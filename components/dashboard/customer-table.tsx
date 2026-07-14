import { CustomerRecord, CustomerTableMetadata } from "@/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function CustomerTableSection({
  customers,
  metadata,
  isLoading = false,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  rowsPerPage,
  setRowsPerPage,
  onPageChange,
}: {
  customers: CustomerRecord[];
  metadata?: CustomerTableMetadata | null;
  isLoading?: boolean;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  rowsPerPage: number;
  setRowsPerPage: (val: number) => void;
  onPageChange: (page: number) => void;
}) {

  const currentPage = metadata?.currentPage || 1;
  const totalPagesCount = metadata?.totalPages ?? 1;

  const handlePrevPage = (e: React.MouseEvent) => {
    e.preventDefault();
    if (metadata && currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = (e: React.MouseEvent) => {
    e.preventDefault();
    if (metadata && currentPage < totalPagesCount) {
      onPageChange(currentPage + 1);
    }
  };

  const skeletonRows = Array.from({ length: rowsPerPage || 10 }, (_, i) => i);

  return (
    <Card className="rounded-2xl border-zinc-200/80 shadow-sm bg-white w-full overflow-hidden mb-8">
      <CardHeader className="px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <CardTitle className="text-lg font-medium text-zinc-900">
              Customers Data
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Recent customer records with plan, billing, status, and signup activity.
            </CardDescription>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
          {/* SEARCH INPUT */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <Input
              type="search"
              placeholder="Search by customer ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 rounded-full bg-zinc-50 border-zinc-200 text-sm focus-visible:ring-zinc-300"
              disabled={isLoading}
            />
          </div>

          {/* RIGHT SIDE BUTTONS & FILTERS */}
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter} disabled={isLoading}>
              <SelectTrigger className="h-9 rounded-full text-xs border-zinc-200 text-zinc-600 bg-zinc-50 hover:bg-zinc-100 w-auto">
                <Filter className="w-3.5 h-3.5 mr-2" />
                <SelectValue placeholder="All Segments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Segments</SelectItem>
                {metadata?.allSegments?.map((segment) => (
                  <SelectItem key={segment} value={segment}>
                    {segment}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <div className="overflow-x-auto px-8 pb-6">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-100 hover:bg-transparent">
              <TableHead className="w-60 h-10 text-xs font-medium text-zinc-500">
                Customer
              </TableHead>
              <TableHead className="h-10 text-xs font-medium text-zinc-500">
                Order Count
              </TableHead>
              <TableHead className="h-10 text-xs font-medium text-zinc-500">
                Order Amount
              </TableHead>
              <TableHead className="h-10 text-xs font-medium text-zinc-500">
                Segment
              </TableHead>
              <TableHead className="h-10 text-xs font-medium text-zinc-500">
                Joined
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading Skeleton State
              skeletonRows.map((i) => (
                <TableRow key={`skeleton-${i}`} className="border-zinc-100">
                  <TableCell className="py-3">
                    <div className="h-6 w-32 bg-zinc-100 animate-pulse rounded" />
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="h-4 w-12 bg-zinc-100 animate-pulse rounded" />
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="h-4 w-16 bg-zinc-100 animate-pulse rounded" />
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="h-5 w-20 bg-zinc-100 animate-pulse rounded-full" />
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="h-4 w-24 bg-zinc-100 animate-pulse rounded" />
                  </TableCell>
                </TableRow>
              ))
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-zinc-500 text-sm"
                >
                  No customers found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              // Actual Data Rows
              customers.map((customer) => (
                <TableRow key={customer.id} className="border-zinc-100">
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-zinc-100 text-zinc-600 text-[10px] font-medium">
                          {customer.id.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-zinc-900">
                        {customer.id}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <span className="text-xs text-zinc-700">
                      {customer.orderCount}x
                    </span>
                  </TableCell>
                  <TableCell className="py-3">
                    <span className="text-xs text-zinc-700">
                      {new Intl.NumberFormat('zh-CN', {
                        style: 'currency',
                        currency: 'CNY',
                      }).format(customer.orderAmount)}
                    </span>
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge
                      variant="secondary"
                      className="rounded-full px-2.5 py-0.5 text-[11px] font-normal bg-zinc-100 text-zinc-600 border-0 uppercase tracking-wide"
                    >
                      {customer.segment}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3">
                    <span className="text-xs text-zinc-700">
                      {format(new Date(customer.joinedDate), "PPP")}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination Section */}
        <div className="flex items-center justify-between gap-4 pt-6">
          <Field orientation="horizontal" className="w-fit">
            <FieldLabel
              htmlFor="select-rows-per-page"
              className="text-xs text-zinc-500"
            >
              Rows per page
            </FieldLabel>
            <Select
              value={rowsPerPage.toString()}
              onValueChange={(val) => setRowsPerPage(Number(val))}
              disabled={isLoading}
            >
              <SelectTrigger
                className="w-20 h-8 text-xs"
                id="select-rows-per-page"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="start">
                <SelectGroup>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>

          <div className="flex items-center gap-4">
            <span className="text-xs text-zinc-500">
              Page {currentPage} of {totalPagesCount}
            </span>
            <Pagination className="mx-0 w-auto">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={handlePrevPage}
                    className={
                      !metadata || currentPage <= 1 || isLoading
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={handleNextPage}
                    className={
                      !metadata ||
                        currentPage >= totalPagesCount ||
                        isLoading
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
    </Card>
  );
}
