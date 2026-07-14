"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Search, Eye } from "lucide-react";

import { SiteHeader } from "@/components/layout/site-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // <--- Import Select

import { getSegmentationHistoryByBatchId, SegmentationHistoryItem } from "@/services/segments";
import { BatchInferenceGraphics } from "@/components/inference/batch-graphics";

export default function BatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const batchId = params.batch_id as string;

  const [items, setItems] = useState<SegmentationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const skip = page * pageSize;
        // Panggil API dengan parameter limit (pageSize) dan skip
        const response = await getSegmentationHistoryByBatchId(batchId, pageSize, skip);
        setItems(response?.data ?? []);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat detail batch.");
      } finally {
        setLoading(false);
      }
    };
    if (batchId) fetchDetail();
  }, [batchId, page, pageSize]); // Akan otomatis fetch ulang kalau page/pageSize berubah

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (item) => item.customer_id?.toLowerCase().includes(q) || item.segment?.toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  // Fungsi navigasi halaman
  const handleNextPage = () => setPage((prev) => prev + 1);
  const handlePrevPage = () => setPage((prev) => Math.max(0, prev - 1));

  return (
    <>
      <SiteHeader breadcrumbs={[{ label: "LoyalT", href: "/dashboard" }, { label: "Inference History", href: "/inference-history" }, { label: "Batch Detail" }]} />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex w-full flex-col gap-6 px-4 lg:px-6">
            
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => router.push('/inference-history')}><ArrowLeft className="h-4 w-4" /></Button>
              <div>
                <h1 className="text-xl font-medium tracking-tight text-zinc-900">Batch Detail</h1>
                <p className="text-sm text-muted-foreground font-mono mt-0.5">{batchId}</p>
              </div>
            </div>

            {loading && items.length === 0 ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-zinc-400" /></div>
            ) : error ? (
              <Card><CardContent className="py-6"><p className="text-sm text-red-500">{error}</p></CardContent></Card>
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Catatan: Karena kita cuma narik 50 data per page, grafik ini sementara cuma ngitung 50 data tersebut */}
                <BatchInferenceGraphics data={items} />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-zinc-900">Daftar Pelanggan</h3>
                    <div className="relative w-64">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Cari di halaman ini..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
                    <div className="max-h-125 overflow-y-auto relative w-full">
                      <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b bg-zinc-50/80 sticky top-0 z-10 backdrop-blur-sm">
                          <tr>
                            <th className="h-10 px-4 font-medium text-muted-foreground w-37.5">Customer ID</th>
                            <th className="h-10 px-4 font-medium text-muted-foreground w-50">Klasifikasi</th>
                            <th className="h-10 px-4 font-medium text-muted-foreground">Pattern & Rekomendasi</th>
                            <th className="h-10 px-4 font-medium text-muted-foreground text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0 divide-y">
                          {filteredItems.length > 0 ? filteredItems.map((item) => (
                            <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors">
                              <td className="p-4 align-middle font-medium text-zinc-900">{item.customer_id || "Unknown"}</td>
                              <td className="p-4 align-middle">
                                <div className="flex flex-wrap gap-1.5">
                                  <Badge variant="secondary" className="text-[10px]">Cluster {item.cluster}</Badge>
                                  <Badge variant="outline" className="text-[10px] bg-white">{item.segment}</Badge>
                                </div>
                              </td>
                              <td className="p-4 align-middle">
                                <div className="space-y-1">
                                  <p className="text-sm font-medium text-zinc-800">{item.pattern}</p>
                                  <p className="text-xs text-muted-foreground">{item.recommendation}</p>
                                </div>
                              </td>
                              <td className="p-4 align-middle text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="hover:bg-blue-50 hover:text-blue-600"
                                  disabled={!item.customer_id}
                                  onClick={() => item.customer_id && router.push(`/inference-history/${batchId}/${encodeURIComponent(item.customer_id)}`)}
                                >
                                  <Eye className="w-4 h-4 mr-2" /> Detail
                                </Button>
                              </td>
                            </tr>
                          )) : (
                            <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Tidak ada data.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* KONTROL PAGINATION */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-zinc-500">Tampilkan:</span>
                      <Select
                        value={pageSize.toString()}
                        onValueChange={(val) => {
                          setPageSize(Number(val));
                          setPage(0); // Reset ke halaman pertama
                        }}
                      >
                        <SelectTrigger className="w-20 h-8 text-sm bg-white">
                          <SelectValue placeholder="50" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="text-sm text-zinc-500">data per halaman</span>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-zinc-700">Halaman {page + 1}</span>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handlePrevPage} 
                          disabled={page === 0 || loading}
                          className="bg-white"
                        >
                          Sebelumnya
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleNextPage} 
                          disabled={items.length < pageSize || loading} 
                          className="bg-white"
                        >
                          Selanjutnya
                        </Button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}