import { useTasks } from "@/hooks/use-tasks";
import { useTags } from "@/hooks/use-tags";
import { Link } from "wouter";
import {
  KanbanSquare,
  FileCheck2,
  Trophy,
  Clock,
  CheckCircle2,
  Circle,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { TagBadge } from "@/components/TagBadge";

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 shadow-sm">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-3xl font-extrabold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { data: tasks = [] } = useTasks();
  const { data: tags = [] } = useTags();

  const todo = tasks.filter((t) => t.status === "todo");
  const inProgress = tasks.filter((t) => t.status === "in_progress");
  const done = tasks.filter((t) => t.status === "done");

  const now = Date.now();
  const upcoming = tasks
    .filter(
      (t) =>
        t.deadline && t.status !== "done" && new Date(t.deadline).getTime() > now
    )
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    .slice(0, 5);

  const overdue = tasks.filter(
    (t) =>
      t.deadline && t.status !== "done" && new Date(t.deadline).getTime() < now
  );

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-8 pt-8 pb-6 border-b border-border bg-background">
        <h1 className="text-2xl font-extrabold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tổng quan công việc của bạn
        </p>
      </div>

      <div className="flex-1 px-8 py-6 space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Tổng công việc" value={tasks.length} icon={KanbanSquare} color="bg-primary" />
          <StatCard label="Cần làm" value={todo.length} icon={Circle} color="bg-yellow-400" />
          <StatCard label="Đang làm" value={inProgress.length} icon={ArrowRight} color="bg-blue-400" />
          <StatCard label="Hoàn thành" value={done.length} icon={CheckCircle2} color="bg-green-500" />
        </div>

        {overdue.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm font-medium text-red-700 dark:text-red-400">
              Có <strong>{overdue.length}</strong> công việc đã quá hạn. Hãy xử lý ngay!
            </p>
            <Link
              href="/todo"
              className="ml-auto text-xs font-semibold text-red-600 hover:underline whitespace-nowrap"
            >
              Xem ngay →
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-base mb-4 flex items-center gap-2 text-foreground">
              <Clock className="w-4 h-4 text-primary" />
              Deadline sắp tới
            </h2>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                Không có công việc nào sắp đến hạn.
              </p>
            ) : (
              <div className="space-y-2">
                {upcoming.map((task) => {
                  const hoursLeft =
                    (new Date(task.deadline!).getTime() - now) / (1000 * 60 * 60);
                  const isUrgent = hoursLeft <= 24;
                  return (
                    <Link
                      key={task.id}
                      href="/todo"
                      className="flex items-start justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p
                          className={`font-medium text-sm truncate ${
                            isUrgent
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-foreground"
                          }`}
                        >
                          {task.title}
                        </p>
                        <span
                          className={`text-xs ${
                            isUrgent ? "text-amber-500 font-semibold" : "text-muted-foreground"
                          }`}
                        >
                          {format(new Date(task.deadline!), "dd/MM/yyyy, HH:mm")}
                          {isUrgent && " · Sắp đến hạn!"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 ml-3 shrink-0">
                        {task.tags.slice(0, 2).map((tag) => (
                          <TagBadge key={tag.id} tag={tag} />
                        ))}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-base mb-4 text-foreground">Truy cập nhanh</h2>
            <div className="space-y-3">
              <Link
                href="/todo"
                className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <KanbanSquare className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">Bảng Kanban</p>
                  <p className="text-xs text-muted-foreground">
                    {todo.length} cần làm · {inProgress.length} đang làm
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-primary transition-colors" />
              </Link>

              <Link
                href="/check-post"
                className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <FileCheck2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">Check bài đăng</p>
                  <p className="text-xs text-muted-foreground">Theo dõi & kiểm tra bài đăng</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-primary transition-colors" />
              </Link>

              <Link
                href="/win"
                className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-[#1e3a8a]/40 hover:bg-[#1e3a8a]/5 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#1e3a8a]/10 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-[#1e3a8a]" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">Sản phẩm Win</p>
                  <p className="text-xs text-muted-foreground">Theo dõi sản phẩm chiến thắng</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-[#1e3a8a] transition-colors" />
              </Link>
            </div>

            {tags.length > 0 && (
              <div className="mt-5 pt-4 border-t border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Nhãn đang dùng
                </p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <TagBadge key={tag.id} tag={tag} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
