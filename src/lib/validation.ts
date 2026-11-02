import { z } from "zod";
import {
  CLOUD_ENVIRONMENTS,
  COMPANY_SIZES,
  COUNTRIES,
  EMPLOYEE_COUNTS,
  INDUSTRIES,
  IT_INFRASTRUCTURES,
  REVENUE_RANGES,
} from "./options";

/**
 * zod schemas shared by forms (client-side validation) and API routes (server-side validation).
 * The server always re-validates — never trust the browser.
 */

const email = z.string().trim().toLowerCase().email("Enter a valid email address");
const password = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(128, "Use at most 128 characters")
  .regex(/[A-Za-z]/, "Include at least one letter")
  .regex(/[0-9]/, "Include at least one number");
const fullName = z.string().trim().min(2, "Enter your full name").max(100);

export const LoginInput = z.object({
  email,
  password: z.string().min(1, "Enter your password"),
});

export const RegisterInput = z.object({
  fullName,
  email,
  password,
  companyName: z.string().trim().min(2, "Enter your company name").max(120),
  companySize: z.enum(COMPANY_SIZES, { errorMap: () => ({ message: "Choose a company size" }) }),
});

const choice = <T extends readonly [string, ...string[]]>(values: T, message: string) =>
  z.enum(values, { errorMap: () => ({ message }) });

export const CompanyInput = z.object({
  name: z.string().trim().min(2, "Enter your company name").max(120),
  industry: choice(INDUSTRIES, "Choose an industry"),
  companySize: choice(COMPANY_SIZES, "Choose a company size"),
  employeeCount: choice(EMPLOYEE_COUNTS, "Choose the number of employees"),
  annualRevenue: choice(REVENUE_RANGES, "Choose a revenue range"),
  country: choice(COUNTRIES, "Choose a country"),
  itInfrastructure: choice(IT_INFRASTRUCTURES, "Choose your IT infrastructure"),
  cloudEnvironment: choice(CLOUD_ENVIRONMENTS, "Choose your cloud environment"),
});

/** "Save progress" accepts a partially filled form */
export const CompanyDraftInput = CompanyInput.partial().extend({ name: CompanyInput.shape.name });

export const ProfileInput = z.object({ fullName, email });

export const PasswordInput = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: password,
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const InviteInput = z.object({
  fullName,
  email,
  role: z.enum(["admin", "member", "viewer"]),
});

export const CreateAssessmentInput = z.object({
  type: z.enum(["full", "quick", "custom"]),
  framework: z.enum(["nist-csf-2", "iso-27001", "cis"]),
  /** Custom assessments only: which functions to include */
  functions: z.array(z.enum(["GV", "ID", "PR", "DE", "RS", "RC"])).optional(),
});

export const AnswerInput = z.object({
  questionId: z.string().min(1),
  value: z.enum(["yes", "partially", "no"]),
  note: z.string().trim().max(2000, "Keep notes under 2,000 characters").nullish(),
  currentIndex: z.number().int().min(0).optional(),
});

export const ActionItemInput = z.object({
  title: z.string().trim().min(3, "Enter a title").max(200),
  description: z.string().trim().max(2000).nullish(),
  priority: z.enum(["high", "medium", "low"]),
  responsibleTeam: z.string().trim().max(100).nullish(),
  estimatedCost: z.string().trim().max(100).nullish(),
  phase: z.string().trim().max(50).nullish(),
});

export const ActionItemUpdate = z.object({
  status: z.enum(["todo", "in_progress", "done"]).optional(),
  progress: z.number().int().min(0).max(100).optional(),
});

export const ChatInput = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(4000, "Keep messages under 4,000 characters"),
      }),
    )
    .min(1)
    .max(40, "Conversation is too long — start a new chat"),
});

/** zod error → { field: firstMessage } for showing errors under inputs */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}
