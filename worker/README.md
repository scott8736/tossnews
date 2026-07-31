# tossnews-proxy (Cloudflare Worker)

네이버 뉴스 검색 API를 앱(브라우저/웹뷰)에서 직접 호출하면 CORS와 Client Secret 노출 문제가 생겨요.
이 Worker가 그 사이에서 안전하게 요청을 대신 보내주는 프록시 역할을 해요.

## 배포하기

```bash
cd worker
npm install
npx wrangler login          # Cloudflare 계정 로그인 (최초 1회)
npm run secret:naver-id     # NAVER_CLIENT_ID 입력
npm run secret:naver-secret # NAVER_CLIENT_SECRET 입력
npm run deploy
```

배포가 끝나면 `https://tossnews-proxy.<your-subdomain>.workers.dev` 같은 주소가 나와요.
이 주소를 앱 프로젝트 루트의 `.env`에 다음과 같이 넣어주세요.

```
VITE_NEWS_PROXY_URL=https://tossnews-proxy.<your-subdomain>.workers.dev
```

## API

```
GET /news?category=economy&sort=date&display=20
```

- `category`: `breaking` | `politics` | `economy` | `society` | `it` | `sports` | `entertainment`
- `sort`: `date`(최신순, 기본값) | `sim`(정확도순)
- `display`: 1~30 (기본값 20)

네이버 검색 API 응답을 그대로 전달해요. 형식은 [네이버 뉴스 검색 API 문서](https://developers.naver.com/docs/serviceapi/search/news/news.md)를 참고하세요.

## 로컬에서 테스트하기

```bash
npm run dev
```

`http://localhost:8787/news?category=economy` 로 확인할 수 있어요. 이때도 시크릿은 미리 등록되어 있어야 해요.
