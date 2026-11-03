import { handle, readJson } from "@/lib/api-response";
import { RegisterInput } from "@/lib/validation";
import { rateLimit } from "@/server/rate-limit";
import { register } from "@/server/services/users";

// POST /api/auth/register → { next }
export async function POST(req: Request) {
  return handle(async () => {
    rateLimit(`register:${req.headers.get("x-forwarded-for") ?? "local"}`, 10, 60 * 60 * 1000);
    return register(RegisterInput.parse(await readJson(req)));
  }, 201);
}
