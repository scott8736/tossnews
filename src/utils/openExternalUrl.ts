export async function openExternalUrl(url: string): Promise<void> {
  try {
    const { openURL } = await import("@apps-in-toss/web-framework");
    await openURL(url);
    return;
  } catch {
    // 앱인토스 환경이 아니거나 SDK를 사용할 수 없을 때는 새 창으로 열어요.
  }
  window.open(url, "_blank", "noopener,noreferrer");
}
