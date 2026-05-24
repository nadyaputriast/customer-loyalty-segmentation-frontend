import { CustomerRecord } from "@/lib/mock-api";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Filter, Calendar } from "lucide-react";

export default function CustomerTableSection({ 
  customers,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter
}: { 
  customers: CustomerRecord[],
  searchQuery: string,
  setSearchQuery: (val: string) => void,
  statusFilter: string,
  setStatusFilter: (val: string) => void
}) {
  return (
    <Card className="rounded-2xl border-zinc-200/80 shadow-sm bg-white w-full overflow-hidden">
      <CardHeader className="px-8 pt-6 pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <CardTitle className="text-lg font-medium text-zinc-900">18,426 Customers</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Recent customer records with plan, billing, status, and signup activity.</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="rounded-full h-8 text-xs font-medium border-zinc-200">
            <Download className="w-3.5 h-3.5 mr-2" /> Export
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
          {/* INTERACTIVE INPUT: Search */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <Input 
              type="search" 
              placeholder="Search customers..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 rounded-full bg-zinc-50 border-zinc-200 text-sm focus-visible:ring-zinc-300" 
            />
          </div>
          <div className="flex gap-2">
            
            {/* INTERACTIVE SELECT: Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 rounded-full text-xs border-zinc-200 text-zinc-600 bg-zinc-50 hover:bg-zinc-100 w-[110px]">
                <Filter className="w-3.5 h-3.5 mr-2" /> 
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="subscribed">Subscribed</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" className="rounded-full h-9 text-xs border-zinc-200 text-zinc-600 bg-zinc-50 hover:bg-zinc-100">
              <Calendar className="w-3.5 h-3.5 mr-2" /> Joined date
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <div className="overflow-x-auto px-8 pb-6">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-100 hover:bg-transparent">
              <TableHead className="w-[300px] h-10 text-xs font-medium text-zinc-500">Customer</TableHead>
              <TableHead className="h-10 text-xs font-medium text-zinc-500">Status</TableHead>
              <TableHead className="h-10 text-xs font-medium text-zinc-500">Billing</TableHead>
              <TableHead className="h-10 text-xs font-medium text-zinc-500">Segment</TableHead>
              <TableHead className="h-10 text-xs font-medium text-zinc-500">Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id} className="border-zinc-100">
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-zinc-100 text-zinc-600 text-xs font-medium">{customer.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-zinc-900">{customer.name}</span>
                      <span className="text-xs text-muted-foreground">{customer.id}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-[11px] font-normal bg-zinc-100 text-zinc-600 border-0">
                    {customer.status}
                  </Badge>
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex items-center gap-1.5">
                    {customer.billing === 'Paid' ? <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> : 
                     customer.billing === 'Overdue' ? <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> : 
                     <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />}
                    <span className="text-xs text-muted-foreground">{customer.billing}</span>
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <span className="text-sm text-zinc-700">{customer.segment}</span>
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex flex-col">
                    <span className="text-xs text-zinc-700">{customer.joinedDate.split(' at ')[0]}</span>
                    <span className="text-[11px] text-muted-foreground">at {customer.joinedDate.split(' at ')[1] || '10:00 AM'}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}