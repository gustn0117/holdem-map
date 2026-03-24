import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-primary border-t border-border-custom mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-5">
              <span className="text-xl font-extrabold gold-text-shine">홀덤맵</span>
            </Link>
            <p className="text-muted text-sm leading-relaxed max-w-52">
              전국 홀덤 매장 정보를 한눈에 확인하고, 가까운 매장을 찾아보세요.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-5 text-base">서비스</h4>
            <div className="flex flex-col gap-3">
              <Link href="/map" className="text-muted hover:text-accent text-base transition-colors">지도 검색</Link>
              <Link href="/events" className="text-muted hover:text-accent text-base transition-colors">대회 일정</Link>
              <Link href="/notices" className="text-muted hover:text-accent text-base transition-colors">공지사항</Link>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-5 text-base">문의</h4>
            <div className="flex flex-col gap-3">
              <Link href="/contact" className="text-muted hover:text-accent text-base transition-colors">매장 등록</Link>
              <Link href="/contact" className="text-muted hover:text-accent text-base transition-colors">광고 문의</Link>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-5 text-base">커뮤니티</h4>
            <div className="flex flex-col gap-3">
              <span className="text-muted text-base">네이버 카페</span>
              <span className="text-muted text-base">인스타그램</span>
            </div>
          </div>
        </div>

        <div className="border-t border-border-custom mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted text-sm">&copy; 2026 홀덤맵. All rights reserved.</p>
          <div className="flex items-center gap-6 text-muted text-sm">
            <Link href="/terms" className="hover:text-accent transition-colors">이용약관</Link>
            <Link href="/privacy" className="hover:text-accent transition-colors">개인정보처리방침</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
