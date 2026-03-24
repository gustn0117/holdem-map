import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-10 w-full">
        <div className="flex items-center gap-2 text-xs mb-6">
          <Link href="/" className="text-muted hover:text-accent transition-colors">홈</Link>
          <span className="text-border-custom">/</span>
          <span className="text-sub">이용약관</span>
        </div>

        <div className="bg-card rounded-2xl border border-border-custom p-6 md:p-8">
          <h1 className="text-2xl font-bold text-white mb-6">이용약관</h1>
          <div className="space-y-6 text-sub text-sm leading-relaxed">
            <section>
              <h2 className="text-white font-semibold mb-2">제1조 (목적)</h2>
              <p>본 약관은 홀덤맵(이하 &quot;서비스&quot;)의 이용조건 및 절차, 이용자와 서비스 제공자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
            </section>
            <section>
              <h2 className="text-white font-semibold mb-2">제2조 (서비스의 내용)</h2>
              <p>서비스는 홀덤 매장의 위치, 영업시간, 대회 일정 등 매장 정보를 제공하는 정보 플랫폼입니다. 서비스에 게시된 정보는 참고용이며, 실제 매장 상황과 다를 수 있습니다.</p>
            </section>
            <section>
              <h2 className="text-white font-semibold mb-2">제3조 (면책조항)</h2>
              <p>서비스는 매장 정보의 정확성을 보장하지 않으며, 이용자가 서비스에 게시된 정보를 기반으로 한 행동에 대해 책임을 지지 않습니다. 매장 방문 전 해당 매장에 직접 확인하시기 바랍니다.</p>
            </section>
            <section>
              <h2 className="text-white font-semibold mb-2">제4조 (지적재산권)</h2>
              <p>서비스에 포함된 모든 콘텐츠(텍스트, 이미지, 디자인 등)에 대한 저작권은 홀덤맵에 있으며, 무단 복제 및 배포를 금지합니다.</p>
            </section>
            <section>
              <h2 className="text-white font-semibold mb-2">제5조 (약관의 변경)</h2>
              <p>서비스는 필요한 경우 약관을 변경할 수 있으며, 변경된 약관은 서비스 내 공지사항을 통해 고지합니다.</p>
            </section>
          </div>
          <p className="text-muted text-xs mt-8">시행일: 2026년 3월 24일</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
