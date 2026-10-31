import "server-only";
import type { DashboardData } from "@/lib/types";
import mock from "@data/mock/dashboard.mock.json";

/**
 * Dashboard data for the latest completed assessment.
 * TODO(ไวท์/โอเว่น): read from AssessmentResult in the DB once the scoring spec arrives.
 */
export async function getDashboard(): Promise<DashboardData> {
  return mock as DashboardData;
}
