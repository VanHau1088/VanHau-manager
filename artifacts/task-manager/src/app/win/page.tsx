import { useState } from "react";
import {
  Trophy, Plus, Trash2, Edit2, ExternalLink,
  CheckCircle2, Flame, PauseCircle, TestTube2, Star,
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

type WinStatus = "dang_chay" | "da_win" | "dung_lai" | "dang_test";

interface WinProduct {
  id: string;
  date: string;
  pageName: string;
  productName: string;
  status: WinStatus;
  note: string;
  link?: string;
}

const STATUS_CONFIG: Record<WinStatus, { label: string; bg: string; text: string; icon: React.ElementType }> = {
  dang_chay: { label: "Đang chạy", bg: "bg-blue-100", text: "text-blue-700", icon: Flame },
  da_win:    { label: "Đã Win",    bg: "bg-yellow-100", text: "text-yellow-700", icon: Star },
  dung_lai:  { label: "Dừng lại",  bg: "bg-gray-100",   text: "text-gray-600",  icon: PauseCircle },
  dang_test: { label: "Đang test", bg: "bg-purple-100", text: "text-purple-700", icon: TestTube2 },
};

const STORAGE_KEY = "taskflow_win_products";

function loadProducts(): WinProduct[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function saveProducts(items: WinProduct[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

const emptyForm = {
  date: format(new Date(), "yyyy-MM-dd"),
  pageName: "",
  productName: "",
  status: "dang_test" as WinStatus,
  note: "",
  link: "",
};

type FilterStatus = WinStatus | "all";

export function WinPage() {
  const [products, setProducts] = useState<WinProduct[]>(loadProducts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WinProduct | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  const openCreate = () => { setEditingItem(null); setForm(emptyForm); setIsModalOpen(true); };
  const openEdit = (item: WinProduct) => {
    setEditingItem(item);
    setForm({
      date: item.date, pageName: item.pageName, productName: item.productName,
      status: item.status, note: item.note, link: item.link || "",
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!form.productName.trim() || !form.pageName.trim()) return;
    if (editingItem) {
      setProducts((prev) => {
        const next = prev.map((p) =>
          p.id === editingItem.id ? { ...p, ...form, link: form.link || undefined } : p
        );
        saveProducts(next); return next;
      });
    } else {
      const newItem: WinProduct = {
        id: Date.now().toString(), ...form, link: form.link || undefined,
      };
      setProducts((prev) => { const next = [newItem, ...prev]; saveProducts(next); return next; });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Xóa sản phẩm này?")) {
      setProducts((prev) => { const next = prev.filter((p) => p.id !== id); saveProducts(next); return next; });
    }
  };

  const handleQuickStatus = (id: string, status: WinStatus) => {
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, status } : p));
      saveProducts(next); return next;
    });
  };

  const filtered = filterStatus === "all" ? products : products.filter((p) => p.status === filterStatus);
  const counts = {
    all: products.length,
    dang_chay: products.filter((p) => p.status === "dang_chay").length,
    da_win:    products.filter((p) => p.status === "da_win").length,
    dung_lai:  products.filter((p) => p.status === "dung_lai").length,
    dang_test: products.filter((p) => p.status === "dang_test").length,
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#f0f4ff]">
      {/* Navy header */}
      <div className="bg-[#0f2057] px-6 py-5 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-400/20 border border-yellow-400/30 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-yellow-300" />
          </div>
          <div>
            <h1 className="text-white font-extrabold text-lg leading-tight">Sản phẩm Win</h1>
            <p className="text-blue-200 text-xs mt-0.5">Theo dõi những sản phẩm chiến thắng của bạn</p>
          </div>
        </div>
        <Button
          onClick={openCreate}
          className="bg-yellow-400 hover:bg-yellow-300 text-[#0f2057] font-bold h-9 gap-2 shadow-md"
        >
          <Plus className="w-4 h-4" />Thêm sản phẩm
        </Button>
      </div>

      {/* Stats bar */}
      <div className="bg-[#172b6e] px-6 py-3 shrink-0 flex items-center gap-6">
        {[
          { key: "all", label: "Tất cả", color: "text-white" },
          { key: "dang_test", label: "Đang test", color: "text-purple-300" },
          { key: "dang_chay", label: "Đang chạy", color: "text-blue-300" },
          { key: "da_win", label: "Đã Win", color: "text-yellow-300" },
          { key: "dung_lai", label: "Dừng lại", color: "text-gray-400" },
        ].map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setFilterStatus(key as FilterStatus)}
            className={`flex flex-col items-center transition-opacity ${
              filterStatus === key ? "opacity-100" : "opacity-50 hover:opacity-75"
            }`}
          >
            <span className={`text-xl font-extrabold ${color}`}>
              {counts[key as keyof typeof counts] ?? 0}
            </span>
            <span className="text-[10px] text-blue-200 whitespace-nowrap">{label}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-52 text-[#0f2057]/40">
            <Trophy className="w-12 h-12 mb-3 opacity-30" />
            <p className="font-semibold text-sm">Chưa có sản phẩm nào.</p>
            <p className="text-xs mt-1">Hãy thêm sản phẩm đầu tiên của bạn!</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 border-[#0f2057]/30 text-[#0f2057] hover:bg-[#0f2057]/5"
              onClick={openCreate}
            >
              <Plus className="w-4 h-4 mr-1" />Thêm sản phẩm
            </Button>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden border border-[#c7d4f5] shadow-sm bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0f2057] text-white">
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Ngày</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Tên Page</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Tên Sản phẩm</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Trạng thái</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider">Ghi chú / Link bài viết</th>
                  <th className="px-4 py-3 w-32"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8edf8]">
                {filtered.map((item, idx) => {
                  const cfg = STATUS_CONFIG[item.status];
                  const Icon = cfg.icon;
                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors hover:bg-[#f0f4ff] ${idx % 2 === 0 ? "bg-white" : "bg-[#f8faff]"}`}
                    >
                      {/* Ngày */}
                      <td className="px-4 py-3 text-[#0f2057] font-medium whitespace-nowrap">
                        {format(new Date(item.date), "dd/MM/yyyy")}
                      </td>
                      {/* Tên Page */}
                      <td className="px-4 py-3 font-semibold text-[#172b6e] whitespace-nowrap">
                        {item.pageName}
                      </td>
                      {/* Tên Sản phẩm */}
                      <td className="px-4 py-3">
                        <span className="font-bold text-[#0f2057]">{item.productName}</span>
                      </td>
                      {/* Trạng thái */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                          <Icon className="w-3.5 h-3.5" />
                          {cfg.label}
                        </span>
                      </td>
                      {/* Ghi chú / Link */}
                      <td className="px-4 py-3 max-w-[260px]">
                        {item.note && (
                          <p className="text-xs text-gray-600 line-clamp-2 mb-1">{item.note}</p>
                        )}
                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-[#172b6e] hover:text-[#0f2057] hover:underline font-medium"
                          >
                            <ExternalLink className="w-3 h-3" />Xem bài viết
                          </a>
                        )}
                        {!item.note && !item.link && (
                          <span className="text-xs text-gray-400 italic">—</span>
                        )}
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {item.status === "dang_test" && (
                            <button
                              onClick={() => handleQuickStatus(item.id, "dang_chay")}
                              className="text-[10px] px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors whitespace-nowrap"
                            >
                              Chạy
                            </button>
                          )}
                          {item.status === "dang_chay" && (
                            <button
                              onClick={() => handleQuickStatus(item.id, "da_win")}
                              className="text-[10px] px-2 py-1 bg-yellow-400 hover:bg-yellow-300 text-[#0f2057] rounded-lg font-semibold transition-colors whitespace-nowrap flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3" />Win!
                            </button>
                          )}
                          <button
                            onClick={() => openEdit(item)}
                            className="p-1.5 text-[#172b6e]/40 hover:text-[#172b6e] hover:bg-[#e8edf8] rounded-lg transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-[#172b6e]/40 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
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
        )}
      </div>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={(o) => !o && setIsModalOpen(false)}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#0f2057]">
              <Trophy className="w-5 h-5 text-yellow-500" />
              {editingItem ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm Win"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Ngày</Label>
                <Input type="date" value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Trạng thái</Label>
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as WinStatus }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dang_test">Đang test</SelectItem>
                    <SelectItem value="dang_chay">Đang chạy</SelectItem>
                    <SelectItem value="da_win">Đã Win</SelectItem>
                    <SelectItem value="dung_lai">Dừng lại</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Tên Page <span className="text-red-500">*</span></Label>
              <Input value={form.pageName}
                onChange={(e) => setForm((f) => ({ ...f, pageName: e.target.value }))}
                placeholder="Tên page Facebook/Instagram..." autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label>Tên Sản phẩm <span className="text-red-500">*</span></Label>
              <Input value={form.productName}
                onChange={(e) => setForm((f) => ({ ...f, productName: e.target.value }))}
                placeholder="Tên sản phẩm đang chạy..." />
            </div>
            <div className="space-y-1.5">
              <Label>Ghi chú</Label>
              <Textarea value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                placeholder="Chi phí, ROAS, ghi chú thêm..."
                rows={2} className="resize-none" />
            </div>
            <div className="space-y-1.5">
              <Label>Link bài viết (nếu có)</Label>
              <Input value={form.link}
                onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                placeholder="https://..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button
              onClick={handleSave}
              disabled={!form.productName.trim() || !form.pageName.trim()}
              className="bg-[#0f2057] hover:bg-[#172b6e] text-white"
            >
              {editingItem ? "Lưu thay đổi" : "Thêm sản phẩm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
