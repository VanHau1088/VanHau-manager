import { Filter, Tags, BellDot } from "lucide-react";
import { Button } from "./ui/button";
import { useTags } from "@/hooks/use-tags";
import { TagBadge } from "./TagBadge";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { requestNotificationPermission } from "@/lib/notifications";

interface TopBarProps {
  onOpenTagManager: () => void;
  selectedTagIds: number[];
  onToggleTagFilter: (id: number) => void;
}

export function TopBar({ onOpenTagManager, selectedTagIds, onToggleTagFilter }: TopBarProps) {
  const { data: tags = [] } = useTags();

  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-xl border-b border-border shadow-sm">
      <div className="px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-inner">
            <div className="w-3 h-3 bg-white rounded-sm rotate-45" />
          </div>
          <h1 className="text-2xl font-display font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            TaskFlow
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 font-medium gap-2">
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Lọc</span>
                {selectedTagIds.length > 0 && (
                  <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                    {selectedTagIds.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[280px] p-4 rounded-xl shadow-xl">
              <h4 className="font-semibold text-sm mb-3">Lọc theo Nhãn</h4>
              <div className="flex flex-wrap gap-2">
                {tags.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Chưa có nhãn nào.</p>
                ) : (
                  tags.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => onToggleTagFilter(tag.id)}
                      className={`transition-all rounded-full ${selectedTagIds.includes(tag.id) ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : 'opacity-60 hover:opacity-100 grayscale hover:grayscale-0'}`}
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
                  className="w-full mt-4 text-muted-foreground h-8"
                  onClick={() => tags.forEach(t => selectedTagIds.includes(t.id) && onToggleTagFilter(t.id))}
                >
                  Xóa bộ lọc
                </Button>
              )}
            </PopoverContent>
          </Popover>

          <div className="w-px h-6 bg-border mx-1" />

          <Button 
            variant="ghost" 
            size="sm" 
            className="h-9 gap-2"
            onClick={onOpenTagManager}
          >
            <Tags className="w-4 h-4" />
            <span className="hidden sm:inline">Nhãn</span>
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            onClick={() => {
              requestNotificationPermission();
              alert("Đã bật thông báo nhắc nhở hạn chót!");
            }}
            title="Enable Notifications"
          >
            <BellDot className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
