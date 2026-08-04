import { ReviewError, reviewResume } from "@/lib/openaiReview";
import {
  ACCEPTED_MIME,
  MAX_FILE_BYTES,
  type ReviewResponse,
} from "@/lib/review";

export const runtime = "nodejs";
/** OpenAI 讀完整份 PDF 需要時間，別讓平台提前砍掉連線。 */
export const maxDuration = 60;

/** 金鑰走 header，不放在 form body 裡，避免被一起記進存取紀錄。 */
const API_KEY_HEADER = "x-openai-api-key";

function json(body: ReviewResponse, status: number) {
  return Response.json(body, {
    status,
    // 金鑰相關的回應一律不快取
    headers: { "Cache-Control": "no-store" },
  });
}

function fail(
  code: Extract<ReviewResponse, { ok: false }>["error"]["code"],
  message: string,
  status: number,
) {
  return json({ ok: false, error: { code, message } }, status);
}

export async function POST(request: Request) {
  const apiKey = request.headers.get(API_KEY_HEADER)?.trim();
  if (!apiKey) {
    return fail("missing_key", "沒有收到 API Key，請先在上方設定。", 400);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail("missing_file", "無法讀取上傳內容，請重新選擇檔案。", 400);
  }

  const file = form.get("file");
  const roleId = form.get("jobRole");

  if (!(file instanceof File) || file.size === 0) {
    return fail("missing_file", "請先選擇一份履歷 PDF。", 400);
  }
  if (typeof roleId !== "string" || !roleId) {
    return fail("invalid_job_role", "請選擇一個職缺類型。", 400);
  }
  // 有些瀏覽器/系統回報的 MIME 不準，副檔名也放行
  const looksLikePdf =
    file.type === ACCEPTED_MIME || file.name.toLowerCase().endsWith(".pdf");
  if (!looksLikePdf) {
    return fail("invalid_file_type", "目前只支援 PDF 檔。", 415);
  }
  if (file.size > MAX_FILE_BYTES) {
    return fail(
      "file_too_large",
      `檔案 ${(file.size / 1024 / 1024).toFixed(1)} MB，超過 ${MAX_FILE_BYTES / 1024 / 1024} MB 上限。`,
      413,
    );
  }

  try {
    const pdfBase64 = Buffer.from(await file.arrayBuffer()).toString("base64");
    const { result, model } = await reviewResume({
      apiKey,
      roleId,
      fileName: file.name,
      pdfBase64,
    });

    return json(
      { ok: true, result, meta: { model, fileName: file.name } },
      200,
    );
  } catch (error) {
    if (error instanceof ReviewError) {
      return fail(error.code, error.message, error.status);
    }
    // 不把原始錯誤往外丟，避免夾帶到金鑰或內部路徑
    console.error("[api/review] unexpected error", error);
    return fail("upstream_error", "分析過程發生未預期的錯誤。", 500);
  }
}
