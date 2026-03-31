import { useState } from "react";
import {
  FlaskConical, Plus, Trash2, Edit2, ExternalLink,
  CheckCircle2, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

type TestStatus = "len_camp" | "chua_len";

interface TestItem {
  id: string;
  status: TestStatus;
  page: string;
  product: string;
  price: string;
  videoLink: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<TestStatus, { label: string; bg: string; text: string; dot: string; icon: React.ElementType }> = {
  len_camp: {
    label: "Lên camp",
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
  },
  chua_len: {
    label: "Chưa lên",
    bg: "bg-orange-100",
    text: "text-orange-700",
    dot: "bg-orange-400",
    icon: Clock,
  },
};

const STORAGE_KEY = "taskflow_test_hang";

function loadItems(): TestItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function saveItems(items: TestItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

const emptyForm = {
  status: "chua_len" as TestStatus,
  page: "",
  product: "",
  price: "",
  videoLink: "",
};

export function TestHangPage() {
  const [items, setItems] = useState<TestItem[]>(loadItems);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TestItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [filterStatus, setFilterStatus] = useState<TestStatus | "all">("all");

  const openCreate = () => { setEditingItem(null); setForm(emptyForm); setIsModalOpen(true); };
  const openEdit = (item: TestItem) => {
    setEditingItem(item);
    setForm({
      status: item.status, page: item.page, product: item.product,
      price: item.price, videoLink: item.videoLink,
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!form.product.trim()) return;
    if (editingItem) {
      setItems((prev) => {
        const next = prev.map((p) => p.id === editingItem.id ? { ...p, ...form } : p);
        saveItems(next); return next;
      });
    } else {
      const newItem: TestItem = { id: Date.now().toString(), ...form, createdAt: new Date().toISOString() };
      setItems((prev) => { const next = [newItem, ...prev]; saveItems(next); return next; });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Xóa mục này?")) {
      setItems((prev) => { const next = prev.filter((p) => p.id !== id); saveItems(next); return next; });
    }
  };

  const toggleStatus = (id: string) => {
    setItems((prev) => {
      const next = prev.map((p) =>
        p.id === id ? { ...p, status: p.status === "len_camp" ? "chua_len" : "len_camp" } : p
      );
      saveItems(next); return next;
    });
  };

  const filtered = filterStatus === "all" ? items : items.filter((p) => p.status === filterStatus);
  const lenCount = items.filter((p) => p.status === "len_camp").length;
  const chuaCount = items.filter((p) => p.status === "chua_len").length;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#f5f7ff]">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-700 to-indigo-600 px-6 py-5 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-extrabold text-lg leading-tight">Test hàng</h1>
            <p className="text-violet-200 text-xs mt-0.5">Quản lý danh sách sản phẩm đang test</p>
          </div>
        </div>
        <Button
          onClick={openCreate}
          className="bg-white hover:bg-violet-50 text-violet-700 font-bold h-9 gap-2 shadow-md"
        >
          <Plus className="w-4 h-4" />Thêm sản phẩm
        </Button>
      </div>

      {/* Stats + filter */}
      <div className="bg-indigo-800 px-6 py-3 shrink-0 flex items-center gap-6">
        {[
          { key: "all", value: items.length, label: "Tất cả", color: "text-white" },
          { key: "chua_len", value: chuaCount, label: "Chưa lên", color: "text-orange-300" },
          { key: "len_camp", value: lenCount, label: "Lên camp", color: "text-emerald-300" },
        ].map(({ key, value, label, color }) => (
          <button
            key={key}
            onClick={() => setFilterStatus(key as TestStatus | "all")}
            className={`flex flex-col items-center transition-opacity ${filterStatus === key ? "opacity-100" : "opacity-45 hover:opacity-70"}`}
          >
            <span className={`text-xl font-extrabold ${color}`}>{value}</span>
            <span className="text-[10px] text-indigo-300 whitespace-nowrap">{label}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-52 text-indigo-300">
            <FlaskConical className="w-12 h-12 mb-3 opacity-30" />
            <p className="font-semibold text-sm text-indigo-900/40">Chưa có sản phẩm nào đang test.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
              onClick={openCreate}
            >
              <Plus className="w-4 h-4 mr-1" />Thêm sản phẩm
            </Button>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden border border-indigo-200 shadow-sm bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-violet-700 to-indigo-600 text-white">
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Trạng thái</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Page</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Sản phẩm</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Giá</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider">Video Test chính</th>
                  <th className="px-4 py-3 w-28"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-50">
                {filtered.map((item, idx) => {
                  const cfg = STATUS_CONFIG[item.status];
                  const Icon = cfg.icon;
                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors hover:bg-indigo-50/60 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}`}
                    >
                      {/* Trạng thái */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleStatus(item.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all hover:opacity-80 ${cfg.bg} ${cfg.text}`}
                          title="Nhấn để đổi trạng thái"
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {cfg.label}
                        </button>
                      </td>
                      {/* Page */}
                      <td className="px-4 py-3 font-semibold text-indigo-800 whitespace-nowrap">
                        {item.page || <span className="text-gray-300 font-normal italic">—</span>}
                      </td>
                      {/* Sản phẩm */}
                      <td className="px-4 py-3 font-bold text-violet-900">
                        {item.product}
                      </td>
                      {/* Giá */}
                      <td className="px-4 py-3 text-indigo-700 font-semibold whitespace-nowrap">
                        {item.price
                          ? item.price
                          : <span className="text-gray-300 font-normal italic">—</span>}
                      </td>
                      {/* Video */}
                      <td className="px-4 py-3">
                        {item.videoLink ? (
                          <a
                            href={item.videoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-800 hover:underline font-medium"
                          >
                            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                            Xem video
                          </a>
                        ) : (
                          <span className="text-gray-300 text-xs italic">Chưa có</span>
                        )}
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(item)}
                            className="p-1.5 text-indigo-300 hover:text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-indigo-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-violet-800">
              <FlaskConical className="w-5 h-5 text-violet-500" />
              {editingItem ? "Chỉnh sửa sản phẩm test" : "Thêm sản phẩm test"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Trạng thái</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as TestStatus }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chua_len">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />
                      Chưa lên
                    </span>
                  </SelectItem>
                  <SelectItem value="len_camp">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                      Lên camp
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Page</Label>
                <Input
                  value={form.page}
                  onChange={(e) => setForm((f) => ({ ...f, page: e.target.value }))}
                  placeholder="Tên page..."
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label>Giá</Label>
                <Input
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="vd: 299.000đ"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Sản phẩm <span className="text-red-500">*</span></Label>
              <Input
                value={form.product}
                onChange={(e) => setForm((f) => ({ ...f, product: e.target.value }))}
                placeholder="Tên sản phẩm đang test..."
              />
            </div>

            <div className="space-y-1.5">
              <Label>Link Video Test chính</Label>
              <Input
                value={form.videoLink}
                onChange={(e) => setForm((f) => ({ ...f, videoLink: e.target.value }))}
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button
              onClick={handleSave}
              disabled={!form.product.trim()}
              className="bg-violet-700 hover:bg-violet-800 text-white"
            >
              {editingItem ? "Lưu thay đổi" : "Thêm sản phẩm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
