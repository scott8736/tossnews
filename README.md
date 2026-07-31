# 오늘의 뉴스속보 (moonlighttarot)

네이버 뉴스를 카테고리별로 모아 보여주는 앱인토스 미니앱이에요. React + TypeScript + TDS(Toss Design System) 기반으로 만들었어요.

## 특징

- 카테고리별 피드(정치/경제/사회/IT·과학/스포츠/연예) + 최신순/정확도순 전환
- 관심 카테고리를 설정하면 "전체" 탭에서 해당 카테고리 소식을 우선적으로 보여줘요
- 기사 스크랩(로컬 저장), 원문 기사 보기, 공유하기
- `VITE_NEWS_PROXY_URL`을 설정하지 않으면 데모 데이터로 자동 동작해요 (오프라인 개발용)

## 시작하기

```bash
npm install
npm run dev
```

## 네이버 뉴스 연동하기

네이버 뉴스 검색 API는 브라우저에서 직접 호출할 수 없어서(CORS/키 노출 문제), `worker/` 폴더의 Cloudflare Worker가 프록시 역할을 해요. 자세한 배포 방법은 [worker/README.md](worker/README.md)를 참고하세요.

```bash
cd worker
npm install
npx wrangler login
npm run secret:naver-id
npm run secret:naver-secret
npm run deploy
```

배포된 Worker 주소를 프로젝트 루트에 `.env` 파일로 넣어주세요 (`.env.example` 참고).

```
VITE_NEWS_PROXY_URL=https://tossnews-proxy.<your-subdomain>.workers.dev
```

## 배포하기

- 앱인토스 배포 API 키는 [앱인토스 콘솔](https://apps-in-toss.toss.im/) > 워크스페이스 > API 키 > 콘솔 API 키 에서 발급받을 수 있어요.

```bash
npm run build
npm run deploy
```

## 유용한 링크

- [앱인토스 콘솔](https://apps-in-toss.toss.im/)
- [앱인토스 개발자센터](https://developers-apps-in-toss.toss.im/)
- [앱인토스 개발자 커뮤니티](https://techchat-apps-in-toss.toss.im/)
- [네이버 뉴스 검색 API 문서](https://developers.naver.com/docs/serviceapi/search/news/news.md)

AI를 사용하시는 경우 [여기](https://developers-apps-in-toss.toss.im/development/llms.html)를 확인해보세요.
