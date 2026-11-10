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
export type Role = "admin" | "member" | "viewer";
export type AssessmentStatus = "draft" | "in_progress" | "submitted" | "processing" | "completed" | "failed";
export type ActionStatus = "todo" | "in_progress" | "done";

/** The signed-in user, as the server sees it */
export interface SessionUser {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  companyId: string | null;
  companyName: string | null;
  onboardingCompleted: boolean;
}

export interface CompanyProfile {
  name: string;
  industry: string | null;
  companySize: string | null;
  employeeCount: string | null;
  annualRevenue: string | null;
  country: string | null;
  itInfrastructure: string | null;
  cloudEnvironment: string | null;
  onboardingCompleted: boolean;
}

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
    /** Suggested plan we sell (Starter / Business / Business + Partner services). Optional: old results don't have it. */
    recommendedPlan?: string;
    /** "rule" = data/scoring.json rule, "ml" = model from the AI service */
    recommendedPlanSource?: "rule" | "ml";
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
  /** Optional: suggested actions (see ai-output.template.json). Falls back to the mock plan. */
  actionPlan?: { title: string; priority: Priority; responsibleTeam: string; estimatedCost: string; phase: string }[];
  /** Optional: plan suggested by the AI service's ML model. Overrides the rule-based plan. */
  recommendedPlan?: { plan: string; confidence?: number; reason?: string };
}

export interface ActionPlanItem {
  id: string;
  title: string;
  description?: string | null;
  priority: Priority;
  responsibleTeam: string;
  estimatedCost: string;
  phase: string;
  status: ActionStatus;
  progress: number;
}

export interface ActionPlanData {
  assessmentId: string | null;
  isMock: boolean;
  items: ActionPlanItem[];
}

export interface AssessmentSummary {
  id: string;
  type: AssessmentType;
  framework: Framework;
  status: AssessmentStatus;
  startedAt: string;
  submittedAt: string | null;
  completedAt: string | null;
  answeredCount: number;
  questionCount: number;
  currentTier: number | null;
  riskLevel: RiskLevel | null;
}

export interface AnswerState {
  value: AnswerValue;
  note: string | null;
  evidence: { id: string; fileName: string }[];
}

export interface AssessmentDetail extends AssessmentSummary {
  currentIndex: number;
  questions: Question[];
  answers: Record<string, AnswerState>;
}

export interface ReportItem {
  id: string;
  title: string;
  assessmentId: string;
  createdAt: string;
}

export interface Collaborator {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  hasAccount: boolean; // false = invited, has not registered yet
  isYou: boolean;
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

/** PENDING SPEC — chat response from the Data/AI service (data/templates/chat.template.json) */
export interface ChatReply {
  reply: string;
  isMock: boolean;
}

/** Standard API error body */
export interface ApiError {
  error: { code: string; message: string };
}
