import Link from "next/link";
import JsonLdScript from "@/components/JsonLd";
import { faqSchema } from "@/lib/schema";

const FAQS: Array<{ q: string; a: string }> = [
  { q: "홀덤펍 이용은 합법인가요?", a: "국내 홀덤펍은 사행행위가 아닌 스포츠·여가 목적의 매장으로 운영되며, 현금 판돈이 오가지 않는 방식으로 운영됩니다. 자세한 운영 기준은 각 매장 안내를 따라주세요." },
  { q: "홀덤 토너먼트 참가는 어떻게 하나요?", a: "홀덤맵코리아의 토너먼트 페이지에서 일정을 확인하고 매장별 선착순 신청을 진행하실 수 있습니다. 무료 참가권 이벤트는 가입 안내를 참고하세요." },
  { q: "홀덤 딜러가 되려면 어떻게 해야 하나요?", a: "대부분의 매장은 자체 교육 프로그램(2~4주)을 운영하며, 신입 딜러도 채용합니다. 구인구직 페이지에서 교육 가능·신입 가능 공고를 확인하세요." },
  { q: "홀덤펍 입장 조건은 어떻게 되나요?", a: "만 19세 이상 성인부터 입장 가능하며, 신분증 확인이 필수입니다. 일부 매장은 드레스코드나 회원제로 운영되니 방문 전 매장에 문의해 주세요." },
];

const REGIONS = ["서울", "경기", "인천", "부산", "대구", "대전", "광주", "울산", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"];

const KEYWORDS = [
  "강남 홀덤펍", "홍대 홀덤펍", "송도 홀덤펍", "부평 홀덤펍",
  "해운대 홀덤펍", "서면 홀덤펍", "동성로 홀덤펍", "둔산 홀덤펍",
  "홀덤 토너먼트 일정", "홀덤 딜러 구인", "홀덤 딜러 채용", "텍사스 홀덤",
];

export default function HomeSeoSection() {
  return (
    <section className="bg-white border-t border-border-custom">
      <div className="max-w-350 mx-auto px-5 md:px-10 py-10 md:py-14">
        <header className="mb-6 md:mb-8">
          <h2 className="text-surface text-xl md:text-2xl font-black mb-2">전국 홀덤펍 찾기 · 홀덤맵코리아</h2>
          <p className="text-sub text-[14px] md:text-[15px] leading-relaxed">
            <strong className="text-surface">홀덤맵코리아</strong>는 전국의 홀덤펍 정보를 한 곳에서 제공하는 무료 플랫폼입니다.
            서울, 인천, 부산, 대구, 대전 등 전국 주요 도시의 <strong className="text-surface">텍사스 홀덤 매장</strong>을
            지도에서 한눈에 검색하고, <strong className="text-surface">토너먼트 일정</strong>·
            <strong className="text-surface">홀덤 딜러 구인구직</strong>·<strong className="text-surface">실시간 매장 정보</strong>까지
            확인할 수 있습니다.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8">
          <article>
            <h3 className="text-surface text-[16px] md:text-[17px] font-bold mb-2 flex items-center gap-2">
              <span className="inline-block w-1.5 h-4 bg-accent rounded-sm" />
              전국 홀덤펍 매장 검색
            </h3>
            <p className="text-sub text-[14px] leading-relaxed">
              지역·노선·키워드로 가까운 홀덤펍을 찾고, 매장별 영업시간·바이인·블라인드·이벤트·연락처를 비교해 보세요.
              지도를 통해 현 위치에서 가장 가까운 홀덤 매장을 빠르게 확인할 수 있습니다.
              초보 환영·교육 가능 매장, 24시간 운영 매장, 토너먼트 전문 매장까지 한 번에 비교 가능합니다.
            </p>
          </article>
          <article>
            <h3 className="text-surface text-[16px] md:text-[17px] font-bold mb-2 flex items-center gap-2">
              <span className="inline-block w-1.5 h-4 bg-accent rounded-sm" />
              홀덤 토너먼트 일정
            </h3>
            <p className="text-sub text-[14px] leading-relaxed">
              전국 홀덤펍에서 열리는 데일리 토너먼트, 위클리 새틀라이트, 메인 이벤트까지
              일정과 GTD 상금, 바이인을 한눈에 확인할 수 있습니다.
              무료 참가권 이벤트와 선착순 참가 신청도 홀덤맵코리아에서 바로 신청할 수 있습니다.
            </p>
          </article>
          <article>
            <h3 className="text-surface text-[16px] md:text-[17px] font-bold mb-2 flex items-center gap-2">
              <span className="inline-block w-1.5 h-4 bg-accent rounded-sm" />
              홀덤 딜러 구인구직
            </h3>
            <p className="text-sub text-[14px] leading-relaxed">
              전국 홀덤펍의 <strong className="text-surface">딜러·서빙·매니저 구인</strong> 정보와
              구직자 프로필을 실시간으로 매칭합니다. 지역별·경력별·근무 형태별로 필터링하여
              원하는 자리를 빠르게 찾고, 사장님은 적합한 딜러를 바로 컨택할 수 있습니다.
            </p>
          </article>
          <article>
            <h3 className="text-surface text-[16px] md:text-[17px] font-bold mb-2 flex items-center gap-2">
              <span className="inline-block w-1.5 h-4 bg-accent rounded-sm" />
              홀덤 커뮤니티 · 정보
            </h3>
            <p className="text-sub text-[14px] leading-relaxed">
              홀덤 입문자를 위한 족보·포지션·기본 전략부터 경험자를 위한 GTO·ICM·3베팅·4베팅 전략까지,
              실전에 바로 쓸 수 있는 정보를 공유합니다.
              매장 후기·딜러 후기·토너먼트 후기를 통해 처음 가는 매장도 미리 분위기를 파악할 수 있습니다.
            </p>
          </article>
        </div>

        <div className="mb-8">
          <h3 className="text-surface text-[16px] md:text-[17px] font-bold mb-3">지역별 홀덤펍 바로가기</h3>
          <div className="flex flex-wrap gap-2">
            {REGIONS.map(name => (
              <Link key={name} href={`/region/${encodeURIComponent(name)}`}
                className="inline-flex items-center gap-1 bg-bg hover:bg-accent/10 hover:text-accent text-sub text-[13px] font-semibold px-3 py-1.5 rounded-full transition-colors">
                {name} 홀덤펍
              </Link>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-surface text-[16px] md:text-[17px] font-bold mb-3">자주 찾는 검색어</h3>
          <div className="flex flex-wrap gap-2">
            {KEYWORDS.map(k => (
              <Link key={k} href={`/search?q=${encodeURIComponent(k)}`}
                className="inline-flex items-center gap-1 border border-border-custom hover:border-accent hover:text-accent text-muted text-[12px] px-2.5 py-1 rounded-full transition-colors">
                #{k}
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-[#fafbfc] border border-border-custom rounded-2xl p-5 md:p-6">
          <h3 className="text-surface text-[16px] md:text-[17px] font-bold mb-3">자주 묻는 질문 (FAQ)</h3>
          <div className="space-y-4 text-[14px] leading-relaxed">
            {FAQS.map((f, i) => (
              <div key={i}>
                <p className="text-surface font-bold mb-1">Q. {f.q}</p>
                <p className="text-muted">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
        <JsonLdScript data={faqSchema(FAQS)} />

        <p className="text-muted text-[12px] mt-6 leading-relaxed">
          홀덤맵코리아는 매장 정보·토너먼트·구인구직 정보를 공유하는 정보 제공 플랫폼이며,
          매장 운영·모집·정산 등 일체에 관여하지 않습니다. 모든 이용은 만 19세 이상 성인만 가능하며,
          관련 법령에 위반될 수 있는 행위는 지원하지 않습니다.
        </p>
      </div>
    </section>
  );
}
