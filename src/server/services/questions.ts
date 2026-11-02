import "server-only";
import type { AssessmentType, FunctionCode, Question } from "@/lib/types";
import mock from "@data/mock/questions.mock.json";

/**
 * Question set for an assessment type.
 * The real dataset comes from the Data/AI team (see data/templates/questions.template.json).
 * Swap the import above for the real file when it arrives — the shape stays the same.
 *
 * Custom assessments use every question, narrowed to the functions the user picked.
 */
export async function getQuestions(type: AssessmentType = "full", functions?: FunctionCode[]): Promise<Question[]> {
  const all = mock as Question[];
  if (type === "custom") {
    return functions?.length ? all.filter((q) => functions.includes(q.function)) : all;
  }
  return all.filter((q) => q.sets.includes(type));
}
