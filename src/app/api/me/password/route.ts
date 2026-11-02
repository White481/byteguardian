import { handle, readJson } from "@/lib/api-response";
import { PasswordInput } from "@/lib/validation";
import { destroyOtherSessions, requireUser } from "@/server/auth";
import { rateLimit } from "@/server/rate-limit";
import { changePassword } from "@/server/services/users";

// POST /api/me/password { currentPassword, newPassword, confirmPassword }
export async function POST(req: Request) {
  return handle(async () => {
    const user = await requireUser();
    rateLimit(`password:${user.id}`, 5, 15 * 60 * 1000);
    const { currentPassword, newPassword } = PasswordInput.parse(await readJson(req));
    const result = await changePassword(user.id, currentPassword, newPassword);
    await destroyOtherSessions(user.id);
    return result;
  });
}
