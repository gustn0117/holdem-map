import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#fafafa] border-t border-border-custom mt-auto">
      <div className="container-main py-10">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 md:gap-6">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4">
            <Link href="/" className="flex items-center gap-1.5">
              <svg className="w-7 h-7" viewBox="0 0 36 36" fill="none">
                <rect width="36" height="36" rx="8" fill="#03C75A" />
                <path d="M10 10h4v6.5l8-6.5h4v16h-4v-6.5l-8 6.5h-4V10z" fill="white" />
              </svg>
              <span className="text-[17px] font-black text-surface">홀덤맵코리아</span>
            </Link>
            <p className="text-muted text-[13px] mt-3 leading-relaxed max-w-[280px]">전국 홀덤 매장 정보를 한눈에 확인하고, 가까운 매장을 찾아보세요.</p>
          </div>

          {/* Services */}
          <div className="md:col-span-2">
            <h4 className="text-surface font-bold text-[13px] mb-3">서비스</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/map" className="text-muted hover:text-accent text-[13px] transition-colors">지도 검색</Link>
              <Link href="/events" className="text-muted hover:text-accent text-[13px] transition-colors">대회 일정</Link>
              <Link href="/shorts" className="text-muted hover:text-accent text-[13px] transition-colors">숏츠</Link>
            </nav>
          </div>

          {/* Community */}
          <div className="md:col-span-2">
            <h4 className="text-surface font-bold text-[13px] mb-3">커뮤니티</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/jobs" className="text-muted hover:text-accent text-[13px] transition-colors">구인구직</Link>
              <Link href="/notices" className="text-muted hover:text-accent text-[13px] transition-colors">공지사항</Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="md:col-span-2">
            <h4 className="text-surface font-bold text-[13px] mb-3">문의</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/contact" className="text-muted hover:text-accent text-[13px] transition-colors">매장 등록</Link>
              <Link href="/contact" className="text-muted hover:text-accent text-[13px] transition-colors">광고 문의</Link>
            </nav>
          </div>

          {/* Legal */}
          <div className="md:col-span-2">
            <h4 className="text-surface font-bold text-[13px] mb-3">약관</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/terms" className="text-muted hover:text-accent text-[13px] transition-colors">이용약관</Link>
              <Link href="/privacy" className="text-muted hover:text-accent text-[13px] transition-colors">개인정보처리방침</Link>
            </nav>
          </div>
        </div>

        <div className="border-t border-border-custom mt-8 pt-5">
          <p className="text-[#ccc] text-[12px]">&copy; 2026 홀덤맵코리아. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
