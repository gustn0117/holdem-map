import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "개인정보처리방침 · 홀덤맵코리아",
  description: "홀덤맵코리아의 개인정보처리방침입니다. 수집 항목, 처리 목적, 보유기간, 이용자의 권리 및 개인정보 보호책임자를 안내합니다.",
  alternates: { canonical: "/privacy" },
};

const EFFECTIVE_DATE = "2026년 7월 1일";
const PRIVACY_OFFICER_EMAIL = "kimdw6621a@gmail.com";

// Cloudflare Scrape Shield는 메일 주소를 "[email protected]"으로 치환한다.
// 개인정보 보호책임자 연락처는 법정 고지 항목이라 <!--email_off--> 로 난독화를 비활성화한다.
const PRIVACY_OFFICER_EMAIL_HTML =
  `<!--email_off--><a href="mailto:${PRIVACY_OFFICER_EMAIL}" class="text-accent font-semibold hover:underline wrap-break-word">${PRIVACY_OFFICER_EMAIL}</a><!--/email_off-->`;

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

const PURPOSES: { title: string; items: string[] }[] = [
  { title: "회원가입 및 회원관리", items: ["회원 식별 및 본인확인", "로그인 서비스 제공", "회원자격 유지 및 관리", "부정 이용 방지"] },
  { title: "서비스 제공", items: ["게시판 운영", "매장 정보 등록 및 관리", "구인·구직 서비스 제공", "포인트 적립 및 관리", "이벤트 운영", "고객 문의 처리"] },
  { title: "상품 및 경품 제공", items: ["포인트샵 상품 배송", "모바일 상품권 발송", "배송 및 교환 처리"] },
  { title: "서비스 개선", items: ["서비스 이용 통계 분석", "오류 개선", "신규 서비스 개발"] },
  { title: "법령 준수 및 분쟁 대응", items: ["민원 처리", "법적 의무 이행", "부정 이용 조사"] },
];

const RETENTION: [string, string][] = [
  ["회원정보", "회원 탈퇴 시까지"],
  ["고객 문의", "처리 완료 후 1년"],
  ["배송 정보", "관련 법령에 따른 보관기간"],
  ["접속기록", "3개월"],
  ["계약 및 결제 관련 정보", "관련 법령에 따른 보관기간"],
];

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
          <h1 className="text-3xl font-extrabold text-surface mb-4">개인정보처리방침</h1>
          <p className="text-sub text-base leading-relaxed mb-2">
            홀덤맵코리아(이하 &quot;회사&quot;)는 「개인정보 보호법」 등 관련 법령을 준수하며,
            이용자의 개인정보를 안전하게 보호하기 위해 다음과 같이 개인정보처리방침을 수립·공개합니다.
          </p>
          <p className="text-muted text-sm mb-8">시행일자: {EFFECTIVE_DATE}</p>

          <div className="space-y-8 text-sub text-base leading-relaxed border-t border-border-custom pt-8">
            <Section title="제1조 (개인정보의 처리 목적)">
              <p>회사는 다음의 목적을 위하여 개인정보를 처리합니다.</p>
              <ol className="list-decimal pl-5 space-y-3 marker:font-semibold marker:text-sub">
                {PURPOSES.map(p => (
                  <li key={p.title}>
                    <span className="font-semibold text-surface">{p.title}</span>
                    <ul className="list-disc pl-5 mt-1 space-y-0.5 text-[15px] marker:text-border-custom">
                      {p.items.map(i => <li key={i}>{i}</li>)}
                    </ul>
                  </li>
                ))}
              </ol>
            </Section>

            <Section title="제2조 (수집하는 개인정보 항목)">
              <p className="font-semibold text-surface">1. 회원가입</p>
              <p className="text-[15px] text-muted">필수항목</p>
              <Bullets items={["아이디", "비밀번호(암호화 저장)", "닉네임", "이메일"]} />
              <p className="text-[15px] text-muted pt-1">선택항목</p>
              <Bullets items={["프로필 이미지", "자기소개"]} />

              <p className="font-semibold text-surface pt-3">2. 자동 수집 항목</p>
              <p>서비스 이용 과정에서 다음 정보가 자동 수집될 수 있습니다.</p>
              <Bullets items={["IP 주소", "쿠키", "접속 로그", "브라우저 정보", "운영체제 정보", "기기 정보", "방문 기록"]} />

              <p className="font-semibold text-surface pt-3">3. 포인트샵 이용</p>
              <Bullets items={["수령인 이름", "연락처", "배송주소(실물 상품)", "주문 내역"]} />

              <p className="font-semibold text-surface pt-3">4. 매장 등록</p>
              <Bullets items={["매장명", "담당자명", "연락처", "카카오톡 ID(선택)", "이메일(선택)", "매장 주소", "매장 소개", "사진 및 동영상"]} />

              <p className="font-semibold text-surface pt-3">5. 광고 문의</p>
              <Bullets items={["업체명", "담당자명", "연락처", "이메일", "문의 내용"]} />

              <p className="font-semibold text-surface pt-3">6. 구인·구직 서비스</p>
              <p className="text-[15px] text-muted">기업</p>
              <Bullets items={["담당자명", "연락처", "이메일"]} />
              <p className="text-[15px] text-muted pt-1">구직자</p>
              <Bullets items={["이름 또는 닉네임", "연락처", "이메일", "이력서(선택)"]} />
            </Section>

            <Section title="제3조 (개인정보의 처리 및 보유기간)">
              <p>회사는 개인정보를 수집 목적이 달성될 때까지 보관하며, 관련 법령에 따라 보관이 필요한 경우에는 해당 기간 동안 보관합니다.</p>
              <div className="overflow-x-auto -mx-2 px-2">
                <table className="w-full text-[15px] border-collapse min-w-80">
                  <thead>
                    <tr className="border-b border-border-custom">
                      <th className="text-left font-bold text-surface py-2 pr-4">구분</th>
                      <th className="text-left font-bold text-surface py-2">보유기간</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RETENTION.map(([k, v]) => (
                      <tr key={k} className="border-b border-border-custom/60">
                        <td className="py-2 pr-4 align-top">{k}</td>
                        <td className="py-2 align-top">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="pt-1">전자상거래 등에서의 소비자보호에 관한 법률 등 관련 법령에 따라 보관이 필요한 경우 해당 기간 동안 보관합니다.</p>
            </Section>

            <Section title="제4조 (개인정보의 제3자 제공)">
              <p>회사는 이용자의 개인정보를 외부에 제공하지 않습니다.</p>
              <p>다만 다음의 경우에는 예외로 합니다.</p>
              <Bullets items={["이용자의 별도 동의를 받은 경우", "법령에 특별한 규정이 있는 경우", "수사기관 등의 적법한 요청이 있는 경우"]} />
            </Section>

            <Section title="제5조 (개인정보 처리의 위탁)">
              <p>회사는 원활한 서비스 제공을 위하여 필요한 경우 개인정보 처리업무를 위탁할 수 있습니다.</p>
              <p className="text-[15px] text-muted">예시</p>
              <Bullets items={["클라우드 서버 운영", "문자 발송 서비스", "이메일 발송 서비스", "모바일 상품권 발송", "택배 배송"]} />
              <p className="text-[15px] text-muted">※ 실제 위탁업체가 확정되면 업체명과 위탁업무를 명시합니다.</p>
            </Section>

            <Section title="제6조 (쿠키의 사용)">
              <p>회사는 이용자에게 보다 편리한 서비스를 제공하기 위하여 쿠키를 사용할 수 있습니다.</p>
              <p>이용자는 브라우저 설정을 통하여 쿠키 저장을 거부할 수 있으나 일부 서비스 이용이 제한될 수 있습니다.</p>
            </Section>

            <Section title="제7조 (이용자의 권리)">
              <p>이용자는 언제든지 다음의 권리를 행사할 수 있습니다.</p>
              <Bullets items={["개인정보 조회", "개인정보 수정", "회원탈퇴", "개인정보 삭제 요청"]} />
              <p>회사는 관련 법령에 따라 지체 없이 처리합니다.</p>
            </Section>

            <Section title="제8조 (개인정보의 파기)">
              <p>회사는 개인정보 보유기간이 종료되거나 처리 목적이 달성된 경우 지체 없이 개인정보를 파기합니다.</p>
              <p>전자적 파일은 복구가 불가능한 방법으로 삭제하며, 종이 문서는 분쇄 또는 소각합니다.</p>
            </Section>

            <Section title="제9조 (개인정보의 안전성 확보조치)">
              <p>회사는 개인정보 보호를 위하여 다음과 같은 조치를 시행합니다.</p>
              <Bullets items={["SSL 암호화 통신", "비밀번호 암호화 저장", "접근권한 최소화", "관리자 접근기록 관리", "보안프로그램 운영", "정기 백업", "내부 관리계획 수립"]} />
            </Section>

            <Section title="제10조 (게시물 관리)">
              <p>회원이 작성한 게시글 및 댓글은 서비스 운영을 위하여 게시될 수 있습니다.</p>
              <p>회원 탈퇴 시 게시물은 서비스 운영 정책에 따라 삭제하거나 작성자를 식별할 수 없는 형태로 처리할 수 있습니다.</p>
              <p>욕설, 허위정보, 타인의 권리를 침해하는 게시물은 운영정책에 따라 삭제될 수 있습니다.</p>
            </Section>

            <Section title="제11조 (포인트 서비스)">
              <p>회사는 포인트 적립 및 사용을 위하여 회원 활동 정보를 처리할 수 있습니다.</p>
              <p>포인트는 서비스 운영정책에 따라 적립·사용되며, 현금으로 환전되거나 회원 간 양도할 수 없습니다.</p>
              <p>부정한 방법으로 적립된 포인트는 회수될 수 있습니다.</p>
            </Section>

            <Section title="제12조 (매장 등록 정보)">
              <p>매장 등록을 위해 제출된 정보는 등록 심사 및 서비스 제공 목적으로만 이용됩니다.</p>
              <p>회사는 등록된 정보가 허위이거나 법령 또는 운영정책에 위반된다고 판단되는 경우 사전 통지 없이 수정 또는 삭제할 수 있습니다.</p>
            </Section>

            <Section title="제13조 (아동의 개인정보)">
              <p>본 서비스는 만 19세 이상 이용자를 대상으로 운영됩니다.</p>
              <p>회사는 만 19세 미만의 개인정보를 의도적으로 수집하지 않습니다.</p>
            </Section>

            <Section title="제14조 (개인정보 보호책임자)">
              <dl className="bg-bg rounded-xl p-5 space-y-1.5 text-[15px]">
                <div className="flex gap-3"><dt className="text-muted w-16 shrink-0">성명</dt><dd className="text-surface font-semibold">김동욱</dd></div>
                <div className="flex gap-3"><dt className="text-muted w-16 shrink-0">직책</dt><dd className="text-surface font-semibold">전무</dd></div>
                <div className="flex gap-3"><dt className="text-muted w-16 shrink-0">이메일</dt>
                  {/* 법정 고지 항목이므로 Cloudflare 이메일 난독화([email protected] 치환)를 email_off로 예외 처리 */}
                  <dd dangerouslySetInnerHTML={{ __html: PRIVACY_OFFICER_EMAIL_HTML }} />
                </div>
                <div className="flex gap-3"><dt className="text-muted w-16 shrink-0">연락처</dt>
                  <dd><a href="tel:0322906423" className="text-accent font-semibold hover:underline">032-290-6423</a></dd>
                </div>
              </dl>
            </Section>

            <Section title="제15조 (개인정보처리방침 변경)">
              <p>본 개인정보처리방침은 법령 또는 서비스 변경에 따라 수정될 수 있으며, 변경되는 경우 홈페이지를 통하여 사전에 공지합니다.</p>
            </Section>

            <Section title="부칙">
              <p>본 개인정보처리방침은 <span className="font-semibold text-surface">{EFFECTIVE_DATE}</span>부터 시행합니다.</p>
            </Section>
          </div>

          <p className="text-muted text-sm mt-10 pt-6 border-t border-border-custom">
            시행일: {EFFECTIVE_DATE} · <Link href="/terms" className="text-accent hover:underline">이용약관 보기</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
