import type { NewsItem } from "../types";

// VITE_NEWS_PROXY_URL이 설정되지 않았을 때 화면 확인용으로 쓰는 샘플 데이터예요.
// 실제 서비스에서는 worker(네이버 뉴스 API 프록시)에서 받아온 데이터로 대체돼요.

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

export const MOCK_NEWS_ITEMS: NewsItem[] = [
  {
    id: "mock-1",
    category: "economy",
    title: "한국은행, 기준금리 3연속 동결…물가 안정에 무게",
    description:
      "한국은행 금융통화위원회가 기준금리를 현 수준에서 동결했어요. 최근 물가 상승세가 둔화되면서 당분간 관망하겠다는 뜻으로 풀이돼요.",
    link: "https://news.naver.com",
    source: "news.naver.com",
    publishedAt: minutesAgo(12),
  },
  {
    id: "mock-2",
    category: "it",
    title: "국내 스타트업, 온디바이스 AI 반도체 시제품 공개",
    description:
      "한 국내 스타트업이 스마트폰에서 별도 서버 없이 AI 연산을 처리하는 저전력 반도체 시제품을 선보였어요.",
    link: "https://news.naver.com",
    source: "news.naver.com",
    publishedAt: minutesAgo(28),
  },
  {
    id: "mock-3",
    category: "society",
    title: "수도권 출퇴근길 지하철 배차 간격 단축 시범 운영",
    description:
      "다음 주부터 수도권 일부 지하철 노선에서 출퇴근 시간대 배차 간격을 기존보다 20% 줄이는 시범 운영이 시작돼요.",
    link: "https://news.naver.com",
    source: "news.naver.com",
    publishedAt: minutesAgo(45),
  },
  {
    id: "mock-4",
    category: "sports",
    title: "프로야구 가을야구 매직넘버 3으로 줄어",
    description:
      "어젯밤 경기에서 승리하며 선두팀의 정규시즌 우승 매직넘버가 3으로 줄었어요.",
    link: "https://news.naver.com",
    source: "news.naver.com",
    publishedAt: minutesAgo(60),
  },
  {
    id: "mock-5",
    category: "politics",
    title: "국회, 저출생 대응 특별법 본회의 통과",
    description:
      "육아휴직 확대와 주거 지원을 뼈대로 한 저출생 대응 특별법이 국회 본회의를 통과했어요.",
    link: "https://news.naver.com",
    source: "news.naver.com",
    publishedAt: minutesAgo(75),
  },
  {
    id: "mock-6",
    category: "entertainment",
    title: "인기 드라마 시즌2 제작 확정, 내년 상반기 공개",
    description:
      "지난 시즌 화제를 모은 드라마의 시즌2 제작이 공식 확정됐어요. 원작 배우진이 대부분 복귀해요.",
    link: "https://news.naver.com",
    source: "news.naver.com",
    publishedAt: minutesAgo(95),
  },
  {
    id: "mock-7",
    category: "economy",
    title: "원·달러 환율 5개월 만에 1,300원대로 하락",
    description:
      "미국 금리 인하 기대감이 커지며 원·달러 환율이 5개월 만에 1,300원대로 하락했어요.",
    link: "https://news.naver.com",
    source: "news.naver.com",
    publishedAt: minutesAgo(110),
  },
  {
    id: "mock-8",
    category: "it",
    title: "생성형 AI 서비스, 국내 이용자 수 1천만 명 돌파",
    description:
      "국내 주요 생성형 AI 서비스의 월간 이용자 수가 처음으로 1천만 명을 돌파했어요.",
    link: "https://news.naver.com",
    source: "news.naver.com",
    publishedAt: minutesAgo(130),
  },
];
