import { NextResponse } from "next/server";
import { ZodError } from "zod";

/** Consistent JSON responses for route handlers */
export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function fail(code: string, message: string, status = 400) {
  return NextResponse.json({ error: { code, message } }, { status });
}

/** Wrap a handler so thrown errors become clean JSON instead of a stack trace */
export async function handle<T>(fn: () => Promise<T>) {
  try {
    return ok(await fn());
  } catch (e) {
    if (e instanceof ZodError) {
      return fail("VALIDATION_ERROR", e.issues.map((i) => i.message).join(", "), 422);
    }
    console.error(e);
    return fail("INTERNAL_ERROR", "Unexpected server error", 500);
  }
}
