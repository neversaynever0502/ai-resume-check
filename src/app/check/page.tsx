import type { Metadata } from "next";
import ApiKeyForm from "@/components/ApiKeyForm";
import ResumeChecker from "@/components/ResumeChecker";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "開始健檢 — AI 履歷健檢",
};

export default function CheckPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader action="home" />

      <main className="relative flex-1">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-grid mask-fade-b"
          aria-hidden
        />

        <div className="relative mx-auto w-full max-w-3xl px-5 pt-12 pb-24 sm:px-8 sm:pt-16">
          <span className="eyebrow text-stone-400 dark:text-stone-500">
            Resume check
          </span>
          <h1 className="mt-4 text-3xl leading-tight font-semibold tracking-tight text-stone-900 sm:text-4xl dark:text-stone-50">
            上傳履歷，開始健檢。
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-7 text-stone-600 sm:text-base dark:text-stone-400">
            第一次使用要先貼上 OpenAI API Key，之後回來就不用再貼一次。
          </p>

          <div className="mt-10 flex flex-col gap-4">
            <ApiKeyForm />
            <ResumeChecker />
          </div>
        </div>
      </main>
    </div>
  );
}
