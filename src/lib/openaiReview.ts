import { findJobRole, type JobRole } from "@/lib/jobRoles";
import {
  ASPECT_IDS,
  REVIEW_JSON_SCHEMA,
  SEVERITIES,
  type Aspect,
  type AspectId,
  type ReviewErrorCode,
  type ReviewResult,
  type Severity,
  type Suggestion,
} from "@/lib/review";

/** 可用 OPENAI_BASE_URL 指向 Azure、自架 proxy 或測試用的假伺服器。 */
const OPENAI_BASE_URL = (
  process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1"
).replace(/\/$/, "");
const OPENAI_ENDPOINT = `${OPENAI_BASE_URL}/responses`;

/** 需要 vision 能力才能讀 PDF 的頁面影像；可用環境變數覆寫。 */
export const REVIEW_MODEL = process.env.OPENAI_MODEL ?? "gpt-5.6-terra";

/** OpenAI 有時要跑上一分鐘，給寬一點但別讓前端無限等。 */
const REQUEST_TIMEOUT_MS = 120_000;

export class ReviewError extends Error {
  readonly code: ReviewErrorCode;
  readonly status: number;

  constructor(code: ReviewErrorCode, message: string, status: number) {
    super(message);
    this.name = "ReviewError";
    this.code = code;
    this.status = status;
  }
}

function buildPrompt(role: JobRole): string {
  return [
    "你是一位資深的科技業履歷顧問，正在替求職者健檢履歷。",
    `目標職缺是「${role.label}」，這個職缺特別看重：${role.focus}`,
    "",
    "附件是求職者的完整履歷 PDF，請完整讀過所有頁面再作答。",
    "",
    "規則：",
    "1. 每一條建議都必須引用履歷中真實存在的原句，逐字複製到 quote 欄位，不可改寫、不可自行造句、不可拼接不同段落。",
    "2. 找不到可引用的原句時，寧可少給一條建議，也不要編造。",
    "3. issue 要講清楚問題，不要只說「不夠好」；fix 要給可執行的做法。",
    "4. rewrite 要能直接貼回履歷，語言與履歷原文一致（履歷是英文就寫英文）。履歷沒提供的數字，用 [具體數字] 這類佔位符標示，不要瞎編。",
    "5. 五個面向都要回，順序固定為 impact、relevance、clarity、keywords、structure。",
    "6. 除了 rewrite 之外，其餘欄位一律使用繁體中文。",
    "7. 分數請務實，不要一律給高分。",
  ].join("\n");
}

type OpenAIContent = { type?: string; text?: string; refusal?: string };
type OpenAIOutputItem = { type?: string; content?: OpenAIContent[] };

/** 從 Responses API 的回傳裡取出模型輸出的 JSON 字串。 */
function extractOutputText(payload: unknown): string {
  const data = payload as {
    output_text?: unknown;
    output?: OpenAIOutputItem[];
    incomplete_details?: { reason?: string };
  };

  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text;
  }

  const chunks: string[] = [];
  for (const item of data.output ?? []) {
    if (item.type !== "message") continue;
    for (const part of item.content ?? []) {
      if (typeof part.refusal === "string" && part.refusal.trim()) {
        throw new ReviewError(
          "bad_output",
          `模型拒絕分析這份履歷：${part.refusal}`,
          502,
        );
      }
      if (part.type === "output_text" && typeof part.text === "string") {
        chunks.push(part.text);
      }
    }
  }

  if (!chunks.length) {
    const reason = data.incomplete_details?.reason;
    throw new ReviewError(
      "bad_output",
      reason
        ? `模型沒有回傳完整結果（${reason}），請再試一次。`
        : "模型沒有回傳任何內容，請再試一次。",
      502,
    );
  }
  return chunks.join("");
}

function clampScore(value: unknown): number {
  const n = typeof value === "number" ? Math.round(value) : Number.NaN;
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, n));
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asSeverity(value: unknown): Severity {
  return SEVERITIES.includes(value as Severity) ? (value as Severity) : "medium";
}

function normalizeSuggestions(value: unknown): Suggestion[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((raw) => {
      const item = raw as Record<string, unknown>;
      return {
        quote: asString(item.quote),
        issue: asString(item.issue),
        fix: asString(item.fix),
        rewrite: asString(item.rewrite),
        severity: asSeverity(item.severity),
      };
    })
    // 少了引用或問題描述的建議對前端沒有價值，直接丟掉
    .filter((s) => s.quote && s.issue);
}

/**
 * 即使開了 strict schema，仍然把回傳正規化一次：
 * 保證五個面向齊全、順序固定、分數在範圍內，前端就不用寫防禦邏輯。
 */
function normalizeResult(raw: unknown, roleId: string): ReviewResult {
  if (!raw || typeof raw !== "object") {
    throw new ReviewError("bad_output", "模型回傳的格式無法解析。", 502);
  }
  const data = raw as Record<string, unknown>;
  const byId = new Map<AspectId, Record<string, unknown>>();

  if (Array.isArray(data.aspects)) {
    for (const entry of data.aspects) {
      const aspect = entry as Record<string, unknown>;
      const id = aspect?.id;
      if (ASPECT_IDS.includes(id as AspectId) && !byId.has(id as AspectId)) {
        byId.set(id as AspectId, aspect);
      }
    }
  }

  if (byId.size === 0) {
    throw new ReviewError("bad_output", "模型沒有回傳任何檢查面向。", 502);
  }

  const aspects: Aspect[] = ASPECT_IDS.map((id) => {
    const aspect = byId.get(id);
    return {
      id,
      score: clampScore(aspect?.score),
      summary: asString(aspect?.summary),
      suggestions: normalizeSuggestions(aspect?.suggestions),
    };
  });

  return {
    jobRole: roleId,
    overallScore: clampScore(data.overallScore),
    overallSummary: asString(data.overallSummary),
    aspects,
  };
}

function mapUpstreamError(status: number, body: string): ReviewError {
  let message = body.slice(0, 300);
  try {
    const parsed = JSON.parse(body) as { error?: { message?: string } };
    if (parsed.error?.message) message = parsed.error.message;
  } catch {
    // 上游不一定回 JSON，保留原文即可
  }

  if (status === 401) {
    return new ReviewError(
      "invalid_key",
      "OpenAI 不接受這組金鑰，請確認是否已失效或貼錯。",
      401,
    );
  }
  if (status === 429) {
    const quota = /quota|billing|insufficient/i.test(message);
    return quota
      ? new ReviewError(
          "quota_exceeded",
          "這組金鑰的額度不足，請到 OpenAI 帳單頁面確認餘額。",
          402,
        )
      : new ReviewError(
          "rate_limited",
          "呼叫太頻繁，請稍等一下再試。",
          429,
        );
  }
  return new ReviewError(
    "upstream_error",
    `OpenAI 回傳錯誤（${status}）：${message}`,
    502,
  );
}

export async function reviewResume(params: {
  apiKey: string;
  roleId: string;
  fileName: string;
  pdfBase64: string;
}): Promise<{ result: ReviewResult; model: string }> {
  const role = findJobRole(params.roleId);
  if (!role) {
    throw new ReviewError("invalid_job_role", "不認得這個職缺類型。", 400);
  }

  let response: Response;
  try {
    response = await fetch(OPENAI_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${params.apiKey}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      body: JSON.stringify({
        model: REVIEW_MODEL,
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_file",
                filename: params.fileName,
                file_data: `data:application/pdf;base64,${params.pdfBase64}`,
                detail: "high",
              },
              { type: "input_text", text: buildPrompt(role) },
            ],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "resume_review",
            strict: true,
            schema: REVIEW_JSON_SCHEMA,
          },
        },
      }),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new ReviewError(
        "timeout",
        "等 OpenAI 回覆超過兩分鐘，請縮短履歷或稍後再試。",
        504,
      );
    }
    throw new ReviewError(
      "upstream_error",
      "連不上 OpenAI，請檢查網路後再試一次。",
      502,
    );
  }

  if (!response.ok) {
    throw mapUpstreamError(response.status, await response.text());
  }

  const payload = (await response.json()) as unknown;
  const text = extractOutputText(payload);

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new ReviewError("bad_output", "模型回傳的不是合法 JSON。", 502);
  }

  return {
    result: normalizeResult(parsed, role.id),
    model: REVIEW_MODEL,
  };
}
