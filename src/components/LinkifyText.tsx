import React from "react";

const URL_REGEX = /(https?:\/\/[^\s<]+)/gi;

interface Props {
  text: string;
  className?: string;
}

/**
 * 텍스트 내 http/https URL 을 자동으로 클릭 가능한 링크로 변환.
 * 개행은 pre-wrap 으로 보존.
 * (저장된 값만 렌더링하므로 XSS 위험 낮음. <a> 에 rel/target 만 지정.)
 */
export default function LinkifyText({ text, className = "" }: Props) {
  if (!text) return null;
  const parts = text.split(URL_REGEX);
  return (
    <span className={className} style={{ whiteSpace: "pre-wrap" }}>
      {parts.map((part, i) => {
        if (URL_REGEX.test(part)) {
          // 후행 구두점 분리
          const trailing = part.match(/[.,!?)\]]+$/);
          const url = trailing ? part.slice(0, -trailing[0].length) : part;
          const tail = trailing ? trailing[0] : "";
          return (
            <React.Fragment key={i}>
              <a href={url} target="_blank" rel="noopener noreferrer"
                className="text-accent underline underline-offset-2 hover:text-accent-hover break-all">
                {url}
              </a>
              {tail}
            </React.Fragment>
          );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </span>
  );
}
