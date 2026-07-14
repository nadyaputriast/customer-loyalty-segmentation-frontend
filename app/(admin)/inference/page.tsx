"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { Loader2, Plus, Trash2, UploadCloud, ArrowRight, BarChart2 } from "lucide-react";

import { SiteHeader } from "@/components/layout/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import {
  segmentFromFile,
  segmentFromLRFM,
  segmentFromTransactions,
  TransactionPayload,
  StandardResponse,
  SegmentationData,
  BatchSegmentationData
} from "@/services/segments";
import { BatchInferenceGraphics } from "@/components/inference/batch-graphics";
import InferenceCharts from "@/components/segments/inference-stats";
import { useSegments } from "@/contexts/segments-context";

type TransactionRow = TransactionPayload & { rowId: string };

type FileResponseData =
  | SegmentationData
  | BatchSegmentationData
  | { batch_id: string; status: "processing" };

const createRowId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `row-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const createEmptyTransaction = (): TransactionRow => ({
  rowId: createRowId(),
  customer_id: "",
  transaction_date: "",
  invoice_id: "",
  amount: 0,
});

const requiredFields = [
  { key: "customer_id", label: "Customer ID" },
  { key: "transaction_date", label: "Transaction Date" },
  { key: "invoice_id", label: "Invoice ID" },
  { key: "amount", label: "Amount" },
] as const;

type RequiredFieldKey = (typeof requiredFields)[number]["key"];
type ColumnMapping = Record<RequiredFieldKey, string>;

const EMPTY_MAPPING: ColumnMapping = {
  customer_id: "",
  transaction_date: "",
  invoice_id: "",
  amount: "",
};

const NONE_SELECT_VALUE = "__none__";

const normalizeHeader = (value: string) => {
  const withSpaces = value.replace(/([a-z])([A-Z])/g, "$1 $2");
  const splitCaps = withSpaces.replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");
  const cleaned = splitCaps.replace(/[^a-zA-Z0-9]/g, " ");
  return cleaned.replace(/\s+/g, " ").trim().toLowerCase();
};

const keywordRules: Record<RequiredFieldKey, { required: string[][]; exclude: string[] }> = {
  customer_id: { required: [["customer", "id"], ["pelanggan", "id"], ["member", "id"], ["user", "id"], ["userid"], ["customerid"]], exclude: ["invoice", "order", "transaction", "trx"] },
  transaction_date: { required: [["date"], ["tanggal"], ["tgl"], ["purchase", "date"], ["order", "date"], ["transaction", "date"]], exclude: [] },
  invoice_id: { required: [["invoice"], ["order", "id"], ["order", "no"], ["no", "pesanan"], ["trx", "id"], ["transaction", "id"], ["id", "transaksi"], ["invoiceid"], ["orderid"]], exclude: ["customer", "pelanggan", "user", "date", "tanggal"] },
  amount: { required: [["amount"], ["total"], ["nominal"], ["revenue"], ["price"], ["harga"], ["sales"], ["belanja"]], exclude: ["customer", "pelanggan", "date", "invoice", "order", "id"] },
};

const matchesRule = (tokens: Set<string>, rules: { required: string[][]; exclude: string[] }) => {
  if (rules.exclude.some((token) => tokens.has(token))) return false;
  return rules.required.some((group) => group.every((token) => tokens.has(token)));
};

const autoDetectMapping = (headers: string[]): ColumnMapping => {
  const mapping: ColumnMapping = { ...EMPTY_MAPPING };
  const usedTargets = new Set<RequiredFieldKey>();
  headers.forEach((header) => {
    const normalized = normalizeHeader(header);
    const tokens = new Set(normalized.split(" "));
    for (const { key } of requiredFields) {
      if (usedTargets.has(key)) continue;
      const normalizedTarget = key.replace(/_/g, " ");
      if (normalized === normalizedTarget || matchesRule(tokens, keywordRules[key])) {
        mapping[key] = header;
        usedTargets.add(key);
        break;
      }
    }
  });
  return mapping;
};

const getFileHeaders = async (file: File) => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: "array", sheetRows: 5 });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: "" });
  return (rows[0] ?? []).map(String).filter((h) => h.trim() !== "");
};

const calculateStats = (arr: number[]) => {
  if (arr.length === 0) return { mean: 0, std: 0 };
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;
  return { mean, std: Math.sqrt(variance) };
};

const FuzzyMembershipCard = ({ membership }: { membership: Record<string, string> }) => {
  const sorted = Object.entries(membership || {}).sort((a, b) => parseFloat(b[1]) - parseFloat(a[1]));
  
  return (
    <div className="rounded-2xl border border-foreground/10 bg-white p-5 flex flex-col h-full shadow-sm">
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-zinc-900">Analisis Kemiripan Gaya Belanja</h4>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          Sistem AI tidak menilai pelanggan secara kaku. Persentase di bawah ini menjelaskan seberapa kuat gaya belanja pelanggan ini jika dibandingkan dengan pola masing-masing segmen.
        </p>
      </div>
      <div className="space-y-3.5 flex-1 justify-center flex flex-col">
        {sorted.map(([label, value]) => (
          <div key={label} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-zinc-700">{label}</span>
              <span className="font-semibold text-zinc-900">{value}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                style={{ width: value }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function InferencePage() {
  const router = useRouter();
  const { clusterStats } = useSegments();

  const [lrfmValues, setLrfmValues] = useState({ L: "", R: "", F: "", M: "" });
  const [lrfmResult, setLrfmResult] = useState<StandardResponse<SegmentationData> | null>(null);
  const [lrfmLoading, setLrfmLoading] = useState(false);
  const [lrfmError, setLrfmError] = useState<string | null>(null);

  const [transactions, setTransactions] = useState<TransactionRow[]>([createEmptyTransaction()]);
  const [transactionResult, setTransactionResult] = useState<StandardResponse<SegmentationData> | null>(null);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [transactionError, setTransactionError] = useState<string | null>(null);

  // ---- File Upload ----
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>(EMPTY_MAPPING);
  const [mappingError, setMappingError] = useState<string | null>(null);
  const [fileResult, setFileResult] = useState<StandardResponse<FileResponseData> | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  // ---- Memos ----
  const canSubmitLrfm = useMemo(() => Object.values(lrfmValues).every((v) => v !== ""), [lrfmValues]);
  const lrfmPayload = useMemo(() => lrfmResult?.data ?? null, [lrfmResult]);
  const transactionPayload = useMemo(() => transactionResult?.data ?? null, [transactionResult]);

  const filePayloads = useMemo<SegmentationData[]>(() => {
    if (!fileResult?.data) return [];
    const d = fileResult.data;
    if ("status" in d && d.status === "processing") return [];
    if ("total_customers" in d && Array.isArray(d.data)) return d.data;
    if ("cluster" in d) return [d as SegmentationData];
    return [];
  }, [fileResult]);

  const currentBatchId = useMemo(() => {
    const d = fileResult?.data;
    return d && "batch_id" in d ? d.batch_id : null;
  }, [fileResult]);

  const isProcessing = useMemo(() => {
    const d = fileResult?.data;
    return d && "status" in d && d.status === "processing";
  }, [fileResult]);

  const batchComprehensiveStats = useMemo(() => {
    if (filePayloads.length === 0) return null;
    const clustersMap = new Map<number, SegmentationData[]>();
    filePayloads.forEach((item) => {
      if (!clustersMap.has(item.cluster)) clustersMap.set(item.cluster, []);
      clustersMap.get(item.cluster)!.push(item);
    });
    return Array.from(clustersMap.entries())
      .map(([clusterId, items]) => {
        const Ls = items.map((i) => i.lrfm_calculated?.L || 0);
        const Rs = items.map((i) => i.lrfm_calculated?.R || 0);
        const Fs = items.map((i) => i.lrfm_calculated?.F || 0);
        const Ms = items.map((i) => i.lrfm_calculated?.M || 0);
        return {
          cluster: clusterId,
          segmentName: items[0].segment,
          count: items.length,
          percentage: ((items.length / filePayloads.length) * 100).toFixed(1),
          stats: {
            L: calculateStats(Ls),
            R: calculateStats(Rs),
            F: calculateStats(Fs),
            M: calculateStats(Ms),
          },
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [filePayloads]);

  const isMappingComplete = useMemo(
    () => requiredFields.every((field) => columnMapping[field.key]),
    [columnMapping]
  );

  // ---- Handlers ----
  const handleLrfmSubmit = async () => {
    setLrfmLoading(true); setLrfmError(null); setLrfmResult(null);
    try {
      const payload = { L: Number(lrfmValues.L), R: Number(lrfmValues.R), F: Number(lrfmValues.F), M: Number(lrfmValues.M) };
      const response = await segmentFromLRFM(payload);
      setLrfmResult(response);
    } catch (err) {
      console.error(err);
      setLrfmError("Inference LRFM gagal. Cek input atau token login.");
    } finally {
      setLrfmLoading(false);
    }
  };

  const handleAddTransaction = () => setTransactions((prev) => [...prev, createEmptyTransaction()]);
  const handleRemoveTransaction = (index: number) => setTransactions((prev) => prev.filter((_, idx) => idx !== index));
  const updateTransaction = (index: number, key: keyof TransactionPayload, value: string) => {
    setTransactions((prev) =>
      prev.map((t, idx) => (idx === index ? { ...t, [key]: key === "amount" ? Number(value) : value } : t))
    );
  };

  const handleTransactionSubmit = async () => {
    setTransactionLoading(true); setTransactionError(null); setTransactionResult(null);
    try {
      const payload = transactions.map((t) => ({
        customer_id: t.customer_id,
        transaction_date: t.transaction_date,
        invoice_id: t.invoice_id,
        amount: t.amount,
      }));
      const response = await segmentFromTransactions(payload);
      setTransactionResult(response);
    } catch (err) {
      console.error(err);
      setTransactionError("Inference transaksi gagal. Pastikan data lengkap.");
    } finally {
      setTransactionLoading(false);
    }
  };

  const handleFileSubmit = async () => {
    if (!uploadFile) { setFileError("Silakan pilih file CSV atau XLSX terlebih dahulu."); return; }
    if (!isMappingComplete) { setMappingError("Lengkapi mapping kolom terlebih dahulu."); return; }

    setFileLoading(true); setFileError(null); setFileResult(null);
    try {
      // IMPORTANT: calls segmentFromFile with only the file (no mapping)
      // The backend will auto-detect column mappings.
      const response = await segmentFromFile(uploadFile);
      setFileResult(response as StandardResponse<FileResponseData>);
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      }, 100);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string; detail?: string } }; message?: string };
      const detail = error.response?.data?.message ?? error.response?.data?.detail ?? error.message;
      setFileError(`Upload gagal: ${detail ?? "unknown error"}`);
    } finally {
      setFileLoading(false);
    }
  };

  const handleFileSelection = async (file: File | null) => {
    setUploadFile(file); setFileResult(null); setFileError(null); setMappingError(null);
    setFileHeaders([]); setColumnMapping(EMPTY_MAPPING);
    if (!file) return;
    try {
      const headers = await getFileHeaders(file);
      setFileHeaders(headers);
      setColumnMapping(autoDetectMapping(headers));
    } catch {
      setFileError("File tidak bisa dibaca. Pastikan format CSV/XLSX valid.");
    }
  };

  // ─────────────────────────── render ─────────────────────────────
  return (
    <>
      <SiteHeader breadcrumbs={[{ label: "LoyalT", href: "/dashboard" }, { label: "Inference" }]} />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex w-full flex-col gap-6 px-4 lg:px-6">
            <header className="w-full">
              <h1 className="text-xl font-medium tracking-tight text-zinc-900">Inference Workspace</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Jalankan segmentasi berdasarkan LRFM, transaksi manual, atau upload CSV/XLSX.
              </p>
            </header>

            <Tabs defaultValue="upload" className="w-full">
              <TabsList>
                <TabsTrigger value="lrfm">LRFM</TabsTrigger>
                <TabsTrigger value="transaction">Transaksi Manual</TabsTrigger>
                <TabsTrigger value="upload">CSV/XLSX</TabsTrigger>
              </TabsList>

              {/* ===== LRFM TAB ===== */}
              <TabsContent value="lrfm" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Input Nilai LRFM</CardTitle>
                    <CardDescription>Isi metrik Length, Recency, Frequency, dan Monetary untuk 1 pelanggan.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      {(["L", "R", "F", "M"] as const).map((key) => (
                        <div key={key} className="space-y-2">
                          <Label htmlFor={`lrfm-${key}`}>{key}</Label>
                          <Input
                            id={`lrfm-${key}`}
                            type="number"
                            value={lrfmValues[key]}
                            onChange={(e) => setLrfmValues((prev) => ({ ...prev, [key]: e.target.value }))}
                          />
                        </div>
                      ))}
                    </div>
                    {lrfmError && <p className="text-sm text-red-500">{lrfmError}</p>}
                    <Button onClick={handleLrfmSubmit} disabled={!canSubmitLrfm || lrfmLoading}>
                      {lrfmLoading ? (
                        <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Processing</span>
                      ) : (
                        "Run Inference"
                      )}
                    </Button>

                    {lrfmPayload && (
                      <div className="mt-6">
                        <div className="grid gap-4 lg:grid-cols-[2fr_1.2fr]">
                          <div className="rounded-2xl border border-foreground/10 bg-linear-to-br from-amber-50 via-white to-rose-50 p-5 shadow-sm">
                            <div className="flex flex-wrap items-center gap-3">
                              <Badge variant="secondary">Cluster {lrfmPayload.cluster}</Badge>
                              <Badge variant="outline">{lrfmPayload.segment}</Badge>
                              <Badge variant="outline">{lrfmPayload.pattern}</Badge>
                            </div>
                            <div className="mt-4">
                              <p className="text-sm text-muted-foreground">Recommendation</p>
                              <p className="text-base font-medium text-zinc-900">{lrfmPayload.recommendation}</p>
                            </div>
                          </div>
                          <FuzzyMembershipCard membership={lrfmPayload.fuzzy_membership} />
                        </div>
                        <InferenceCharts inferenceResult={lrfmPayload} clusterStats={clusterStats || []} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ===== TRANSACTION TAB ===== */}
              <TabsContent value="transaction" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Input Transaksi Manual</CardTitle>
                    <CardDescription>Masukkan transaksi per pelanggan satu per satu lalu jalankan segmentasi.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      {transactions.map((transaction, index) => (
                        <div key={transaction.rowId} className="grid gap-3 rounded-xl border border-dashed border-muted-foreground/20 p-4 md:grid-cols-5">
                          <div className="space-y-2"><Label>Customer ID</Label><Input value={transaction.customer_id} onChange={(e) => updateTransaction(index, "customer_id", e.target.value)} /></div>
                          <div className="space-y-2"><Label>Invoice ID</Label><Input value={transaction.invoice_id} onChange={(e) => updateTransaction(index, "invoice_id", e.target.value)} /></div>
                          <div className="space-y-2"><Label>Date</Label><Input type="date" value={transaction.transaction_date} onChange={(e) => updateTransaction(index, "transaction_date", e.target.value)} /></div>
                          <div className="space-y-2"><Label>Amount</Label><Input type="number" value={transaction.amount} onChange={(e) => updateTransaction(index, "amount", e.target.value)} /></div>
                          <div className="flex items-end justify-end"><Button variant="outline" size="icon" onClick={() => handleRemoveTransaction(index)} disabled={transactions.length === 1}><Trash2 className="h-4 w-4" /></Button></div>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button variant="outline" onClick={handleAddTransaction}><Plus className="h-4 w-4" /> Add Row</Button>
                      <Button onClick={handleTransactionSubmit} disabled={transactionLoading}>
                        {transactionLoading ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Processing</span> : "Run Inference"}
                      </Button>
                    </div>
                    {transactionError && <p className="text-sm text-red-500">{transactionError}</p>}

                    {transactionPayload && (
                      <div className="mt-6">
                        <div className="grid gap-4 lg:grid-cols-[2fr_1.2fr]">
                          <div className="rounded-2xl border border-foreground/10 bg-linear-to-br from-emerald-50 via-white to-sky-50 p-5 shadow-sm">
                            <div className="flex flex-wrap items-center gap-3">
                              <Badge variant="secondary">Cluster {transactionPayload.cluster}</Badge>
                              <Badge variant="outline">{transactionPayload.segment}</Badge>
                              <Badge variant="outline">{transactionPayload.pattern}</Badge>
                            </div>
                            <div className="mt-4">
                              <p className="text-sm text-muted-foreground">Recommendation</p>
                              <p className="text-base font-medium text-zinc-900">{transactionPayload.recommendation}</p>
                            </div>
                          </div>
                          <FuzzyMembershipCard membership={transactionPayload.fuzzy_membership} />
                        </div>
                        <InferenceCharts inferenceResult={transactionPayload} clusterStats={clusterStats || []} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ===== UPLOAD TAB ===== */}
              <TabsContent value="upload" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Upload File Transaksi</CardTitle>
                    <CardDescription>Upload file CSV atau XLSX berisi transaksi pelanggan. Kolom akan di-mapping otomatis.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="upload-file">File</Label>
                      <Input
                        id="upload-file"
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={(e) => handleFileSelection(e.target.files?.[0] ?? null)}
                      />
                    </div>

                    {fileHeaders.length > 0 && (
                      <div className="rounded-xl border border-muted-foreground/20 p-4 text-sm space-y-3">
                        <div className="text-muted-foreground">Detected headers: {fileHeaders.join(", ")}</div>
                        <div className="grid gap-3 md:grid-cols-2">
                          {requiredFields.map((field) => (
                            <div key={field.key} className="space-y-2">
                              <Label>{field.label}</Label>
                              <Select
                                value={columnMapping[field.key] || NONE_SELECT_VALUE}
                                onValueChange={(val) =>
                                  setColumnMapping((prev) => ({
                                    ...prev,
                                    [field.key]: val === NONE_SELECT_VALUE ? "" : val,
                                  }))
                                }
                              >
                                <SelectTrigger className="w-full"><SelectValue placeholder="Pilih kolom" /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={NONE_SELECT_VALUE}>Tidak dipilih</SelectItem>
                                  {fileHeaders.map((header) => (
                                    <SelectItem key={header} value={header}>{header}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {fileError && <p className="text-sm text-red-500">{fileError}</p>}
                    {mappingError && <p className="text-sm text-red-500">{mappingError}</p>}

                    <Button onClick={handleFileSubmit} disabled={fileLoading || !uploadFile}>
                      {fileLoading ? (
                        <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Processing Batch...</span>
                      ) : (
                        <span className="inline-flex items-center gap-2"><UploadCloud className="h-4 w-4" /> Run Inference</span>
                      )}
                    </Button>

                    {/* Background task banner */}
                    {isProcessing && (
                      <div className="mt-10 p-8 border rounded-2xl bg-linear-to-bl from-blue-50 to-indigo-50 border-blue-100 flex flex-col items-center text-center space-y-5 animate-in fade-in slide-in-from-bottom-4">
                        <div className="p-3 bg-blue-100 rounded-full"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
                        <div>
                          <h3 className="font-bold text-xl text-blue-900">File Sedang Dianalisis!</h3>
                          <p className="text-sm text-blue-700 mt-2 max-w-md mx-auto">
                            Sistem sedang memproses data transaksi kamu di latar belakang.
                          </p>
                        </div>
                        <Button
                          size="lg"
                          className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                          onClick={() => router.push(currentBatchId ? `/inference-history/${currentBatchId}` : "/inference-history")}
                        >
                          <BarChart2 className="w-4 h-4 mr-2" /> Pantau Progress di History <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    )}

                    {/* Inline result (small file) */}
                    {filePayloads.length > 0 && batchComprehensiveStats && (
                      <div className="space-y-8 mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500 border-t pt-8">
                        <div className="bg-zinc-50 border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <h3 className="font-semibold text-xl text-zinc-900">Berhasil Memproses {filePayloads.length} Pelanggan!</h3>
                            <p className="text-sm text-muted-foreground mt-1">Terbagi ke dalam {batchComprehensiveStats.length} cluster berbeda.</p>
                          </div>
                          {currentBatchId && (
                            <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                              <Badge variant="secondary" className="font-mono text-xs">ID: {currentBatchId.split("-")[0]}...</Badge>
                              <Button
                                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                                onClick={() => router.push(`/inference-history/${currentBatchId}`)}
                              >
                                <BarChart2 className="w-4 h-4 mr-2" /> Lihat Detail di History <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                            </div>
                          )}
                        </div>

                        <BatchInferenceGraphics data={filePayloads} />

                        <div className="bg-white border rounded-2xl p-6 shadow-sm mt-4">
                          <div className="mb-6">
                            <h3 className="font-semibold text-lg text-zinc-900">Karakteristik & Variansi per Cluster</h3>
                            <p className="text-sm text-muted-foreground">Analisis mendalam mengenai nilai rata-rata dan penyebaran data dalam setiap segmen.</p>
                          </div>
                          <Accordion type="single" collapsible className="w-full space-y-3">
                            {batchComprehensiveStats.map((c) => (
                              <AccordionItem value={`cluster-${c.cluster}`} key={c.cluster} className="bg-zinc-50/50 border rounded-xl px-4 overflow-hidden">
                                <AccordionTrigger className="hover:no-underline py-4">
                                  <div className="flex items-center justify-between w-full pr-4">
                                    <div className="flex items-center gap-3">
                                      <Badge className="bg-white border shadow-sm text-zinc-800">Cluster {c.cluster}</Badge>
                                      <span className="font-medium text-base text-zinc-900">{c.segmentName}</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground bg-white px-3 py-1 rounded-full border shadow-sm">
                                      {c.count} orang ({c.percentage}%)
                                    </div>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="pb-6 pt-2">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm bg-white p-5 rounded-xl border shadow-sm">
                                    <div className="space-y-3">
                                      <p className="font-semibold text-zinc-800 border-b pb-2 flex items-center">
                                        <span className="w-2 h-2 rounded-full bg-blue-500 mr-2" /> Rata-rata (Mean)
                                      </p>
                                      <div className="flex justify-between"><span className="text-zinc-500">Length</span><span className="font-medium">{c.stats.L.mean.toFixed(1)} hr</span></div>
                                      <div className="flex justify-between"><span className="text-zinc-500">Recency</span><span className="font-medium">{c.stats.R.mean.toFixed(1)} hr</span></div>
                                      <div className="flex justify-between"><span className="text-zinc-500">Frequency</span><span className="font-medium">{c.stats.F.mean.toFixed(1)} x</span></div>
                                      <div className="flex justify-between"><span className="text-zinc-500">Monetary</span><span className="font-medium text-emerald-600">¥ {c.stats.M.mean.toLocaleString("id-ID", { maximumFractionDigits: 0 })}</span></div>
                                    </div>
                                    <div className="space-y-3">
                                      <p className="font-semibold text-zinc-800 border-b pb-2 flex items-center">
                                        <span className="w-2 h-2 rounded-full bg-amber-500 mr-2" /> Standar Deviasi (Variansi)
                                      </p>
                                      <div className="flex justify-between"><span className="text-zinc-500">Deviasi L</span><span className="font-medium text-zinc-600">± {c.stats.L.std.toFixed(1)}</span></div>
                                      <div className="flex justify-between"><span className="text-zinc-500">Deviasi R</span><span className="font-medium text-zinc-600">± {c.stats.R.std.toFixed(1)}</span></div>
                                      <div className="flex justify-between"><span className="text-zinc-500">Deviasi F</span><span className="font-medium text-zinc-600">± {c.stats.F.std.toFixed(1)}</span></div>
                                      <div className="flex justify-between"><span className="text-zinc-500">Deviasi M</span><span className="font-medium text-zinc-600">± ¥ {c.stats.M.std.toLocaleString("id-ID", { maximumFractionDigits: 0 })}</span></div>
                                    </div>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-4 italic text-center">
                                    *Semakin besar nilai Standar Deviasi, semakin menyebar (bervariasi) perilaku belanja pelanggan di dalam cluster ini.
                                  </p>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}