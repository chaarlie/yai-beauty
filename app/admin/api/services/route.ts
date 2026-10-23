import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { failure, invalid, isAdmin, isDocumentId, readJson, unauthorized } from "@/lib/admin/api";
import { listAdminServices, saveServices, type ServiceSave } from "@/lib/admin/services";
import { SERVICE_LIMITS, SERVICES_TAG, parseServiceInput } from "@/lib/services";

/** Every service, hidden ones included, in catalog order. */
export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  try {
    return NextResponse.json({ services: await listAdminServices() });
  } catch (error) {
    return failure(error);
  }
}

/**
 * Saves a batch: `{ services: [{ key, id?, rev?, ...ServiceInput }] }`. Rows with
 * an `id` (and the `rev` they were read at) are updated, rows without one are
 * created. `key` is the editor's own row id — per-field `issues` come back as
 * `<key>.<field>` so it can mark the right row. All rows save, or none do.
 */
export async function PUT(request: Request) {
  if (!(await isAdmin())) return unauthorized();

  const body = await readJson(request);
  if (body instanceof Response) return body;
  const list = (body as { services?: unknown } | null)?.services;
  if (!Array.isArray(list) || list.length === 0 || list.length > SERVICE_LIMITS.batch) {
    return invalid({ _: `Envía entre 1 y ${SERVICE_LIMITS.batch} servicios` });
  }

  const issues: Record<string, string> = {};
  const rows: ServiceSave[] = [];
  list.forEach((raw, i) => {
    const row = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
    const key = typeof row.key === "string" && row.key ? row.key : String(i);
    const parsed = parseServiceInput(row);
    if (!parsed.ok) {
      for (const [field, message] of Object.entries(parsed.issues)) issues[`${key}.${field}`] = message;
      return;
    }
    if (row.id === undefined || row.id === null) {
      rows.push({ input: parsed.value });
    } else if (typeof row.id === "string" && isDocumentId(row.id) && typeof row.rev === "string" && row.rev) {
      rows.push({ id: row.id, rev: row.rev, input: parsed.value });
    } else {
      issues[`${key}._`] = "Servicio no válido";
    }
  });
  if (Object.keys(issues).length > 0) return invalid(issues);

  try {
    const services = await saveServices(rows);
    revalidateTag(SERVICES_TAG, { expire: 0 });
    return NextResponse.json({ services });
  } catch (error) {
    if ((error as { statusCode?: number } | null)?.statusCode === 409) {
      return NextResponse.json(
        { error: "Estos servicios cambiaron en otra pestaña mientras editabas. Recarga la página para ver la versión actual." },
        { status: 409 },
      );
    }
    return failure(error);
  }
}
