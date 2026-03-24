import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-primary border-t border-border-custom/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-linear-to-br from-accent to-accent-light rounded-lg flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <span className="text-base font-bold text-white">홀덤맵</span>
            </div>
            <p className="text-muted text-xs leading-relaxed">
              전국 홀덤 매장 정보를<br />한눈에 확인하세요.
            </p>
          </div>

          <div>
            <h4 className="text-surface font-semibold mb-3 text-xs uppercase tracking-wider">서비스</h4>
            <div className="flex flex-col gap-2">
              <Link href="/map" className="text-muted hover:text-accent-light text-sm transition-colors">지도 검색</Link>
              <Link href="/events" className="text-muted hover:text-accent-light text-sm transition-colors">대회 일정</Link>
            </div>
          </div>

          <div>
            <h4 className="text-surface font-semibold mb-3 text-xs uppercase tracking-wider">안내</h4>
            <div className="flex flex-col gap-2">
              <span className="text-muted text-sm">매장 등록 문의</span>
              <span className="text-muted text-sm">광고 문의</span>
            </div>
          </div>

          <div>
            <h4 className="text-surface font-semibold mb-3 text-xs uppercase tracking-wider">커뮤니티</h4>
            <div className="flex flex-col gap-2">
              <span className="text-muted text-sm">네이버 카페 <span className="text-[10px] text-accent/60">준비중</span></span>
              <span className="text-muted text-sm">인스타그램 <span className="text-[10px] text-accent/60">준비중</span></span>
            </div>
          </div>
        </div>

        <div className="border-t border-border-custom/50 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-muted/60 text-[11px]">&copy; 2026 홀덤맵. All rights reserved.</p>
          <p className="text-muted/40 text-[11px]">본 서비스는 정보 제공 목적이며, 실제 매장 정보와 다를 수 있습니다.</p>
        </div>
      </div>
    </footer>
  );
}
