"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger, 
  SheetFooter 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, Tag, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { createPromoConfig, getPromosByCluster, getPromoMetadata, ActivePromoData, ActivePromoParams } from "@/services/promo";
import { RankedPromo } from "@/services/segments";

const ALL_PROMO_TYPES: Record<string, { label: string; keyword: string }> = {
  kupon:       { label: "Kupon / Voucher",       keyword: "kupon" },
  cashback:    { label: "Cashback",              keyword: "cashback" },
  bogo:        { label: "Buy One Get One Free",  keyword: "buy one get one" },
  price_off:   { label: "Price Off Deals",       keyword: "price off" },
  bonus_packs: { label: "Bonus Packs",           keyword: "bonus packs" },
  sampling:    { label: "Free Sampling",         keyword: "sampling" },
};

// Fallback lokal jika BE masih mengirim format flat string biasa
const FALLBACK_PROMO_MAP: Record<string, string> = {
  "High Value Loyal Customers": "Sampling, cashback",
  "High Value New Customers": "Buy One Get One Free, Cashback",
  "Platinum Customers": "Cashback",
  "Potential Loyal Customers": "Sampling, cashback",
  "Potential High Frequency Customers": "Kupon, cashback",
  "Potential Consumption Customers": "Buy One Get One Free",
  "High Value Lost Customers": "Buy One Get One Free, Bonus Packs",
  "Frequency Lost Customers": "Buy One Get One Free, Kupon",
  "Consumption Lost Customers": "Bonus Packs, Kupon",
  "Uncertain Lost Customers": "Kupon, Bonus Packs",
  "Frequency Promotions Customers": "Price Off Deals, cashback",
  "Consumption Promotions Customers": "Cashback",
  "Uncertain New Customers": "Kupon, Buy One Get One Free",
  "High Consumption Cost Customers": "Bonus Packs",
  "Low Consumption Cost Customers": "Bonus Packs, Kupon"
};

interface PromoConfigSheetProps {
  segmentName: string;
  clusterId: number;
  recommendation: string;
  rankedPromos?: RankedPromo[] | null;
  onSaved?: () => void;
  trigger?: React.ReactNode;
}

export function PromoConfigSheet({ 
  segmentName, 
  clusterId,
  onSaved,
  trigger,
}: PromoConfigSheetProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const isGlobalCreate = clusterId === -1;
  const [selectedClusterId, setSelectedClusterId] = useState<number>(clusterId);

  // Menggunakan tipe data 'any' internal khusus di state ini agar fleksibel membaca format lama/baru dari BE
  const [clusterMetadata, setClusterMetadata] = useState<Record<string, any>>({});
  const [promoType, setPromoType] = useState<string>("");
  const [promoValue, setPromoValue] = useState("");
  const [promoDiscount, setPromoDiscount] = useState("");
  const [productName, setProductName] = useState("");
  const [bogoBuy, setBogoBuy] = useState("1");
  const [bogoGet, setBogoGet] = useState("1");

  const [existingPromos, setExistingPromos] = useState<ActivePromoData[]>([]);

  // Fetch Metadata map dari JSON BE saat sheet dibuka
  useEffect(() => {
    if (!open) return;
    const fetchMetadata = async () => {
      try {
        const res = await getPromoMetadata();
        setClusterMetadata(res.data || {});
      } catch (err) {
        console.error("Gagal memuat metadata JSON:", err);
      }
    };
    fetchMetadata();
    setSelectedClusterId(clusterId);
  }, [clusterId, open]);

  // Fetch config aktif milik cluster terpilih
  useEffect(() => {
    if (!open || selectedClusterId === -1) return;

    const fetchClusterConfigs = async () => {
      try {
        setFetching(true);
        const res = await getPromosByCluster(selectedClusterId);
        const dbData = res.data ? (Array.isArray(res.data) ? res.data : [res.data]) : [];
        setExistingPromos(dbData);

        if (dbData.length > 0) {
          setPromoType(dbData[0].promo_type);
        } else {
          setPromoType("");
        }
      } catch (err) {
        console.error(err);
        setExistingPromos([]);
      } finally {
        setFetching(false);
      }
    };

    fetchClusterConfigs();
  }, [open, selectedClusterId]);

  // Auto-fill Form Form Data
  useEffect(() => {
    if (selectedClusterId === -1 || !promoType) return;

    const matchedPromo = existingPromos.find(p => p.promo_type === promoType);

    if (matchedPromo) {
      setIsEditMode(true);
      let parsedParams: ActivePromoParams = {};
      if (typeof matchedPromo.params === "string") {
        try { parsedParams = JSON.parse(matchedPromo.params); } catch { parsedParams = {}; }
      } else {
        parsedParams = matchedPromo.params || {};
      }
      setPromoValue(String(parsedParams.value ?? ""));
      setPromoDiscount(String(parsedParams.discount ?? ""));
      setProductName(parsedParams.product_name ?? "");
      setBogoBuy(String(parsedParams.buy_qty ?? "1"));
      setBogoGet(String(parsedParams.get_qty ?? "1"));
    } else {
      setIsEditMode(false);
      setPromoValue("");
      setPromoDiscount("");
      setProductName("");
      setBogoBuy("1");
      setBogoGet("1");
    }
  }, [promoType, existingPromos, selectedClusterId]);

  // =========================================================================
  // FIX VALIDASI DROPDOWN: Otomatis mem-parsing rule map baik format lama maupun baru
  // =========================================================================
  const dropdownOptions = useMemo(() => {
    const keyStr = String(selectedClusterId);
    if (selectedClusterId === -1 || !clusterMetadata[keyStr]) return [];
    
    const currentMeta = clusterMetadata[keyStr];
    let allowedKeys: string[] = [];

    if (typeof currentMeta === "string") {
      // JIKA FORMAT BE ADALAH FLAT STRING: Lakukan parsing dari Fallback Map lokal
      const promoStr = FALLBACK_PROMO_MAP[currentMeta] || "";
      const keywordMapping: Record<string, string> = {
        "kupon": "kupon", "voucher": "kupon", "cashback": "cashback",
        "buy one get one": "bogo", "bogo": "bogo", "price off": "price_off",
        "bonus packs": "bonus_packs", "sampling": "sampling"
      };
      Object.entries(keywordMapping).forEach(([keyword, targetKey]) => {
        if (promoStr.toLowerCase().includes(keyword) && !allowedKeys.includes(targetKey)) {
          allowedKeys.push(targetKey);
        }
      });
    } else if (currentMeta && Array.isArray(currentMeta.allowed_promos)) {
      // JIKA FORMAT BE ADALAH OBJECT TERSTRUKTUR: Langsung pakai array bawaan BE
      allowedKeys = currentMeta.allowed_promos;
    }

    // Jika karena suatu alasan tidak ada promo terdeteksi, tampilkan opsi default kupon
    if (allowedKeys.length === 0) allowedKeys = ["kupon"];

    // Set default selection jika state promoType saat ini kosong / tidak valid
    if (!promoType && allowedKeys.length > 0) {
      setTimeout(() => setPromoType(allowedKeys[0]), 50);
    }

    return allowedKeys.map(value => {
      const info = ALL_PROMO_TYPES[value];
      if (!info) return null;
      const exists = existingPromos.some(ep => ep.promo_type === value);
      return { value, label: info.label, isActiveInDb: exists };
    }).filter((item): item is { value: string; label: string; isActiveInDb: boolean } => item !== null);
  }, [clusterMetadata, selectedClusterId, existingPromos, promoType]);

  const handleSubmit = async () => {
    if (selectedClusterId === -1) {
      toast.error("Silakan pilih Target Cluster terlebih dahulu.");
      return;
    }
    setLoading(true);
    try {
      const params: ActivePromoParams = {};
      if (promoType === "cashback" || promoType === "price_off") {
        if (!promoValue) { toast.error("Masukkan nilai nominal."); setLoading(false); return; }
        params.value = Number(promoValue);
      } else if (promoType === "kupon") {
        if (!promoDiscount) { toast.error("Masukkan persentase diskon."); setLoading(false); return; }
        params.discount = Number(promoDiscount);
      } else if (promoType === "sampling" || promoType === "bonus_packs") {
        if (!productName) { toast.error("Masukkan nama produk."); setLoading(false); return; }
        params.product_name = productName;
      } else if (promoType === "bogo") {
        params.buy_qty = Number(bogoBuy);
        params.get_qty = Number(bogoGet);
      }

      await createPromoConfig({ promo_type: promoType, params, active: true, cluster_id: selectedClusterId });
      toast.success(isEditMode ? "Configuration updated successfully!" : "Configuration deployed successfully!");
      onSaved?.();
      setOpen(false);
    } catch {
      toast.error("Gagal menyimpan konfigurasi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger ? trigger : (
          <Button variant="secondary" className="mt-4 bg-white/20 hover:bg-white/30 text-white">
             Configure Campaign
          </Button>
        )}
      </SheetTrigger>
      
      <SheetContent className="sm:max-w-112.5 flex flex-col h-full p-0">
        <div className="p-6 pb-0">
          <SheetHeader className="mb-2">
            <SheetTitle className="text-xl flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> Campaign Setup
            </SheetTitle>
            <SheetDescription>
              Kelola konfigurasi promosi tertarget berdasarkan matriks draf regulasi kluster.
            </SheetDescription>
          </SheetHeader>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 shadow-sm">
            <Label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">
              Target Audience
            </Label>
            
            {isGlobalCreate ? (
              <div className="mt-2">
                <Select 
                  value={selectedClusterId === -1 ? "" : String(selectedClusterId)} 
                  onValueChange={(val) => {
                    setSelectedClusterId(Number(val));
                    setPromoType("");
                  }}
                >
                  <SelectTrigger className="w-full bg-white h-10 border-zinc-200">
                    <SelectValue placeholder="-- Pilih Target Cluster --" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* DROPDOWN ADAPTIF: Otomatis membaca format string ataupun object */}
                    {Object.entries(clusterMetadata).map(([id, item]) => {
                      const nameToShow = typeof item === "string" ? item : (item?.segment_name || `Cluster ${id}`);
                      return (
                        <SelectItem key={id} value={id}>
                          Cluster {id} ({nameToShow})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="mt-1 flex items-center justify-between">
                <span className="font-semibold text-zinc-900 text-sm">{segmentName}</span>
                <span className="text-xs bg-white border border-zinc-200 px-2 py-1 rounded-md font-mono shadow-xs">
                  Cluster {clusterId}
                </span>
              </div>
            )}
          </div>

          {fetching ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">Checking validation rule map...</p>
            </div>
          ) : (
            selectedClusterId !== -1 && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold flex items-center gap-2 text-zinc-800">
                    <Tag className="w-4 h-4 text-zinc-400" /> Pilih Tipe Promo Valid
                  </Label>

                  <Select value={promoType} onValueChange={setPromoType}>
                    <SelectTrigger className="h-10 bg-white border-zinc-200">
                      <SelectValue placeholder="Pilih jenis promo yang valid" />
                    </SelectTrigger>
                    <SelectContent>
                      {dropdownOptions.map((pt) => (
                        <SelectItem key={pt.value} value={pt.value}>
                          <div className="flex items-center gap-2">
                            <span>{pt.label}</span>
                            {pt.isActiveInDb && (
                              <span className="text-[9px] bg-emerald-50 border border-emerald-200 text-emerald-700 px-1.5 py-0.2 rounded font-bold">
                                Aktif di DB
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {isEditMode ? (
                    <div className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50/50 border border-amber-200 p-3 rounded-lg shadow-2xs">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        Promo jenis ini sudah terkonfigurasi. Tombol beralih ke mode <span className="font-bold underline">Update Campaign</span> untuk mengubah nilai.
                      </div>
                    </div>
                  ) : (
                    promoType && (
                      <div className="flex items-start gap-2 text-xs text-emerald-800 bg-emerald-50/40 border border-emerald-200 p-3 rounded-lg shadow-2xs">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          Promo siap didaftarkan baru dalam mode <span className="font-bold underline">Deploy Campaign</span>.
                        </div>
                      </div>
                    )
                  )}
                </div>

                {/* FORM FIELDS */}
                {(promoType === "cashback" || promoType === "price_off") && (
                  <div className="space-y-3 pt-2 border-t border-dashed">
                    <Label className="text-sm font-semibold">Nominal Value (¥)</Label>
                    <Input type="number" className="h-10 bg-white" placeholder="e.g. 50000" value={promoValue} onChange={(e) => setPromoValue(e.target.value)} />
                  </div>
                )}

                {promoType === "kupon" && (
                  <div className="space-y-3 pt-2 border-t border-dashed">
                    <Label className="text-sm font-semibold">Discount Percentage (%)</Label>
                    <Input type="number" className="h-10 bg-white" placeholder="e.g. 15" value={promoDiscount} onChange={(e) => setPromoDiscount(e.target.value)} />
                  </div>
                )}

                {(promoType === "sampling" || promoType === "bonus_packs") && (
                  <div className="space-y-3 pt-2 border-t border-dashed">
                    <Label className="text-sm font-semibold">{promoType === "sampling" ? "Sample Product Name" : "Bonus Item Name"}</Label>
                    <Input type="text" className="h-10 bg-white" placeholder="e.g. Aqua 330 ml" value={productName} onChange={(e) => setProductName(e.target.value)} />
                  </div>
                )}

                {promoType === "bogo" && (
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-dashed">
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">Buy Qty</Label>
                      <Input type="number" className="h-10 bg-white" placeholder="1" value={bogoBuy} onChange={(e) => setBogoBuy(e.target.value)} />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">Get Qty</Label>
                      <Input type="number" className="h-10 bg-white" placeholder="1" value={bogoGet} onChange={(e) => setBogoGet(e.target.value)} />
                    </div>
                  </div>
                )}
              </div>
            )
          )}
        </div>
        
        <div className="p-6 border-t bg-zinc-50/50 mt-auto">
          <SheetFooter className="flex flex-row gap-3 sm:justify-end">
            <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button
              className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-white shadow-sm"
              onClick={handleSubmit}
              disabled={loading || fetching || selectedClusterId === -1 || !promoType}
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : isEditMode ? "Update Campaign" : "Deploy Campaign"}
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}