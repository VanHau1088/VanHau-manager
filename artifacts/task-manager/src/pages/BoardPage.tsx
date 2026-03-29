import { useState, useEffect } from "react";
import { TopBar } from "@/components/TopBar";
import { KanbanBoard } from "@/components/KanbanBoard";
import { TaskModal } from "@/components/TaskModal";
import { TagManagerModal } from "@/components/TagManagerModal";
import { useTasks } from "@/hooks/use-tasks";
import { Task } from "@workspace/api-client-react/src/generated/api.schemas";
import { checkAndNotifyDeadlines } from "@/lib/notifications";
import { Loader2 } from "lucide-react";

export function BoardPage() {
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  
  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<'todo' | 'in_progress' | 'done'>('todo');
  
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);

  // Fetch tasks. We pass tagIds joined by comma if we have any
  const tagIdsParam = selectedTagIds.length > 0 ? selectedTagIds.join(",") : undefined;
  const { data: tasks, isLoading, error } = useTasks(tagIdsParam);

  // Setup Notification checking interval
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      checkAndNotifyDeadlines(tasks);
      const interval = setInterval(() => {
        checkAndNotifyDeadlines(tasks);
      }, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [tasks]);

  const handleOpenTaskModal = (task?: Task, status?: 'todo' | 'in_progress' | 'done') => {
    setSelectedTask(task || null);
    setDefaultStatus(status || 'todo');
    setIsTaskModalOpen(true);
  };

  const handleToggleTagFilter = (id: number) => {
    setSelectedTagIds(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <TopBar 
        onOpenTagManager={() => setIsTagManagerOpen(true)} 
        selectedTagIds={selectedTagIds}
        onToggleTagFilter={handleToggleTagFilter}
      />
      
      <main className="flex-1 overflow-hidden flex flex-col p-6">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground animate-in fade-in duration-500">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
            <p className="font-medium text-lg">Loading your workflow...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-destructive/10 text-destructive p-6 rounded-xl max-w-md text-center border border-destructive/20">
              <h2 className="font-bold text-xl mb-2">Failed to load tasks</h2>
              <p className="text-sm opacity-90">Please ensure the backend server is running and try again.</p>
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
