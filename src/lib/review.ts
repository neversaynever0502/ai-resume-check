/**
 * 履歷健檢的資料契約。
 * 前端渲染、API 驗證、給模型的 JSON Schema 都以這個檔為單一來源。
 */

/** 固定的五個檢查面向，順序即為前端顯示順序。 */
export const ASPECT_IDS = [
  "impact",
  "relevance",
  "clarity",
  "keywords",
  "structure",
] as const;

export type AspectId = (typeof ASPECT_IDS)[number];

export const ASPECT_META: Record<
  AspectId,
  { label: string; description: string }
> = {
  impact: {
    label: "成果與量化",
    description: "有沒有把工作講成可衡量的成果，而不是職務描述。",
  },
  relevance: {
    label: "職缺相關性",
    description: "內容跟目標職缺的距離，該放大的經歷有沒有被放大。",
  },
  clarity: {
    label: "表達與可讀性",
    description: "句子是否精簡好讀，有沒有冗詞、空泛形容詞。",
  },
  keywords: {
    label: "技能與關鍵字",
    description: "技術棧與關鍵字是否完整，能不能通過初步篩選。",
  },
  structure: {
    label: "結構與完整性",
    description: "區塊安排、篇幅分配與缺漏的必要資訊。",
  },
};

export const SEVERITIES = ["high", "medium", "low"] as const;
export type Severity = (typeof SEVERITIES)[number];

export const SEVERITY_LABELS: Record<Severity, string> = {
  high: "優先處理",
  medium: "建議調整",
  low: "可以再更好",
};

export type Suggestion = {
  /** 逐字引用履歷中的原句，前端會用引言樣式呈現。 */
  quote: string;
  /** 這句話的問題在哪裡。 */
  issue: string;
  /** 該怎麼改的說明。 */
  fix: string;
  /** 可以直接貼回履歷的改寫版本。 */
  rewrite: string;
  severity: Severity;
};

export type Aspect = {
  id: AspectId;
  /** 0–100。 */
  score: number;
  summary: string;
  suggestions: Suggestion[];
};

export type ReviewResult = {
  /** 使用者選的職缺 id，由後端回填。 */
  jobRole: string;
  /** 0–100。 */
  overallScore: number;
  overallSummary: string;
  /** 一定是五個，且依 ASPECT_IDS 排序。 */
  aspects: Aspect[];
};

export type ReviewErrorCode =
  | "missing_key"
  | "invalid_key"
  | "missing_file"
  | "invalid_file_type"
  | "file_too_large"
  | "invalid_job_role"
  | "rate_limited"
  | "quota_exceeded"
  | "bad_output"
  | "timeout"
  | "upstream_error";

export type ReviewResponse =
  | {
      ok: true;
      result: ReviewResult;
      meta: { model: string; fileName: string };
    }
  | {
      ok: false;
      error: { code: ReviewErrorCode; message: string };
    };

/** 上傳限制，前後端共用同一組數字。 */
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_MIME = "application/pdf";

/**
 * 給 OpenAI Structured Outputs 用的 schema。
 * strict 模式要求每個 property 都列在 required，且 additionalProperties 為 false。
 * jobRole 不讓模型回，由後端回填使用者實際選的值。
 */
export const REVIEW_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["overallScore", "overallSummary", "aspects"],
  properties: {
    overallScore: {
      type: "integer",
      description: "履歷對此職缺的整體分數，0 到 100。",
    },
    overallSummary: {
      type: "string",
      description: "兩到三句話的整體講評，用繁體中文。",
    },
    aspects: {
      type: "array",
      description:
        "必須剛好五個元素，依序為 impact、relevance、clarity、keywords、structure，不可省略或重複。",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "score", "summary", "suggestions"],
        properties: {
          id: {
            type: "string",
            enum: [...ASPECT_IDS],
            description: "此面向的固定代號。",
          },
          score: {
            type: "integer",
            description: "此面向的分數，0 到 100。",
          },
          summary: {
            type: "string",
            description: "一到兩句話說明此面向的整體狀況，用繁體中文。",
          },
          suggestions: {
            type: "array",
            description:
              "此面向的具體建議，每個面向請給 2 到 4 條；若履歷在此面向確實沒有問題，可以回空陣列。",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["quote", "issue", "fix", "rewrite", "severity"],
              properties: {
                quote: {
                  type: "string",
                  description:
                    "逐字引用履歷中的原句，必須與 PDF 內文完全一致，不可改寫、不可自行造句。",
                },
                issue: {
                  type: "string",
                  description: "這句話的問題是什麼，用繁體中文。",
                },
                fix: {
                  type: "string",
                  description: "該怎麼改、要補上哪些資訊，用繁體中文。",
                },
                rewrite: {
                  type: "string",
                  description:
                    "改寫後可直接貼回履歷的版本，語言與履歷原文一致；若缺少數字請用 [具體數字] 之類的佔位符標示。",
                },
                severity: {
                  type: "string",
                  enum: [...SEVERITIES],
                  description: "嚴重程度。",
                },
              },
            },
          },
        },
      },
    },
  },
} as const;
