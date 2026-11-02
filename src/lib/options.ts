import type { AssessmentType, Framework, Role } from "./types";

/**
 * Select options shared by forms (client) and validation (server).
 * These are UI choices only — not cybersecurity content.
 */
export const INDUSTRIES = [
  "Finance & Banking",
  "Healthcare",
  "Government",
  "Education",
  "Retail & E-commerce",
  "Manufacturing",
  "Technology",
  "Energy & Utilities",
  "Telecommunications",
  "Other",
] as const;

export const COMPANY_SIZES = ["Small (1–50)", "Medium (51–250)", "Large (251–1,000)", "Enterprise (1,000+)"] as const;

export const EMPLOYEE_COUNTS = ["1–10", "11–50", "51–250", "251–1,000", "1,001–5,000", "5,000+"] as const;

export const REVENUE_RANGES = [
  "Under $1M",
  "$1M–$10M",
  "$10M–$50M",
  "$50M–$250M",
  "Over $250M",
  "Prefer not to say",
] as const;

export const COUNTRIES = [
  "Thailand",
  "Singapore",
  "Malaysia",
  "Vietnam",
  "Indonesia",
  "Philippines",
  "Japan",
  "United States",
  "United Kingdom",
  "Other",
] as const;

export const IT_INFRASTRUCTURES = ["On-premises", "Hybrid", "Fully cloud", "Not sure"] as const;

export const CLOUD_ENVIRONMENTS = ["AWS", "Microsoft Azure", "Google Cloud", "Multi-cloud", "Private cloud", "None"] as const;

export const ROLES: { value: Role; label: string; description: string }[] = [
  { value: "admin", label: "Admin", description: "Manage the company, team and every assessment" },
  { value: "member", label: "Member", description: "Run assessments and update the action plan" },
  { value: "viewer", label: "Viewer", description: "Read-only access to results and reports" },
];

export const ASSESSMENT_TYPES: { value: AssessmentType; label: string; description: string }[] = [
  { value: "full", label: "Full Assessment", description: "Every question across all six functions." },
  { value: "quick", label: "Quick Assessment", description: "A shorter set for a first look at your posture." },
  { value: "custom", label: "Custom Assessment", description: "Choose the functions you want to assess." },
];

/** `available: false` until the cyber team delivers that framework's question set */
export const FRAMEWORKS: { value: Framework; label: string; available: boolean }[] = [
  { value: "nist-csf-2", label: "NIST CSF 2.0", available: true },
  { value: "iso-27001", label: "ISO/IEC 27001", available: false },
  { value: "cis", label: "CIS Controls", available: false },
];

export const FRAMEWORK_LABEL: Record<Framework, string> = {
  "nist-csf-2": "NIST CSF 2.0",
  "iso-27001": "ISO/IEC 27001",
  cis: "CIS Controls",
};

export const ASSESSMENT_TYPE_LABEL: Record<AssessmentType, string> = {
  full: "Full",
  quick: "Quick",
  custom: "Custom",
};
