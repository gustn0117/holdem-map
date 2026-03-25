import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-border-custom mt-auto">
      <div className="max-w-350 mx-auto px-5 md:px-10 py-8">
        <div className="flex flex-col md:flex-row md:items-start gap-8 md:gap-16">
          <div className="shrink-0">
            <Link href="/" className="text-lg font-black text-accent">홀덤맵</Link>
            <p className="text-muted text-[13px] mt-2 max-w-[240px] leading-relaxed">전국 홀덤 매장 정보를 한눈에 확인하세요.</p>
          </div>
          <div className="flex gap-12 md:gap-16 flex-wrap flex-1">
            <div>
              <h4 className="text-surface font-bold text-[13px] mb-2.5">서비스</h4>
              <div className="flex flex-col gap-1.5">
                {[{ href: "/map", label: "지도 검색" }, { href: "/events", label: "대회 일정" }, { href: "/jobs", label: "구인구직" }, { href: "/shorts", label: "숏츠" }, { href: "/notices", label: "공지사항" }].map(l => (
                  <Link key={l.href} href={l.href} className="text-muted hover:text-accent text-[13px] transition-colors">{l.label}</Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-surface font-bold text-[13px] mb-2.5">문의</h4>
              <div className="flex flex-col gap-1.5">
                <Link href="/contact" className="text-muted hover:text-accent text-[13px] transition-colors">매장 등록</Link>
                <Link href="/contact" className="text-muted hover:text-accent text-[13px] transition-colors">광고 문의</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-border-custom mt-6 pt-5 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-[#ccc] text-[12px]">&copy; 2026 홀덤맵</p>
          <div className="flex items-center gap-3 text-[#ccc] text-[12px]">
            <Link href="/terms" className="hover:text-muted transition-colors">이용약관</Link>
            <Link href="/privacy" className="hover:text-muted transition-colors">개인정보처리방침</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
