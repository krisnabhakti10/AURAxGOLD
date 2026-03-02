"use client";

import { useState, useMemo, useEffect } from "react";

/* ─── Types ─────────────────────────────────────────────── */
type ItemType = "pemasukan" | "pengeluaran";

interface RegularItem {
  id: string;
  kind: "regular";
  type: ItemType;
  nama: string;
  jumlah: number;
  tanggal: number;
  bulan: number;
  tahun: number;
}

interface CicilanItem {
  id: string;
  kind: "cicilan";
  type: ItemType;
  nama: string;
  jumlahDefault: number;
  /** Override nominal per bulan cicilan: key = 0-indexed (bulan ke-1 = key 0) */
  customAmounts: Record<number, number>;
  tanggal: number;
  mulaiBuilan: number;
  mulaiTahun: number;
  durasi: number;
}

type AnyItem = RegularItem | CicilanItem;

/* ─── Helpers ───────────────────────────────────────────── */
const formatRp = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", maximumFractionDigits: 0,
  }).format(n);

const uid = () => Math.random().toString(36).slice(2, 9);

const BULAN = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
];

function getCicilanProgress(c: CicilanItem, bulan: number, tahun: number) {
  const mulaiIdx = c.mulaiTahun * 12 + c.mulaiBuilan;
  const viewIdx  = tahun * 12 + bulan;
  const ke = viewIdx - mulaiIdx + 1;
  if (ke < 1 || ke > c.durasi) return null;
  return ke;
}

function getCicilanAmount(c: CicilanItem, ke: number): number {
  return c.customAmounts[ke - 1] ?? c.jumlahDefault;
}

/* ─── Generate month label from offset ── */
function monthLabel(mulaiBuilan: number, mulaiTahun: number, offset: number) {
  const idx  = mulaiBuilan + offset;
  const b    = idx % 12;
  const y    = mulaiTahun + Math.floor(idx / 12);
  return `${BULAN[b].slice(0, 3)} ${y}`;
}

/* ─── Form state ─────────────────────────────────────────── */
interface FormState {
  type: ItemType;
  nama: string;
  jumlah: number;
  tanggal: number;
  isCicilan: boolean;
  durasi: number;
  useCustomAmounts: boolean;
  customAmounts: Record<number, string>; // string for input control
}

const emptyForm = (): FormState => ({
  type: "pengeluaran",
  nama: "",
  jumlah: 0,
  tanggal: 1,
  isCicilan: false,
  durasi: 6,
  useCustomAmounts: false,
  customAmounts: {},
});

/* ─── LS key ─────────────────────────────────────────────── */
const LS_KEY = "auraxgold_kalkulator_v2";

/* ─── Export ke .txt ─────────────────────────────────────── */
function exportToTxt(items: AnyItem[]) {
  const now   = new Date();
  const tgl   = now.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
  const jam   = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  const formatRpLocal = (n: number) =>
    "Rp " + n.toLocaleString("id-ID");

  const lines: string[] = [
    "╔══════════════════════════════════════════════════╗",
    "║       KALKULATOR KEUANGAN — AURAXGOLD            ║",
    "╚══════════════════════════════════════════════════╝",
    `  Tanggal Export : ${tgl} ${jam}`,
    `  Total Item     : ${items.length}`,
    "",
    "══════════════════════════════════════════════════════",
    "  ITEM PEMASUKAN / PENGELUARAN SEKALI",
    "══════════════════════════════════════════════════════",
  ];

  const regulars = items.filter((i): i is RegularItem => i.kind === "regular");
  if (regulars.length === 0) {
    lines.push("  (tidak ada)");
  } else {
    regulars.forEach((item, idx) => {
      lines.push(`  [${idx + 1}] ${item.nama}`);
      lines.push(`      Tipe    : ${item.type === "pemasukan" ? "Pemasukan ⬆" : "Pengeluaran ⬇"}`);
      lines.push(`      Jumlah  : ${formatRpLocal(item.jumlah)}`);
      lines.push(`      Tanggal : ${item.tanggal} ${BULAN[item.bulan]} ${item.tahun}`);
      lines.push("");
    });
  }

  lines.push("");
  lines.push("══════════════════════════════════════════════════════");
  lines.push("  CICILAN OTOMATIS");
  lines.push("══════════════════════════════════════════════════════");

  const cicilanItems = items.filter((i): i is CicilanItem => i.kind === "cicilan");
  if (cicilanItems.length === 0) {
    lines.push("  (tidak ada)");
  } else {
    cicilanItems.forEach((item, idx) => {
      const endIdx = item.mulaiBuilan + item.durasi - 1;
      const endB   = endIdx % 12;
      const endY   = item.mulaiTahun + Math.floor(endIdx / 12);
      const hasCustom = Object.keys(item.customAmounts).length > 0;
      lines.push(`  [${idx + 1}] ${item.nama}`);
      lines.push(`      Tipe        : ${item.type === "pemasukan" ? "Pemasukan ⬆" : "Pengeluaran ⬇"}`);
      lines.push(`      Default/bln : ${formatRpLocal(item.jumlahDefault)}`);
      lines.push(`      Tanggal JT  : Setiap tgl ${item.tanggal}`);
      lines.push(`      Durasi      : ${item.durasi} bulan`);
      lines.push(`      Mulai       : ${BULAN[item.mulaiBuilan]} ${item.mulaiTahun}`);
      lines.push(`      Selesai     : ${BULAN[endB]} ${endY}`);
      if (hasCustom) {
        lines.push(`      Custom/bln  :`);
        for (let i = 0; i < item.durasi; i++) {
          if (item.customAmounts[i] !== undefined) {
            const bIdx = item.mulaiBuilan + i;
            const bNama = BULAN[bIdx % 12];
            const bThn  = item.mulaiTahun + Math.floor(bIdx / 12);
            lines.push(`        Cicilan ${i + 1}/${item.durasi} (${bNama} ${bThn}) = ${formatRpLocal(item.customAmounts[i])}`);
          }
        }
      }
      lines.push("");
    });
  }

  lines.push("");
  lines.push("══════════════════════════════════════════════════════");
  lines.push("  DATA JSON (untuk import kembali)");
  lines.push("══════════════════════════════════════════════════════");
  lines.push(JSON.stringify(items, null, 2));
  lines.push("");
  lines.push("══════════════════════════════════════════════════════");
  lines.push("  AURAxGOLD — Kalkulator Keuangan Bulanan");
  lines.push("══════════════════════════════════════════════════════");

  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `kalkulator-keuangan-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ─── Import dari .txt / .json ───────────────────────────── */
function importFromFile(
  file: File,
  onSuccess: (data: AnyItem[]) => void,
  onError: (msg: string) => void
) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string;
      // Coba parse langsung sebagai JSON
      let parsed: AnyItem[];
      try {
        parsed = JSON.parse(content);
      } catch {
        // Ekstrak blok JSON dari dalam .txt
        const marker = "DATA JSON (untuk import kembali)";
        const start  = content.indexOf(marker);
        if (start === -1) throw new Error("Format tidak dikenali");
        const jsonStr = content.slice(content.indexOf("[", start));
        const endIdx  = jsonStr.lastIndexOf("]");
        parsed = JSON.parse(jsonStr.slice(0, endIdx + 1));
      }
      if (!Array.isArray(parsed)) throw new Error("Data tidak valid");
      onSuccess(parsed);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Gagal membaca file");
    }
  };
  reader.readAsText(file);
}

/* ─── Page ──────────────────────────────────────────────── */
export default function KalkulatorPage() {
  const now = new Date();

  const [bulan, setBulan] = useState(now.getMonth());
  const [tahun, setTahun] = useState(now.getFullYear());
  const [items, setItems] = useState<AnyItem[]>([]);
  const [form,  setForm]  = useState<FormState>(emptyForm());
  const [showForm,  setShowForm]  = useState(false);
  const [editId,    setEditId]    = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"semua" | "regular" | "cicilan">("semua");
  const [importMsg, setImportMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  /* ── Load dari localStorage ── */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  /* ── Simpan ke localStorage setiap ada perubahan ── */
  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(items)); } catch { /* ignore */ }
  }, [items]);

  /* ─────────────────────────────────────────────────────── */
  /*  Computed                                              */
  /* ─────────────────────────────────────────────────────── */
  interface TimelineEntry {
    id: string;
    type: ItemType;
    nama: string;
    jumlah: number;
    tanggal: number;
    label?: string;
    isCicilan: boolean;
    sisaBulan?: number;
  }

  const activeEntries = useMemo((): TimelineEntry[] => {
    const result: TimelineEntry[] = [];
    items.forEach((item) => {
      if (item.kind === "regular") {
        if (item.bulan === bulan && item.tahun === tahun) {
          result.push({ id: item.id, type: item.type, nama: item.nama, jumlah: item.jumlah, tanggal: item.tanggal, isCicilan: false });
        }
      } else {
        const ke = getCicilanProgress(item, bulan, tahun);
        if (ke !== null) {
          result.push({
            id: `${item.id}-${ke}`,
            type: item.type,
            nama: item.nama,
            jumlah: getCicilanAmount(item, ke),
            tanggal: item.tanggal,
            label: `Cicilan ${ke}/${item.durasi}`,
            isCicilan: true,
            sisaBulan: item.durasi - ke,
          });
        }
      }
    });
    return result;
  }, [items, bulan, tahun]);

  const totalPemasukan   = useMemo(() => activeEntries.filter(e => e.type === "pemasukan").reduce((s, e) => s + e.jumlah, 0), [activeEntries]);
  const totalPengeluaran = useMemo(() => activeEntries.filter(e => e.type === "pengeluaran").reduce((s, e) => s + e.jumlah, 0), [activeEntries]);
  const saldoBersih = totalPemasukan - totalPengeluaran;

  const timeline = useMemo(() => {
    const grouped: Record<number, TimelineEntry[]> = {};
    activeEntries.forEach((e) => {
      if (!grouped[e.tanggal]) grouped[e.tanggal] = [];
      grouped[e.tanggal].push(e);
    });
    return Object.entries(grouped)
      .map(([tgl, list]) => ({ tgl: Number(tgl), list }))
      .sort((a, b) => a.tgl - b.tgl);
  }, [activeEntries]);

  const runningBalance = useMemo(() => {
    let bal = 0;
    const result: Record<number, number> = {};
    timeline.forEach(({ tgl, list }) => {
      list.forEach((e) => { bal += e.type === "pemasukan" ? e.jumlah : -e.jumlah; });
      result[tgl] = bal;
    });
    return result;
  }, [timeline]);

  const cicilanList = useMemo(() => items.filter((i): i is CicilanItem => i.kind === "cicilan"), [items]);
  const years = Array.from({ length: 8 }, (_, k) => now.getFullYear() - 1 + k);

  /* ─────────────────────────────────────────────────────── */
  /*  Actions                                               */
  /* ─────────────────────────────────────────────────────── */
  const handleSave = () => {
    if (!form.nama.trim() || form.jumlah <= 0) return;

    const buildCustomAmounts = (): Record<number, number> => {
      if (!form.useCustomAmounts) return {};
      const result: Record<number, number> = {};
      for (let i = 0; i < form.durasi; i++) {
        const val = Number(form.customAmounts[i] ?? "");
        if (!isNaN(val) && val > 0) result[i] = val;
      }
      return result;
    };

    if (editId) {
      setItems((prev) => prev.map((item) => {
        if (item.id !== editId) return item;
        if (form.isCicilan) {
          return { ...item, kind: "cicilan", type: form.type, nama: form.nama, jumlahDefault: form.jumlah, customAmounts: buildCustomAmounts(), tanggal: form.tanggal, mulaiBuilan: bulan, mulaiTahun: tahun, durasi: form.durasi } as CicilanItem;
        } else {
          return { ...item, kind: "regular", type: form.type, nama: form.nama, jumlah: form.jumlah, tanggal: form.tanggal, bulan, tahun } as RegularItem;
        }
      }));
      setEditId(null);
    } else {
      if (form.isCicilan) {
        setItems((prev) => [...prev, { id: uid(), kind: "cicilan", type: form.type, nama: form.nama, jumlahDefault: form.jumlah, customAmounts: buildCustomAmounts(), tanggal: form.tanggal, mulaiBuilan: bulan, mulaiTahun: tahun, durasi: form.durasi }]);
      } else {
        setItems((prev) => [...prev, { id: uid(), kind: "regular", type: form.type, nama: form.nama, jumlah: form.jumlah, tanggal: form.tanggal, bulan, tahun }]);
      }
    }
    setForm(emptyForm());
    setShowForm(false);
  };

  const handleEdit = (item: AnyItem) => {
    if (item.kind === "regular") {
      setForm({ ...emptyForm(), type: item.type, nama: item.nama, jumlah: item.jumlah, tanggal: item.tanggal, isCicilan: false });
    } else {
      const hasCustom = Object.keys(item.customAmounts).length > 0;
      const caStr: Record<number, string> = {};
      for (const [k, v] of Object.entries(item.customAmounts)) caStr[Number(k)] = String(v);
      setForm({ ...emptyForm(), type: item.type, nama: item.nama, jumlah: item.jumlahDefault, tanggal: item.tanggal, isCicilan: true, durasi: item.durasi, useCustomAmounts: hasCustom, customAmounts: caStr });
    }
    setEditId(item.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (editId === id) { setEditId(null); setShowForm(false); setForm(emptyForm()); }
  };

  const handleCancel = () => { setForm(emptyForm()); setEditId(null); setShowForm(false); };

  const filteredList = items.filter((i) =>
    activeTab === "semua" || (activeTab === "cicilan" ? i.kind === "cicilan" : i.kind === "regular")
  );

  /* ─── Total cicilan per bulan (untuk preview) ── */
  const totalCicilanBulanIni = useMemo(() => {
    if (!form.isCicilan || form.jumlah <= 0) return 0;
    let total = 0;
    for (let i = 0; i < form.durasi; i++) {
      const v = form.useCustomAmounts ? (Number(form.customAmounts[i] ?? "") || form.jumlah) : form.jumlah;
      total += v;
    }
    return total;
  }, [form]);

  return (
    <div className="min-h-screen px-4 sm:px-6 py-10">
      <div className="max-w-5xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold-500/20 bg-gold-500/[0.05] text-gold-400 text-[11px] font-semibold tracking-widest uppercase mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-[blink_2s_ease-in-out_infinite]" />
            Kalkulator Arus Kas
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">
            Kalkulator <span className="text-gold-gradient">Keuangan Bulanan</span>
          </h1>
          <p className="text-zinc-500 text-sm max-w-md mx-auto">
            Data tersimpan otomatis. Cicilan bisa punya nominal berbeda tiap bulan.
          </p>
        </div>

        {/* ── Pilih Periode ── */}
        <div className="card p-4 mb-6 flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium shrink-0">
            <svg className="w-4 h-4 text-gold-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            Lihat Periode:
          </div>
          <select value={bulan} onChange={(e) => setBulan(Number(e.target.value))} className="input-field max-w-[160px] !py-2">
            {BULAN.map((b, i) => <option key={b} value={i}>{b}</option>)}
          </select>
          <select value={tahun} onChange={(e) => setTahun(Number(e.target.value))} className="input-field max-w-[110px] !py-2">
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <div className="ml-auto flex items-center gap-3">
            {cicilanList.filter(c => getCicilanProgress(c, bulan, tahun) !== null).length > 0 && (
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                {cicilanList.filter(c => getCicilanProgress(c, bulan, tahun) !== null).length} cicilan aktif
              </div>
            )}
            {/* Saved indicator */}
            <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
              Tersimpan
            </div>
          </div>
        </div>

        {/* ── Summary ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="card p-5">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-400" style={{ background: "rgba(74,222,128,0.07)", border: "1px solid rgba(74,222,128,0.15)" }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12"/></svg>
              </div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Pemasukan</p>
            </div>
            <p className="text-xl font-bold text-emerald-400 font-mono">{formatRp(totalPemasukan)}</p>
            <p className="text-[11px] text-zinc-600 mt-1">{activeEntries.filter(e => e.type === "pemasukan").length} item · {BULAN[bulan]}</p>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400" style={{ background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.15)" }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6"/></svg>
              </div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Pengeluaran</p>
            </div>
            <p className="text-xl font-bold text-red-400 font-mono">{formatRp(totalPengeluaran)}</p>
            <p className="text-[11px] text-zinc-600 mt-1">{activeEntries.filter(e => e.type === "pengeluaran").length} item · {BULAN[bulan]}</p>
          </div>
          <div className={`card p-5 ${saldoBersih >= 0 ? "border-gold-500/20" : "border-red-500/20"}`}>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-gold-400" style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.15)" }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Saldo Bersih</p>
            </div>
            <p className={`text-xl font-bold font-mono ${saldoBersih >= 0 ? "text-gold-400" : "text-red-400"}`}>{formatRp(saldoBersih)}</p>
            <p className={`text-[11px] mt-1 ${saldoBersih >= 0 ? "text-emerald-600" : "text-red-600"}`}>{saldoBersih >= 0 ? "✓ Surplus" : "✗ Defisit"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ══ KIRI ══ */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {!showForm && (
              <button onClick={() => { setForm(emptyForm()); setShowForm(true); }} className="btn-gold w-full py-3 text-sm flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
                Tambah Item / Cicilan
              </button>
            )}

            {/* ── Form ── */}
            {showForm && (
              <div className="card p-5 border-gold-500/20">
                <h3 className="text-sm font-semibold text-zinc-200 mb-4">
                  {editId ? "✏️ Edit Item" : "➕ Tambah Item Baru"}
                </h3>

                {/* Tipe */}
                <div className="mb-4">
                  <label className="field-label">Tipe</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["pemasukan","pengeluaran"] as ItemType[]).map((t) => (
                      <button key={t} type="button" onClick={() => setForm((f) => ({ ...f, type: t }))}
                        className={`py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                          form.type === t
                            ? t === "pemasukan" ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400" : "bg-red-500/15 border-red-500/40 text-red-400"
                            : "bg-transparent border-white/[0.08] text-zinc-500 hover:border-white/15 hover:text-zinc-300"
                        }`}>
                        {t === "pemasukan" ? "⬆ Pemasukan" : "⬇ Pengeluaran"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nama */}
                <div className="mb-3">
                  <label className="field-label">Nama / Keterangan</label>
                  <input type="text" placeholder="mis. Gaji, Cicilan Motor..."
                    value={form.nama} onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))}
                    className="input-field" />
                </div>

                {/* Jumlah */}
                <div className="mb-3">
                  <label className="field-label">
                    {form.isCicilan && form.useCustomAmounts ? "Jumlah Default / Bulan (Rp)" : form.isCicilan ? "Jumlah per Bulan (Rp)" : "Jumlah (Rp)"}
                  </label>
                  <input type="number" min={0} placeholder="0"
                    value={form.jumlah || ""}
                    onChange={(e) => setForm((f) => ({ ...f, jumlah: Number(e.target.value) }))}
                    className="input-field font-mono" />
                  {form.jumlah > 0 && (
                    <p className="field-hint text-gold-600 font-medium">
                      {formatRp(form.jumlah)}
                      {form.isCicilan && !form.useCustomAmounts && (
                        <> · Total: {formatRp(form.jumlah * form.durasi)}</>
                      )}
                      {form.isCicilan && form.useCustomAmounts && totalCicilanBulanIni > 0 && (
                        <> · Grand Total: {formatRp(totalCicilanBulanIni)}</>
                      )}
                    </p>
                  )}
                </div>

                {/* Tanggal */}
                <div className="mb-4">
                  <label className="field-label">{form.isCicilan ? "Tanggal Jatuh Tempo" : "Tanggal (1–31)"}</label>
                  <input type="number" min={1} max={31}
                    value={form.tanggal}
                    onChange={(e) => setForm((f) => ({ ...f, tanggal: Math.min(31, Math.max(1, Number(e.target.value))) }))}
                    className="input-field font-mono" />
                  <p className="field-hint">
                    {form.isCicilan
                      ? `Jatuh tempo tiap tgl ${form.tanggal} selama ${form.durasi} bulan`
                      : `Tanggal ${form.tanggal} ${BULAN[bulan]} ${tahun}`}
                  </p>
                </div>

                {/* Toggle Cicilan */}
                <div className="mb-3">
                  <button type="button"
                    onClick={() => setForm((f) => ({ ...f, isCicilan: !f.isCicilan, useCustomAmounts: false, customAmounts: {} }))}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                      form.isCicilan ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "bg-white/[0.03] border-white/[0.08] text-zinc-500 hover:border-white/15 hover:text-zinc-300"
                    }`}>
                    <div className={`relative w-9 h-5 rounded-full transition-all duration-300 shrink-0 ${form.isCicilan ? "bg-amber-500" : "bg-zinc-700"}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${form.isCicilan ? "left-4" : "left-0.5"}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`text-sm font-semibold ${form.isCicilan ? "text-amber-400" : "text-zinc-400"}`}>🔄 Cicilan Otomatis</p>
                      <p className="text-[11px] text-zinc-600 mt-0.5">{form.isCicilan ? "Aktif — berulang tiap bulan" : "Nonaktif — hanya sekali"}</p>
                    </div>
                  </button>
                </div>

                {/* Cicilan options */}
                {form.isCicilan && (
                  <div className="mb-4 p-4 rounded-xl border border-amber-500/15 space-y-3" style={{ background: "rgba(245,158,11,0.02)" }}>

                    {/* Durasi */}
                    <div>
                      <label className="field-label text-amber-500/80">Durasi Cicilan</label>
                      <div className="grid grid-cols-4 gap-1.5 mb-2">
                        {[3,6,12,24].map((d) => (
                          <button key={d} type="button"
                            onClick={() => setForm((f) => ({ ...f, durasi: d }))}
                            className={`py-2 rounded-lg text-xs font-bold border transition-all duration-200 ${
                              form.durasi === d ? "bg-amber-500/20 border-amber-500/50 text-amber-400" : "bg-transparent border-white/[0.08] text-zinc-500 hover:border-white/15 hover:text-zinc-300"
                            }`}>
                            {d}x
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="number" min={1} max={360}
                          value={form.durasi}
                          onChange={(e) => setForm((f) => ({ ...f, durasi: Math.max(1, Number(e.target.value)), customAmounts: {} }))}
                          className="input-field font-mono max-w-[90px] !py-2" />
                        <span className="text-sm text-zinc-500">bulan</span>
                        <span className="text-xs text-zinc-600 ml-auto">
                          s/d {monthLabel(bulan, tahun, form.durasi - 1)}
                        </span>
                      </div>
                    </div>

                    {/* ── Toggle Nominal Berbeda Per Bulan ── */}
                    <button type="button"
                      onClick={() => setForm((f) => {
                        const next = !f.useCustomAmounts;
                        // Pre-fill with default jika baru aktif
                        const ca: Record<number, string> = {};
                        if (next && f.jumlah > 0) {
                          for (let i = 0; i < f.durasi; i++) ca[i] = String(f.jumlah);
                        }
                        return { ...f, useCustomAmounts: next, customAmounts: next ? ca : {} };
                      })}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
                        form.useCustomAmounts ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "bg-transparent border-white/[0.07] text-zinc-500 hover:border-white/12 hover:text-zinc-400"
                      }`}>
                      <div className={`relative w-8 h-4 rounded-full transition-all duration-300 shrink-0 ${form.useCustomAmounts ? "bg-blue-500" : "bg-zinc-700"}`}>
                        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-all duration-300 ${form.useCustomAmounts ? "left-[18px]" : "left-0.5"}`} />
                      </div>
                      <div className="text-left">
                        <p className={`text-xs font-semibold ${form.useCustomAmounts ? "text-blue-400" : "text-zinc-500"}`}>📅 Nominal Berbeda Tiap Bulan</p>
                        <p className="text-[10px] text-zinc-600">{form.useCustomAmounts ? "Edit nominal per bulan di bawah" : "Aktifkan untuk atur per bulan"}</p>
                      </div>
                    </button>

                    {/* Tabel nominal per bulan */}
                    {form.useCustomAmounts && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Nominal Per Bulan</p>
                          <button type="button"
                            onClick={() => setForm((f) => {
                              const ca: Record<number, string> = {};
                              for (let i = 0; i < f.durasi; i++) ca[i] = String(f.jumlah || "");
                              return { ...f, customAmounts: ca };
                            })}
                            className="text-[10px] text-zinc-600 hover:text-zinc-400 underline">
                            Reset semua ke default
                          </button>
                        </div>
                        <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
                          {Array.from({ length: form.durasi }, (_, i) => {
                            const label = monthLabel(bulan, tahun, i);
                            const val   = form.customAmounts[i] ?? "";
                            const num   = Number(val);
                            return (
                              <div key={i} className="flex items-center gap-2">
                                <div className="w-[72px] shrink-0">
                                  <p className="text-[11px] font-semibold text-zinc-400">{i + 1}/{form.durasi}</p>
                                  <p className="text-[10px] text-zinc-600">{label}</p>
                                </div>
                                <input
                                  type="number" min={0} placeholder={String(form.jumlah || 0)}
                                  value={val}
                                  onChange={(e) => setForm((f) => ({
                                    ...f,
                                    customAmounts: { ...f.customAmounts, [i]: e.target.value },
                                  }))}
                                  className="input-field font-mono !py-1.5 text-xs flex-1"
                                />
                                {num > 0 && num !== form.jumlah && (
                                  <span className={`text-[10px] shrink-0 font-bold w-16 text-right ${num > form.jumlah ? "text-red-400" : "text-emerald-400"}`}>
                                    {num > form.jumlah ? "▲" : "▼"}{formatRp(Math.abs(num - form.jumlah)).replace("Rp\u00a0","").replace("Rp ","").slice(0,8)}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        {totalCicilanBulanIni > 0 && (
                          <div className="mt-2 pt-2 border-t border-white/[0.06] flex justify-between text-xs">
                            <span className="text-zinc-500">Grand Total</span>
                            <span className="font-bold font-mono text-gold-400">{formatRp(totalCicilanBulanIni)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button onClick={handleSave} className="btn-gold flex-1 py-2.5 text-sm">
                    {editId ? "Simpan" : form.isCicilan ? `Tambah ${form.durasi}x Cicilan` : "Tambahkan"}
                  </button>
                  <button onClick={handleCancel} className="btn-ghost flex-1 py-2.5 text-sm">Batal</button>
                </div>
              </div>
            )}

            {/* ── Daftar ── */}
            <div className="card overflow-hidden">
              <div className="flex border-b border-white/[0.06]">
                {(["semua","regular","cicilan"] as const).map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2.5 text-[11px] font-semibold transition-all duration-200 ${
                      activeTab === tab ? "text-gold-400 border-b-2 border-gold-500 bg-gold-500/[0.05]" : "text-zinc-500 hover:text-zinc-300"
                    }`}>
                    {tab === "semua" ? "Semua" : tab === "regular" ? "Sekali" : "🔄 Cicilan"}
                  </button>
                ))}
              </div>

              {filteredList.length === 0 ? (
                <div className="py-10 text-center text-zinc-600 text-sm">
                  <svg className="w-8 h-8 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                  Belum ada item
                </div>
              ) : (
                <ul className="divide-y divide-white/[0.04] max-h-[460px] overflow-y-auto">
                  {filteredList.map((item) => {
                    const isCicilan  = item.kind === "cicilan";
                    const activeKe   = isCicilan ? getCicilanProgress(item as CicilanItem, bulan, tahun) : null;
                    const jumlah     = isCicilan
                      ? (activeKe ? getCicilanAmount(item as CicilanItem, activeKe) : (item as CicilanItem).jumlahDefault)
                      : (item as RegularItem).jumlah;
                    const hasCustom  = isCicilan && Object.keys((item as CicilanItem).customAmounts).length > 0;

                    return (
                      <li key={item.id} className="px-4 py-3 hover:bg-white/[0.02] transition-colors group">
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${item.type === "pemasukan" ? "bg-emerald-500" : "bg-red-500"}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="text-sm font-medium text-zinc-200 truncate">{item.nama}</p>
                              {isCicilan && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
                                  🔄 {(item as CicilanItem).durasi}x
                                </span>
                              )}
                              {hasCustom && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">📅</span>
                              )}
                              {activeKe && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-700 text-zinc-400 shrink-0">
                                  {activeKe}/{(item as CicilanItem).durasi}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-zinc-600 mt-0.5">
                              {isCicilan
                                ? `Tgl ${item.tanggal} · Mulai ${BULAN[(item as CicilanItem).mulaiBuilan].slice(0,3)} ${(item as CicilanItem).mulaiTahun}`
                                : `Tgl ${item.tanggal} · ${BULAN[(item as RegularItem).bulan].slice(0,3)} ${(item as RegularItem).tahun}`}
                            </p>
                            {isCicilan && (() => {
                              const c  = item as CicilanItem;
                              const ke = activeKe ?? 0;
                              const pct = Math.round((ke / c.durasi) * 100);
                              return (
                                <div className="mt-1.5">
                                  <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                                    <div className={`h-full rounded-full transition-all duration-500 ${ke >= c.durasi ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${pct}%` }} />
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <p className={`text-sm font-bold font-mono ${item.type === "pemasukan" ? "text-emerald-400" : "text-red-400"}`}>
                              {item.type === "pemasukan" ? "+" : "-"}{formatRp(jumlah)}
                            </p>
                            {isCicilan && <p className="text-[10px] text-zinc-600">/bln{hasCustom ? "*" : ""}</p>}
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleEdit(item)} className="w-6 h-6 flex items-center justify-center rounded text-zinc-500 hover:text-gold-400 hover:bg-gold-500/10 transition-all">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                              </button>
                              <button onClick={() => handleDelete(item.id)} className="w-6 h-6 flex items-center justify-center rounded text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* ══ KANAN: Timeline ══ */}
          <div className="lg:col-span-3">
            <div className="card p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-bold text-zinc-100">Flow Arus Kas</h2>
                  <p className="text-xs text-zinc-600 mt-0.5">{BULAN[bulan]} {tahun} — urut per tanggal</p>
                </div>
                {activeEntries.length > 0 && (
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${saldoBersih >= 0 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                    {saldoBersih >= 0 ? "Surplus" : "Defisit"}
                  </span>
                )}
              </div>

              {timeline.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.1)" }}>
                    <svg className="w-7 h-7 text-gold-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/>
                    </svg>
                  </div>
                  <p className="text-zinc-500 text-sm font-medium mb-1">Belum ada data untuk {BULAN[bulan]} {tahun}</p>
                  <p className="text-zinc-700 text-xs">Tambahkan item atau ubah periode</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-[39px] top-0 bottom-0 w-px bg-white/[0.05]" />
                  <div className="space-y-1">
                    {timeline.map(({ tgl, list }, idx) => {
                      const bal     = runningBalance[tgl];
                      const prevBal = idx === 0 ? 0 : runningBalance[timeline[idx - 1].tgl];
                      const diff    = bal - prevBal;
                      return (
                        <div key={tgl}>
                          <div className="flex items-start gap-3">
                            <div className="shrink-0 w-[52px] flex flex-col items-center pt-2.5">
                              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[13px] font-bold font-mono z-10 relative"
                                style={{
                                  background: diff >= 0 ? "linear-gradient(135deg,rgba(74,222,128,0.15),rgba(74,222,128,0.05))" : "linear-gradient(135deg,rgba(248,113,113,0.15),rgba(248,113,113,0.05))",
                                  border: diff >= 0 ? "1px solid rgba(74,222,128,0.25)" : "1px solid rgba(248,113,113,0.25)",
                                  color: diff >= 0 ? "#4ade80" : "#f87171",
                                }}>
                                {tgl}
                              </div>
                            </div>
                            <div className="flex-1 pb-4">
                              <div className="space-y-1.5 mb-2">
                                {list.map((entry) => (
                                  <div key={entry.id} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                                    style={{
                                      background: entry.type === "pemasukan" ? "rgba(74,222,128,0.04)" : "rgba(248,113,113,0.04)",
                                      border: entry.type === "pemasukan" ? "1px solid rgba(74,222,128,0.12)" : "1px solid rgba(248,113,113,0.12)",
                                    }}>
                                    <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${entry.type === "pemasukan" ? "text-emerald-400" : "text-red-400"}`}
                                      style={{ background: entry.type === "pemasukan" ? "rgba(74,222,128,0.12)" : "rgba(248,113,113,0.12)" }}>
                                      {entry.type === "pemasukan"
                                        ? <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5 5 5"/></svg>
                                        : <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 13l-5 5-5-5"/></svg>}
                                    </div>
                                    <div className="flex-1 min-w-0 flex items-center gap-1.5 flex-wrap">
                                      <p className="text-xs font-medium text-zinc-300 truncate">{entry.nama}</p>
                                      {entry.isCicilan && entry.label && (
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0 whitespace-nowrap">
                                          🔄 {entry.label}{entry.sisaBulan === 0 ? " ✓" : ""}
                                        </span>
                                      )}
                                    </div>
                                    <p className={`text-sm font-bold font-mono shrink-0 ${entry.type === "pemasukan" ? "text-emerald-400" : "text-red-400"}`}>
                                      {entry.type === "pemasukan" ? "+" : "−"}{formatRp(entry.jumlah)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-px bg-white/[0.04]" />
                                <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                                  <span className="text-zinc-600">Saldo:</span>
                                  <span className={`font-mono ${bal >= 0 ? "text-gold-400" : "text-red-400"}`}>{formatRp(bal)}</span>
                                  <span className={`text-[10px] ${diff >= 0 ? "text-emerald-600" : "text-red-600"}`}>({diff >= 0 ? "+" : ""}{formatRp(diff)})</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Saldo akhir */}
                    <div className="flex items-center gap-3 pt-2">
                      <div className="shrink-0 w-[52px] flex justify-center">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                          style={{
                            background: saldoBersih >= 0 ? "linear-gradient(135deg,rgba(245,158,11,0.2),rgba(245,158,11,0.08))" : "linear-gradient(135deg,rgba(248,113,113,0.2),rgba(248,113,113,0.08))",
                            border: saldoBersih >= 0 ? "1px solid rgba(245,158,11,0.35)" : "1px solid rgba(248,113,113,0.35)",
                          }}>
                          <svg className={`w-4 h-4 ${saldoBersih >= 0 ? "text-gold-400" : "text-red-400"}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1 flex items-center justify-between px-4 py-3 rounded-xl"
                        style={{
                          background: saldoBersih >= 0 ? "linear-gradient(135deg,rgba(245,158,11,0.06),rgba(245,158,11,0.02))" : "linear-gradient(135deg,rgba(248,113,113,0.06),rgba(248,113,113,0.02))",
                          border: saldoBersih >= 0 ? "1px solid rgba(245,158,11,0.2)" : "1px solid rgba(248,113,113,0.2)",
                        }}>
                        <div>
                          <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Saldo Akhir Bulan</p>
                          <p className="text-[10px] text-zinc-700 mt-0.5">{BULAN[bulan]} {tahun}</p>
                        </div>
                        <p className={`text-lg font-black font-mono ${saldoBersih >= 0 ? "text-gold-400" : "text-red-400"}`}>{formatRp(saldoBersih)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Rekap Cicilan ── */}
            {cicilanList.length > 0 && (
              <div className="card p-5 mt-4">
                <h3 className="text-sm font-semibold text-zinc-200 mb-3 flex items-center gap-2">
                  <span className="text-amber-400">🔄</span> Rekap Semua Cicilan
                </h3>
                <div className="space-y-3">
                  {cicilanList.map((c) => {
                    const ke = getCicilanProgress(c, bulan, tahun);
                    const endIdx = c.mulaiBuilan + c.durasi - 1;
                    const endB   = endIdx % 12;
                    const endY   = c.mulaiTahun + Math.floor(endIdx / 12);
                    const finished   = ke === null && (tahun * 12 + bulan > c.mulaiTahun * 12 + c.mulaiBuilan + c.durasi - 1);
                    const notStarted = ke === null && !finished;
                    const hasCustom  = Object.keys(c.customAmounts).length > 0;
                    const amountNow  = ke ? getCicilanAmount(c, ke) : c.jumlahDefault;

                    return (
                      <div key={c.id} className="p-3 rounded-xl border border-white/[0.06] hover:border-white/[0.1] transition-colors"
                        style={{ background: "rgba(255,255,255,0.02)" }}>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-semibold text-zinc-200 truncate">{c.nama}</p>
                              {hasCustom && <span className="text-[10px] px-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">📅 custom</span>}
                            </div>
                            <p className="text-[11px] text-zinc-600">
                              {BULAN[c.mulaiBuilan].slice(0,3)} {c.mulaiTahun} → {BULAN[endB].slice(0,3)} {endY} · Tgl {c.tanggal}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className={`text-xs font-bold font-mono ${c.type === "pemasukan" ? "text-emerald-400" : "text-red-400"}`}>
                              {formatRp(amountNow)}/bln{ke && hasCustom ? "*" : ""}
                            </p>
                            {finished ? <span className="text-[10px] text-emerald-500 font-semibold">✓ Lunas</span>
                              : notStarted ? <span className="text-[10px] text-zinc-600">Belum mulai</span>
                              : ke === c.durasi ? <span className="text-[10px] text-emerald-500 font-semibold">✓ Terakhir!</span>
                              : <span className="text-[10px] text-amber-500">Aktif · sisa {c.durasi - (ke ?? 0)} bln</span>}
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-[10px] text-zinc-600">{ke ?? 0}/{c.durasi} bulan</span>
                            <span className="text-[10px] text-zinc-600">{Math.round(((ke ?? 0) / c.durasi) * 100)}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-700 ${finished || ke === c.durasi ? "bg-emerald-500" : "bg-amber-500"}`}
                              style={{ width: `${Math.round(((ke ?? 0) / c.durasi) * 100)}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Export / Import / Reset ── */}
        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">

          {/* Export */}
          <button
            onClick={() => exportToTxt(items)}
            disabled={items.length === 0}
            className="btn-outline-gold text-xs py-2 px-4 flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            Download Backup (.txt)
          </button>

          {/* Import */}
          <label className="btn-ghost text-xs py-2 px-4 flex items-center gap-1.5 cursor-pointer">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
            </svg>
            Import dari File
            <input
              type="file"
              accept=".txt,.json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                importFromFile(
                  file,
                  (data) => {
                    setItems(data);
                    setImportMsg({ type: "ok", text: `✓ Berhasil import ${data.length} item!` });
                    setTimeout(() => setImportMsg(null), 4000);
                  },
                  (msg) => {
                    setImportMsg({ type: "err", text: `✗ Gagal: ${msg}` });
                    setTimeout(() => setImportMsg(null), 4000);
                  }
                );
                e.target.value = "";
              }}
            />
          </label>

          {/* Pesan import */}
          {importMsg && (
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${
              importMsg.type === "ok"
                ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                : "text-red-400 bg-red-500/10 border-red-500/20"
            }`}>
              {importMsg.text}
            </span>
          )}

          {/* Reset */}
          {items.length > 0 && (
            <button
              onClick={() => {
                if (!confirm("Yakin hapus semua data?")) return;
                setItems([]); setForm(emptyForm()); setShowForm(false); setEditId(null);
                localStorage.removeItem(LS_KEY);
              }}
              className="btn-ghost text-xs py-2 px-4 text-red-500 border-red-500/20 hover:border-red-500/40 hover:text-red-400 hover:bg-red-500/[0.04] flex items-center gap-1.5 sm:ml-auto"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              Reset Semua Data
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
