export const API_KEY_STORAGE_KEY = "ai-resume-check:openai-api-key";

type Listener = () => void;

const listeners = new Set<Listener>();

// useSyncExternalStore 要求 getSnapshot 回傳穩定的值，所以讀到的結果先快取起來，
// 只有在寫入或其他分頁改動時才重新讀。
let cache: string | null = null;

function readStorage(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(API_KEY_STORAGE_KEY) ?? "";
  } catch {
    // 無痕模式或使用者停用 storage 時會丟例外
    return "";
  }
}

function emit() {
  cache = null;
  for (const listener of listeners) listener();
}

/** 給 useSyncExternalStore 用：訂閱金鑰變動（含其他分頁的變動）。 */
export function subscribeApiKey(listener: Listener): () => void {
  listeners.add(listener);

  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === API_KEY_STORAGE_KEY) emit();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function getApiKeySnapshot(): string {
  if (cache === null) cache = readStorage();
  return cache;
}

/** SSR 時沒有 localStorage，一律當作還沒設定。 */
export function getApiKeyServerSnapshot(): string {
  return "";
}

export function saveApiKey(key: string): void {
  try {
    window.localStorage.setItem(API_KEY_STORAGE_KEY, key);
  } catch {
    // 存不進去就當作沒存，交由呼叫端顯示提示
  }
  emit();
}

export function clearApiKey(): void {
  try {
    window.localStorage.removeItem(API_KEY_STORAGE_KEY);
  } catch {
    // 同上
  }
  emit();
}

/** OpenAI 金鑰目前都是 sk- 開頭，只做寬鬆檢查，不擋使用者。 */
export function looksLikeApiKey(key: string): boolean {
  return /^sk-[A-Za-z0-9_-]{20,}$/.test(key.trim());
}

/** 顯示用的遮罩，例如 sk-proj-…a1B2 */
export function maskApiKey(key: string): string {
  const trimmed = key.trim();
  if (trimmed.length <= 11) return "•".repeat(trimmed.length);
  return `${trimmed.slice(0, 7)}…${trimmed.slice(-4)}`;
}
