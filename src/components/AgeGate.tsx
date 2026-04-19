"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "holdem-map-age-confirmed";

export default function AgeGate() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const confirmed = localStorage.getItem(STORAGE_KEY);
      if (!confirmed) setShow(true);
    } catch {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  const confirm = () => {
    try { localStorage.setItem(STORAGE_KEY, new Date().toISOString()); } catch {}
    setShow(false);
  };

  const deny = () => {
    window.location.href = "https://www.naver.com";
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-7 md:p-9 shadow-2xl">
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-red-50 flex items-center justify-center">
          <span className="text-red-500 text-3xl font-black">19</span>
        </div>
        <h2 className="text-center text-surface text-xl font-black mb-2">성인 인증 안내</h2>
        <p className="text-center text-sub text-[14px] leading-relaxed mb-6">
          본 사이트는 <span className="font-bold text-surface">만 19세 이상</span>만 이용 가능합니다.
          <br />홀덤은 법적으로 허용된 범위 내에서만 즐기시기 바랍니다.
        </p>
        <div className="bg-[#f9f9f9] rounded-xl p-4 mb-6 text-[12px] text-muted leading-relaxed space-y-1">
          <p>※ 본 사이트는 이벤트/매장 정보 안내 목적이며 도박·사행성 행위를 권장하지 않습니다.</p>
          <p>※ 현금 거래·환전·계좌 정보 등 관련 법령에 위반될 수 있는 행위는 지원하지 않습니다.</p>
          <p>※ 불법 콘텐츠·허위 정보는 자동 필터링 및 관리자 검토 후 삭제됩니다.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={deny}
            className="flex-1 border border-border-custom text-sub font-semibold py-3 rounded-xl hover:bg-[#f5f6f8] transition-all">
            19세 미만 (나가기)
          </button>
          <button onClick={confirm}
            className="flex-1 bg-accent hover:bg-accent-hover text-white font-bold py-3 rounded-xl transition-all">
            19세 이상 입장
          </button>
        </div>
      </div>
    </div>
  );
}
