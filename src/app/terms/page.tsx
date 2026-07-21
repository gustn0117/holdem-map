import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "이용약관 · 홀덤맵코리아",
  description: "홀덤맵코리아 서비스 이용약관입니다. 회원가입, 게시물·매장 등록, 광고, 포인트 서비스 및 면책사항을 안내합니다.",
  alternates: { canonical: "/terms" },
};

const EFFECTIVE_DATE = "2026년 7월 1일";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-surface font-bold text-lg mb-3">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="list-disc pl-5 space-y-1 marker:text-border-custom">
      {items.map(t => <li key={t}>{t}</li>)}
    </ul>
  );
}

function Numbered({ items }: { items: string[] }) {
  return (
    <ol className="list-decimal pl-5 space-y-1 marker:text-sub">
      {items.map(t => <li key={t}>{t}</li>)}
    </ol>
  );
}

const DEFINITIONS: [string, string][] = [
  ["서비스", "회사가 운영하는 홀덤맵코리아 웹사이트 및 관련 서비스를 말합니다."],
  ["회원", "본 약관에 동의하고 회원가입을 완료한 자를 말합니다."],
  ["매장회원", "매장 정보를 등록하거나 광고를 신청하는 회원을 말합니다."],
  ["게시물", "회원이 작성한 글, 댓글, 사진, 동영상 등을 의미합니다."],
  ["포인트", "회사가 운영하는 서비스 내에서 적립 및 사용할 수 있는 서비스 포인트를 의미합니다."],
];

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-10 w-full">
        <div className="flex items-center gap-2 text-sm mb-8">
          <Link href="/" className="text-muted hover:text-accent transition-colors">홈</Link>
          <span className="text-border-custom">/</span>
          <span className="text-sub">이용약관</span>
        </div>

        <div className="bg-card rounded-xl border border-border-custom p-8 md:p-10">
          <h1 className="text-3xl font-extrabold text-surface mb-4">홀덤맵코리아 이용약관</h1>
          <p className="text-muted text-sm mb-3">시행일자: {EFFECTIVE_DATE}</p>
          <p className="text-sub text-base leading-relaxed mb-8">
            본 약관은 홀덤맵코리아(이하 &quot;회사&quot;)가 제공하는 인터넷 서비스{" "}
            <a href="https://holdemmapkorea.com" className="text-accent hover:underline wrap-break-word">https://holdemmapkorea.com</a>
            의 이용과 관련하여 회사와 회원의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
          </p>

          <div className="space-y-8 text-sub text-base leading-relaxed border-t border-border-custom pt-8">
            <Section title="제1조 (목적)">
              <p>본 약관은 회사가 제공하는 홀덤맵코리아 서비스의 이용조건 및 절차, 회원과 회사의 권리·의무 및 책임사항 등을 규정함을 목적으로 합니다.</p>
            </Section>

            <Section title="제2조 (정의)">
              <ol className="list-decimal pl-5 space-y-1.5 marker:text-sub">
                {DEFINITIONS.map(([term, desc]) => (
                  <li key={term}>
                    <span className="font-semibold text-surface">{term}</span>이란 {desc}
                  </li>
                ))}
              </ol>
            </Section>

            <Section title="제3조 (약관의 효력 및 변경)">
              <p>회사는 관련 법령을 위반하지 않는 범위에서 약관을 변경할 수 있으며, 변경 시 홈페이지를 통해 사전에 공지합니다.</p>
              <p>변경된 약관에 동의하지 않을 경우 회원은 탈퇴할 수 있습니다.</p>
            </Section>

            <Section title="제4조 (회원가입)">
              <p>회원은 회사가 정한 절차에 따라 회원가입을 신청할 수 있습니다.</p>
              <p>회사는 다음의 경우 가입을 거부하거나 사후 취소할 수 있습니다.</p>
              <Bullets items={["허위 정보를 입력한 경우", "타인의 정보를 도용한 경우", "관련 법령을 위반한 경우", "서비스 운영을 방해할 목적인 경우"]} />
            </Section>

            <Section title="제5조 (회원의 의무)">
              <p>회원은 다음 행위를 하여서는 안 됩니다.</p>
              <Numbered items={["타인의 개인정보 도용", "허위 게시물 작성", "욕설·비방·명예훼손", "음란물 게시", "저작권 침해", "해킹 및 서비스 공격", "불법 광고", "자동 프로그램 이용", "기타 관련 법령 위반"]} />
            </Section>

            <Section title="제6조 (서비스의 제공)">
              <p>회사는 다음 서비스를 제공합니다.</p>
              <Bullets items={["전국 홀덤 매장 정보 제공", "커뮤니티", "자유게시판", "홀덤 전략 게시판", "구인·구직", "매장 등록", "광고 서비스", "포인트 서비스", "이벤트", "기타 회사가 제공하는 서비스"]} />
              <p>회사는 서비스의 일부를 변경하거나 종료할 수 있습니다.</p>
            </Section>

            <Section title="제7조 (게시물의 관리)">
              <p>회원이 작성한 게시물의 책임은 작성자에게 있습니다.</p>
              <p>회사는 다음 게시물을 사전 통보 없이 삭제할 수 있습니다.</p>
              <Bullets items={["허위 사실", "명예훼손", "욕설", "음란물", "광고성 게시물", "개인정보 노출", "불법 도박 홍보", "현금 환전 유도", "불법 토토·카지노 홍보", "법령 위반 게시물"]} />
            </Section>

            <Section title="제8조 (매장 등록)">
              <p>매장 등록 회원은 사실에 근거한 정보를 등록하여야 합니다.</p>
              <p>회사는 다음의 경우 등록을 거부하거나 삭제할 수 있습니다.</p>
              <Bullets items={["허위 매장", "허위 이벤트", "허위 연락처", "불법 영업", "타인의 상표권 침해", "기타 회사 정책 위반"]} />
              <p>회사는 등록된 매장의 영업행위나 운영방식에 대하여 보증하지 않습니다.</p>
            </Section>

            <Section title="제9조 (광고 서비스)">
              <p>회사는 광고 신청 내용을 심사한 후 게재 여부를 결정합니다.</p>
              <p>다음 광고는 게재를 거부하거나 삭제할 수 있습니다.</p>
              <Bullets items={["불법 도박", "사설 카지노", "환전", "불법 금융", "불법 대출", "음란물", "허위 광고", "기타 관련 법령 위반"]} />
              <p>광고 내용의 책임은 광고주에게 있습니다.</p>
            </Section>

            <Section title="제10조 (포인트 서비스)">
              <p>회사는 회원 활동에 따라 포인트를 지급할 수 있습니다.</p>
              <p>포인트는 다음과 같습니다.</p>
              <Bullets items={["현금으로 환전할 수 없습니다.", "회원 간 양도할 수 없습니다.", "담보로 사용할 수 없습니다.", "회사 정책에 따라 소멸될 수 있습니다.", "부정 적립 시 회수될 수 있습니다."]} />
              <p>회사는 포인트 정책을 변경할 수 있습니다.</p>
            </Section>

            <Section title="제11조 (구인·구직)">
              <p>회원은 사실에 근거한 채용 정보를 등록하여야 합니다.</p>
              <p>다음 정보는 등록할 수 없습니다.</p>
              <Bullets items={["허위 채용", "불법 영업", "사행성 업소", "미성년자 고용", "차별적 채용", "개인정보 과다 요구"]} />
              <p>회사는 이를 발견할 경우 즉시 삭제할 수 있습니다.</p>
            </Section>

            <Section title="제12조 (서비스 이용 제한)">
              <p>회사는 다음의 경우 회원의 서비스 이용을 제한할 수 있습니다.</p>
              <Bullets items={["약관 위반", "반복적인 신고", "불법 프로그램 사용", "포인트 부정 적립", "게시판 도배", "타인의 권리 침해", "법령 위반"]} />
              <p>필요한 경우 회원 계정을 영구 정지할 수 있습니다.</p>
            </Section>

            <Section title="제13조 (면책사항)">
              <p>회사는 회원 또는 매장회원이 등록한 정보의 정확성이나 적법성을 보증하지 않습니다.</p>
              <p>매장 이용, 이벤트 참여, 상품 제공 등은 해당 매장 또는 운영자의 책임입니다.</p>
              <p>회사는 회원 간 거래 및 분쟁에 개입하지 않으며 이에 대한 책임을 지지 않습니다.</p>
            </Section>

            <Section title="제14조 (도박 관련 안내)">
              <p>홀덤맵코리아는 홀덤 관련 정보 및 커뮤니티 서비스를 제공하는 플랫폼입니다.</p>
              <p>회사는 회원에게 불법 도박, 현금 환전, 사설 카지노 운영 또는 기타 법령에 위반되는 행위를 권유하거나 중개하지 않습니다.</p>
              <p>회원은 대한민국 법령을 준수하여 서비스를 이용하여야 하며, 불법적인 목적의 이용은 금지됩니다.</p>
              <p>회사는 관련 법령 또는 운영정책에 위반되는 게시물 및 매장 정보를 발견하는 경우 사전 통지 없이 삭제하거나 서비스 이용을 제한할 수 있습니다.</p>
            </Section>

            <Section title="제15조 (지식재산권)">
              <p>서비스의 디자인, 로고, 이미지, 프로그램 및 콘텐츠에 대한 저작권은 회사 또는 정당한 권리자에게 있습니다.</p>
              <p>회원은 회사의 사전 동의 없이 이를 복제, 배포 또는 상업적으로 이용할 수 없습니다.</p>
            </Section>

            <Section title="제16조 (개인정보 보호)">
              <p>회사는 회원의 개인정보를 개인정보처리방침에 따라 처리합니다.</p>
              <p>
                개인정보처리방침은 별도로 공개합니다.{" "}
                <Link href="/privacy" className="text-accent font-semibold hover:underline">개인정보처리방침 보기</Link>
              </p>
            </Section>

            <Section title="제17조 (분쟁 해결)">
              <p>회사와 회원 간 분쟁이 발생한 경우 상호 협의를 통해 해결하도록 노력합니다.</p>
              <p>협의가 이루어지지 않는 경우 대한민국 법률을 적용하며, 회사의 본점 소재지를 관할하는 법원을 전속 관할법원으로 합니다.</p>
            </Section>

            <Section title="부칙">
              <p>본 약관은 <span className="font-semibold text-surface">{EFFECTIVE_DATE}</span>부터 시행합니다.</p>
            </Section>
          </div>

          <p className="text-muted text-sm mt-10 pt-6 border-t border-border-custom">
            시행일: {EFFECTIVE_DATE} · <Link href="/privacy" className="text-accent hover:underline">개인정보처리방침 보기</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
