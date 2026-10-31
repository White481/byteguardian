import "server-only";
import type { AssessmentType, Question } from "@/lib/types";
import mock from "@data/mock/questions.mock.json";

/**
 * Question set for an assessment type.
 * The real dataset comes from the Data/AI team (see data/templates/questions.template.json).
 * Swap the import above for the real file when it arrives — the shape stays the same.
 */
export async function getQuestions(type: AssessmentType = "full"): Promise<Question[]> {
  const all = mock as Question[];
  return type === "custom" ? all : all.filter((q) => q.sets.includes(type));
}
