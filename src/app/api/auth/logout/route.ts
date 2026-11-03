import { handle } from "@/lib/api-response";
import { destroySession } from "@/server/auth";

// POST /api/auth/logout
export async function POST() {
  return handle(async () => {
    await destroySession();
    return { signedOut: true };
  });
}
