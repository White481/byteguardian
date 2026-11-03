"use client";

import { useState } from "react";
import { Trash2, UserPlus } from "lucide-react";
import { useForm } from "@/components/forms/use-form";
import { useSession } from "@/components/session/session-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Alert, ErrorState, LoadingState } from "@/components/ui/feedback";
import { Field, Input, Select } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page";
import { Table, Td, Th } from "@/components/ui/table";
import { apiFetch, useApi } from "@/lib/api-client";
import { ROLES } from "@/lib/options";
import type { Collaborator, Role } from "@/lib/types";
import { initials } from "@/lib/utils";
import { InviteInput } from "@/lib/validation";

export function Collaborators() {
  const me = useSession();
  const isAdmin = me.role === "admin";
  const { data, loading, error, reload } = useApi<Collaborator[]>("/api/collaborators");
  const invite = useForm(InviteInput, { fullName: "", email: "", role: "member" });
  const [busy, setBusy] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);
  const [invited, setInvited] = useState<string | null>(null);

  if (loading) return <LoadingState label="Loading team…" />;
  if (error || !data) return <ErrorState message={error ?? "No data"} onRetry={reload} />;

  async function act(id: string, fn: () => Promise<unknown>) {
    setBusy(id);
    setRowError(null);
    try {
      await fn();
      await reload();
    } catch (e) {
      setRowError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(null);
    }
  }

  const changeRole = (c: Collaborator, role: Role) =>
    act(c.id, () => apiFetch(`/api/collaborators/${c.id}`, { method: "PATCH", body: JSON.stringify({ role }) }));

  const remove = (c: Collaborator) => {
    if (!window.confirm(`Remove ${c.fullName} from the company?`)) return;
    void act(c.id, () => apiFetch(`/api/collaborators/${c.id}`, { method: "DELETE" }));
  };

  return (
    <>
      <PageHeader title="Collaborators" description={`People who can access ${me.companyName ?? "your company"}.`} />

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title={`Team (${data.length})`} />
          <CardBody>
            {rowError && <Alert className="mb-3">{rowError}</Alert>}
            <Table>
              <thead>
                <tr>
                  <Th>Name</Th>
                  <Th>Role</Th>
                  <Th>Status</Th>
                  {isAdmin && <Th />}
                </tr>
              </thead>
              <tbody>
                {data.map((c) => (
                  <tr key={c.id} className={busy === c.id ? "opacity-60" : undefined}>
                    <Td>
                      <div className="flex items-center gap-3">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-3 text-xs font-bold">
                          {initials(c.fullName)}
                        </span>
                        <div>
                          <p className="font-medium text-fg">
                            {c.fullName} {c.isYou && <span className="text-xs text-subtle">(you)</span>}
                          </p>
                          <p className="text-xs text-muted">{c.email}</p>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      {isAdmin && !c.isYou ? (
                        <Select
                          aria-label={`Role of ${c.fullName}`}
                          className="h-8 w-28"
                          value={c.role}
                          disabled={busy === c.id}
                          onChange={(e) => changeRole(c, e.target.value as Role)}
                        >
                          {ROLES.map((r) => (
                            <option key={r.value} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </Select>
                      ) : (
                        <span className="capitalize">{c.role}</span>
                      )}
                    </Td>
                    <Td>{c.hasAccount ? <Badge tone="success">Active</Badge> : <Badge tone="warning">Invited</Badge>}</Td>
                    {isAdmin && (
                      <Td className="text-right">
                        {!c.isYou && (
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label={`Remove ${c.fullName}`}
                            disabled={busy === c.id}
                            onClick={() => remove(c)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                      </Td>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardBody>
        </Card>

        <div className="flex flex-col gap-4">
          {isAdmin ? (
            <Card>
              <CardHeader title="Invite a teammate" icon={<UserPlus className="size-5" />} />
              <CardBody>
                <form
                  noValidate
                  className="flex flex-col gap-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setInvited(null);
                    invite.submit("/api/collaborators", async () => {
                      setInvited(invite.values.email);
                      invite.setValues({ fullName: "", email: "", role: invite.values.role });
                      await reload();
                    });
                  }}
                >
                  {invite.formError && <Alert>{invite.formError}</Alert>}
                  {invited && (
                    <Alert tone="success">
                      Invited {invited}. Ask them to create an account at /register with this email.
                    </Alert>
                  )}
                  <Field label="Full name" htmlFor="fullName" required error={invite.errors.fullName}>
                    <Input {...invite.field("fullName")} />
                  </Field>
                  <Field label="Work email" htmlFor="email" required error={invite.errors.email}>
                    <Input {...invite.field("email")} type="email" />
                  </Field>
                  <Field label="Role" htmlFor="role" required error={invite.errors.role}>
                    <Select {...invite.field("role")}>
                      {ROLES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Button type="submit" loading={invite.submitting}>
                    Send invite
                  </Button>
                  <p className="text-xs text-subtle">Invitation emails aren&apos;t sent yet — share the link yourself.</p>
                </form>
              </CardBody>
            </Card>
          ) : (
            <Alert tone="info">Only admins can invite people or change roles.</Alert>
          )}

          <Card>
            <CardHeader title="Roles" />
            <CardBody>
              <dl className="flex flex-col gap-3 text-sm">
                {ROLES.map((r) => (
                  <div key={r.value}>
                    <dt className="font-medium">{r.label}</dt>
                    <dd className="text-muted">{r.description}</dd>
                  </div>
                ))}
              </dl>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
