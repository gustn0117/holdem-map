import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-primary border-t border-border-custom mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center text-white font-bold text-xs">
                H
              </div>
              <span className="text-lg font-bold text-white">
                홀덤<span className="text-accent">맵</span>
              </span>
            </div>
            <p className="text-muted text-sm leading-relaxed">
              전국 홀덤 매장을 지도에서 한눈에!
              <br />
              위치, 영업시간, 대회 정보까지 확인하세요.
            </p>
          </div>

          <div>
            <h4 className="text-surface font-semibold mb-4 text-sm">
              바로가기
            </h4>
            <div className="flex flex-col gap-2">
              <Link
                href="/"
                className="text-muted hover:text-accent text-sm transition-colors"
              >
                홈
              </Link>
              <Link
                href="/map"
                className="text-muted hover:text-accent text-sm transition-colors"
              >
                지도검색
              </Link>
              <Link
                href="/events"
                className="text-muted hover:text-accent text-sm transition-colors"
              >
                대회/이벤트
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-surface font-semibold mb-4 text-sm">
              외부 링크
            </h4>
            <div className="flex flex-col gap-2">
              <span className="text-muted text-sm">네이버 카페 (준비중)</span>
              <span className="text-muted text-sm">인스타그램 (준비중)</span>
              <span className="text-muted text-sm">카카오톡 채널 (준비중)</span>
            </div>
          </div>
        </div>

        <div className="border-t border-border-custom mt-8 pt-6 text-center">
          <p className="text-muted text-xs">
            &copy; 2026 홀덤맵. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
