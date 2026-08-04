"use client";

import { useId, useState, useSyncExternalStore } from "react";
import {
  clearApiKey,
  getApiKeySnapshot,
  getApiKeyServerSnapshot,
  looksLikeApiKey,
  maskApiKey,
  saveApiKey,
  subscribeApiKey,
} from "@/lib/apiKey";

type Status =
  | { type: "idle" }
  | { type: "saved" }
  | { type: "cleared" }
  | { type: "error"; message: string };

export default function ApiKeyForm() {
  const inputId = useId();

  // localStorage 只有瀏覽器才讀得到，交給 useSyncExternalStore 處理 SSR 與水合。
  const savedKey = useSyncExternalStore(
    subscribeApiKey,
    getApiKeySnapshot,
    getApiKeyServerSnapshot,
  );

  // draft 為 null 代表使用者還沒動過輸入框，直接顯示已存的金鑰。
  const [draft, setDraft] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [status, setStatus] = useState<Status>({ type: "idle" });

  const value = draft ?? savedKey;
  const dirty = value.trim() !== savedKey;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const key = value.trim();

    if (!key) {
      setStatus({ type: "error", message: "請先貼上你的 API Key。" });
      return;
    }
    if (!looksLikeApiKey(key)) {
      setStatus({
        type: "error",
        message: "這看起來不像 OpenAI 的金鑰，正確格式是 sk- 開頭的一長串字元。",
      });
      return;
    }

    saveApiKey(key);
    setDraft(null);
    setRevealed(false);

    if (getApiKeySnapshot() !== key) {
      setStatus({
        type: "error",
        message:
          "瀏覽器不允許寫入 localStorage（可能是無痕模式），關掉分頁後就要重貼一次。",
      });
      return;
    }
    setStatus({ type: "saved" });
  }

  function handleClear() {
    clearApiKey();
    setDraft(null);
    setRevealed(false);
    setStatus({ type: "cleared" });
  }

  return (
    <section className="w-full overflow-hidden rounded-2xl border hairline bg-white shadow-[0_20px_50px_-35px_rgb(28_25_23/0.4)] dark:bg-stone-950">
      <header className="flex items-start gap-4 border-b hairline px-6 py-5 sm:px-8">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border hairline font-mono text-[11px] text-stone-500 dark:text-stone-400">
          1
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight text-stone-900 dark:text-stone-50">
            OpenAI API Key
          </h2>
          <p className="mt-1 text-sm leading-6 text-stone-500 dark:text-stone-400">
            貼上你自己的金鑰，履歷分析會用它來呼叫 OpenAI。
          </p>
        </div>
        {savedKey && !dirty && (
          <span className="ml-auto hidden shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 sm:inline-flex dark:bg-emerald-500/10 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            已設定
          </span>
        )}
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 px-6 py-6 sm:px-8">
        <label
          htmlFor={inputId}
          className="eyebrow text-stone-400 dark:text-stone-500"
        >
          Secret key
        </label>

        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <input
              id={inputId}
              type={revealed ? "text" : "password"}
              value={value}
              onChange={(event) => {
                setDraft(event.target.value);
                setStatus({ type: "idle" });
              }}
              placeholder="sk-..."
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              className="w-full rounded-xl border hairline bg-stone-50 py-3 pr-16 pl-3.5 font-mono text-sm text-stone-900 outline-none transition placeholder:font-sans placeholder:text-stone-400 focus:border-stone-900 focus:bg-white focus:ring-4 focus:ring-stone-900/5 dark:bg-stone-900 dark:text-stone-50 dark:focus:border-stone-500 dark:focus:bg-stone-900 dark:focus:ring-stone-100/5"
            />
            <button
              type="button"
              onClick={() => setRevealed((shown) => !shown)}
              disabled={!value}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-lg px-2 py-1 font-mono text-[11px] text-stone-500 transition hover:bg-stone-200/70 hover:text-stone-900 disabled:opacity-40 dark:hover:bg-stone-800 dark:hover:text-stone-100"
            >
              {revealed ? "HIDE" : "SHOW"}
            </button>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!dirty}
              className="h-12 flex-1 rounded-xl bg-stone-900 px-5 text-sm font-medium text-stone-50 transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-30 sm:flex-none dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
            >
              儲存
            </button>
            {savedKey && (
              <button
                type="button"
                onClick={handleClear}
                className="h-12 rounded-xl border hairline px-5 text-sm font-medium text-stone-600 transition hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-900"
              >
                清除
              </button>
            )}
          </div>
        </div>

        <div aria-live="polite" className="min-h-5 text-sm">
          {status.type === "error" && (
            <p className="text-red-600 dark:text-red-400">{status.message}</p>
          )}
          {status.type === "saved" && (
            <p className="text-emerald-600 dark:text-emerald-400">
              已儲存，下次回來不用再貼一次。
            </p>
          )}
          {status.type === "cleared" && (
            <p className="text-stone-500 dark:text-stone-400">
              已從這台瀏覽器移除。
            </p>
          )}
          {status.type === "idle" && savedKey && !dirty && (
            <p className="text-stone-500 dark:text-stone-500">
              目前使用{" "}
              <code className="font-mono text-stone-700 dark:text-stone-300">
                {maskApiKey(savedKey)}
              </code>
              ，已存在這台瀏覽器。
            </p>
          )}
        </div>
      </form>

      <footer className="flex flex-col gap-1 border-t hairline bg-stone-50/60 px-6 py-4 text-xs leading-6 text-stone-500 sm:px-8 dark:bg-stone-900/40 dark:text-stone-400">
        <p>
          我們不會保存你的金鑰 —
          它只存在你自己瀏覽器的 localStorage，不會上傳、也不會寫進我們的伺服器或資料庫。
        </p>
        <p>
          還沒有金鑰？到{" "}
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noreferrer noopener"
            className="font-medium text-stone-900 underline underline-offset-4 transition hover:text-stone-600 dark:text-stone-100 dark:hover:text-stone-300"
          >
            OpenAI API keys 頁面
          </a>{" "}
          申請一組。
        </p>
      </footer>
    </section>
  );
}
