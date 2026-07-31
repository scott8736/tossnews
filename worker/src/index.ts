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

function corsHeaders(env: Env): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN ?? "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function jsonResponse(env: Env, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=60",
      ...corsHeaders(env),
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
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
      return jsonResponse(
        env,
        { error: "naver_api_error", status: naverRes.status },
        502,
      );
    }

    const data = await naverRes.json();
    return jsonResponse(env, data);
  },
};
