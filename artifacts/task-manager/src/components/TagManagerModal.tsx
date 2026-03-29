import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTags, useCreateTag, useDeleteTag } from "@/hooks/use-tags";
import { TagBadge } from "./TagBadge";
import { Trash2 } from "lucide-react";

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e", 
  "#10b981", "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1", 
  "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e"
];

interface TagManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TagManagerModal({ isOpen, onClose }: TagManagerModalProps) {
  const { data: tags = [] } = useTags();
  const createTag = useCreateTag();
  const deleteTag = useDeleteTag();

  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  const handleCreate = () => {
    if (!name.trim()) return;
    createTag.mutate({ data: { name, color: selectedColor } }, {
      onSuccess: () => setName("")
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">Manage Tags</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Create New Tag */}
          <div className="bg-muted/50 p-4 rounded-xl border border-border space-y-4">
            <h4 className="text-sm font-semibold">Create New Tag</h4>
            <div className="flex gap-3">
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Tag name (e.g. Urgent)" 
                className="flex-1"
              />
              <Button 
                onClick={handleCreate} 
                disabled={!name.trim() || createTag.isPending}
              >
                Add Tag
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  className={`w-6 h-6 rounded-full transition-all ${selectedColor === c ? 'ring-2 ring-offset-2 ring-primary ring-offset-background scale-110' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>

          {/* List Existing Tags */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Existing Tags</h4>
            {tags.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No tags created yet.</p>
            ) : (
              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2">
                {tags.map(tag => (
                  <div key={tag.id} className="flex items-center justify-between p-2 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                    <TagBadge tag={tag} className="text-sm px-3 py-1" />
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8 p-0 rounded-full"
                      onClick={() => deleteTag.mutate({ id: tag.id })}
                      disabled={deleteTag.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
