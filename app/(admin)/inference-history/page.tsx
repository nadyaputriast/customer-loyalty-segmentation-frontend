"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSegmentationHistoryBatches, BatchHistoryItem } from "@/services/segments";

const ITEMS_PER_PAGE = 10;

export default function InferenceHistoryBatchesPage() {
  const router = useRouter();
  const [batches, setBatches] = useState<BatchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State untuk Search & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoading(true);
        // Kita ambil data agak banyak dari backend, lalu dipaginasi di frontend
        const response = await getSegmentationHistoryBatches(500); 
        setBatches(response?.data ?? []);
      } catch (err) {
        console.error("Error loading batches:", err);
        setError("Gagal memuat riwayat inference. Pastikan sudah login.");
      } finally {
        setLoading(false);
      }
    };
    fetchBatches();
  }, []);

  // Filter & Pagination Logic
  const filteredBatches = useMemo(() => {
    if (!searchQuery) return batches;
    return batches.filter(
      (b) => 
        b.batch_id.toLowerCase().includes(searchQuery.toLowerCase()) || 
        b.source.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [batches, searchQuery]);

  const totalPages = Math.ceil(filteredBatches.length / ITEMS_PER_PAGE);
  
  const paginatedBatches = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBatches.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBatches, currentPage]);

  // Reset ke halaman 1 kalau user ngetik di search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <>
      <SiteHeader breadcrumbs={[{ label: "LoyalT", href: "/dashboard" }, { label: "Inference History" }]} />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex w-full flex-col gap-6 px-4 lg:px-6">
            
            <header className="w-full flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="text-xl font-medium tracking-tight text-zinc-900">Inference History</h1>
                <p className="text-sm text-muted-foreground mt-1">Riwayat segmentasi pelanggan (Upload CSV & Input LRFM).</p>
              </div>
              
              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Cari Batch ID atau Source..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm"
                />
              </div>
            </header>

            {loading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-zinc-400" /></div>
            ) : error ? (
              <Card><CardContent className="py-6"><p className="text-sm text-red-500">{error}</p></CardContent></Card>
            ) : batches.length === 0 ? (
              <Card><CardContent className="py-12 text-center"><p className="text-sm text-muted-foreground">Belum ada history inference yang tersimpan.</p></CardContent></Card>
            ) : (
              <div className="space-y-4">
                {/* Data Table */}
                <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full caption-bottom text-sm text-left">
                      <thead className="[&_tr]:border-b bg-zinc-50/80">
                        <tr>
                          <th className="h-10 px-4 font-medium text-muted-foreground w-70">Batch ID</th>
                          <th className="h-10 px-4 font-medium text-muted-foreground">Waktu Proses</th>
                          <th className="h-10 px-4 font-medium text-muted-foreground">Metode (Source)</th>
                          <th className="h-10 px-4 font-medium text-muted-foreground text-center">Jml. Pelanggan</th>
                          <th className="h-10 px-4 font-medium text-muted-foreground text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="[&_tr:last-child]:border-0 divide-y">
                        {paginatedBatches.length > 0 ? paginatedBatches.map((batch) => (
                          <tr key={batch.batch_id} className="hover:bg-zinc-50/50 transition-colors group">
                            <td className="p-4 align-middle font-mono text-xs text-zinc-600 truncate max-w-70" title={batch.batch_id}>
                              {batch.batch_id}
                            </td>
                            <td className="p-4 align-middle whitespace-nowrap text-zinc-700">
                              {new Date(batch.created_at).toLocaleString('id-ID', { 
                                day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                              })}
                            </td>
                            <td className="p-4 align-middle">
                              <Badge variant={batch.source === "file" ? "default" : batch.source === "lrfm" ? "outline" : "secondary"} className="font-normal">
                                {batch.source === "file" ? "CSV Upload" : batch.source === "transactions" ? "Raw Transaction" : "Manual LRFM"}
                              </Badge>
                            </td>
                            <td className="p-4 align-middle text-center font-medium text-zinc-900">
                              {batch.total_customers.toLocaleString("id-ID")}
                            </td>
                            <td className="p-4 align-middle text-right">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 text-zinc-600 hover:text-zinc-900" 
                                onClick={() => router.push(`/inference-history/${batch.batch_id}`)}
                              >
                                <Eye className="h-4 w-4 mr-2" /> Detail
                              </Button>
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Tidak ada batch yang sesuai dengan pencarian.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-2">
                    <p className="text-sm text-muted-foreground">
                      Menampilkan {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredBatches.length)} dari {filteredBatches.length} batch
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-medium w-12 text-center">
                        {currentPage} / {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
          </div>
        </div>
      </div>
    </>
  );
}