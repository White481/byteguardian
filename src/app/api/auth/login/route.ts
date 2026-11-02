import { handle, readJson } from "@/lib/api-response";
import { LoginInput } from "@/lib/validation";
import { rateLimit } from "@/server/rate-limit";
import { login } from "@/server/services/users";

// POST /api/auth/login → { next }
export async function POST(req: Request) {
  return handle(async () => {
    const input = LoginInput.parse(await readJson(req));
    rateLimit(`login:${input.email}`, 10, 15 * 60 * 1000);
    return login(input);
  });
}
