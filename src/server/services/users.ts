import "server-only";
import type { z } from "zod";
import { HttpError } from "@/lib/api-response";
import { db } from "@/lib/db";
import type { Collaborator, Role, SessionUser } from "@/lib/types";
import type { InviteInput, LoginInput, ProfileInput, RegisterInput } from "@/lib/validation";
import { createSession, hashPassword, verifyPassword } from "@/server/auth";

/**
 * Register a new account + company.
 * If an admin already invited this email, the user claims that account and joins their company.
 */
export async function register(input: z.infer<typeof RegisterInput>) {
  const existing = await db.user.findUnique({ where: { email: input.email } });
  if (existing?.passwordHash) throw new HttpError(409, "EMAIL_TAKEN", "An account with this email already exists");

  const passwordHash = await hashPassword(input.password);
  let user;
  if (existing) {
    user = await db.user.update({ where: { id: existing.id }, data: { fullName: input.fullName, passwordHash } });
  } else {
    user = await db.$transaction(async (tx) => {
      const company = await tx.company.create({ data: { name: input.companyName, companySize: input.companySize } });
      return tx.user.create({
        data: { fullName: input.fullName, email: input.email, passwordHash, role: "admin", companyId: company.id },
      });
    });
  }
  await createSession(user.id);
  return { next: existing ? "/dashboard" : "/onboarding/company" };
}

export async function login(input: z.infer<typeof LoginInput>) {
  const user = await db.user.findUnique({ where: { email: input.email }, include: { company: true } });
  // Same message for unknown email and wrong password, so emails can't be enumerated
  const valid = user?.passwordHash ? await verifyPassword(input.password, user.passwordHash) : false;
  if (!user || !valid) throw new HttpError(401, "INVALID_CREDENTIALS", "Incorrect email or password");
  await createSession(user.id);
  return { next: user.company?.onboardingCompleted ? "/dashboard" : "/onboarding/company" };
}

export async function updateProfile(userId: string, input: z.infer<typeof ProfileInput>) {
  const clash = await db.user.findFirst({ where: { email: input.email, id: { not: userId } } });
  if (clash) throw new HttpError(409, "EMAIL_TAKEN", "Another account uses this email");
  const u = await db.user.update({ where: { id: userId }, data: input });
  return { fullName: u.fullName, email: u.email };
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const u = await db.user.findUniqueOrThrow({ where: { id: userId } });
  if (!u.passwordHash || !(await verifyPassword(currentPassword, u.passwordHash))) {
    throw new HttpError(422, "WRONG_PASSWORD", "Current password is incorrect");
  }
  await db.user.update({ where: { id: userId }, data: { passwordHash: await hashPassword(newPassword) } });
  return { changed: true };
}

// ---- Collaborators ----

export async function listCollaborators(me: SessionUser & { companyId: string }): Promise<Collaborator[]> {
  const users = await db.user.findMany({ where: { companyId: me.companyId }, orderBy: { createdAt: "asc" } });
  return users.map((u) => ({
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    role: u.role as Role,
    hasAccount: Boolean(u.passwordHash),
    isYou: u.id === me.id,
  }));
}

/** Creates a pending account; the person finishes by registering with the same email */
export async function inviteCollaborator(companyId: string, input: z.infer<typeof InviteInput>) {
  const existing = await db.user.findUnique({ where: { email: input.email } });
  if (existing) throw new HttpError(409, "EMAIL_TAKEN", "This email already has an account");
  await db.user.create({ data: { ...input, companyId } });
  return { invited: true };
}

async function findTeammate(companyId: string, id: string) {
  const u = await db.user.findFirst({ where: { id, companyId } });
  if (!u) throw new HttpError(404, "NOT_FOUND", "Team member not found");
  return u;
}

async function assertNotLastAdmin(companyId: string, userId: string) {
  const admins = await db.user.count({ where: { companyId, role: "admin", id: { not: userId } } });
  if (admins === 0) throw new HttpError(409, "LAST_ADMIN", "The company needs at least one admin");
}

export async function changeRole(companyId: string, id: string, role: Role) {
  const u = await findTeammate(companyId, id);
  if (u.role === "admin" && role !== "admin") await assertNotLastAdmin(companyId, id);
  await db.user.update({ where: { id }, data: { role } });
  return { updated: true };
}

/** Removes the person from the company (their past assessments stay) and signs them out */
export async function removeCollaborator(me: SessionUser & { companyId: string }, id: string) {
  if (id === me.id) throw new HttpError(409, "SELF", "You can't remove yourself");
  const u = await findTeammate(me.companyId, id);
  if (u.role === "admin") await assertNotLastAdmin(me.companyId, id);
  await db.$transaction([
    db.session.deleteMany({ where: { userId: id } }),
    db.user.update({ where: { id }, data: { companyId: null } }),
  ]);
  return { removed: true };
}
