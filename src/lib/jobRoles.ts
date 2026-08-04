export type JobRole = {
  id: string;
  label: string;
  /** 給模型的補充說明，讓建議貼近該職缺實際在看的東西。 */
  focus: string;
};

export const JOB_ROLES: JobRole[] = [
  {
    id: "frontend",
    label: "前端工程師",
    focus: "框架與狀態管理經驗、效能與可存取性優化、與設計和後端的協作。",
  },
  {
    id: "backend",
    label: "後端工程師",
    focus: "系統設計、API 與資料庫、流量與穩定性數字、雲端與部署經驗。",
  },
  {
    id: "fullstack",
    label: "全端工程師",
    focus: "端到端交付能力、獨立完成產品的紀錄、前後端技術廣度。",
  },
  {
    id: "mobile",
    label: "行動應用工程師",
    focus: "iOS/Android 或跨平台框架、上架與版本維運、崩潰率與效能數字。",
  },
  {
    id: "data",
    label: "資料分析 / 資料科學",
    focus: "分析如何影響決策、SQL 與統計方法、資料規模與商業成效。",
  },
  {
    id: "ai",
    label: "AI / 機器學習工程師",
    focus: "模型與資料處理流程、評估指標、上線後的效果與成本。",
  },
  {
    id: "devops",
    label: "DevOps / SRE",
    focus: "CI/CD、可觀測性、事故處理與 SLO、基礎設施自動化。",
  },
  {
    id: "pm",
    label: "產品經理",
    focus: "問題定義與取捨、跨部門推動、產品指標的變化。",
  },
  {
    id: "designer",
    label: "UI / UX 設計師",
    focus: "設計流程與研究方法、作品集連結、設計對指標的影響。",
  },
  {
    id: "marketing",
    label: "行銷企劃",
    focus: "檔期成效、投放與內容數據、預算規模與 ROI。",
  },
];

export function findJobRole(id: string | null | undefined): JobRole | undefined {
  if (!id) return undefined;
  return JOB_ROLES.find((role) => role.id === id);
}
