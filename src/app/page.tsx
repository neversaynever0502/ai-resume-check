import Link from "next/link";
import HeroResumeVisual from "@/components/HeroResumeVisual";
import SiteHeader from "@/components/SiteHeader";
import { ASPECT_IDS, ASPECT_META } from "@/lib/review";
import { JOB_ROLES } from "@/lib/jobRoles";

const STEPS = [
  {
    title: "貼上你的 API Key",
    body: "用你自己的 OpenAI 金鑰，只存在這台瀏覽器的 localStorage，我們不保存。",
  },
  {
    title: "上傳 PDF、選職缺",
    body: "整份履歷交給模型，連版面一起讀，不是只抓純文字。",
  },
  {
    title: "拿到逐句建議",
    body: "五個面向、每條都引用你的原句，附上問題、改法與可直接貼回的改寫版。",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader action="start" />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 bg-grid mask-fade-b"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-indigo-400/10 blur-3xl dark:bg-indigo-500/10"
            aria-hidden
          />

          <div className="relative mx-auto grid w-full max-w-5xl gap-14 px-5 pt-16 pb-20 sm:px-8 sm:pt-24 sm:pb-28 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-10">
            <div className="flex flex-col items-start">
              <span className="inline-flex items-center gap-2 rounded-full border hairline bg-white/70 px-3 py-1 text-xs font-medium text-stone-600 backdrop-blur dark:bg-stone-950/70 dark:text-stone-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                自備 OpenAI 金鑰，免註冊
              </span>

              <h1 className="mt-6 text-4xl leading-[1.12] font-semibold tracking-tight text-stone-900 sm:text-5xl lg:text-[3.4rem] dark:text-stone-50">
                履歷的問題
                <br />
                <span className="relative inline-block">
                  逐句
                  <span
                    className="absolute inset-x-0 bottom-1 -z-10 h-3 bg-indigo-200/70 dark:bg-indigo-500/25"
                    aria-hidden
                  />
                </span>
                指出來。
              </h1>

              <p className="mt-6 max-w-lg text-base leading-8 text-stone-600 sm:text-lg dark:text-stone-400">
                上傳 PDF、選一個目標職缺。AI
                會引用你履歷裡的原句，告訴你問題在哪、該怎麼改，並直接給你一段可以貼回去的改寫。
              </p>

              <div className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                <Link
                  href="/check"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-stone-900 px-7 text-sm font-medium text-stone-50 transition hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
                >
                  開始健檢
                  <span aria-hidden>→</span>
                </Link>
                <a
                  href="#sample"
                  className="inline-flex h-12 items-center justify-center rounded-full border hairline px-7 text-sm font-medium text-stone-700 transition hover:bg-white dark:text-stone-300 dark:hover:bg-stone-900"
                >
                  先看範例
                </a>
              </div>

              <dl className="mt-12 grid w-full grid-cols-3 gap-px overflow-hidden rounded-xl border hairline bg-[var(--hairline)] sm:max-w-md">
                {[
                  { value: "5", label: "檢查面向" },
                  { value: String(JOB_ROLES.length), label: "職缺類型" },
                  { value: "0", label: "伺服器留存" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-[var(--background)] px-4 py-3.5 text-center"
                  >
                    <dt className="font-mono text-xl font-medium tabular-nums text-stone-900 dark:text-stone-100">
                      {stat.value}
                    </dt>
                    <dd className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                      {stat.label}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="lg:pl-6">
              <HeroResumeVisual />
            </div>
          </div>
        </section>

        {/* 五個面向 */}
        <section className="border-t hairline">
          <div className="mx-auto w-full max-w-5xl px-5 py-20 sm:px-8 sm:py-24">
            <span className="eyebrow text-stone-400 dark:text-stone-500">
              What we check
            </span>
            <h2 className="mt-4 max-w-xl text-2xl leading-snug font-semibold tracking-tight text-stone-900 sm:text-3xl dark:text-stone-50">
              固定五個面向，每次都用同一把尺。
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-7 text-stone-600 dark:text-stone-400">
              不是給你一段籠統的評語。每個面向都有獨立分數，以及對應到履歷原句的具體建議。
            </p>

            <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border hairline bg-[var(--hairline)] sm:grid-cols-2 lg:grid-cols-3">
              {ASPECT_IDS.map((id, index) => (
                <div
                  key={id}
                  className="group flex flex-col bg-[var(--background)] p-6 transition-colors hover:bg-white sm:p-7 dark:hover:bg-stone-950"
                >
                  <span className="font-mono text-xs text-stone-400 dark:text-stone-600">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-stone-900 dark:text-stone-100">
                    {ASPECT_META[id].label}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-400">
                    {ASPECT_META[id].description}
                  </p>
                </div>
              ))}

              <div className="flex flex-col justify-center bg-[var(--background)] p-6 sm:p-7">
                <p className="text-sm leading-7 text-stone-500 dark:text-stone-400">
                  再依你選的職缺
                  <br />
                  調整每個面向的權重。
                </p>
                <Link
                  href="/check"
                  className="mt-4 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-indigo-600 transition hover:gap-2.5 dark:text-indigo-400"
                >
                  選擇職缺 <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 範例輸出 */}
        <section id="sample" className="scroll-mt-16 border-t hairline">
          <div className="mx-auto w-full max-w-5xl px-5 py-20 sm:px-8 sm:py-24">
            <div className="grid gap-12 lg:grid-cols-[0.85fr_1fr] lg:gap-16">
              <div>
                <span className="eyebrow text-stone-400 dark:text-stone-500">
                  Sample output
                </span>
                <h2 className="mt-4 text-2xl leading-snug font-semibold tracking-tight text-stone-900 sm:text-3xl dark:text-stone-50">
                  每一條建議都長這樣。
                </h2>
                <p className="mt-3 text-sm leading-7 text-stone-600 dark:text-stone-400">
                  先引用履歷裡真實存在的句子，再說問題、給改法，最後補一段可以直接貼回履歷的版本。缺少的數字會用佔位符標示，模型不會替你編。
                </p>
                <ul className="mt-8 flex flex-col gap-3">
                  {["引用原句，不改寫、不拼接", "問題與改法分開講", "改寫版語言跟著履歷走"].map(
                    (item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 text-sm leading-6 text-stone-600 dark:text-stone-400"
                      >
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-stone-400 dark:bg-stone-600" />
                        {item}
                      </li>
                    ),
                  )}
                </ul>
              </div>

              <div className="rounded-2xl border hairline bg-white p-6 shadow-[0_20px_50px_-30px_rgb(28_25_23/0.35)] sm:p-8 dark:bg-stone-950">
                <div className="flex items-center gap-2 border-b hairline pb-4">
                  <span className="font-mono text-xs text-stone-400 dark:text-stone-600">
                    01
                  </span>
                  <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20 dark:bg-red-950 dark:text-red-300 dark:ring-red-400/25">
                    優先處理
                  </span>
                  <span className="ml-auto text-xs text-stone-400 dark:text-stone-600">
                    成果與量化
                  </span>
                </div>

                <blockquote className="mt-5 border-l-2 border-indigo-400 pl-4 font-mono text-[13px] leading-6 break-words text-stone-700 dark:border-indigo-500 dark:text-stone-300">
                  Helped improve performance.
                </blockquote>

                <dl className="mt-5 flex flex-col gap-4 text-sm leading-7">
                  <div>
                    <dt className="eyebrow text-stone-400 dark:text-stone-600">
                      問題
                    </dt>
                    <dd className="mt-1.5 text-stone-700 dark:text-stone-300">
                      沒有說明改善了什麼指標、幅度多少，招募方無法判斷這件事的份量。
                    </dd>
                  </div>
                  <div>
                    <dt className="eyebrow text-stone-400 dark:text-stone-600">
                      改法
                    </dt>
                    <dd className="mt-1.5 text-stone-700 dark:text-stone-300">
                      補上指標名稱、改善前後的數字，以及你實際用的方法。
                    </dd>
                  </div>
                </dl>

                <div className="mt-5 rounded-xl bg-emerald-50 p-4 dark:bg-emerald-500/10">
                  <span className="eyebrow text-emerald-700 dark:text-emerald-400">
                    改寫後
                  </span>
                  <p className="mt-2 font-mono text-[13px] leading-6 break-words text-emerald-900 dark:text-emerald-200">
                    Cut page load time from 4.1s to 1.3s by code-splitting and
                    lazy-loading the dashboard bundle.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 流程 */}
        <section className="border-t hairline">
          <div className="mx-auto w-full max-w-5xl px-5 py-20 sm:px-8 sm:py-24">
            <span className="eyebrow text-stone-400 dark:text-stone-500">
              How it works
            </span>
            <h2 className="mt-4 text-2xl leading-snug font-semibold tracking-tight text-stone-900 sm:text-3xl dark:text-stone-50">
              三步，大約一分鐘。
            </h2>

            <ol className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-6">
              {STEPS.map((step, index) => (
                <li key={step.title} className="relative flex flex-col">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border hairline font-mono text-xs text-stone-500 dark:text-stone-400">
                      {index + 1}
                    </span>
                    <span
                      className="h-px flex-1 bg-[var(--hairline)] sm:block"
                      aria-hidden
                    />
                  </div>
                  <h3 className="mt-5 text-base font-semibold text-stone-900 dark:text-stone-100">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-400">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 隱私 + CTA */}
        <section className="border-t hairline">
          <div className="mx-auto w-full max-w-5xl px-5 py-20 sm:px-8 sm:py-24">
            <div className="relative overflow-hidden rounded-3xl border hairline bg-white px-6 py-14 text-center sm:px-12 dark:bg-stone-950">
              <div
                className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-48 w-96 rounded-full bg-indigo-400/15 blur-3xl dark:bg-indigo-500/15"
                aria-hidden
              />
              <div className="relative">
                <span className="eyebrow text-stone-400 dark:text-stone-500">
                  Your key, your data
                </span>
                <h2 className="mx-auto mt-4 max-w-md text-2xl leading-snug font-semibold tracking-tight text-stone-900 sm:text-3xl dark:text-stone-50">
                  金鑰留在你的瀏覽器，履歷不寫進資料庫。
                </h2>
                <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-stone-600 dark:text-stone-400">
                  API Key 只存在 localStorage，隨時可以清除。履歷 PDF
                  會經過我們的伺服器轉送給 OpenAI，處理完就結束，不落地、不留存。
                </p>
                <Link
                  href="/check"
                  className="mt-9 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-stone-900 px-8 text-sm font-medium text-stone-50 transition hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
                >
                  開始健檢
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t hairline">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-5 py-8 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between sm:px-8 dark:text-stone-500">
          <span>AI 履歷健檢</span>
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noreferrer noopener"
            className="transition hover:text-stone-900 dark:hover:text-stone-200"
          >
            申請 OpenAI API Key ↗
          </a>
        </div>
      </footer>
    </div>
  );
}
