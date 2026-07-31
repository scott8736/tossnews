export interface Env {
  NAVER_CLIENT_ID: string;
  NAVER_CLIENT_SECRET: string;
  // 콘솔에서 배포한 미니앱 도메인만 허용하고 싶으면 wrangler.toml에 vars로 추가해서 사용하세요.
  ALLOWED_ORIGIN?: string;
}

const CATEGORY_QUERY: Record<string, string> = {
  breaking: "속보",
  politics: "정치",
  economy: "경제",
  society: "사회",
  it: "IT 과학",
  sports: "스포츠",
  entertainment: "연예",
};

// 네이버 API 호출 결과를 이 시간(초)만큼 Cloudflare 엣지에 캐싱해요.
// 사용자가 아무리 많아도, 같은 카테고리/정렬 조합은 이 시간 동안 네이버를 한 번만 호출해요.
const CACHE_TTL_SECONDS = 180;

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
    const query = CATEGORY_QUERY[category];

    if (!query) {
      return jsonResponse(
        env,
        { error: "invalid_category", allowed: Object.keys(CATEGORY_QUERY) },
        400,
      );
    }

    const sort = url.searchParams.get("sort") === "sim" ? "sim" : "date";
    const displayParam = Number(url.searchParams.get("display") ?? 20);
    const display = Math.min(Math.max(displayParam, 1), 30);

    // category/sort/display 조합별로 캐시 키를 만들어요. (요청자 IP 등은 키에 안 들어가서
    // 전 세계 사용자가 같은 캐시를 공유해요.)
    const cache = caches.default;
    const cacheKey = new Request(
      `https://tossnews-proxy.cache/news?category=${category}&sort=${sort}&display=${display}`,
      { method: "GET" },
    );

    const cached = await cache.match(cacheKey);
    if (cached) {
      const hit = new Response(cached.body, cached);
      hit.headers.set("X-Cache", "HIT");
      return hit;
    }

    const naverUrl = new URL("https://openapi.naver.com/v1/search/news.json");
    naverUrl.searchParams.set("query", query);
    naverUrl.searchParams.set("display", String(display));
    naverUrl.searchParams.set("sort", sort);

    const naverRes = await fetch(naverUrl.toString(), {
      headers: {
        "X-Naver-Client-Id": env.NAVER_CLIENT_ID,
        "X-Naver-Client-Secret": env.NAVER_CLIENT_SECRET,
      },
    });

    if (!naverRes.ok) {
      // 네이버 쪽 에러는 캐싱하지 않아요. 다음 요청에서 바로 재시도할 수 있게 해요.
      return jsonResponse(
        env,
        { error: "naver_api_error", status: naverRes.status },
        502,
      );
    }

    const data = await naverRes.json();
    const response = jsonResponse(env, data, 200, {
      "Cache-Control": `public, max-age=${CACHE_TTL_SECONDS}`,
      "X-Cache": "MISS",
    });

    ctx.waitUntil(cache.put(cacheKey, response.clone()));

    return response;
  },
};
