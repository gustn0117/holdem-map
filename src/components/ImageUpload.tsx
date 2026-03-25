"use client";

import { useState, useRef } from "react";
import { uploadImage } from "@/lib/upload";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  aspect?: string;
  hint?: string;
}

export default function ImageUpload({ value, onChange, folder = "images", label = "이미지", aspect = "aspect-video", hint }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      alert("이미지 또는 영상 파일만 업로드 가능합니다.");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadImage(file, folder);
      onChange(url);
    } catch (e) {
      alert("업로드에 실패했습니다.");
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div>
      <label className="text-sub text-sm font-semibold block mb-2">{label} {hint && <span className="text-muted font-normal">({hint})</span>}</label>
      <input ref={inputRef} type="file" accept="image/*,video/*" onChange={handleChange} className="hidden" />

      {value ? (
        <div className="relative group">
          <div className={`${aspect} rounded-xl overflow-hidden border border-border-custom bg-bg`}>
            {value.includes(".mp4") || value.includes(".webm") || value.includes(".mov") ? (
              <video src={value} className="w-full h-full object-cover" muted />
            ) : (
              <img src={value} alt="" className="w-full h-full object-cover" />
            )}
          </div>
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-3">
            <button type="button" onClick={() => inputRef.current?.click()} className="bg-white text-surface text-sm font-medium px-4 py-2 rounded-lg">변경</button>
            <button type="button" onClick={() => onChange("")} className="bg-white text-red text-sm font-medium px-4 py-2 rounded-lg">삭제</button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`${aspect} rounded-xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center transition-all ${
            dragOver ? "border-accent bg-accent-light" : "border-border-custom hover:border-accent/50 bg-bg"
          }`}
        >
          {uploading ? (
            <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          ) : (
            <>
              <svg className="w-8 h-8 text-muted mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-muted text-[13px]">클릭 또는 드래그하여 업로드</p>
              <p className="text-[#ccc] text-[11px] mt-1">JPG, PNG, GIF, MP4</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
