import { handle, readJson } from "@/lib/api-response";
import { InviteInput } from "@/lib/validation";
import { requireCompanyUser, requireRole } from "@/server/auth";
import { inviteCollaborator, listCollaborators } from "@/server/services/users";

// GET /api/collaborators → Collaborator[]
export async function GET() {
  return handle(async () => listCollaborators(await requireCompanyUser()));
}

// POST /api/collaborators { fullName, email, role } — admin only
export async function POST(req: Request) {
  return handle(async () => {
    const user = await requireCompanyUser();
    requireRole(user, ["admin"]);
    return inviteCollaborator(user.companyId, InviteInput.parse(await readJson(req)));
  }, 201);
}
