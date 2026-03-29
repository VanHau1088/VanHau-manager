import { Tag } from "@workspace/api-client-react/src/generated/api.schemas";
import { cn } from "@/lib/utils";

interface TagBadgeProps {
  tag: Tag;
  className?: string;
  onRemove?: () => void;
}

export function TagBadge({ tag, className, onRemove }: TagBadgeProps) {
  return (
    <span 
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-sm",
        className
      )}
      style={{
        backgroundColor: `${tag.color}20`,
        color: tag.color,
        border: `1px solid ${tag.color}40`
      }}
    >
      <span 
        className="w-1.5 h-1.5 rounded-full" 
        style={{ backgroundColor: tag.color }} 
      />
      {tag.name}
      {onRemove && (
        <button 
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="ml-1 hover:opacity-70 focus:outline-none transition-opacity"
        >
          &times;
        </button>
      )}
    </span>
  );
}
