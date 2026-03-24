import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-primary/80 border-t border-white/[0.04] mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 bg-linear-to-br from-accent to-accent-light rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-[10px]">H</span>
              </div>
              <span className="text-sm font-bold text-white">홀덤맵</span>
            </div>
            <p className="text-muted/40 text-xs leading-relaxed max-w-48">
              전국 홀덤 매장 정보를 한눈에 확인하고, 가까운 매장을 찾아보세요.
            </p>
          </div>

          <div>
            <h4 className="text-white/30 font-semibold mb-4 text-[10px] uppercase tracking-[0.15em]">서비스</h4>
            <div className="flex flex-col gap-2.5">
              <Link href="/map" className="text-muted/50 hover:text-accent-light text-sm transition-colors">지도 검색</Link>
              <Link href="/events" className="text-muted/50 hover:text-accent-light text-sm transition-colors">대회 일정</Link>
              <span className="text-muted/25 text-sm">매장 비교 <span className="text-[9px] text-accent/30 ml-1">SOON</span></span>
            </div>
          </div>

          <div>
            <h4 className="text-white/30 font-semibold mb-4 text-[10px] uppercase tracking-[0.15em]">문의</h4>
            <div className="flex flex-col gap-2.5">
              <span className="text-muted/50 text-sm">매장 등록</span>
              <span className="text-muted/50 text-sm">광고 문의</span>
              <span className="text-muted/50 text-sm">제휴 제안</span>
            </div>
          </div>

          <div>
            <h4 className="text-white/30 font-semibold mb-4 text-[10px] uppercase tracking-[0.15em]">커뮤니티</h4>
            <div className="flex flex-col gap-2.5">
              <span className="text-muted/25 text-sm">네이버 카페 <span className="text-[9px] text-accent/30 ml-1">SOON</span></span>
              <span className="text-muted/25 text-sm">인스타그램 <span className="text-[9px] text-accent/30 ml-1">SOON</span></span>
              <span className="text-muted/25 text-sm">카카오톡 <span className="text-[9px] text-accent/30 ml-1">SOON</span></span>
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.04] mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-muted/20 text-[11px]">&copy; 2026 홀덤맵. All rights reserved.</p>
          <div className="flex items-center gap-4 text-muted/20 text-[11px]">
            <span className="hover:text-muted/40 transition-colors cursor-pointer">이용약관</span>
            <span className="hover:text-muted/40 transition-colors cursor-pointer">개인정보처리방침</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
