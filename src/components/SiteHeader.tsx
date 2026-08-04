import Link from "next/link";

export default function SiteHeader({
  action,
}: {
  /** 首頁指向健檢頁，健檢頁指回首頁。 */
  action: "start" | "home";
}) {
  return (
    <header className="sticky top-0 z-30 border-b hairline bg-[var(--background)]/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-stone-900 text-[11px] font-semibold text-stone-50 dark:bg-stone-100 dark:text-stone-900">
            R
          </span>
          <span className="text-sm font-medium tracking-tight text-stone-900 dark:text-stone-100">
            履歷健檢
          </span>
        </Link>

        {action === "start" ? (
          <Link
            href="/check"
            className="rounded-full bg-stone-900 px-4 py-1.5 text-sm font-medium text-stone-50 transition hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
          >
            開始健檢
          </Link>
        ) : (
          <Link
            href="/"
            className="text-sm font-medium text-stone-500 transition hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
          >
            回首頁
          </Link>
        )}
      </div>
    </header>
  );
}
