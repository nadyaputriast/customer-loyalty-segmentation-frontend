"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  getActivePromoConfigs,
  deletePromoConfig,
  ActivePromoData,
  ActivePromoParams,
} from "@/services/promo";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Tag,
  Pencil,
  Trash2,
  History,
  Plus,
  AlertCircle,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { PromoConfigSheet } from "@/components/promo/promo-config-sheet";

const PROMO_LABEL: Record<string, string> = {
  kupon: "Kupon / Voucher",
  cashback: "Cashback",
  bogo: "Buy One Get One Free",
  price_off: "Price Off Deals",
  bonus_packs: "Bonus Packs",
  sampling: "Free Sampling",
};

const formatParams = (type: string, params: ActivePromoParams): string => {
  if (type === "kupon") return `Diskon ${params.discount}%`;
  if (type === "cashback" || type === "price_off")
    return `Nilai ¥ ${params.value?.toLocaleString("id-ID")}`;
  if (type === "sampling" || type === "bonus_packs")
    return `Produk: ${params.product_name}`;
  if (type === "bogo") return `Beli ${params.buy_qty} Gratis ${params.get_qty}`;
  return JSON.stringify(params);
};

export default function PromoCampaignsPage() {
  const router = useRouter();
  const [promos, setPromos] = useState<ActivePromoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"cluster" | "type">("cluster");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const fetchPromos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getActivePromoConfigs();
      setPromos(res.data || []);
    } catch (err) {
      console.error("Gagal memuat promo:", err);
      toast.error("Gagal memuat daftar campaign.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromos();
  }, [fetchPromos]);

  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id);
      await deletePromoConfig(id);
      toast.success("Campaign berhasil dihapus.");
      setPromos((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus campaign.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredPromos = useMemo(() => {
    setCurrentPage(1);
    return promos.filter((promo) => {
      const segmentName = (promo.segment_name || "").toLowerCase();
      const promoLabel = (PROMO_LABEL[promo.promo_type] || "").toLowerCase();
      const clusterText = `cluster ${promo.cluster_id}`;
      const query = searchQuery.toLowerCase();

      return (
        segmentName.includes(query) ||
        promoLabel.includes(query) ||
        clusterText.includes(query)
      );
    });
  }, [promos, searchQuery]);

  const sortedPromos = useMemo(() => {
    return [...filteredPromos].sort((a, b) => {
      if (sortBy === "cluster") {
        if (a.cluster_id !== b.cluster_id) {
          return sortOrder === "asc" ? a.cluster_id - b.cluster_id : b.cluster_id - a.cluster_id;
        }
        return a.promo_type.localeCompare(b.promo_type);
      } else {
        const labelA = PROMO_LABEL[a.promo_type] || a.promo_type;
        const labelB = PROMO_LABEL[b.promo_type] || b.promo_type;
        if (labelA !== labelB) {
          return sortOrder === "asc" ? labelA.localeCompare(labelB) : labelB.localeCompare(labelA);
        }
        return a.cluster_id - b.cluster_id;
      }
    });
  }, [filteredPromos, sortBy, sortOrder]);

  const paginatedPromos = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return sortedPromos.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedPromos, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(sortedPromos.length / rowsPerPage) || 1;

  const toggleSort = (type: "cluster" | "type") => {
    if (sortBy === type) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(type);
      setSortOrder("asc");
    }
  };

  return (
    <div className="flex flex-1 flex-col pb-20 bg-zinc-50/30">
      <div className="@container/main flex flex-1 flex-col gap-6 py-8 px-4 lg:px-8 max-w-6xl mx-auto w-full">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
              <Tag className="w-6 h-6 text-primary" />
              Campaign Manager
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Kelola konfigurasi promosi aktif untuk tiap segmen cluster pelanggan.
            </p>
          </div>

          <PromoConfigSheet
            segmentName="Cluster Baru"
            clusterId={-1}
            recommendation=""
            rankedPromos={null}
            onSaved={fetchPromos}
            trigger={
              <Button className="shrink-0 shadow-sm">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Campaign
              </Button>
            }
          />
        </div>

        {/* FILTER BAR */}
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white p-4 rounded-xl border border-zinc-200/80 shadow-sm">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Cari Cluster atau Tipe Promo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-zinc-50/50 border-zinc-200 focus-visible:bg-white"
            />
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
              <span>Tampilkan:</span>
              <Select
                value={String(rowsPerPage)}
                onValueChange={(val) => {
                  setRowsPerPage(Number(val));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-17.5 h-8 bg-zinc-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* TABLE CARD */}
        <Card className="shadow-sm border-zinc-200/60 overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-24 gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Memuat campaign...</span>
              </div>
            ) : paginatedPromos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-zinc-400">
                <AlertCircle className="w-8 h-8" />
                <p className="text-sm font-medium">Tidak ada campaign yang cocok.</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-zinc-50/70 border-b border-zinc-200">
                      <TableHead 
                        className="font-semibold text-zinc-700 cursor-pointer hover:bg-zinc-100/80 transition-colors select-none"
                        onClick={() => toggleSort("cluster")}
                      >
                        <div className="flex items-center gap-1">
                          Cluster Target
                          <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="font-semibold text-zinc-700 cursor-pointer hover:bg-zinc-100/80 transition-colors select-none"
                        onClick={() => toggleSort("type")}
                      >
                        <div className="flex items-center gap-1">
                          Tipe Promo
                          <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-zinc-700">Detail Mekanisme</TableHead>
                      <TableHead className="font-semibold text-zinc-700">Status</TableHead>
                      <TableHead className="font-semibold text-zinc-700 text-right pr-6">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPromos.map((promo) => {
                      const segmentName = promo.segment_name || `Cluster ${promo.cluster_id}`;

                      return (
                        <TableRow key={promo.id} className="hover:bg-zinc-50/40 transition-colors border-b border-zinc-100">
                          
                          {/* CLUSTER */}
                          <TableCell className="py-3.5">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-semibold text-zinc-900 font-mono text-sm">
                                Cluster {promo.cluster_id}
                              </span>
                              <span className="text-xs text-zinc-500 font-medium">{segmentName}</span>
                            </div>
                          </TableCell>

                          {/* TIPE PROMO */}
                          <TableCell className="py-3.5">
                            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/10 font-medium capitalize">
                              {PROMO_LABEL[promo.promo_type] ?? promo.promo_type}
                            </Badge>
                          </TableCell>

                          {/* DETAIL */}
                          <TableCell className="text-zinc-600 text-sm py-3.5 font-medium">
                            {formatParams(promo.promo_type, promo.params)}
                          </TableCell>

                          {/* STATUS */}
                          <TableCell className="py-3.5">
                            <Badge className="bg-emerald-500 text-white hover:bg-emerald-500 shadow-xs px-2.5 font-medium">
                              Aktif
                            </Badge>
                          </TableCell>

                          {/* AKSI */}
                          <TableCell className="py-3.5">
                            <div className="flex items-center justify-end gap-1 pr-2">
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2.5 text-zinc-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                onClick={() => router.push(`/inference-history?cluster=${promo.cluster_id}`)}
                              >
                                <History className="w-3.5 h-3.5 mr-1.5" />
                                History
                              </Button>

                              <PromoConfigSheet
                                segmentName={segmentName}
                                clusterId={promo.cluster_id}
                                recommendation=""
                                rankedPromos={null}
                                onSaved={fetchPromos}
                                trigger={
                                  <Button variant="ghost" size="sm" className="h-8 px-2.5 text-zinc-500 hover:text-primary hover:bg-primary/10 rounded-lg">
                                    <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
                                  </Button>
                                }
                              />

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 px-2.5 text-zinc-500 hover:text-destructive hover:bg-destructive/10 rounded-lg" disabled={deletingId === promo.id}>
                                    {deletingId === promo.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 mr-1.5" />}
                                    Hapus
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Hapus Campaign?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Campaign <span className="font-semibold text-zinc-900">{PROMO_LABEL[promo.promo_type] ?? promo.promo_type}</span> untuk <span className="font-semibold text-zinc-900">{segmentName}</span> akan dihapus permanen.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction className="bg-destructive hover:bg-destructive/90 text-white" onClick={() => handleDelete(promo.id)}>
                                      Hapus Campaign
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>

                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {/* PAGINATION PANEL */}
                <div className="flex items-center justify-between px-6 py-3 border-t border-zinc-200 bg-zinc-50/50 text-sm text-zinc-500">
                  <span className="font-medium">
                    Menampilkan {Math.min(filteredPromos.length, (currentPage - 1) * rowsPerPage + 1)}-
                    {Math.min(filteredPromos.length, currentPage * rowsPerPage)} dari {filteredPromos.length} data
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => prev - 1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-xs font-semibold px-3 text-zinc-700">
                      Halaman {currentPage} dari {totalPages}
                    </span>
                    <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === totalPages} onClick={() => setCurrentPage((prev) => prev + 1)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}