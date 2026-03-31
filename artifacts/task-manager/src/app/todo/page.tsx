import { useState, useEffect } from "react";
import { KanbanBoard } from "@/components/KanbanBoard";
import { TaskModal } from "@/components/TaskModal";
import { TagManagerModal } from "@/components/TagManagerModal";
import { useTasks } from "@/hooks/use-tasks";
import { Task } from "@workspace/api-client-react/src/generated/api.schemas";
import { checkAndNotifyDeadlines } from "@/lib/notifications";
import { Loader2, Filter, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTags } from "@/hooks/use-tags";
import { TagBadge } from "@/components/TagBadge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function TodoPage() {
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<"todo" | "in_progress" | "done">("todo");
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);

  const tagIdsParam = selectedTagIds.length > 0 ? selectedTagIds.join(",") : undefined;
  const { data: tasks, isLoading, error } = useTasks(tagIdsParam);
  const { data: tags = [] } = useTags();

  useEffect(() => {
    if (tasks && tasks.length > 0) {
      checkAndNotifyDeadlines(tasks);
      const interval = setInterval(() => checkAndNotifyDeadlines(tasks), 60000);
      return () => clearInterval(interval);
    }
  }, [tasks]);

  const handleOpenTaskModal = (task?: Task, status?: "todo" | "in_progress" | "done") => {
    setSelectedTask(task || null);
    setDefaultStatus(status || "todo");
    setIsTaskModalOpen(true);
  };

  const handleToggleTagFilter = (id: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 h-14 flex items-center justify-between border-b border-border bg-background shrink-0">
        <h1 className="font-extrabold text-lg text-foreground">Bảng Kanban</h1>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-2">
                <Filter className="w-3.5 h-3.5" />
                <span>Lọc</span>
                {selectedTagIds.length > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                    {selectedTagIds.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[260px] p-4 rounded-xl shadow-xl">
              <h4 className="font-semibold text-sm mb-3">Lọc theo Nhãn</h4>
              <div className="flex flex-wrap gap-2">
                {tags.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Chưa có nhãn nào.</p>
                ) : (
                  tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleToggleTagFilter(tag.id)}
                      className={`transition-all rounded-full ${
                        selectedTagIds.includes(tag.id)
                          ? "ring-2 ring-primary ring-offset-1 ring-offset-background"
                          : "opacity-60 hover:opacity-100 grayscale hover:grayscale-0"
                      }`}
                    >
                      <TagBadge tag={tag} />
                    </button>
                  ))
                )}
              </div>
              {selectedTagIds.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-3 text-muted-foreground h-8"
                  onClick={() => setSelectedTagIds([])}
                >
                  Xóa bộ lọc
                </Button>
              )}
            </PopoverContent>
          </Popover>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-2"
            onClick={() => setIsTagManagerOpen(true)}
          >
            <Tags className="w-3.5 h-3.5" />
            <span>Nhãn</span>
          </Button>
        </div>
      </div>

      <main className="flex-1 overflow-hidden flex flex-col px-6 py-4">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground animate-in fade-in duration-500">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-primary" />
            <p className="font-medium">Đang tải công việc...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-destructive/10 text-destructive p-6 rounded-xl max-w-md text-center border border-destructive/20">
              <h2 className="font-bold text-lg mb-2">Không thể tải dữ liệu</h2>
              <p className="text-sm opacity-90">Vui lòng kiểm tra kết nối server và thử lại.</p>
            </div>
          </div>
        ) : (
          <KanbanBoard
            tasks={tasks || []}
            onTaskClick={(task) => handleOpenTaskModal(task)}
            onAddTask={(status) => handleOpenTaskModal(undefined, status)}
          />
        )}
      </main>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={selectedTask}
        defaultStatus={defaultStatus}
      />
      <TagManagerModal
        isOpen={isTagManagerOpen}
        onClose={() => setIsTagManagerOpen(false)}
      />
    </div>
  );
}
