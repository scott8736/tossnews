export interface Env {
  NAVER_CLIENT_ID: string;
  NAVER_CLIENT_SECRET: string;
  // 콘솔에서 배포한 미니앱 도메인만 허용하고 싶으면 wrangler.toml에 vars로 추가해서 사용하세요.
  ALLOWED_ORIGIN?: string;
}

interface NaverNewsItem {
  title: string;
  originallink: string;
  link: string;
  description: string;
  pubDate: string;
}

interface CategoryRule {
  // 네이버 검색에 보낼 검색어들. 한 단어("정치")만 넣으면 그 단어가 들어간
  // 아무 기사나 섞여서, 분야를 대표하는 검색어 여러 개로 모아요.
  queries: string[];
  // 제목에 이 중 하나라도 있어야 그 분야 기사로 인정해요.
  // null 이면 제목 검사를 하지 않아요.
  titleKeywords: string[] | null;
}

const CATEGORY_RULES: Record<string, CategoryRule> = {
  breaking: {
    queries: ["속보"],
    titleKeywords: ["속보"],
  },
  politics: {
    queries: ["국회", "대통령실", "여야", "국민의힘 민주당"],
    titleKeywords: [
      "국회", "대통령", "대통령실", "여당", "야당", "與", "野", "민주당", "국민의힘",
      "의원", "총리", "장관", "정부", "선거", "탄핵", "외교", "북한", "국무", "정당",
      "개헌", "법안", "청문회", "정상회담", "李", "尹",
    ],
  },
  economy: {
    queries: ["금리", "코스피", "환율", "부동산", "물가"],
    titleKeywords: [
      "금리", "코스피", "코스닥", "환율", "부동산", "아파트", "물가", "증시", "주가",
      "한은", "한국은행", "수출", "경제", "GDP", "실적", "반도체", "유가", "대출",
      "집값", "세금", "연금", "달러", "원화", "관세", "투자", "매출", "적자", "흑자",
    ],
  },
  society: {
    queries: ["경찰", "법원 판결", "사고", "날씨"],
    titleKeywords: [
      "경찰", "검찰", "법원", "재판", "사고", "화재", "사망", "숨져", "구속", "기소",
      "수사", "학교", "교육", "날씨", "기온", "비", "의료", "병원", "혐의", "판결",
      "징역", "체포", "실종", "지진", "태풍",
    ],
  },
  it: {
    queries: ["인공지능 AI", "반도체", "스마트폰", "과학 연구"],
    titleKeywords: [
      "AI", "인공지능", "반도체", "스마트폰", "갤럭시", "아이폰", "앱", "플랫폼",
      "과학", "우주", "로봇", "통신", "네이버", "카카오", "구글", "오픈AI", "챗GPT",
      "배터리", "노벨", "엔비디아", "삼성전자", "애플", "데이터", "보안", "해킹",
    ],
  },
  sports: {
    queries: ["프로야구", "축구", "골프", "배구 농구"],
    titleKeywords: [
      "야구", "축구", "골프", "농구", "배구", "KBO", "MLB", "손흥민", "이강인",
      "김하성", "이정후", "감독", "경기", "우승", "선수", "올림픽", "리그", "월드컵",
      "홈런", "대표팀", "결승", "LPGA", "PGA",
    ],
  },
  entertainment: {
    queries: ["배우", "가수", "드라마", "예능"],
    titleKeywords: [
      "배우", "가수", "드라마", "예능", "아이돌", "컴백", "결혼", "열애", "방송",
      "영화", "뮤지컬", "앨범", "콘서트", "시청률", "BTS", "유튜버", "출연", "MC",
    ],
  },
};

// 제목만 보고 걸러낼 기사들이에요. 사진 한 장짜리, 인사·부고, 지역 단신 묶음 등은
// 뉴스 앱 목록에서 가치가 낮아요.
const EXCLUDE_TITLE_PATTERNS = [
  /\[(사진|인사|부고|부음|화보|날씨|오늘의 운세|운세|게시판|알림|광고|AD)\]/,
  /\[[^\]]*포토/,
  /\[[^\]]*(시|군|구|도) 소식\]/,
  /오늘의 운세/,
  /^\s*(포토|화보)\s/,
];

// 주요 언론사예요. 이 목록에 있는 기사를 앞에 두고, 화면에는 도메인 대신 이름을 보여줘요.
const PRESS_NAMES: Record<string, string> = {
  "yna.co.kr": "연합뉴스",
  "yonhapnewstv.co.kr": "연합뉴스TV",
  "newsis.com": "뉴시스",
  "news1.kr": "뉴스1",
  "chosun.com": "조선일보",
  "joongang.co.kr": "중앙일보",
  "donga.com": "동아일보",
  "hani.co.kr": "한겨레",
  "khan.co.kr": "경향신문",
  "hankookilbo.com": "한국일보",
  "seoul.co.kr": "서울신문",
  "segye.com": "세계일보",
  "kmib.co.kr": "국민일보",
  "munhwa.com": "문화일보",
  "mk.co.kr": "매일경제",
  "hankyung.com": "한국경제",
  "sedaily.com": "서울경제",
  "mt.co.kr": "머니투데이",
  "edaily.co.kr": "이데일리",
  "asiae.co.kr": "아시아경제",
  "heraldcorp.com": "헤럴드경제",
  "fnnews.com": "파이낸셜뉴스",
  "ajunews.com": "아주경제",
  "etnews.com": "전자신문",
  "zdnet.co.kr": "지디넷코리아",
  "dt.co.kr": "디지털타임스",
  "kbs.co.kr": "KBS",
  "imbc.com": "MBC",
  "sbs.co.kr": "SBS",
  "jtbc.co.kr": "JTBC",
  "ytn.co.kr": "YTN",
  "mbn.co.kr": "MBN",
  "ichannela.com": "채널A",
  "tvchosun.com": "TV조선",
  "nocutnews.co.kr": "노컷뉴스",
  "ohmynews.com": "오마이뉴스",
  "pressian.com": "프레시안",
  "osen.co.kr": "OSEN",
  "sportschosun.com": "스포츠조선",
  "sports.donga.com": "스포츠동아",
  "isplus.com": "일간스포츠",
  "xportsnews.com": "엑스포츠뉴스",
  "starnewskorea.com": "스타뉴스",
  "tenasia.co.kr": "텐아시아",
  "mydaily.co.kr": "마이데일리",
  "busan.com": "부산일보",
  "imaeil.com": "매일신문",
};

// 네이버 API 결과를 이 시간(초)만큼 Cloudflare 엣지에 캐싱해요.
// 분야마다 검색어를 여러 개 부르므로, 일일 호출 한도(25,000회)를 넘지 않도록 넉넉히 잡았어요.
const CACHE_TTL_SECONDS = 300;

// 한 검색어당 가져오는 기사 수예요. 거르고 묶은 뒤에도 충분히 남도록 크게 받아요.
const FETCH_PER_QUERY = 50;

// 두 제목의 글자쌍(바이그램) 겹침이 이 값 이상이면 같은 소식으로 봐요.
// 2026-10-06 실측: 같은 소식을 다르게 쓴 제목끼리 0.33~0.38, 다른 소식끼리 0.1 미만.
const DUPLICATE_THRESHOLD = 0.25;

// 제목에 자주 쓰는 한자 약칭이에요. 같은 소식이 "北"과 "북한"으로 갈려 다른 기사로 보이지 않게 풀어요.
const HANJA_ABBREVIATIONS: Record<string, string> = {
  北: "북한",
  南: "남한",
  韓: "한국",
  美: "미국",
  中: "중국",
  日: "일본",
  與: "여당",
  野: "야당",
  軍: "군",
  "㎜": "mm",
};

// 네이버 검색 API는 초당 호출 수가 제한돼 있어요. 첫 화면이 여러 분야를 한꺼번에 부르므로
// 한 분야 안의 검색어는 순서대로, 사이를 조금 띄워서 불러요.
const QUERY_GAP_MS = 120;

// 글자쌍으로는 갈리지만 같은 소식인 제목(예: "KT 최원준, 단일 시즌 200안타 달성"과
// "kt 최원준, 시즌 200안타…")을 단어로 한 번 더 잡아요. 이 개수 이상, 짧은 쪽 제목 단어의
// 이 비율 이상이 겹치면 같은 소식으로 봐요. 실측에서 "여야"처럼 한두 단어만 겹치는 다른
// 기사는 걸리지 않았어요.
const DUPLICATE_MIN_SHARED_WORDS = 3;
const DUPLICATE_WORD_RATIO = 0.4;

// 어느 기사에나 붙는 말이라 같은 소식인지 가리는 데 쓰지 않는 단어들이에요.
const COMMON_WORDS = new Set([
  "속보", "단독", "종합", "1보", "2보", "3보", "오늘", "대통령", "의원", "정부",
  "한국", "북한", "미국", "국감",
]);

function corsHeaders(env: Env): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN ?? "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function jsonResponse(
  env: Env,
  body: unknown,
  status = 200,
  extraHeaders: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(env),
      ...extraHeaders,
    },
  });
}

function decodeTitle(text: string): string {
  return text
    .replace(/<\/?b>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'");
}

function hostOf(link: string): string {
  try {
    return new URL(link).hostname.replace(/^(www|m|news|biz|view|n)\./, "");
  } catch {
    return "";
  }
}

function pressNameOf(link: string): string | null {
  const host = hostOf(link);
  if (PRESS_NAMES[host]) return PRESS_NAMES[host];
  // sports.donga.com 처럼 하위 도메인이 따로 등록된 경우가 아니면 상위 도메인으로 찾아요.
  const parts = host.split(".");
  for (let i = 1; i < parts.length - 1; i += 1) {
    const parent = parts.slice(i).join(".");
    if (PRESS_NAMES[parent]) return PRESS_NAMES[parent];
  }
  return null;
}

// 비교용으로 제목을 다듬어요. [속보]·[단독] 같은 머리표, 따옴표, 공백, 문장부호를 지워요.
function normalizeTitle(title: string): string {
  let text = title;
  for (const [abbr, full] of Object.entries(HANJA_ABBREVIATIONS)) {
    text = text.split(abbr).join(full);
  }
  return text
    .replace(/\[[^\]]*\]/g, "")
    .replace(/[\s"'“”‘’`.,·…!?()<>「」『』:;~\-–—]/g, "")
    .toLowerCase();
}

function words(title: string): Set<string> {
  let text = title.replace(/\[[^\]]*\]/g, "");
  for (const [abbr, full] of Object.entries(HANJA_ABBREVIATIONS)) {
    text = text.split(abbr).join(full);
  }
  const set = new Set<string>();
  for (const word of text.match(/[0-9A-Za-z가-힣]+/g) ?? []) {
    if (word.length >= 2 && !COMMON_WORDS.has(word)) set.add(word.toLowerCase());
  }
  return set;
}

function isSameStory(a: Candidate, b: Candidate): boolean {
  if (similarity(a.grams, b.grams) >= DUPLICATE_THRESHOLD) return true;
  let shared = 0;
  for (const word of a.words) {
    if (b.words.has(word)) shared += 1;
  }
  const shorter = Math.min(a.words.size, b.words.size);
  return (
    shared >= DUPLICATE_MIN_SHARED_WORDS &&
    shorter > 0 &&
    shared / shorter >= DUPLICATE_WORD_RATIO
  );
}

function bigrams(text: string): Set<string> {
  const set = new Set<string>();
  for (let i = 0; i < text.length - 1; i += 1) {
    set.add(text.slice(i, i + 2));
  }
  return set;
}

function similarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const gram of a) {
    if (b.has(gram)) shared += 1;
  }
  return shared / (a.size + b.size - shared);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function searchNaver(
  env: Env,
  query: string,
  sort: "date" | "sim",
): Promise<NaverNewsItem[]> {
  const naverUrl = new URL("https://openapi.naver.com/v1/search/news.json");
  naverUrl.searchParams.set("query", query);
  naverUrl.searchParams.set("display", String(FETCH_PER_QUERY));
  naverUrl.searchParams.set("sort", sort);

  const res = await fetch(naverUrl.toString(), {
    headers: {
      "X-Naver-Client-Id": env.NAVER_CLIENT_ID,
      "X-Naver-Client-Secret": env.NAVER_CLIENT_SECRET,
    },
  });

  if (!res.ok) {
    throw new Error(`naver_api_error:${res.status}`);
  }

  const data = (await res.json()) as { items?: NaverNewsItem[] };
  return data.items ?? [];
}

interface Candidate {
  item: NaverNewsItem & { press: string | null };
  plainTitle: string;
  grams: Set<string>;
  words: Set<string>;
  time: number;
  major: boolean;
}

// 여러 검색어 결과를 합쳐서 분야에 맞는 기사만 남기고, 같은 소식은 한 건으로 묶어요.
function curate(
  rule: CategoryRule,
  results: NaverNewsItem[][],
  display: number,
  sort: "date" | "sim",
): Array<NaverNewsItem & { press: string | null }> {
  const seenLinks = new Set<string>();
  const candidates: Candidate[] = [];

  results.forEach((items, queryIndex) => {
    items.forEach((item, rankInQuery) => {
      const link = item.link || item.originallink;
      if (!link || seenLinks.has(link)) return;
      seenLinks.add(link);

      const plainTitle = decodeTitle(item.title);
      if (EXCLUDE_TITLE_PATTERNS.some((pattern) => pattern.test(plainTitle))) return;
      if (
        rule.titleKeywords &&
        !rule.titleKeywords.some((keyword) => plainTitle.includes(keyword))
      ) {
        return;
      }

      const press = pressNameOf(item.originallink || item.link);
      const time = new Date(item.pubDate).getTime();
      candidates.push({
        item: { ...item, press },
        plainTitle,
        grams: bigrams(normalizeTitle(plainTitle)),
        words: words(plainTitle),
        // 정확도순일 때는 네이버가 준 순서를 지키기 위해 검색어 안 순위를 시간처럼 써요.
        time: sort === "sim" ? -(rankInQuery * 10 + queryIndex) : time,
        major: press !== null,
      });
    });
  });

  candidates.sort((a, b) => b.time - a.time);

  // 같은 소식 묶음마다 대표 한 건을 골라요. 주요 언론사 기사가 있으면 그걸 대표로 써요.
  const groups: Candidate[][] = [];
  for (const candidate of candidates) {
    const group = groups.find((g) =>
      g.some((member) => isSameStory(member, candidate)),
    );
    if (group) {
      group.push(candidate);
    } else {
      groups.push([candidate]);
    }
  }

  const representatives = groups.map((group) => group.find((c) => c.major) ?? group[0]);

  // 주요 언론사 기사로 먼저 채우고, 모자라면 나머지로 채워요. 순서는 원래 정렬을 유지해요.
  const majors = representatives.filter((c) => c.major);
  const others = representatives.filter((c) => !c.major);
  const picked = [...majors, ...others].slice(0, display);
  picked.sort((a, b) => b.time - a.time);

  return picked.map((c) => c.item);
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(env) });
    }

    const url = new URL(request.url);

    if (url.pathname !== "/news") {
      return jsonResponse(env, { error: "not_found" }, 404);
    }

    const category = url.searchParams.get("category") ?? "";
    const rule = CATEGORY_RULES[category];

    if (!rule) {
      return jsonResponse(
        env,
        { error: "invalid_category", allowed: Object.keys(CATEGORY_RULES) },
        400,
      );
    }

    const sort = url.searchParams.get("sort") === "sim" ? "sim" : "date";
    const displayParam = Number(url.searchParams.get("display") ?? 20);
    const display = Math.min(Math.max(Number.isFinite(displayParam) ? displayParam : 20, 1), 30);

    // 거르고 묶은 결과를 category/sort/display 조합별로 캐싱해요. (요청자 정보는 키에
    // 들어가지 않아서 모든 사용자가 같은 캐시를 공유해요.)
    const cache = caches.default;
    const cacheKey = new Request(
      `https://tossnews-proxy.cache/v4/news?category=${category}&sort=${sort}&display=${display}`,
      { method: "GET" },
    );

    const cached = await cache.match(cacheKey);
    if (cached) {
      const hit = new Response(cached.body, cached);
      hit.headers.set("X-Cache", "HIT");
      return hit;
    }

    // 검색어 하나가 실패해도 나머지로 보여줘요. 전부 실패했을 때만 에러로 돌려줘요.
    const results: NaverNewsItem[][] = [];
    let lastError = "";
    for (const [index, query] of rule.queries.entries()) {
      if (index > 0) await sleep(QUERY_GAP_MS);
      try {
        results.push(await searchNaver(env, query, sort));
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
        // 초당 한도에 걸렸으면 한 번만 쉬었다가 다시 불러요.
        if (lastError.endsWith(":429")) {
          await sleep(600);
          try {
            results.push(await searchNaver(env, query, sort));
          } catch {
            // 이 검색어는 건너뛰어요.
          }
        }
      }
    }

    if (results.length === 0) {
      // 네이버 쪽 에러는 캐싱하지 않아요. 다음 요청에서 바로 재시도할 수 있게 해요.
      return jsonResponse(env, { error: "naver_api_error", detail: lastError }, 502);
    }

    const items = curate(rule, results, display, sort);
    const response = jsonResponse(env, { items }, 200, {
      "Cache-Control": `public, max-age=${CACHE_TTL_SECONDS}`,
      "X-Cache": "MISS",
    });

    ctx.waitUntil(cache.put(cacheKey, response.clone()));

    return response;
  },
};
