"use client";

import { useState } from "react";
import type { z } from "zod";
import { apiFetch } from "@/lib/api-client";
import { fieldErrors } from "@/lib/validation";

/**
 * Small form helper: values + per-field errors + submit with client-side zod validation.
 *   const form = useForm(LoginInput, { email: "", password: "" });
 *   <Input {...form.field("email")} />  … form.submit(url, onSuccess)
 */
export function useForm<S extends z.ZodTypeAny>(schema: S, initial: Record<string, string>) {
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function set(name: string, value: string) {
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) {
      setErrors((e) => {
        const next = { ...e };
        delete next[name];
        return next;
      });
    }
  }

  /** Props for <Input>/<Select>/<Textarea> */
  function field(name: string) {
    return {
      id: name,
      name,
      value: values[name] ?? "",
      "aria-invalid": errors[name] ? true : undefined,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        set(name, e.target.value),
    };
  }

  /** Validates, sends JSON, calls onSuccess with the response. Returns false on failure. */
  async function submit<T>(
    url: string,
    onSuccess: (data: T) => void | Promise<void>,
    opts: { method?: string; schema?: z.ZodTypeAny; values?: Record<string, string> } = {},
  ) {
    setFormError(null);
    const parsed = (opts.schema ?? schema).safeParse(opts.values ?? values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return false;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const data = await apiFetch<T>(url, { method: opts.method ?? "POST", body: JSON.stringify(parsed.data) });
      await onSuccess(data);
      return true;
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Something went wrong");
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  return { values, setValues, set, errors, setErrors, formError, setFormError, submitting, field, submit };
}
