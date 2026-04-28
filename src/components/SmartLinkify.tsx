import React from "react";

const URL_REGEX = /(https?:\/\/[^\s<]+|tel:[+\d-]+)/gi;

type LinkPreset = {
  label: string;
  bg: string;
  text: string;
  hover: string;
  icon: React.ReactNode;
};

function detectPreset(url: string): LinkPreset {
  const u = url.toLowerCase();
  if (u.startsWith("tel:")) {
    return {
      label: "전화 걸기",
      bg: "bg-accent",
      text: "text-white",
      hover: "hover:bg-accent-hover",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
      ),
    };
  }
  if (u.includes("cafe.naver.com")) {
    return {
      label: "네이버 카페 바로가기",
      bg: "bg-[#03c75a]",
      text: "text-white",
      hover: "hover:bg-[#029f4a]",
      icon: <span className="font-black text-[14px] leading-none">N</span>,
    };
  }
  if (u.includes("blog.naver.com") || u.includes("naver.com")) {
    return {
      label: "네이버 바로가기",
      bg: "bg-[#03c75a]",
      text: "text-white",
      hover: "hover:bg-[#029f4a]",
      icon: <span className="font-black text-[14px] leading-none">N</span>,
    };
  }
  if (u.includes("open.kakao.com")) {
    return {
      label: "카카오톡 오픈채팅 입장",
      bg: "bg-[#FEE500]",
      text: "text-[#3C1E1E]",
      hover: "hover:bg-[#e6cf00]",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.72 1.8 5.108 4.516 6.467-.197.735-.714 2.666-.818 3.08-.128.512.188.504.395.367.163-.108 2.592-1.76 3.637-2.477.733.104 1.49.16 2.27.16 5.523 0 10-3.463 10-7.691S17.523 3 12 3z"/></svg>
      ),
    };
  }
  if (u.includes("pf.kakao.com") || u.includes("kakao.com")) {
    return {
      label: "카카오 채널",
      bg: "bg-[#FEE500]",
      text: "text-[#3C1E1E]",
      hover: "hover:bg-[#e6cf00]",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.72 1.8 5.108 4.516 6.467-.197.735-.714 2.666-.818 3.08-.128.512.188.504.395.367.163-.108 2.592-1.76 3.637-2.477.733.104 1.49.16 2.27.16 5.523 0 10-3.463 10-7.691S17.523 3 12 3z"/></svg>
      ),
    };
  }
  if (u.includes("t.me") || u.includes("telegram.me")) {
    return {
      label: "텔레그램 입장",
      bg: "bg-[#229ED9]",
      text: "text-white",
      hover: "hover:bg-[#1a8bc2]",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.28-.02-.12.02-2.02 1.28-5.7 3.77-.54.37-1.03.55-1.47.54-.48-.01-1.41-.27-2.1-.5-.84-.28-1.51-.43-1.45-.91.03-.25.38-.51 1.05-.78 4.12-1.79 6.87-2.97 8.26-3.54 3.93-1.62 4.75-1.9 5.28-1.91.12 0 .38.03.55.17.14.12.18.28.2.45-.01.06-.01.24-.02.38z"/></svg>
      ),
    };
  }
  if (u.includes("instagram.com")) {
    return {
      label: "인스타그램",
      bg: "bg-linear-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5]",
      text: "text-white",
      hover: "hover:opacity-90",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
      ),
    };
  }
  if (u.includes("youtube.com") || u.includes("youtu.be")) {
    return {
      label: "유튜브",
      bg: "bg-[#FF0000]",
      text: "text-white",
      hover: "hover:bg-[#cc0000]",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
      ),
    };
  }
  return {
    label: "링크 열기",
    bg: "bg-accent",
    text: "text-white",
    hover: "hover:bg-accent-hover",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
    ),
  };
}

interface Props {
  text: string;
  className?: string;
}

export default function SmartLinkify({ text, className = "" }: Props) {
  if (!text) return null;
  const parts = text.split(URL_REGEX);
  return (
    <div className={className} style={{ whiteSpace: "pre-wrap" }}>
      {parts.map((part, i) => {
        if (URL_REGEX.test(part)) {
          const trailing = part.match(/[.,!?)\]]+$/);
          const url = trailing ? part.slice(0, -trailing[0].length) : part;
          const tail = trailing ? trailing[0] : "";
          const preset = detectPreset(url);
          return (
            <React.Fragment key={i}>
              <a href={url} target="_blank" rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 ${preset.bg} ${preset.text} ${preset.hover} font-bold text-[13px] px-3 py-1.5 rounded-lg my-1 transition-all break-all align-middle`}>
                {preset.icon}
                <span>{preset.label}</span>
              </a>
              {tail}
            </React.Fragment>
          );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </div>
  );
}
