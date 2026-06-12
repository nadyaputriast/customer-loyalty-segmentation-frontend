"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Loader2, ArrowLeft, User, Sparkles, 
  CalendarDays, Clock, ShoppingCart, Wallet, CheckCircle 
} from "lucide-react";

import { SiteHeader } from "@/components/layout/site-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { getSegmentationHistoryByBatchId, SegmentationHistoryItem } from "@/services/segments";
import { getPromosByCluster, ActivePromoData, ActivePromoParams } from "@/services/promo";
import InferenceCharts from "@/components/segments/inference-stats";
import { useSegments, SegmentsProvider } from "@/contexts/segments-context";
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

function CustomerDetailContent() {
  const params = useParams();
  const router = useRouter();
  const batchId = params.batch_id as string;
  const customerId = decodeURIComponent(params.customer_id as string);
  
  const { clusterStats } = useSegments();

  const [customerData, setCustomerData] = useState<SegmentationHistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State baru untuk menampung konfigurasi riil dari DB
  const [activePromos, setActivePromos] = useState<ActivePromoData[]>([]);

  // 1. FETCH PROFILE USER HISTORY
  useEffect(() => {
    const fetchCustomerDetail = async () => {
      try {
        setLoading(true);
        const response = await getSegmentationHistoryByBatchId(batchId);
        const batchItems: SegmentationHistoryItem[] = response?.data ?? [];
        
        const foundCustomer = batchItems.find((c: SegmentationHistoryItem) => c.customer_id === customerId);
        if (foundCustomer) {
          setCustomerData(foundCustomer);
        } else {
          setError("Pelanggan tidak ditemukan di dalam batch ini.");
        }
      } catch (err) {
        console.error(err);
        setError("Gagal memuat detail pelanggan.");
      } finally {
        setLoading(false);
      }
    };
    if (batchId && customerId) fetchCustomerDetail();
  }, [batchId, customerId]);


  // 2. FETCH PROMO AKTIF BERDASARKAN NOMOR CLUSTERNYA
  const fetchClusterPromos = useCallback(async () => {
    if (!customerData) return;
    try {
      const res = await getPromosByCluster(customerData.cluster);
      setActivePromos(res.data ? (Array.isArray(res.data) ? res.data : [res.data]) : []);
    } catch (err) {
      console.error("Gagal mengambil promo cluster aktif:", err);
    }
  }, [customerData]);

  useEffect(() => {
    if (customerData) {
      fetchClusterPromos();
    }
  }, [customerData, fetchClusterPromos]);


  const lrfm = customerData?.lrfm_calculated;

  return (
    <>
      <SiteHeader 
        breadcrumbs={[
          { label: "LoyalT", href: "/dashboard" }, 
          { label: "Inference History", href: "/inference-history" }, 
          { label: "Batch Detail", href: `/inference-history/${batchId}` },
          { label: customerId }
        ]} 
      />
      <div className="flex flex-1 flex-col pb-20 bg-zinc-50/30">
        <div className="@container/main flex flex-1 flex-col gap-6 py-8 px-4 lg:px-8 max-w-6xl mx-auto w-full">
          
          {/* HEADER */}
          <div className="flex items-center gap-4 mb-2">
            <Button
              variant="outline"
              size="icon"
              className="bg-white"
              onClick={() => router.push(`/inference-history/${batchId}`)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
                <User className="h-6 w-6 text-primary" /> {customerId}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Batch Ref: <span className="font-mono">{batchId.split("-")[0]}...</span>
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Menganalisis profil pelanggan...</p>
              </div>
            </div>
          ) : error || !customerData ? (
            <Card>
              <CardContent className="py-16 text-center text-destructive font-medium">
                {error}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* SECTION 1: IDENTITY & AI INSIGHT */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Klasifikasi Box */}
                <div className="lg:col-span-1 bg-white border rounded-2xl p-6 shadow-sm flex flex-col justify-center">
                  <p className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
                    Hasil Klasifikasi
                  </p>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-zinc-500 mb-1.5">Primary Cluster</p>
                      <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 text-sm px-3 py-1">
                        Cluster {customerData.cluster}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-1.5">Segmentasi Model</p>
                      <Badge variant="outline" className="text-sm px-3 py-1 bg-white border-zinc-200 text-zinc-800 shadow-sm">
                        {customerData.segment}
                      </Badge>
                    </div>
                    <div className="pt-2 border-t mt-4">
                      <p className="text-xs text-zinc-500 mb-1">Pola LRFM (Pattern)</p>
                      <p className="font-mono text-lg font-semibold text-zinc-900 tracking-widest">
                        {customerData.pattern}
                      </p>
                    </div>
                  </div>
                </div>

                {/* AI Recommendation Box (KOTAK ORANYE) */}
                <div className="lg:col-span-2 bg-linear-to-br from-primary to-primary/80 rounded-2xl p-6 shadow-md text-white relative overflow-hidden flex flex-col justify-center">
                  <div className="absolute top-0 right-0 p-6 opacity-10">
                    <Sparkles className="w-32 h-32" />
                  </div>
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-5 h-5 text-primary-foreground/70" />
                        <h3 className="text-sm font-medium text-primary-foreground/70 uppercase tracking-wider">
                          Actionable Insight
                        </h3>
                      </div>
                      
                      <p className="text-xl md:text-2xl font-bold tracking-tight mb-2">
                        &quot;{customerData.recommendation}&quot;
                      </p>

                      <p className="text-primary-foreground/80 text-xs leading-relaxed max-w-xl">
                        Rekomendasi ini dihasilkan berdasarkan pola transaksi dan tingkat probabilitas kemiripan dengan segmen utama.
                      </p>
                    </div>

                    {/* Render Real Configuration */}
                    {activePromos.length > 0 && (
                      <div className="mt-5 pt-4 border-t border-white/20 space-y-2 animate-in fade-in duration-300">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-white/90 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Konfigurasi Aktif Saat Ini:
                        </span>
                        
                        {/* FIX UI MELEBAR: Ubah dari grid menjadi flex row agar ukurannya dinamis */}
                        <div className="flex flex-row flex-wrap gap-2.5">
                          {activePromos.map((p) => {
                            let parsedParams: ActivePromoParams = {};
                            if (typeof p.params === "string") {
                              try { parsedParams = JSON.parse(p.params); } catch { parsedParams = {}; }
                            } else {
                              parsedParams = p.params || {};
                            }

                            return (
                              <div 
                                key={p.id} 
                                className="bg-white/10 border border-white/10 rounded-xl px-4 py-2backdrop-blur-md flex flex-col w-fit min-w-40 shadow-xs"
                              > {/* Ditambahkan w-fit dan min-width agar proporsional */}
                                <span className="font-bold text-xs tracking-wide text-white">
                                  {PROMO_LABEL[p.promo_type] ?? p.promo_type}
                                </span>
                                <span className="text-[11px] text-white/90 mt-0.5 font-medium">
                                  {formatParams(p.promo_type, parsedParams)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-4 flex justify-start">
                      <PromoConfigSheet 
                        segmentName={customerData.segment} 
                        clusterId={customerData.cluster} 
                        recommendation={customerData.recommendation}
                        onSaved={fetchClusterPromos} // Pas disave, lgsg re-fetch biar nilainya lgsg muncul di box oranye
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* SECTION 2: LRFM METRIC CARDS */}
              {lrfm && (
                <div>
                  <h3 className="text-base font-semibold text-zinc-900 mb-4 px-1">
                    Metrik Transaksi Aktual (LRFM)
                  </h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="shadow-sm border-zinc-200/60">
                      <CardContent className="p-5 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-zinc-500 mb-1">
                          <Clock className="w-4 h-4" />
                          <span className="text-xs font-medium uppercase tracking-wider">Length</span>
                        </div>
                        <p className="text-2xl font-bold text-zinc-900">
                          {lrfm.L} <span className="text-sm font-medium text-muted-foreground">Hari</span>
                        </p>
                        <p className="text-xs text-muted-foreground">Umur hubungan pelanggan</p>
                      </CardContent>
                    </Card>
                    <Card className="shadow-sm border-zinc-200/60">
                      <CardContent className="p-5 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-zinc-500 mb-1">
                          <CalendarDays className="w-4 h-4" />
                          <span className="text-xs font-medium uppercase tracking-wider">Recency</span>
                        </div>
                        <p className="text-2xl font-bold text-zinc-900">
                          {lrfm.R} <span className="text-sm font-medium text-muted-foreground">Hari</span>
                        </p>
                        <p className="text-xs text-muted-foreground">Sejak transaksi terakhir</p>
                      </CardContent>
                    </Card>
                    <Card className="shadow-sm border-zinc-200/60">
                      <CardContent className="p-5 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-zinc-500 mb-1">
                          <ShoppingCart className="w-4 h-4" />
                          <span className="text-xs font-medium uppercase tracking-wider">Frequency</span>
                        </div>
                        <p className="text-2xl font-bold text-zinc-900">
                          {lrfm.F} <span className="text-sm font-medium text-muted-foreground">Kali</span>
                        </p>
                        <p className="text-xs text-muted-foreground">Total jumlah transaksi</p>
                      </CardContent>
                    </Card>
                    <Card className="shadow-sm border-zinc-200/60">
                      <CardContent className="p-5 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-zinc-500 mb-1">
                          <Wallet className="w-4 h-4" />
                          <span className="text-xs font-medium uppercase tracking-wider">Monetary</span>
                        </div>
                        <p className="text-2xl font-bold text-emerald-600">
                          ¥ {lrfm.M.toLocaleString("id-ID", { maximumFractionDigits: 0 })}
                        </p>
                        <p className="text-xs text-muted-foreground">Total uang yang dihabiskan</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* SECTION 3: CHARTS */}
              <div>
                <h3 className="text-base font-semibold text-zinc-900 mb-4 px-1">
                  Komparasi Visual & Probabilitas Segmen
                </h3>
                <div className="bg-white border rounded-2xl p-4 sm:p-6 shadow-sm">
                  <InferenceCharts
                    inferenceResult={customerData}
                    clusterStats={clusterStats || []}
                  />
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function CustomerDetailPage() {
  return (
    <SegmentsProvider>
      <CustomerDetailContent />
    </SegmentsProvider>
  );
}