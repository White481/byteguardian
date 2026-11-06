import "server-only";
import type { AssessmentType, FunctionCode, Question } from "@/lib/types";
import questionSet from "@data/questions.json";

/**
 * Question set for an assessment type.
 * Questions come from data/questions.json (DRAFT set from the Data/AI team, NIST CSF 2.0).
 * The old placeholder set is still in data/mock/questions.mock.json.
 *
 * Custom assessments use every question, narrowed to the functions the user picked.
 */
export async function getQuestions(type: AssessmentType = "full", functions?: FunctionCode[]): Promise<Question[]> {
  const all = questionSet.questions as Question[];
  if (type === "custom") {
    return functions?.length ? all.filter((q) => functions.includes(q.function)) : all;
  }
  return all.filter((q) => q.sets.includes(type));
}
