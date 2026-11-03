import { NextResponse } from "next/server";
import { ZodError } from "zod";

/** Throw from services/routes to return a specific status + error code */
export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

/** Consistent JSON responses for route handlers */
export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function fail(code: string, message: string, status = 400) {
  return NextResponse.json({ error: { code, message } }, { status });
}

/** Wrap a handler so thrown errors become clean JSON instead of a stack trace */
export async function handle<T>(fn: () => Promise<T>, status = 200) {
  try {
    return ok(await fn(), status);
  } catch (e) {
    if (e instanceof HttpError) return fail(e.code, e.message, e.status);
    if (e instanceof ZodError) {
      return fail("VALIDATION_ERROR", e.issues.map((i) => i.message).join(", "), 422);
    }
    console.error(e);
    return fail("INTERNAL_ERROR", "Unexpected server error", 500);
  }
}

/** Parse a JSON body; a malformed body becomes a 400 instead of a 500 */
export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new HttpError(400, "BAD_JSON", "Request body must be valid JSON");
  }
}
