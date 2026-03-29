import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table'
import Underline from '@tiptap/extension-underline'
import { 
  Bold, Italic, Underline as UnderlineIcon, 
  List, ListOrdered, Table as TableIcon 
} from 'lucide-react'
import { useEffect } from 'react'

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  return (
    <div className="border-b border-border p-2 flex flex-wrap gap-1 bg-muted/30 rounded-t-xl">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded-lg transition-colors ${editor.isActive('bold') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded-lg transition-colors ${editor.isActive('italic') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-2 rounded-lg transition-colors ${editor.isActive('underline') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
        title="Underline"
      >
        <UnderlineIcon className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-border mx-1 my-auto" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded-lg transition-colors ${editor.isActive('bulletList') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded-lg transition-colors ${editor.isActive('orderedList') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
        title="Ordered List"
      >
        <ListOrdered className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-border mx-1 my-auto" />

      <button
        type="button"
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        className="p-2 rounded-lg transition-colors hover:bg-muted text-muted-foreground"
        title="Insert Table"
      >
        <TableIcon className="w-4 h-4" />
      </button>
    </div>
  )
}

export function TipTapEditor({ content, onChange }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'min-h-[200px] outline-none',
      },
    },
  });

  // Ensure content updates if external prop changes, but only if it's vastly different
  // (Prevents cursor jumping during typing)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="border-2 border-border rounded-xl bg-background overflow-hidden focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all duration-200">
      <MenuBar editor={editor} />
      <div className="bg-background">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
