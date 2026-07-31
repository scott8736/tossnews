// 토스 앱 브릿지가 없는 환경(일반 브라우저 등)에서는 isSupported() 자체가
// false를 반환하는 대신 예외를 던져요. 그래서 항상 이 함수로 감싸서 호출해요.
export function safeIsSupported(check: () => boolean): boolean {
  try {
    return check();
  } catch {
    return false;
  }
}
