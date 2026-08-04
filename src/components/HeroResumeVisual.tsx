/**
 * 純裝飾：一張被標記過的履歷。
 * 用 div 疊出來而不是圖片，才能跟著深淺色主題走，也不會拖慢載入。
 */

function Line({ width, dim }: { width: string; dim?: boolean }) {
  return (
    <div
      className={`h-2 rounded-full ${dim ? "bg-stone-200/80 dark:bg-stone-800" : "bg-stone-300/80 dark:bg-stone-700"}`}
      style={{ width }}
    />
  );
}

export default function HeroResumeVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[420px] select-none" aria-hidden>
      {/* 疊在後面的第二頁，做出厚度 */}
      <div className="absolute -top-3 left-4 right-4 h-full rounded-2xl border hairline bg-white/60 dark:bg-stone-900/60" />

      <div className="relative rounded-2xl border hairline bg-white p-6 shadow-[0_24px_60px_-24px_rgb(28_25_23/0.28)] sm:p-7 dark:bg-stone-950 dark:shadow-[0_24px_60px_-24px_rgb(0_0_0/0.9)]">
        {/* 抬頭 */}
        <div className="flex items-center gap-3 border-b hairline pb-5">
          <div className="h-9 w-9 shrink-0 rounded-full bg-stone-200 dark:bg-stone-800" />
          <div className="flex flex-col gap-1.5">
            <Line width="112px" />
            <Line width="72px" dim />
          </div>
        </div>

        <div className="flex flex-col gap-5 pt-5">
          <div className="flex flex-col gap-2.5">
            <span className="eyebrow text-stone-400 dark:text-stone-600">
              Experience
            </span>
            <Line width="100%" dim />
            <Line width="86%" dim />
          </div>

          {/* 被挑出來的那一句 */}
          <div className="relative">
            <span className="absolute -left-6 top-1/2 hidden h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-semibold text-white sm:flex">
              1
            </span>
            <p className="rounded-lg bg-indigo-50 px-3 py-2 font-mono text-[13px] leading-6 text-indigo-950 ring-1 ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-100 dark:ring-indigo-400/25">
              Helped improve performance.
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            <Line width="94%" dim />
            <Line width="60%" dim />
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="eyebrow text-stone-400 dark:text-stone-600">
              Skills
            </span>
            <div className="flex flex-wrap gap-1.5">
              {["JavaScript", "React", "Node.js"].map((skill) => (
                <span
                  key={skill}
                  className="rounded-md bg-stone-100 px-2 py-1 font-mono text-[11px] text-stone-500 dark:bg-stone-900 dark:text-stone-400"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 浮在右下角的建議卡：手機縮進版面內，桌機才外掛 */}
      <div className="relative -mt-6 ml-auto w-[85%] rounded-xl border hairline bg-white p-3.5 shadow-[0_16px_40px_-16px_rgb(28_25_23/0.35)] sm:absolute sm:-right-10 sm:bottom-10 sm:mt-0 sm:w-60 dark:bg-stone-950 dark:shadow-[0_16px_40px_-16px_rgb(0_0_0/0.9)]">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700 ring-1 ring-inset ring-red-600/20 dark:bg-red-950 dark:text-red-300 dark:ring-red-400/25">
            優先處理
          </span>
          <span className="eyebrow text-stone-400 dark:text-stone-600">
            Impact
          </span>
        </div>
        <p className="mt-2 text-[13px] leading-6 text-stone-600 dark:text-stone-400">
          沒有說明改善了什麼指標、幅度多少。
        </p>
        <p className="mt-2 rounded-md bg-emerald-50 px-2.5 py-2 font-mono text-[12px] leading-5 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-200">
          Cut page load time from 4.1s to 1.3s
        </p>
      </div>
    </div>
  );
}
