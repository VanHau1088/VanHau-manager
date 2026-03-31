import { useState } from "react";
import {
  Rocket, Plus, Trash2, Edit2, Sparkles, X,
  TrendingUp, TrendingDown, Minus, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

type CampStatus = "dang_chay" | "dung" | "test" | "win";

const STATUS_CONFIG: Record<CampStatus, { label: string; bg: string; text: string }> = {
  dang_chay: { label: "Đang chạy", bg: "bg-blue-100",   text: "text-blue-700" },
  win:       { label: "Win",        bg: "bg-yellow-100", text: "text-yellow-700" },
  dung:      { label: "Dừng",       bg: "bg-red-100",    text: "text-red-600" },
  test:      { label: "Test",       bg: "bg-purple-100", text: "text-purple-700" },
};

interface BudgetGroup { name: string; budget: string; }

interface CampRecord {
  id: string;
  date: string;
  status: CampStatus;
  note: string;
  page: string;
  product: string;
  totalBudget: string;
  budgetGroups: BudgetGroup[];
  totalSpend: string;
  sodon: string;
  cpaTarget: string;
  cpc: string;
  ctr: string;
  cpm: string;
  createdAt: string;
}

const STORAGE_KEY = "taskflow_chay_hang";

function load(): CampRecord[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}
function save(data: CampRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function fmtNum(val: string) {
  const n = parseFloat(val);
  if (!val || isNaN(n)) return "—";
  return n.toLocaleString("vi-VN");
}

function calcCPA(spend: string, orders: string) {
  const s = parseFloat(spend);
  const o = parseFloat(orders);
  if (!s || !o || o === 0) return null;
  return s / o;
}

const emptyForm = {
  date: format(new Date(), "yyyy-MM-dd"),
  status: "test" as CampStatus,
  note: "",
  page: "",
  product: "",
  totalBudget: "",
  budgetGroups: [{ name: "Nhóm 1", budget: "" }] as BudgetGroup[],
  totalSpend: "",
  sodon: "",
  cpaTarget: "",
  cpc: "",
  ctr: "",
  cpm: "",
};

interface AIDialogProps {
  record: CampRecord;
  onClose: () => void;
}

function AIDialog({ record, onClose }: AIDialogProps) {
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cpa = calcCPA(record.totalSpend, record.sodon);

  const evaluate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/evaluate-camp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: record.date,
          page: record.page,
          product: record.product,
          totalBudget: record.totalBudget,
          totalSpend: record.totalSpend,
          sodon: record.sodon,
          cpa: cpa?.toFixed(0) ?? "",
          cpaTarget: record.cpaTarget,
          cpc: record.cpc,
          ctr: record.ctr,
          cpm: record.cpm,
          note: record.note,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAdvice(data.advice);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  };

  const cpaNum = cpa ?? 0;
  const cpaTargetNum = parseFloat(record.cpaTarget) || 0;
  const cpaStatus =
    !cpa || !cpaTargetNum ? "neutral"
    : cpaNum <= cpaTargetNum ? "good"
    : cpaNum <= cpaTargetNum * 1.2 ? "warn"
    : "bad";

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[580px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-violet-800">
            <Sparkles className="w-5 h-5 text-violet-500" />
            Đánh giá AI — {record.product}
          </DialogTitle>
        </DialogHeader>

        {/* Metrics summary */}
        <div className="grid grid-cols-3 gap-3 py-2">
          {[
            { label: "CPC", value: record.cpc ? fmtNum(record.cpc) + "đ" : "—" },
            { label: "CTR", value: record.ctr ? record.ctr + "%" : "—" },
            { label: "CPM", value: record.cpm ? fmtNum(record.cpm) + "đ" : "—" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-violet-50 border border-violet-100 rounded-xl p-3 text-center">
              <p className="text-xs text-violet-500 font-semibold">{label}</p>
              <p className="text-sm font-bold text-violet-800 mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className={`rounded-xl p-3 text-center border ${
            cpaStatus === "good" ? "bg-green-50 border-green-200"
            : cpaStatus === "warn" ? "bg-yellow-50 border-yellow-200"
            : cpaStatus === "bad"  ? "bg-red-50 border-red-200"
            : "bg-gray-50 border-gray-200"
          }`}>
            <div className="flex items-center justify-center gap-1 mb-0.5">
              {cpaStatus === "good" ? <TrendingDown className="w-3.5 h-3.5 text-green-600" />
               : cpaStatus === "bad" ? <TrendingUp className="w-3.5 h-3.5 text-red-500" />
               : <Minus className="w-3.5 h-3.5 text-gray-400" />}
              <p className="text-xs font-semibold text-gray-600">CPA thực tế</p>
            </div>
            <p className={`text-base font-extrabold ${
              cpaStatus === "good" ? "text-green-700"
              : cpaStatus === "warn" ? "text-yellow-700"
              : cpaStatus === "bad" ? "text-red-600"
              : "text-gray-500"
            }`}>
              {cpa ? fmtNum(cpa.toFixed(0)) + "đ" : "—"}
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500 font-semibold mb-0.5">CPA Target</p>
            <p className="text-base font-extrabold text-gray-700">
              {record.cpaTarget ? fmtNum(record.cpaTarget) + "đ" : "—"}
            </p>
          </div>
        </div>

        {/* AI Analysis */}
        {!advice && !loading && !error && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-4">
              AI sẽ phân tích toàn bộ chỉ số và đưa ra lời khuyên cụ thể cho camp này.
            </p>
            <Button onClick={evaluate} className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
              <Sparkles className="w-4 h-4" />
              Phân tích bằng AI
            </Button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center gap-3 py-6 text-violet-600">
            <Loader2 className="w-7 h-7 animate-spin" />
            <p className="text-sm font-medium">AI đang phân tích camp của bạn...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
            {error}
            <Button variant="ghost" size="sm" className="ml-2 h-7" onClick={evaluate}>Thử lại</Button>
          </div>
        )}

        {advice && (
          <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-violet-500" />
              <p className="text-xs font-bold text-violet-700 uppercase tracking-wider">Phân tích AI</p>
            </div>
            <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
              {advice}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 text-violet-600 hover:bg-violet-100 h-7 gap-1"
              onClick={evaluate}
            >
              <Sparkles className="w-3.5 h-3.5" />Phân tích lại
            </Button>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ChayHangPage() {
  const [records, setRecords] = useState<CampRecord[]>(load);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CampRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [aiRecord, setAiRecord] = useState<CampRecord | null>(null);
  const [filterStatus, setFilterStatus] = useState<CampStatus | "all">("all");

  const openCreate = () => { setEditingItem(null); setForm({ ...emptyForm, budgetGroups: [{ name: "Nhóm 1", budget: "" }] }); setIsModalOpen(true); };
  const openEdit = (item: CampRecord) => {
    setEditingItem(item);
    setForm({
      date: item.date, status: item.status, note: item.note,
      page: item.page, product: item.product, totalBudget: item.totalBudget,
      budgetGroups: item.budgetGroups.length ? item.budgetGroups : [{ name: "Nhóm 1", budget: "" }],
      totalSpend: item.totalSpend, sodon: item.sodon, cpaTarget: item.cpaTarget,
      cpc: item.cpc, ctr: item.ctr, cpm: item.cpm,
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!form.product.trim()) return;
    if (editingItem) {
      setRecords((prev) => { const next = prev.map((p) => p.id === editingItem.id ? { ...p, ...form } : p); save(next); return next; });
    } else {
      const item: CampRecord = { id: Date.now().toString(), ...form, createdAt: new Date().toISOString() };
      setRecords((prev) => { const next = [item, ...prev]; save(next); return next; });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Xóa mục này?")) {
      setRecords((prev) => { const next = prev.filter((p) => p.id !== id); save(next); return next; });
    }
  };

  const addGroup = () => setForm((f) => ({
    ...f,
    budgetGroups: [...f.budgetGroups, { name: `Nhóm ${f.budgetGroups.length + 1}`, budget: "" }],
  }));
  const removeGroup = (i: number) => setForm((f) => ({
    ...f,
    budgetGroups: f.budgetGroups.filter((_, idx) => idx !== i),
  }));
  const updateGroup = (i: number, field: keyof BudgetGroup, value: string) =>
    setForm((f) => ({
      ...f,
      budgetGroups: f.budgetGroups.map((g, idx) => idx === i ? { ...g, [field]: value } : g),
    }));

  const filtered = filterStatus === "all" ? records : records.filter((r) => r.status === filterStatus);

  const counts = {
    all: records.length,
    dang_chay: records.filter((r) => r.status === "dang_chay").length,
    win:       records.filter((r) => r.status === "win").length,
    dung:      records.filter((r) => r.status === "dung").length,
    test:      records.filter((r) => r.status === "test").length,
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#f0f7ff]">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-700 to-blue-600 px-6 py-5 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-extrabold text-lg leading-tight">Chạy hàng</h1>
            <p className="text-sky-200 text-xs mt-0.5">Quản lý & theo dõi hiệu suất camp quảng cáo</p>
          </div>
        </div>
        <Button onClick={openCreate} className="bg-white hover:bg-sky-50 text-sky-700 font-bold h-9 gap-2 shadow-md">
          <Plus className="w-4 h-4" />Thêm camp
        </Button>
      </div>

      {/* Stats bar */}
      <div className="bg-blue-800 px-6 py-3 shrink-0 flex items-center gap-6 overflow-x-auto">
        {[
          { key: "all",       value: counts.all,       label: "Tất cả",    color: "text-white" },
          { key: "test",      value: counts.test,      label: "Test",      color: "text-purple-300" },
          { key: "dang_chay", value: counts.dang_chay, label: "Đang chạy", color: "text-sky-300" },
          { key: "win",       value: counts.win,       label: "Win",       color: "text-yellow-300" },
          { key: "dung",      value: counts.dung,      label: "Dừng",      color: "text-red-300" },
        ].map(({ key, value, label, color }) => (
          <button key={key} onClick={() => setFilterStatus(key as CampStatus | "all")}
            className={`flex flex-col items-center shrink-0 transition-opacity ${filterStatus === key ? "opacity-100" : "opacity-45 hover:opacity-70"}`}>
            <span className={`text-xl font-extrabold ${color}`}>{value}</span>
            <span className="text-[10px] text-blue-300 whitespace-nowrap">{label}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-52 text-blue-300">
            <Rocket className="w-12 h-12 mb-3 opacity-30" />
            <p className="font-semibold text-sm text-blue-900/40">Chưa có camp nào.</p>
            <Button variant="outline" size="sm" className="mt-4 border-blue-300 text-blue-700 hover:bg-blue-50" onClick={openCreate}>
              <Plus className="w-4 h-4 mr-1" />Thêm camp
            </Button>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden border border-blue-200 shadow-sm bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[1100px]">
                <thead>
                  <tr className="bg-gradient-to-r from-sky-700 to-blue-600 text-white text-xs uppercase tracking-wider">
                    <th className="text-left px-3 py-3 whitespace-nowrap">Ngày</th>
                    <th className="text-left px-3 py-3 whitespace-nowrap">Trạng thái</th>
                    <th className="text-left px-3 py-3 whitespace-nowrap">Page</th>
                    <th className="text-left px-3 py-3 whitespace-nowrap">Sản Phẩm</th>
                    <th className="text-right px-3 py-3 whitespace-nowrap">Tổng NS</th>
                    <th className="text-right px-3 py-3 whitespace-nowrap">Chi tiêu</th>
                    <th className="text-right px-3 py-3 whitespace-nowrap">Số Đơn</th>
                    <th className="text-right px-3 py-3 whitespace-nowrap">CPA</th>
                    <th className="text-right px-3 py-3 whitespace-nowrap">CPA Target</th>
                    <th className="text-right px-3 py-3 whitespace-nowrap">CPC</th>
                    <th className="text-right px-3 py-3 whitespace-nowrap">CTR</th>
                    <th className="text-right px-3 py-3 whitespace-nowrap">CPM</th>
                    <th className="text-left px-3 py-3">Ghi chú</th>
                    <th className="px-3 py-3 w-20"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-50">
                  {filtered.map((item, idx) => {
                    const cfg = STATUS_CONFIG[item.status];
                    const cpa = calcCPA(item.totalSpend, item.sodon);
                    const cpaTarget = parseFloat(item.cpaTarget) || 0;
                    const cpaGood = cpa && cpaTarget && cpa <= cpaTarget;
                    const cpaBad = cpa && cpaTarget && cpa > cpaTarget * 1.2;
                    return (
                      <tr key={item.id} className={`hover:bg-sky-50/50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
                        <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap text-xs">
                          {format(new Date(item.date), "dd/MM/yy")}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 font-semibold text-sky-800 whitespace-nowrap">{item.page || "—"}</td>
                        <td className="px-3 py-2.5 font-bold text-blue-900 whitespace-nowrap">{item.product}</td>
                        <td className="px-3 py-2.5 text-right text-gray-700 whitespace-nowrap">{fmtNum(item.totalBudget)}</td>
                        <td className="px-3 py-2.5 text-right text-gray-700 whitespace-nowrap">{fmtNum(item.totalSpend)}</td>
                        <td className="px-3 py-2.5 text-right font-semibold text-blue-700">{item.sodon || "—"}</td>
                        <td className={`px-3 py-2.5 text-right font-bold whitespace-nowrap ${cpaGood ? "text-green-600" : cpaBad ? "text-red-600" : "text-gray-700"}`}>
                          {cpa ? fmtNum(cpa.toFixed(0)) : "—"}
                        </td>
                        <td className="px-3 py-2.5 text-right text-gray-500 whitespace-nowrap">{fmtNum(item.cpaTarget)}</td>
                        <td className="px-3 py-2.5 text-right text-gray-600 whitespace-nowrap">{fmtNum(item.cpc)}</td>
                        <td className="px-3 py-2.5 text-right text-gray-600 whitespace-nowrap">{item.ctr ? item.ctr + "%" : "—"}</td>
                        <td className="px-3 py-2.5 text-right text-gray-600 whitespace-nowrap">{fmtNum(item.cpm)}</td>
                        <td className="px-3 py-2.5 text-gray-500 text-xs max-w-[120px]">
                          <span className="line-clamp-2">{item.note || "—"}</span>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1 justify-end">
                            <button onClick={() => setAiRecord(item)}
                              className="p-1.5 text-violet-400 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-colors" title="Phân tích AI">
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => openEdit(item)}
                              className="p-1.5 text-blue-300 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDelete(item.id)}
                              className="p-1.5 text-blue-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={(o) => !o && setIsModalOpen(false)}>
        <DialogContent className="sm:max-w-[620px] max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sky-800">
              <Rocket className="w-5 h-5 text-sky-500" />
              {editingItem ? "Chỉnh sửa camp" : "Thêm camp mới"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Row 1: Date + Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Ngày</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Trạng thái</Label>
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as CampStatus }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="test">Test</SelectItem>
                    <SelectItem value="dang_chay">Đang chạy</SelectItem>
                    <SelectItem value="win">Win</SelectItem>
                    <SelectItem value="dung">Dừng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2: Page + Product */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Page</Label>
                <Input value={form.page} onChange={(e) => setForm((f) => ({ ...f, page: e.target.value }))} placeholder="Tên page..." autoFocus />
              </div>
              <div className="space-y-1.5">
                <Label>Sản Phẩm <span className="text-red-500">*</span></Label>
                <Input value={form.product} onChange={(e) => setForm((f) => ({ ...f, product: e.target.value }))} placeholder="Tên sản phẩm..." />
              </div>
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <Label>Tổng ngân sách</Label>
              <Input value={form.totalBudget} onChange={(e) => setForm((f) => ({ ...f, totalBudget: e.target.value }))} placeholder="vd: 500000" />
            </div>

            {/* Budget groups */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Ngân sách nhóm quảng cáo</Label>
                <button onClick={addGroup} className="text-xs text-sky-600 hover:text-sky-800 font-medium flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" />Thêm nhóm
                </button>
              </div>
              <div className="space-y-2">
                {form.budgetGroups.map((g, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input value={g.name} onChange={(e) => updateGroup(i, "name", e.target.value)}
                      placeholder={`Nhóm ${i + 1}`} className="w-28 shrink-0 text-sm" />
                    <Input value={g.budget} onChange={(e) => updateGroup(i, "budget", e.target.value)}
                      placeholder="Ngân sách..." className="text-sm" />
                    {form.budgetGroups.length > 1 && (
                      <button onClick={() => removeGroup(i)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Spend + Orders + CPA Target */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Tổng Chi Tiêu</Label>
                <Input value={form.totalSpend} onChange={(e) => setForm((f) => ({ ...f, totalSpend: e.target.value }))} placeholder="vd: 350000" />
              </div>
              <div className="space-y-1.5">
                <Label>Số Đơn</Label>
                <Input value={form.sodon} onChange={(e) => setForm((f) => ({ ...f, sodon: e.target.value }))} placeholder="vd: 12" />
              </div>
              <div className="space-y-1.5">
                <Label>CPA Target</Label>
                <Input value={form.cpaTarget} onChange={(e) => setForm((f) => ({ ...f, cpaTarget: e.target.value }))} placeholder="vd: 30000" />
              </div>
            </div>

            {/* CPC + CTR + CPM */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>CPC (đ)</Label>
                <Input value={form.cpc} onChange={(e) => setForm((f) => ({ ...f, cpc: e.target.value }))} placeholder="vd: 1500" />
              </div>
              <div className="space-y-1.5">
                <Label>CTR (%)</Label>
                <Input value={form.ctr} onChange={(e) => setForm((f) => ({ ...f, ctr: e.target.value }))} placeholder="vd: 2.5" />
              </div>
              <div className="space-y-1.5">
                <Label>CPM (đ)</Label>
                <Input value={form.cpm} onChange={(e) => setForm((f) => ({ ...f, cpm: e.target.value }))} placeholder="vd: 45000" />
              </div>
            </div>

            {/* Note */}
            <div className="space-y-1.5">
              <Label>Ghi chú</Label>
              <Textarea value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                placeholder="ROAS, ghi chú thêm..." rows={2} className="resize-none" />
            </div>

            {/* CPA preview */}
            {form.totalSpend && form.sodon && (
              <div className="bg-sky-50 border border-sky-200 rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-sky-700 font-medium">CPA tính toán</span>
                <span className="text-lg font-extrabold text-sky-800">
                  {fmtNum((parseFloat(form.totalSpend) / parseFloat(form.sodon)).toFixed(0))}đ
                </span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button onClick={handleSave} disabled={!form.product.trim()} className="bg-sky-700 hover:bg-sky-800 text-white">
              {editingItem ? "Lưu thay đổi" : "Thêm camp"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Dialog */}
      {aiRecord && <AIDialog record={aiRecord} onClose={() => setAiRecord(null)} />}
    </div>
  );
}
