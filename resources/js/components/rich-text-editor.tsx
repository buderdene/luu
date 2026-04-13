import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useRef } from 'react';
import { Bold, Italic, List, ListOrdered, Undo, Redo } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type Props = {
    value?: string;
    name?: string;
    placeholder?: string;
    onChange?: (html: string) => void;
    className?: string;
};

function htmlFromText(text: string): string {
    if (!text) return '';
    if (text.startsWith('<')) return text;
    return text
        .split('\n\n')
        .map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
        .join('');
}

function MenuBar({ editor }: { editor: ReturnType<typeof useEditor> }) {
    if (!editor) return null;

    return (
        <div className="flex flex-wrap gap-1 border-b px-2 py-1.5">
            <Button
                type="button"
                variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => editor.chain().focus().toggleBold().run()}
            >
                <Bold className="h-3.5 w-3.5" />
            </Button>
            <Button
                type="button"
                variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => editor.chain().focus().toggleItalic().run()}
            >
                <Italic className="h-3.5 w-3.5" />
            </Button>
            <Button
                type="button"
                variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
                <List className="h-3.5 w-3.5" />
            </Button>
            <Button
                type="button"
                variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
                <ListOrdered className="h-3.5 w-3.5" />
            </Button>
            <div className="mx-1 w-px bg-border" />
            <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                disabled={!editor.can().undo()}
                onClick={() => editor.chain().focus().undo().run()}
            >
                <Undo className="h-3.5 w-3.5" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                disabled={!editor.can().redo()}
                onClick={() => editor.chain().focus().redo().run()}
            >
                <Redo className="h-3.5 w-3.5" />
            </Button>
        </div>
    );
}

export default function RichTextEditor({
    value = '',
    name,
    placeholder,
    onChange,
    className,
}: Props) {
    const hiddenRef = useRef<HTMLInputElement>(null);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({ placeholder: placeholder ?? '' }),
        ],
        content: htmlFromText(value),
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none px-3 py-2 min-h-[120px] focus:outline-none',
            },
        },
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            if (hiddenRef.current) {
                hiddenRef.current.value = html;
            }
            onChange?.(html);
        },
    });

    useEffect(() => {
        if (hiddenRef.current) {
            hiddenRef.current.value = editor?.getHTML() ?? htmlFromText(value);
        }
    }, [editor, value]);

    return (
        <div
            className={cn(
                'rounded-md border bg-transparent shadow-xs focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]',
                className,
            )}
        >
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
            {name && (
                <input
                    ref={hiddenRef}
                    type="hidden"
                    name={name}
                    defaultValue={htmlFromText(value)}
                />
            )}
        </div>
    );
}
