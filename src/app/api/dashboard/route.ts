import { handle } from "@/lib/api-response";
import { getDashboard } from "@/server/services/dashboard";

export async function GET() {
  return handle(() => getDashboard());
}
