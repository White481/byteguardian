import { z } from "zod";
import { handle, readJson } from "@/lib/api-response";
import { requireCompanyUser, requireRole } from "@/server/auth";
import { changeRole, removeCollaborator } from "@/server/services/users";

type Ctx = { params: Promise<{ id: string }> };

// PATCH /api/collaborators/:id { role } — admin only
export async function PATCH(req: Request, { params }: Ctx) {
  return handle(async () => {
    const user = await requireCompanyUser();
    requireRole(user, ["admin"]);
    const { role } = z.object({ role: z.enum(["admin", "member", "viewer"]) }).parse(await readJson(req));
    return changeRole(user.companyId, (await params).id, role);
  });
}

// DELETE /api/collaborators/:id — admin only
export async function DELETE(_req: Request, { params }: Ctx) {
  return handle(async () => {
    const user = await requireCompanyUser();
    requireRole(user, ["admin"]);
    return removeCollaborator(user, (await params).id);
  });
}
