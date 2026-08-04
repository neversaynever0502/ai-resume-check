"use client";

import { useId, useRef, useState, useSyncExternalStore } from "react";
import ReviewResultView from "@/components/ReviewResultView";
import { JOB_ROLES } from "@/lib/jobRoles";
import {
  getApiKeySnapshot,
  getApiKeyServerSnapshot,
  subscribeApiKey,
} from "@/lib/apiKey";
import {
  ACCEPTED_MIME,
  MAX_FILE_BYTES,
  type ReviewResponse,
  type ReviewResult,
} from "@/lib/review";

type Phase =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "error"; message: string }
  | { type: "done"; result: ReviewResult; fileName: string };

export default function ResumeChecker() {
  const fileInputId = useId();
  const roleInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const apiKey = useSyncExternalStore(
    subscribeApiKey,
    getApiKeySnapshot,
    getApiKeyServerSnapshot,
  );

  const [file, setFile] = useState<File | null>(null);
  const [roleId, setRoleId] = useState(JOB_ROLES[0].id);
  const [dragging, setDragging] = useState(false);
  const [phase, setPhase] = useState<Phase>({ type: "idle" });

  const loading = phase.type === "loading";
  const canSubmit = Boolean(apiKey) && Boolean(file) && !loading;

  function acceptFile(candidate: File | undefined) {
    if (!candidate) return;
    const isPdf =
      candidate.type === ACCEPTED_MIME ||
      candidate.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setPhase({ type: "error", message: "目前只支援 PDF 檔。" });
      return;
    }
    if (candidate.size > MAX_FILE_BYTES) {
      setPhase({
        type: "error",
        message: `檔案超過 ${MAX_FILE_BYTES / 1024 / 1024} MB 上限。`,
      });
      return;
    }
    setFile(candidate);
    setPhase({ type: "idle" });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setPhase({ type: "error", message: "請先選擇一份履歷 PDF。" });
      return;
    }
    if (!apiKey) {
      setPhase({ type: "error", message: "請先在上方設定 OpenAI API Key。" });
      return;
    }

    setPhase({ type: "loading" });
    const body = new FormData();
    body.append("file", file);
    body.append("jobRole", roleId);

    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: { "x-openai-api-key": apiKey },
        body,
      });
      const payload = (await response.json()) as ReviewResponse;

      if (!payload.ok) {
        setPhase({ type: "error", message: payload.error.message });
        return;
      }
      setPhase({
        type: "done",
        result: payload.result,
        fileName: payload.meta.fileName,
      });
    } catch {
      setPhase({
        type: "error",
        message: "送出失敗，請確認網路連線後再試一次。",
      });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="w-full overflow-hidden rounded-2xl border hairline bg-white shadow-[0_20px_50px_-35px_rgb(28_25_23/0.4)] dark:bg-stone-950">
        <header className="flex items-start gap-4 border-b hairline px-6 py-5 sm:px-8">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border hairline font-mono text-[11px] text-stone-500 dark:text-stone-400">
            2
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-tight text-stone-900 dark:text-stone-50">
              上傳履歷
            </h2>
            <p className="mt-1 text-sm leading-6 text-stone-500 dark:text-stone-400">
              選一份 PDF 和目標職缺，整份履歷會直接交給 OpenAI 分析。
            </p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-2.5">
            <label
              htmlFor={fileInputId}
              className="eyebrow text-stone-400 dark:text-stone-500"
            >
              Resume PDF
            </label>
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                acceptFile(event.dataTransfer.files[0]);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-10 text-center transition ${
                dragging
                  ? "border-indigo-500 bg-indigo-50/60 dark:border-indigo-400 dark:bg-indigo-500/10"
                  : file
                    ? "border-emerald-400/70 bg-emerald-50/40 dark:border-emerald-500/40 dark:bg-emerald-500/5"
                    : "border-stone-300 bg-stone-50/60 hover:border-stone-400 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900/40 dark:hover:border-stone-600"
              }`}
            >
              <input
                ref={fileInputRef}
                id={fileInputId}
                type="file"
                accept="application/pdf,.pdf"
                className="sr-only"
                onChange={(event) => acceptFile(event.target.files?.[0])}
              />
              {file ? (
                <>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 font-mono text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                    PDF
                  </span>
                  <span className="max-w-full truncate px-2 text-sm font-medium text-stone-900 dark:text-stone-100">
                    {file.name}
                  </span>
                  <span className="text-xs text-stone-500 dark:text-stone-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB · 點一下可換一份
                  </span>
                </>
              ) : (
                <>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border hairline text-stone-400 dark:text-stone-500">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                      aria-hidden
                    >
                      <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" />
                      <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                    </svg>
                  </span>
                  <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                    把 PDF 拖進來，或點一下選擇檔案
                  </span>
                  <span className="text-xs text-stone-500 dark:text-stone-400">
                    上限 {MAX_FILE_BYTES / 1024 / 1024} MB
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <label
              htmlFor={roleInputId}
              className="eyebrow text-stone-400 dark:text-stone-500"
            >
              Target role
            </label>
            <div className="relative">
              <select
                id={roleInputId}
                value={roleId}
                onChange={(event) => setRoleId(event.target.value)}
                className="w-full appearance-none rounded-xl border hairline bg-stone-50 py-3 pr-10 pl-3.5 text-sm text-stone-900 outline-none transition focus:border-stone-900 focus:bg-white focus:ring-4 focus:ring-stone-900/5 dark:bg-stone-900 dark:text-stone-50 dark:focus:border-stone-500 dark:focus:ring-stone-100/5"
              >
                {JOB_ROLES.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.label}
                  </option>
                ))}
              </select>
              <span
                className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-stone-400 dark:text-stone-500"
                aria-hidden
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-stone-900 px-5 text-sm font-medium text-stone-50 transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-30 sm:w-auto sm:self-start sm:px-8 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
            >
              {loading && (
                <span
                  className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
                  aria-hidden
                />
              )}
              {loading ? "分析中…" : "開始健檢"}
            </button>

            {!apiKey && (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                請先在上面設定 API Key。
              </p>
            )}
            {loading && (
              <p className="text-sm text-stone-500 dark:text-stone-400">
                整份 PDF 要讀完，通常需要 20–60 秒。
              </p>
            )}
          </div>

          <div aria-live="polite" className="min-h-5 text-sm">
            {phase.type === "error" && (
              <p className="rounded-xl bg-red-50 px-4 py-3 leading-6 text-red-700 dark:bg-red-500/10 dark:text-red-300">
                {phase.message}
              </p>
            )}
          </div>
        </form>
      </section>

      {phase.type === "done" && (
        <ReviewResultView result={phase.result} fileName={phase.fileName} />
      )}
    </div>
  );
}
