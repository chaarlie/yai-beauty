import "server-only";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/session";

/**
 * Shared plumbing for the /admin/api route handlers. Errors are JSON with an
 * `error` message in Spanish — the admin shows it to Yasmin as-is.
 */

export async function isAdmin(): Promise<boolean> {
  return (await getAdminSession()) !== null;
}

export function unauthorized() {
  return NextResponse.json({ error: "No autorizado" }, { status: 401 });
}

export function notFound() {
  return NextResponse.json({ error: "No existe esa oferta" }, { status: 404 });
}

export function invalid(issues: Record<string, string>) {
  return NextResponse.json({ error: "Revisa los campos marcados", issues }, { status: 400 });
}

/**
 * The parsed JSON body, or the error response to return instead. Requiring
 * `application/json` is also the CSRF guard: a cross-site <form> can't send that
 * content type, and a cross-site fetch that does needs a preflight we never grant
 * — on top of the session cookie being SameSite=Lax.
 */
export async function readJson(request: Request): Promise<unknown | Response> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return NextResponse.json({ error: "Envía el cuerpo como application/json" }, { status: 415 });
  }
  try {
    return await request.json();
  } catch {
    return NextResponse.json({ error: "JSON no válido" }, { status: 400 });
  }
}

/** 502 when Sanity answered with an error (its client errors carry a statusCode), 500 otherwise. */
export function failure(error: unknown) {
  console.error("[admin api]", error);
  const fromSanity = typeof (error as { statusCode?: unknown } | null)?.statusCode === "number";
  return NextResponse.json(
    { error: "Algo falló al hablar con Sanity. Inténtalo de nuevo." },
    { status: fromSanity ? 502 : 500 },
  );
}

/**
 * Offer and service ids are UUIDs minted on create. Rejecting anything else up
 * front also keeps the `drafts.` and `versions.` id spaces out of reach of the API.
 */
const DOCUMENT_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isDocumentId(id: string): boolean {
  return DOCUMENT_ID.test(id);
}
