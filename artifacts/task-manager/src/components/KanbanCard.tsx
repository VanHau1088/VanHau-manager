import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@workspace/api-client-react/src/generated/api.schemas";
import { TagBadge } from "./TagBadge";
import { ArrowRight, CheckCircle2, Clock, GripVertical, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useDeleteTask, useUpdateTask } from "@/hooks/use-tasks";

interface KanbanCardProps {
  task: Task;
  onClick: () => void;
}

export function KanbanCard({ task, onClick }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });

  const deleteTask = useDeleteTask();
  const updateTask = useUpdateTask();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  // Deadline logic
  let borderClass = "border-border hover:border-primary/50";
  let deadlineTextClass = "text-muted-foreground";

  if (task.deadline && task.status !== 'done') {
    const now = new Date().getTime();
    const deadlineTime = new Date(task.deadline).getTime();
    const hoursLeft = (deadlineTime - now) / (1000 * 60 * 60);

    if (hoursLeft < 0) {
      borderClass = "border-red-500 shadow-sm shadow-red-500/10";
      deadlineTextClass = "text-red-500 font-medium";
    } else if (hoursLeft <= 24) {
      borderClass = "border-amber-500 shadow-sm shadow-amber-500/10";
      deadlineTextClass = "text-amber-500 font-medium";
    }
  }

  const handleMoveNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus = task.status === 'todo' ? 'in_progress' : 'done';
    updateTask.mutate({ id: task.id as number, data: { status: nextStatus } });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Bạn có chắc muốn xóa công việc này không?")) {
      deleteTask.mutate({ id: task.id });
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-card rounded-xl p-4 border-2 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer flex flex-col gap-3 ${borderClass}`}
      onClick={onClick}
    >
      {/* Top-right controls: delete + drag handle */}
      <div className="absolute top-2 right-2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
          onClick={handleDelete}
          title="Xóa công việc"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <div
          {...attributes}
          {...listeners}
          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted cursor-grab active:cursor-grabbing rounded-md transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4" />
        </div>
      </div>

      <h4 className="font-bold text-foreground pr-10 leading-tight">
        {task.title}
      </h4>

      {task.description && (
        <p className="text-sm text-muted-foreground line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Deadline + Tags row */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {task.deadline && (
          <div className={`flex items-center text-xs gap-1 ${deadlineTextClass}`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{format(new Date(task.deadline), "dd/MM, HH:mm")}</span>
          </div>
        )}
        <div className="flex flex-wrap gap-1 ml-auto">
          {task.tags.map(tag => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
        </div>
      </div>

      {/* Quick move buttons — same row, left-aligned, below tags */}
      {task.status !== 'done' && (
        <div className="flex justify-between items-center pt-1 border-t border-border/40">
          <span className="text-xs text-muted-foreground">
            {task.status === 'todo' ? 'Chưa bắt đầu' : 'Đang thực hiện'}
          </span>
          <button
            onClick={handleMoveNext}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-lg transition-colors
              ${task.status === 'todo'
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
          >
            {task.status === 'todo' ? (
              <><ArrowRight className="w-3.5 h-3.5" /> Làm ngay</>
            ) : (
              <><CheckCircle2 className="w-3.5 h-3.5" /> Xong</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
