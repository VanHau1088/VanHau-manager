import { useState } from "react";
import {
  Plus,
  Trash2,
  ExternalLink,
  Facebook,
  Instagram,
  Youtube,
  Globe,
  CheckCircle2,
  Clock,
  XCircle,
  Edit2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

type Platform = "facebook" | "instagram" | "youtube" | "website" | "other";
type PostStatus = "cho_dang" | "da_dang" | "can_chinh_sua" | "da_huy";

interface Post {
  id: string;
  title: string;
  content: string;
  platform: Platform;
  status: PostStatus;
  url?: string;
  scheduledAt?: string;
  createdAt: string;
}

const PLATFORM_ICONS: Record<Platform, React.ElementType> = {
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  website: Globe,
  other: Globe,
};

const PLATFORM_LABELS: Record<Platform, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  website: "Website",
  other: "Khác",
};

const PLATFORM_COLORS: Record<Platform, string> = {
  facebook: "text-blue-600 bg-blue-50",
  instagram: "text-pink-600 bg-pink-50",
  youtube: "text-red-600 bg-red-50",
  website: "text-gray-600 bg-gray-100",
  other: "text-gray-600 bg-gray-100",
};

const STATUS_CONFIG: Record<
  PostStatus,
  { label: string; color: string; icon: React.ElementType }
> = {
  cho_dang: {
    label: "Chờ đăng",
    color: "text-amber-600 bg-amber-50 border-amber-200",
    icon: Clock,
  },
  da_dang: {
    label: "Đã đăng",
    color: "text-green-600 bg-green-50 border-green-200",
    icon: CheckCircle2,
  },
  can_chinh_sua: {
    label: "Cần chỉnh sửa",
    color: "text-orange-600 bg-orange-50 border-orange-200",
    icon: Edit2,
  },
  da_huy: {
    label: "Đã hủy",
    color: "text-gray-500 bg-gray-100 border-gray-200",
    icon: XCircle,
  },
};

const DEFAULT_POSTS: Post[] = [
  {
    id: "1",
    title: "Kịch bản Ads tháng 4",
    content: "Chương trình khuyến mãi tháng 4, giảm 20% cho khách hàng mới...",
    platform: "facebook",
    status: "cho_dang",
    scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Review sản phẩm mới",
    content: "Video review chi tiết về sản phẩm XYZ, hướng dẫn sử dụng...",
    platform: "youtube",
    status: "da_dang",
    url: "https://youtube.com",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "3",
    title: "Story khách hàng VIP",
    content: "Feedback từ khách hàng Nguyễn Thị A sau khi dùng dịch vụ...",
    platform: "instagram",
    status: "can_chinh_sua",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

const emptyForm = {
  title: "",
  content: "",
  platform: "facebook" as Platform,
  status: "cho_dang" as PostStatus,
  url: "",
  scheduledAt: "",
};

export function CheckPostPage() {
  const [posts, setPosts] = useState<Post[]>(DEFAULT_POSTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [filterStatus, setFilterStatus] = useState<PostStatus | "all">("all");

  const openCreateModal = () => {
    setEditingPost(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (post: Post) => {
    setEditingPost(post);
    setForm({
      title: post.title,
      content: post.content,
      platform: post.platform,
      status: post.status,
      url: post.url || "",
      scheduledAt: post.scheduledAt
        ? format(new Date(post.scheduledAt), "yyyy-MM-dd'T'HH:mm")
        : "",
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (editingPost) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === editingPost.id
            ? {
                ...p,
                ...form,
                scheduledAt: form.scheduledAt
                  ? new Date(form.scheduledAt).toISOString()
                  : undefined,
                url: form.url || undefined,
              }
            : p
        )
      );
    } else {
      const newPost: Post = {
        id: Date.now().toString(),
        ...form,
        scheduledAt: form.scheduledAt
          ? new Date(form.scheduledAt).toISOString()
          : undefined,
        url: form.url || undefined,
        createdAt: new Date().toISOString(),
      };
      setPosts((prev) => [newPost, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc muốn xóa bài đăng này không?")) {
      setPosts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleQuickStatus = (id: string, status: PostStatus) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    );
  };

  const filtered =
    filterStatus === "all"
      ? posts
      : posts.filter((p) => p.status === filterStatus);

  const counts = {
    all: posts.length,
    cho_dang: posts.filter((p) => p.status === "cho_dang").length,
    da_dang: posts.filter((p) => p.status === "da_dang").length,
    can_chinh_sua: posts.filter((p) => p.status === "can_chinh_sua").length,
    da_huy: posts.filter((p) => p.status === "da_huy").length,
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Page header */}
      <div className="px-6 h-14 flex items-center justify-between border-b border-border bg-background shrink-0">
        <h1 className="font-extrabold text-lg text-foreground">Check bài đăng</h1>
        <Button size="sm" className="h-8 gap-2" onClick={openCreateModal}>
          <Plus className="w-4 h-4" />
          Thêm bài đăng
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="px-6 py-3 border-b border-border bg-background shrink-0 flex items-center gap-2 overflow-x-auto">
        {(
          [
            { key: "all", label: "Tất cả" },
            { key: "cho_dang", label: "Chờ đăng" },
            { key: "da_dang", label: "Đã đăng" },
            { key: "can_chinh_sua", label: "Cần chỉnh sửa" },
            { key: "da_huy", label: "Đã hủy" },
          ] as const
        ).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilterStatus(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors
              ${
                filterStatus === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
          >
            {label}
            <span className="ml-1.5 opacity-70">
              ({counts[key as keyof typeof counts] ?? 0})
            </span>
          </button>
        ))}
      </div>

      {/* Posts list */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <p className="text-sm">Chưa có bài đăng nào.</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3"
              onClick={openCreateModal}
            >
              <Plus className="w-4 h-4 mr-1" /> Thêm bài đăng
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((post) => {
              const PlatformIcon = PLATFORM_ICONS[post.platform];
              const statusCfg = STATUS_CONFIG[post.status];
              const StatusIcon = statusCfg.icon;
              return (
                <div
                  key={post.id}
                  className="bg-card border border-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    {/* Platform icon */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        PLATFORM_COLORS[post.platform]
                      }`}
                    >
                      <PlatformIcon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm text-foreground truncate">
                          {post.title}
                        </h3>
                        <span
                          className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${statusCfg.color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {statusCfg.label}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {post.content}
                      </p>

                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className="text-xs text-muted-foreground">
                          {PLATFORM_LABELS[post.platform]}
                        </span>
                        {post.scheduledAt && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {format(new Date(post.scheduledAt), "dd/MM/yyyy HH:mm")}
                          </span>
                        )}
                        {post.url && (
                          <a
                            href={post.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-3 h-3" />
                            Xem bài
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {post.status === "cho_dang" && (
                        <button
                          onClick={() => handleQuickStatus(post.id, "da_dang")}
                          className="text-xs px-2.5 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Đã đăng
                        </button>
                      )}
                      {post.status === "can_chinh_sua" && (
                        <button
                          onClick={() => handleQuickStatus(post.id, "cho_dang")}
                          className="text-xs px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors flex items-center gap-1"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          Chờ đăng
                        </button>
                      )}
                      <button
                        onClick={() => openEditModal(post)}
                        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={(o) => !o && setIsModalOpen(false)}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>
              {editingPost ? "Chỉnh sửa bài đăng" : "Thêm bài đăng mới"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Tiêu đề</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Tên bài đăng..."
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Nền tảng</Label>
                <Select
                  value={form.platform}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, platform: v as Platform }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Trạng thái</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, status: v as PostStatus }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cho_dang">Chờ đăng</SelectItem>
                    <SelectItem value="da_dang">Đã đăng</SelectItem>
                    <SelectItem value="can_chinh_sua">Cần chỉnh sửa</SelectItem>
                    <SelectItem value="da_huy">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Nội dung / Ghi chú</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="Nội dung hoặc ghi chú về bài đăng..."
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Ngày đăng (dự kiến)</Label>
                <Input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, scheduledAt: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label>Link bài đăng (nếu có)</Label>
                <Input
                  value={form.url}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, url: e.target.value }))
                  }
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={!form.title.trim()}>
              {editingPost ? "Lưu thay đổi" : "Thêm bài đăng"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
