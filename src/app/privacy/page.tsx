import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-10 w-full">
        <div className="flex items-center gap-2 text-sm mb-8">
          <Link href="/" className="text-muted hover:text-accent transition-colors">홈</Link>
          <span className="text-border-custom">/</span>
          <span className="text-sub">개인정보처리방침</span>
        </div>

        <div className="bg-card rounded-xl border border-border-custom p-8 md:p-10">
          <h1 className="text-3xl font-extrabold text-surface mb-8">개인정보처리방침</h1>
          <div className="space-y-8 text-sub text-base leading-relaxed">
            <section><h2 className="text-surface font-bold text-lg mb-3">1. 수집하는 개인정보</h2><p>홀덤맵은 매장 등록 문의 시 다음 정보를 수집할 수 있습니다: 담당자명, 연락처, 매장명, 매장 주소. 서비스 이용 시 별도의 회원가입이나 개인정보 수집은 하지 않습니다.</p></section>
            <section><h2 className="text-surface font-bold text-lg mb-3">2. 개인정보의 이용 목적</h2><p>수집된 정보는 매장 등록 문의 응대 및 서비스 개선을 위해서만 사용됩니다.</p></section>
            <section><h2 className="text-surface font-bold text-lg mb-3">3. 개인정보의 보유 및 파기</h2><p>수집된 개인정보는 문의 처리 완료 후 즉시 파기하며, 별도의 보관을 하지 않습니다.</p></section>
            <section><h2 className="text-surface font-bold text-lg mb-3">4. 제3자 제공</h2><p>홀덤맵은 이용자의 개인정보를 제3자에게 제공하지 않습니다.</p></section>
            <section><h2 className="text-surface font-bold text-lg mb-3">5. 쿠키 사용</h2><p>본 서비스는 사용자 경험 개선을 위해 쿠키를 사용할 수 있습니다.</p></section>
            <section><h2 className="text-surface font-bold text-lg mb-3">6. 문의처</h2><p>개인정보 관련 문의는 매장 등록 문의 페이지를 통해 연락 부탁드립니다.</p></section>
          </div>
          <p className="text-muted text-sm mt-10">시행일: 2026년 3월 24일</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
