import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "moonlighttarot",
  brand: {
    displayName: "오늘의 뉴스속보",
    primaryColor: "#3182F6",
    // 앱인토스 콘솔 > 앱 정보에서 업로드한 아이콘 이미지를 우클릭해 "이미지 주소 복사" 후 여기에 붙여넣어 주세요.
    icon: "https://static.toss.im/appsintoss/22039/3a94b706-101b-46ba-8ef3-6342b556c788.png",
  },
  web: {
    host: "localhost",
    port: 5173,
    commands: {
      dev: "vite dev",
      build: "vite build",
    },
  },
  permissions: [],
  outdir: "dist",
});
