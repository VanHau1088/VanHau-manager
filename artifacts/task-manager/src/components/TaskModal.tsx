import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TipTapEditor } from "./TipTapEditor";
import { Task, Tag } from "@workspace/api-client-react/src/generated/api.schemas";
import { useCreateTask, useUpdateTask } from "@/hooks/use-tasks";
import { useTags } from "@/hooks/use-tags";
import { TagBadge } from "./TagBadge";
import { format } from "date-fns";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  defaultStatus?: 'todo' | 'in_progress' | 'done';
}

export function TaskModal({ isOpen, onClose, task, defaultStatus = 'todo' }: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [deadline, setDeadline] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  const { data: tags = [] } = useTags();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setContent(task.content || "");
      // format for datetime-local: YYYY-MM-DDThh:mm
      setDeadline(task.deadline ? format(new Date(task.deadline), "yyyy-MM-dd'T'HH:mm") : "");
      setSelectedTagIds(task.tags.map(t => t.id));
    } else {
      setTitle("");
      setDescription("");
      setContent("");
      setDeadline("");
      setSelectedTagIds([]);
    }
  }, [task, isOpen]);

  const handleSave = () => {
    if (!title.trim()) return;

    const payload = {
      title,
      description,
      content,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      tagIds: selectedTagIds,
      status: task?.status || defaultStatus,
    };

    if (task) {
      updateTask.mutate(
        { id: task.id, data: payload },
        { onSuccess: onClose }
      );
    } else {
      createTask.mutate(
        { data: payload },
        { onSuccess: onClose }
      );
    }
  };

  const isPending = createTask.isPending || updateTask.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">
            {task ? "Chỉnh sửa công việc" : "Thêm công việc mới"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold">Tiêu đề</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Cần làm gì?"
              className="text-lg py-6"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="deadline" className="text-sm font-semibold">Hạn chót</Label>
              <Input 
                id="deadline" 
                type="datetime-local" 
                value={deadline} 
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Nhãn</Label>
              <div className="flex flex-wrap gap-2 p-2 min-h-[42px] border-2 border-border rounded-xl">
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => {
                      if (selectedTagIds.includes(tag.id)) {
                        setSelectedTagIds(prev => prev.filter(id => id !== tag.id));
                      } else {
                        setSelectedTagIds(prev => [...prev, tag.id]);
                      }
                    }}
                    className={`transition-all rounded-full ${selectedTagIds.includes(tag.id) ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : 'opacity-60 hover:opacity-100 grayscale hover:grayscale-0'}`}
                  >
                    <TagBadge tag={tag} />
                  </button>
                ))}
                {tags.length === 0 && (
                  <span className="text-sm text-muted-foreground self-center">Chưa có nhãn. Hãy tạo nhãn trong phần Quản lý Nhãn.</span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc" className="text-sm font-semibold">Mô tả ngắn</Label>
            <Textarea 
              id="desc" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Tóm tắt ngắn về công việc này..."
              className="resize-none"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Ghi chú chi tiết</Label>
            <TipTapEditor content={content} onChange={setContent} />
          </div>
        </div>

        <DialogFooter className="border-t border-border pt-4">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Hủy
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!title.trim() || isPending}
            className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/25 transition-all"
          >
            {isPending ? "Đang lưu..." : "Lưu lại"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
