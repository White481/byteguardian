import { handle, readJson } from "@/lib/api-response";
import { ProfileInput } from "@/lib/validation";
import { requireUser } from "@/server/auth";
import { updateProfile } from "@/server/services/users";

// GET /api/me → SessionUser
export async function GET() {
  return handle(() => requireUser());
}

// PATCH /api/me { fullName, email }
export async function PATCH(req: Request) {
  return handle(async () => {
    const user = await requireUser();
    return updateProfile(user.id, ProfileInput.parse(await readJson(req)));
  });
}
