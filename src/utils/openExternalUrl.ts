function timeout(ms: number): Promise<never> {
  return new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms));
}

export async function openExternalUrl(url: string): Promise<void> {
  try {
    const { openURL } = await import("@apps-in-toss/web-framework");
    // 토스 앱 브릿지가 응답하지 않는 환경(일반 브라우저 등)에서도 무한 대기하지
    // 않도록 타임아웃을 두고, 실패하면 새 창 열기로 넘어가요.
    await Promise.race([openURL(url), timeout(2000)]);
    return;
  } catch {
    // 앱인토스 환경이 아니거나 SDK를 사용할 수 없을 때는 새 창으로 열어요.
  }
  window.open(url, "_blank", "noopener,noreferrer");
}
