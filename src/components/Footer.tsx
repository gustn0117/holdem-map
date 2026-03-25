import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#fafafa] border-t border-border-custom mt-auto">
      <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <Link href="/" className="text-xl font-black text-accent inline-block mb-3">홀덤맵</Link>
            <p className="text-muted text-[13px] leading-relaxed max-w-xs">전국 홀덤 매장 정보를 한눈에 확인하고, 가까운 매장을 찾아보세요.</p>
          </div>
          <div>
            <h4 className="text-surface font-bold mb-3 text-[13px]">서비스</h4>
            <div className="flex flex-col gap-2">
              <Link href="/map" className="text-muted hover:text-accent text-[13px] transition-colors">지도 검색</Link>
              <Link href="/events" className="text-muted hover:text-accent text-[13px] transition-colors">대회 일정</Link>
              <Link href="/jobs" className="text-muted hover:text-accent text-[13px] transition-colors">구인구직</Link>
              <Link href="/shorts" className="text-muted hover:text-accent text-[13px] transition-colors">숏츠</Link>
            </div>
          </div>
          <div>
            <h4 className="text-surface font-bold mb-3 text-[13px]">정보</h4>
            <div className="flex flex-col gap-2">
              <Link href="/notices" className="text-muted hover:text-accent text-[13px] transition-colors">공지사항</Link>
              <Link href="/contact" className="text-muted hover:text-accent text-[13px] transition-colors">매장 등록</Link>
              <Link href="/contact" className="text-muted hover:text-accent text-[13px] transition-colors">광고 문의</Link>
            </div>
          </div>
          <div>
            <h4 className="text-surface font-bold mb-3 text-[13px]">커뮤니티</h4>
            <div className="flex flex-col gap-2">
              <span className="text-muted text-[13px]">네이버 카페</span>
              <span className="text-muted text-[13px]">인스타그램</span>
            </div>
          </div>
        </div>
        <div className="border-t border-border-custom mt-8 pt-5 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-muted text-[12px]">&copy; 2026 홀덤맵. All rights reserved.</p>
          <div className="flex items-center gap-4 text-muted text-[12px]">
            <Link href="/terms" className="hover:text-accent transition-colors">이용약관</Link>
            <Link href="/privacy" className="hover:text-accent transition-colors">개인정보처리방침</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
