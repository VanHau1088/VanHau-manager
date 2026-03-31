import { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Task } from "@workspace/api-client-react/src/generated/api.schemas";
import { useUpdateTask } from "@/hooks/use-tasks";
import { KanbanCard } from "./KanbanCard";
import { Plus } from "lucide-react";
import { Button } from "./ui/button";

interface KanbanBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: (status: 'todo' | 'in_progress' | 'done') => void;
}

type ColumnType = 'todo' | 'in_progress' | 'done';

const COLUMNS: { id: ColumnType; title: string; color: string }[] = [
  { id: 'todo', title: 'To Do', color: 'bg-slate-100 dark:bg-slate-800/50' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-indigo-50 dark:bg-indigo-900/20' },
  { id: 'done', title: 'Done', color: 'bg-green-50 dark:bg-green-900/10' },
];

export function KanbanBoard({ tasks: initialTasks, onTaskClick, onAddTask }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
  const updateTask = useUpdateTask();

  // Sync prop changes to local state, but preserve local state during drag
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.sortable;
    const isOverTask = over.data.current?.sortable;

    if (!isActiveTask) return;

    // Moving between columns
    setTasks((prev) => {
      const activeIndex = prev.findIndex(t => t.id === activeId);
      const overIndex = prev.findIndex(t => t.id === overId);

      if (activeIndex === -1) return prev;
      
      const activeTask = prev[activeIndex];
      const isOverColumn = COLUMNS.some(c => c.id === overId);
      
      // If dragged over another task in a different column
      if (isOverTask && activeTask.status !== prev[overIndex].status) {
        const newTasks = [...prev];
        newTasks[activeIndex] = { ...activeTask, status: prev[overIndex].status };
        return arrayMove(newTasks, activeIndex, overIndex);
      }
      
      // If dragged over an empty column area
      if (isOverColumn && activeTask.status !== overId) {
        const newTasks = [...prev];
        newTasks[activeIndex] = { ...activeTask, status: overId as ColumnType };
        return arrayMove(newTasks, activeIndex, prev.length - 1);
      }

      // Dragging within same column
      if (isOverTask && activeTask.status === prev[overIndex].status) {
        return arrayMove(prev, activeIndex, overIndex);
      }

      return prev;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id;
    const taskIndex = tasks.findIndex(t => t.id === activeId);
    if (taskIndex === -1) return;

    const task = tasks[taskIndex];
    
    // Find new order based on index in its status column
    const columnTasks = tasks.filter(t => t.status === task.status);
    const newOrderIndex = columnTasks.findIndex(t => t.id === task.id);
    // Multiply by 1000 to give space for inserting between items later if needed
    const newOrder = newOrderIndex * 1000;

    // Persist to backend
    const originalTask = initialTasks.find(t => t.id === activeId);
    if (originalTask && (originalTask.status !== task.status || originalTask.order !== newOrder)) {
      updateTask.mutate({
        id: task.id as number,
        data: {
          status: task.status,
          order: newOrder
        }
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 h-full overflow-x-auto pb-4 items-start pt-4">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter(t => t.status === col.id);
          
          return (
            <div 
              key={col.id} 
              className={`flex-shrink-0 w-80 rounded-2xl flex flex-col max-h-[80vh] border border-border/50 shadow-sm ${col.color}`}
            >
              <div className="p-4 flex items-center justify-between sticky top-0 z-10">
                <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                  {col.title}
                  <span className="bg-background/80 px-2 py-0.5 rounded-full text-xs text-muted-foreground border border-border/50">
                    {colTasks.length}
                  </span>
                </h3>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full hover:bg-background/80"
                  onClick={() => onAddTask(col.id)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="p-4 pt-0 flex-1 overflow-y-auto">
                <SortableContext 
                  id={col.id}
                  items={colTasks.map(t => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex flex-col gap-3 min-h-[150px]">
                    {colTasks.map(task => (
                      <KanbanCard 
                        key={task.id} 
                        task={task} 
                        onClick={() => onTaskClick(task)}
                      />
                    ))}
                  </div>
                </SortableContext>
                
                <Button 
                  variant="ghost" 
                  className="w-full mt-3 border-2 border-dashed border-border/60 hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all"
                  onClick={() => onAddTask(col.id)}
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Task
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
        {activeTask ? (
          <div className="opacity-90 rotate-2 scale-105 shadow-2xl cursor-grabbing">
            <KanbanCard task={activeTask} onClick={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
