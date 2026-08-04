import {
  ASPECT_META,
  SEVERITY_LABELS,
  type ReviewResult,
  type Severity,
} from "@/lib/review";
import { findJobRole } from "@/lib/jobRoles";

const SEVERITY_STYLES: Record<Severity, string> = {
  high: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-400/25",
  medium:
    "bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/25",
  low: "bg-stone-100 text-stone-600 ring-stone-500/20 dark:bg-stone-800 dark:text-stone-300 dark:ring-stone-400/20",
};

const SEVERITY_RULE: Record<Severity, string> = {
  high: "border-red-400 dark:border-red-500",
  medium: "border-amber-400 dark:border-amber-500",
  low: "border-stone-300 dark:border-stone-600",
};

function scoreTone(score: number): { bar: string; text: string } {
  if (score >= 80)
    return {
      bar: "bg-emerald-500",
      text: "text-emerald-600 dark:text-emerald-400",
    };
  if (score >= 60)
    return { bar: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" };
  return { bar: "bg-red-500", text: "text-red-600 dark:text-red-400" };
}

/** 整體分數的環形圖。 */
function ScoreDial({ score }: { score: number }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const dash = (Math.min(100, Math.max(0, score)) / 100) * circumference;
  const tone = scoreTone(score);

  return (
    <div className="relative h-28 w-28 shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="7"
          className="stroke-stone-200 dark:stroke-stone-800"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          className={
            score >= 80
              ? "stroke-emerald-500"
              : score >= 60
                ? "stroke-amber-500"
                : "stroke-red-500"
          }
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`font-mono text-3xl leading-none font-medium tabular-nums ${tone.text}`}
        >
          {score}
        </span>
        <span className="mt-1 font-mono text-[10px] text-stone-400 dark:text-stone-600">
          / 100
        </span>
      </div>
    </div>
  );
}

export default function ReviewResultView({
  result,
  fileName,
}: {
  result: ReviewResult;
  fileName: string;
}) {
  const role = findJobRole(result.jobRole);
  const totalSuggestions = result.aspects.reduce(
    (sum, aspect) => sum + aspect.suggestions.length,
    0,
  );

  return (
    <div className="flex flex-col gap-4">
      {/* 總覽 */}
      <section className="overflow-hidden rounded-2xl border hairline bg-white shadow-[0_20px_50px_-35px_rgb(28_25_23/0.4)] dark:bg-stone-950">
        <div className="flex flex-col items-center gap-6 px-6 py-8 text-center sm:flex-row sm:items-center sm:gap-8 sm:px-8 sm:text-left">
          <ScoreDial score={result.overallScore} />
          <div className="min-w-0 flex-1">
            <span className="eyebrow text-stone-400 dark:text-stone-500">
              Overall
            </span>
            <p className="mt-3 text-base leading-8 text-stone-800 dark:text-stone-200">
              {result.overallSummary || "分析完成。"}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-x-2 gap-y-1 text-xs text-stone-500 sm:justify-start dark:text-stone-400">
              <span className="max-w-full truncate font-mono">{fileName}</span>
              {role && (
                <>
                  <span aria-hidden>·</span>
                  <span>目標職缺：{role.label}</span>
                </>
              )}
              <span aria-hidden>·</span>
              <span>{totalSuggestions} 條建議</span>
            </div>
          </div>
        </div>

        {/* 五個面向的分數一覽 */}
        <div className="grid grid-cols-2 gap-px border-t hairline bg-[var(--hairline)] sm:grid-cols-5">
          {result.aspects.map((aspect) => {
            const tone = scoreTone(aspect.score);
            return (
              <a
                key={aspect.id}
                href={`#aspect-${aspect.id}`}
                // 手機是兩欄，第五個補滿整列，避免右邊留一格空白
                className="group bg-white px-4 py-4 transition-colors last:col-span-2 hover:bg-stone-50 sm:last:col-span-1 dark:bg-stone-950 dark:hover:bg-stone-900"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-xs text-stone-500 dark:text-stone-400">
                    {ASPECT_META[aspect.id].label}
                  </span>
                  <span
                    className={`font-mono text-sm tabular-nums ${tone.text}`}
                  >
                    {aspect.score}
                  </span>
                </div>
                <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
                  <div
                    className={`h-full rounded-full ${tone.bar}`}
                    style={{ width: `${aspect.score}%` }}
                  />
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* 各面向細節 */}
      {result.aspects.map((aspect, aspectIndex) => {
        const meta = ASPECT_META[aspect.id];
        const tone = scoreTone(aspect.score);

        return (
          <section
            key={aspect.id}
            id={`aspect-${aspect.id}`}
            className="scroll-mt-20 overflow-hidden rounded-2xl border hairline bg-white shadow-[0_20px_50px_-35px_rgb(28_25_23/0.4)] dark:bg-stone-950"
          >
            <header className="border-b hairline px-6 py-6 sm:px-8">
              <div className="flex items-start gap-4">
                <span className="mt-1 font-mono text-xs text-stone-400 dark:text-stone-600">
                  {String(aspectIndex + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-50">
                      {meta.label}
                    </h3>
                    <span
                      className={`font-mono text-sm tabular-nums ${tone.text}`}
                    >
                      {aspect.score}
                      <span className="text-stone-400 dark:text-stone-600">
                        /100
                      </span>
                    </span>
                  </div>
                  <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
                    <div
                      className={`h-full rounded-full ${tone.bar}`}
                      style={{ width: `${aspect.score}%` }}
                    />
                  </div>
                  <p className="mt-3 text-sm leading-7 text-stone-600 dark:text-stone-400">
                    {aspect.summary || meta.description}
                  </p>
                </div>
              </div>
            </header>

            {aspect.suggestions.length === 0 ? (
              <p className="px-6 py-6 text-sm text-stone-500 sm:px-8 dark:text-stone-400">
                這個面向沒有找到需要修改的地方。
              </p>
            ) : (
              <ol className="divide-y divide-[var(--hairline)]">
                {aspect.suggestions.map((suggestion, index) => (
                  <li
                    key={`${aspect.id}-${index}`}
                    className="flex flex-col gap-4 px-6 py-6 sm:px-8"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs text-stone-400 tabular-nums dark:text-stone-600">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${SEVERITY_STYLES[suggestion.severity]}`}
                      >
                        {SEVERITY_LABELS[suggestion.severity]}
                      </span>
                    </div>

                    <blockquote
                      className={`border-l-2 pl-4 font-mono text-[13px] leading-6 break-words text-stone-700 dark:text-stone-300 ${SEVERITY_RULE[suggestion.severity]}`}
                    >
                      {suggestion.quote}
                    </blockquote>

                    <dl className="flex flex-col gap-4">
                      <div>
                        <dt className="eyebrow text-stone-400 dark:text-stone-600">
                          問題
                        </dt>
                        <dd className="mt-1.5 text-sm leading-7 text-stone-700 dark:text-stone-300">
                          {suggestion.issue}
                        </dd>
                      </div>
                      {suggestion.fix && (
                        <div>
                          <dt className="eyebrow text-stone-400 dark:text-stone-600">
                            改法
                          </dt>
                          <dd className="mt-1.5 text-sm leading-7 text-stone-700 dark:text-stone-300">
                            {suggestion.fix}
                          </dd>
                        </div>
                      )}
                    </dl>

                    {suggestion.rewrite && (
                      <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-500/10">
                        <span className="eyebrow text-emerald-700 dark:text-emerald-400">
                          改寫後
                        </span>
                        <p className="mt-2 font-mono text-[13px] leading-6 break-words text-emerald-900 dark:text-emerald-200">
                          {suggestion.rewrite}
                        </p>
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </section>
        );
      })}
    </div>
  );
}
