/**
 * Shared types between frontend and API.
 * Shapes marked "PENDING SPEC" will change when the Data/AI team delivers
 * the real question set, scoring method and AI output format.
 */

export type FunctionCode = "GV" | "ID" | "PR" | "DE" | "RS" | "RC";

export const FUNCTIONS: { code: FunctionCode; name: string }[] = [
  { code: "GV", name: "Govern" },
  { code: "ID", name: "Identify" },
  { code: "PR", name: "Protect" },
  { code: "DE", name: "Detect" },
  { code: "RS", name: "Respond" },
  { code: "RC", name: "Recover" },
];

export type AssessmentType = "full" | "quick" | "custom";
export type Framework = "nist-csf-2" | "iso-27001" | "cis";
export type AnswerValue = "yes" | "partially" | "no";
export type Priority = "high" | "medium" | "low";
export type RiskLevel = "low" | "medium" | "high" | "critical";

/** PENDING SPEC — question dataset from Data/AI team */
export interface Question {
  id: string; // e.g. "GV.OC-01"
  function: FunctionCode;
  category: string; // e.g. "GV.OC"
  categoryName: string; // e.g. "Organizational Context"
  text: string;
  description?: string;
  evidenceRequired?: boolean;
  sets: AssessmentType[]; // which assessment types include this question
}

export interface FunctionScore {
  function: FunctionCode;
  name: string;
  current: number;
  target: number;
}

export interface CategoryScore {
  category: string;
  name: string;
  current: number;
}

/** PENDING SPEC — scoring output */
export interface DashboardData {
  isMock: boolean;
  assessment: { id: string; completedAt: string; status: string };
  summary: {
    currentTier: number;
    currentTierLabel: string;
    targetTier: number;
    targetTierLabel: string;
    overallGap: number;
    riskLevel: RiskLevel;
    maxTier: number;
  };
  functionScores: FunctionScore[];
  categoryScores: CategoryScore[];
  risk: {
    overallScore: number;
    counts: Record<"critical" | "high" | "medium" | "low", number>;
    heatmap: number[][]; // [impact high→low][likelihood low→high]
    topRisks: { title: string; level: RiskLevel }[];
  };
}

/** PENDING SPEC — AI output format */
export interface AiInsights {
  isMock: boolean;
  summary?: string;
  keyFindings: { title: string; detail: string; priority: Priority }[];
  recommendations: { title: string; detail: string; priority: Priority }[];
  weaknesses: string[];
  improvements: string[];
}

export interface ActionPlanItem {
  id: string;
  title: string;
  priority: Priority;
  responsibleTeam: string;
  estimatedCost: string;
  phase: string;
  status: "todo" | "in_progress" | "done";
  progress: number;
}

/** Standard API error body */
export interface ApiError {
  error: { code: string; message: string };
}
