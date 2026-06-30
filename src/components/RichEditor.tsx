"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import dynamic from "next/dynamic";
import { useRef, useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

const COLORS = ["#1a1a1a", "#ef4444", "#f97316", "#eab308", "#22c55e", "#0ea5e9", "#8b5cf6", "#ec4899", "#6b7280"];

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  maxChars?: number;
  storageFolder?: string;
};

export default function RichEditor({
  value,
  onChange,
  placeholder = "내용을 입력하세요",
  minHeight = 280,
  maxChars = 20000,
  storageFolder = "posts",
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [showColor, setShowColor] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextStyle,
      Color,
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { class: "text-accent underline" } }),
      Image.configure({ HTMLAttributes: { class: "rounded-xl max-w-full" } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
      CharacterCount.configure({ limit: maxChars }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose prose-sm md:prose-base max-w-none focus:outline-none px-4 py-3 text-[15px] leading-relaxed",
        style: `min-height:${minHeight}px`,
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current && !(value === "" && current === "<p></p>")) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleImage = useCallback(async (file: File) => {
    if (!editor) return;
    if (!file.type.startsWith("image/")) { alert("이미지 파일만 업로드할 수 있습니다."); return; }
    if (file.size > 5 * 1024 * 1024) { alert("이미지 크기는 5MB 이하만 가능합니다."); return; }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${storageFolder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("uploads").upload(path, file, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("uploads").getPublicUrl(path);
      editor.chain().focus().setImage({ src: data.publicUrl }).run();
    } catch {
      alert("이미지 업로드에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  }, [editor, storageFolder]);

  const handleLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href;
    const url = window.prompt("링크 URL", prev || "https://");
    if (url === null) return;
    if (url === "") { editor.chain().focus().extendMarkRange("link").unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return <div className="border border-border-custom rounded-xl bg-white" style={{ minHeight: minHeight + 50 }} />;

  return (
    <div className="border border-border-custom rounded-xl bg-white overflow-hidden">
      <Toolbar editor={editor}
        onLink={handleLink}
        onPickImage={() => fileRef.current?.click()}
        onToggleColor={() => { setShowColor(v => !v); setShowEmoji(false); }}
        onToggleEmoji={() => { setShowEmoji(v => !v); setShowColor(false); }}
        uploading={uploading}
      />
      {showColor && (
        <div className="flex gap-2 px-3 py-2 border-b border-border-custom bg-[#fafbfc] flex-wrap">
          {COLORS.map(c => (
            <button key={c} type="button" aria-label={`color ${c}`}
              onClick={() => { editor.chain().focus().setColor(c).run(); setShowColor(false); }}
              className="w-6 h-6 rounded-full border border-border-custom hover:scale-110 transition-transform"
              style={{ backgroundColor: c }} />
          ))}
          <button type="button"
            onClick={() => { editor.chain().focus().unsetColor().run(); setShowColor(false); }}
            className="text-[12px] text-muted px-2 py-1 hover:text-surface">초기화</button>
        </div>
      )}
      {showEmoji && (
        <div className="px-2 py-2 border-b border-border-custom bg-[#fafbfc]">
          <EmojiPicker
            onEmojiClick={(e) => { editor.chain().focus().insertContent(e.emoji).run(); setShowEmoji(false); }}
            width="100%" height={360} previewConfig={{ showPreview: false }} skinTonesDisabled
            searchPlaceholder="이모지 검색"
          />
        </div>
      )}
      <EditorContent editor={editor} />
      <div className="flex items-center justify-between px-3 py-2 border-t border-border-custom bg-[#fafbfc] text-[11px] text-muted">
        <span>{uploading ? "이미지 업로드 중..." : "텍스트를 선택해 서식을 적용하세요"}</span>
        <span>{editor.storage.characterCount.characters().toLocaleString()} / {maxChars.toLocaleString()}</span>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleImage(f); e.target.value = ""; }} />
    </div>
  );
}

function Toolbar({ editor, onLink, onPickImage, onToggleColor, onToggleEmoji, uploading }: {
  editor: Editor; onLink: () => void; onPickImage: () => void; onToggleColor: () => void; onToggleEmoji: () => void; uploading: boolean;
}) {
  const btn = "px-2 py-1.5 rounded-md text-[13px] font-semibold text-sub hover:bg-[#eef0f3] transition-colors inline-flex items-center justify-center min-w-[30px]";
  const on = "bg-accent/10 text-accent hover:bg-accent/15";
  const sep = <span className="w-px h-5 bg-border-custom mx-0.5" />;
  return (
    <div className="flex items-center gap-0.5 flex-wrap px-2 py-1.5 border-b border-border-custom bg-[#fafbfc]">
      <button type="button" title="굵게" onClick={() => editor.chain().focus().toggleBold().run()}
        className={`${btn} ${editor.isActive("bold") ? on : ""}`}><b>B</b></button>
      <button type="button" title="기울임" onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`${btn} ${editor.isActive("italic") ? on : ""}`}><i>I</i></button>
      <button type="button" title="밑줄" onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`${btn} ${editor.isActive("underline") ? on : ""}`}><u>U</u></button>
      <button type="button" title="취소선" onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`${btn} ${editor.isActive("strike") ? on : ""}`}><s>S</s></button>
      <button type="button" title="글자색" onClick={onToggleColor} className={btn}>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 4 3 19h2.5l1.4-4h6.2l1.4 4H17L11 4H9zm.4 9 2.1-6 2.1 6H9.4zM18 20v-2h4v2h-4z"/></svg>
      </button>
      <button type="button" title="서식 제거" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} className={btn}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4h12M5 20h6m4 0l-2-6m0 0l4-4 3 3-4 4m-3-3l-3-3"/></svg>
      </button>
      {sep}
      <button type="button" title="제목 1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`${btn} ${editor.isActive("heading", { level: 1 }) ? on : ""}`}>H1</button>
      <button type="button" title="제목 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`${btn} ${editor.isActive("heading", { level: 2 }) ? on : ""}`}>H2</button>
      <button type="button" title="제목 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`${btn} ${editor.isActive("heading", { level: 3 }) ? on : ""}`}>H3</button>
      {sep}
      <button type="button" title="왼쪽 정렬" onClick={() => editor.chain().focus().setTextAlign("left").run()}
        className={`${btn} ${editor.isActive({ textAlign: "left" }) ? on : ""}`}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M4 6h16M4 12h10M4 18h16"/></svg>
      </button>
      <button type="button" title="가운데" onClick={() => editor.chain().focus().setTextAlign("center").run()}
        className={`${btn} ${editor.isActive({ textAlign: "center" }) ? on : ""}`}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M4 6h16M7 12h10M4 18h16"/></svg>
      </button>
      <button type="button" title="오른쪽" onClick={() => editor.chain().focus().setTextAlign("right").run()}
        className={`${btn} ${editor.isActive({ textAlign: "right" }) ? on : ""}`}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M4 6h16M10 12h10M4 18h16"/></svg>
      </button>
      {sep}
      <button type="button" title="실행 취소" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}
        className={`${btn} disabled:opacity-30`}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 14L4 9m0 0l5-5M4 9h11a4 4 0 014 4v0a4 4 0 01-4 4h-4"/></svg>
      </button>
      <button type="button" title="다시 실행" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}
        className={`${btn} disabled:opacity-30`}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 14l5-5m0 0l-5-5m5 5H9a4 4 0 00-4 4v0a4 4 0 004 4h4"/></svg>
      </button>
      {sep}
      <button type="button" title="링크" onClick={onLink}
        className={`${btn} ${editor.isActive("link") ? on : ""}`}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
      </button>
      <button type="button" title="이미지" onClick={onPickImage} disabled={uploading} className={`${btn} disabled:opacity-30`}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="1.5" fill="currentColor"/><path d="M21 17l-5-5-9 9"/></svg>
      </button>
      <button type="button" title="이모지" onClick={onToggleEmoji} className={btn}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
      </button>
    </div>
  );
}
