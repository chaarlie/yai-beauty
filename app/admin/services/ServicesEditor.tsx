"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Localized } from "@/lib/offers";
import { SERVICE_LIMITS, type AdminService, type CategoryId } from "@/lib/services";

type Text = { es: string; en: string };
type TextField = "name" | "display" | "note";

type Row = {
  /** The service id once saved; "new-N" until then. */
  key: string;
  id?: string;
  rev?: string;
  slug?: string;
  featured: boolean;
  category: CategoryId;
  name: Text;
  display: Text;
  note: Text;
  benefits: Text[];
  price: string;
  active: boolean;
};

type Props = {
  initial: AdminService[];
  categories: { id: CategoryId; es: string }[];
  pricePrefix: string;
};

const toText = (text: Localized | null): Text => ({ es: text?.es ?? "", en: text?.en ?? "" });
const isBlank = (text: Text) => !text.es.trim() && !text.en.trim();

function toRow(service: AdminService): Row {
  return {
    key: service.id,
    id: service.id,
    rev: service.rev,
    slug: service.slug,
    featured: service.featured,
    category: service.category,
    name: toText(service.name),
    display: toText(service.display),
    note: toText(service.note),
    benefits: service.benefits.map(toText),
    price: String(service.price),
    active: service.active,
  };
}

/** What a save would change; equal fingerprints mean the row is untouched. A blank benefit isn't a change. */
const fingerprint = (row: Row) =>
  JSON.stringify([row.category, row.name, row.display, row.note, row.benefits.filter((b) => !isBlank(b)), row.price.trim(), row.active]);

/** A new row she added but hasn't typed anything into: not a change. */
const isEmptyNew = (row: Row) => !row.id && isBlank(row.name) && !row.price.trim();

function payload(row: Row) {
  return {
    key: row.key,
    ...(row.id ? { id: row.id, rev: row.rev } : {}),
    category: row.category,
    name: row.name,
    display: isBlank(row.display) ? null : row.display,
    note: isBlank(row.note) ? null : row.note,
    // Blanks included: the API drops them, and its issues then number the items as the editor does.
    benefits: row.benefits,
    // An empty or non-numeric price goes as null, and the API names the row.
    price: row.price.trim() === "" ? null : Number(row.price),
    active: row.active,
  };
}

const INPUT =
  "w-full border border-rule-button bg-cream px-3 py-2.5 text-base text-ink outline-none transition-colors focus:border-clay aria-[invalid=true]:border-[#8a3b2e]";
const LABEL = "t-label mb-1.5 block text-secondary";
const ERROR = "mt-1 text-[13px] leading-[1.5] text-[#8a3b2e]";

/** Fields that live behind "Más"; an error in one opens the row. */
const DETAIL_FIELDS = ["name.en", "display", "note", "benefits", "category"];

/**
 * The price list as Yasmin edits it: every service by category, its Spanish name
 * and price inline, the rest behind "Más". Edits stay local until "Guardar
 * cambios", which sends every changed row to /admin/api/services in one
 * all-or-nothing save; the page then shows what was stored.
 */
export default function ServicesEditor({ initial, categories, pricePrefix }: Props) {
  const router = useRouter();
  const [saved, setSaved] = useState(() => initial.map(toRow));
  const [rows, setRows] = useState(saved);
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const [issues, setIssues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const added = useRef(0);

  const savedPrints = useMemo(() => new Map(saved.map((row) => [row.key, fingerprint(row)])), [saved]);
  const changed = rows.filter((row) => (row.id ? savedPrints.get(row.key) !== fingerprint(row) : !isEmptyNew(row)));
  const isChanged = (row: Row) => changed.includes(row);

  // Leaving with unsaved edits asks first.
  useEffect(() => {
    if (changed.length === 0) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [changed.length]);

  const update = (key: string, patch: Partial<Row>) => {
    setNotice(null);
    setRows((all) => all.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  };
  const updateText = (key: string, field: TextField, lang: "es" | "en", value: string) => {
    setNotice(null);
    setRows((all) => all.map((row) => (row.key === key ? { ...row, [field]: { ...row[field], [lang]: value } } : row)));
  };
  const toggle = (key: string) =>
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  function addRow(category: CategoryId) {
    added.current += 1;
    const key = `new-${added.current}`;
    const blank = { es: "", en: "" };
    setRows((all) => [...all, { key, featured: false, category, name: blank, display: blank, note: blank, benefits: [], price: "", active: true }]);
  }

  function discard() {
    setRows(saved);
    setIssues({});
    setError(null);
    setNotice(null);
  }

  async function save() {
    if (changed.length === 0) return;
    setBusy(true);
    setIssues({});
    setError(null);
    setNotice(null);
    try {
      const res = await fetch("/admin/api/services/", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ services: changed.map(payload) }),
      });
      if (res.status === 401) {
        router.push(`/admin/login/?next=${encodeURIComponent(window.location.pathname)}`);
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const found: Record<string, string> = data.issues ?? {};
        setIssues(found);
        setError(data.error ?? "No se pudo guardar. Inténtalo de nuevo.");
        // Open every row whose error sits behind "Más".
        const keys = Object.keys(found).filter((key) => DETAIL_FIELDS.some((field) => key.includes(`.${field}`)));
        if (keys.length) setOpen((current) => new Set([...current, ...keys.map((key) => key.split(".")[0])]));
        return;
      }
      const fresh = (data.services as AdminService[]).map(toRow);
      setSaved(fresh);
      setRows(fresh);
      setNotice(`Guardado: ${changed.length} ${changed.length === 1 ? "servicio" : "servicios"}. Ya se ve en la página.`);
    } catch {
      setError("No hay conexión. Tus cambios siguen aquí; inténtalo de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-10">
      <h1 className="font-display text-[40px] leading-[1.1] font-light">Servicios y precios</h1>
      <p className="mt-3 max-w-[620px] text-[15px] leading-[1.6] font-light text-secondary">
        Cambia nombres, precios y beneficios aquí y pulsa «Guardar cambios». Para dejar de ofrecer un servicio, desmarca
        «Mostrar»: desaparece de la lista de precios y de las reservas, pero no se borra.
      </p>

      <div className="mt-10 grid gap-12">
        {categories.map((category) => {
          const list = rows.filter((row) => row.category === category.id);
          return (
            <section key={category.id} aria-labelledby={`cat-${category.id}`}>
              <h2 id={`cat-${category.id}`} className="border-b border-rule pb-3 font-display text-[26px] leading-[1.2] font-light">
                {category.es}
              </h2>
              <ul>
                {list.map((row) => (
                  <ServiceRow
                    key={row.key}
                    row={row}
                    categories={categories}
                    pricePrefix={pricePrefix}
                    open={open.has(row.key)}
                    changed={isChanged(row)}
                    issues={issues}
                    onToggle={() => toggle(row.key)}
                    onUpdate={(patch) => update(row.key, patch)}
                    onText={(field, lang, value) => updateText(row.key, field, lang, value)}
                    onRemove={row.id ? undefined : () => setRows((all) => all.filter((r) => r.key !== row.key))}
                  />
                ))}
              </ul>
              <button
                type="button"
                onClick={() => addRow(category.id)}
                className="t-button-sm mt-4 border-b border-ink px-1 py-2 hover:border-clay"
              >
                Añadir servicio en {category.es}
              </button>
            </section>
          );
        })}
      </div>

      <div className="sticky bottom-0 mt-12 flex flex-wrap items-center gap-4 border-t border-rule bg-cream py-4">
        <button
          type="button"
          onClick={() => void save()}
          disabled={busy || changed.length === 0}
          className="t-button min-h-[52px] bg-ink px-8 text-cream transition-colors hover:bg-[#0f0c0b] disabled:opacity-50"
        >
          {busy ? "Guardando…" : changed.length ? `Guardar cambios (${changed.length})` : "Sin cambios"}
        </button>
        {changed.length > 0 && !busy ? (
          <button type="button" onClick={discard} className="t-button-sm border-b border-ink px-1 py-2 hover:border-clay">
            Descartar
          </button>
        ) : null}
        {notice ? (
          <p role="status" className="text-[15px] text-secondary">
            {notice}
          </p>
        ) : null}
        {error ? (
          <p role="alert" className="w-full text-[15px] leading-[1.5] text-[#8a3b2e]">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function ServiceRow({
  row,
  categories,
  pricePrefix,
  open,
  changed,
  issues,
  onToggle,
  onUpdate,
  onText,
  onRemove,
}: {
  row: Row;
  categories: Props["categories"];
  pricePrefix: string;
  open: boolean;
  changed: boolean;
  issues: Record<string, string>;
  onToggle: () => void;
  onUpdate: (patch: Partial<Row>) => void;
  onText: (field: TextField, lang: "es" | "en", value: string) => void;
  onRemove?: () => void;
}) {
  const issue = (field: string) => issues[`${row.key}.${field}`];
  const label = row.name.es || "servicio nuevo";
  const id = (field: string) => `${row.key}-${field}`;

  return (
    <li className={`border-b border-rule py-4 ${row.active ? "" : "opacity-60"}`}>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-3 sm:grid-cols-[minmax(0,1fr)_9rem_auto_auto] sm:items-start">
        <div className="col-span-2 sm:col-span-1">
          <label htmlFor={id("name")} className="sr-only">
            Nombre
          </label>
          <input
            id={id("name")}
            value={row.name.es}
            onChange={(e) => onText("name", "es", e.target.value)}
            maxLength={SERVICE_LIMITS.name}
            placeholder="Nombre del servicio"
            aria-invalid={Boolean(issue("name.es"))}
            className={INPUT}
          />
          {issue("name.es") ? <p className={ERROR}>{issue("name.es")}</p> : null}
          <p className="mt-1.5 flex flex-wrap gap-2">
            {!row.id ? <Chip>Nuevo</Chip> : null}
            {changed && row.id ? <Chip tone="clay">Sin guardar</Chip> : null}
            {row.featured ? <Chip>Con foto</Chip> : null}
            {!row.active ? <Chip>Oculto</Chip> : null}
          </p>
        </div>

        <div>
          <label htmlFor={id("price")} className="sr-only">
            Precio de {label} en {pricePrefix}
          </label>
          <div className="flex items-center gap-2">
            <span className="text-[15px] text-muted">{pricePrefix}</span>
            <input
              id={id("price")}
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              value={row.price}
              onChange={(e) => onUpdate({ price: e.target.value })}
              aria-invalid={Boolean(issue("price"))}
              className={`${INPUT} w-[7rem]`}
            />
          </div>
          {issue("price") ? <p className={ERROR}>{issue("price")}</p> : null}
        </div>

        <label className="flex cursor-pointer items-center gap-2 self-center sm:mt-2.5 sm:self-start">
          <input
            type="checkbox"
            checked={row.active}
            onChange={(e) => onUpdate({ active: e.target.checked })}
            className="size-5 accent-clay"
          />
          <span className="text-[15px]">Mostrar</span>
        </label>

        <div className="col-span-2 flex items-center gap-4 sm:col-span-1 sm:mt-2">
          <button type="button" onClick={onToggle} aria-expanded={open} aria-controls={id("details")} className="t-button-sm border-b border-ink px-1 py-1 hover:border-clay">
            {open ? "Menos" : "Más"}
          </button>
          {onRemove ? (
            <button type="button" onClick={onRemove} className="t-button-sm px-1 py-1 text-muted hover:text-ink">
              Quitar
            </button>
          ) : null}
        </div>
      </div>

      {open ? (
        <div id={id("details")} className="mt-5 grid gap-5 bg-blush-50 p-4 sm:grid-cols-2 sm:p-5">
          <Detail label="Nombre en inglés" hint="Vacío: la versión en inglés usa el español." error={issue("name.en")}>
            <input id={id("name-en")} value={row.name.en} placeholder={row.name.es} onChange={(e) => onText("name", "en", e.target.value)} maxLength={SERVICE_LIMITS.name} className={INPUT} />
          </Detail>
          <Detail label="Categoría" error={issue("category")}>
            <select id={id("category")} value={row.category} onChange={(e) => onUpdate({ category: e.target.value as CategoryId })} className={INPUT}>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.es}
                </option>
              ))}
            </select>
          </Detail>
          <Detail label="Título del catálogo" hint="Opcional. Reemplaza al nombre en la lista de precios." error={issue("display.es") ?? issue("display")}>
            <input id={id("display-es")} value={row.display.es} onChange={(e) => onText("display", "es", e.target.value)} maxLength={SERVICE_LIMITS.display} className={INPUT} />
          </Detail>
          <Detail label="Título del catálogo (inglés)" error={issue("display.en")}>
            <input id={id("display-en")} value={row.display.en} placeholder={row.display.es} onChange={(e) => onText("display", "en", e.target.value)} maxLength={SERVICE_LIMITS.display} className={INPUT} />
          </Detail>
          <Detail label="Nota" hint="Opcional. Ej.: Solo mujeres" error={issue("note.es") ?? issue("note")}>
            <input id={id("note-es")} value={row.note.es} onChange={(e) => onText("note", "es", e.target.value)} maxLength={SERVICE_LIMITS.note} className={INPUT} />
          </Detail>
          <Detail label="Nota (inglés)" error={issue("note.en")}>
            <input id={id("note-en")} value={row.note.en} placeholder={row.note.es} onChange={(e) => onText("note", "en", e.target.value)} maxLength={SERVICE_LIMITS.note} className={INPUT} />
          </Detail>
          <div className="sm:col-span-2">
            <p className={LABEL}>Beneficios</p>
            <p className="text-[13px] leading-[1.5] text-muted">
              Lo que hace el tratamiento, uno en cada casilla, hasta {SERVICE_LIMITS.benefits}. Se ven junto a la foto en los servicios «Con foto».
            </p>
            {row.benefits.map((benefit, i) => {
              const setBenefit = (lang: "es" | "en", value: string) =>
                onUpdate({ benefits: row.benefits.map((b, j) => (j === i ? { ...b, [lang]: value } : b)) });
              return (
                <div key={i} className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-start">
                  <div>
                    <label htmlFor={id(`benefit-${i}-es`)} className="sr-only">
                      Beneficio {i + 1}
                    </label>
                    <textarea id={id(`benefit-${i}-es`)} rows={2} value={benefit.es} onChange={(e) => setBenefit("es", e.target.value)} maxLength={SERVICE_LIMITS.benefit} aria-invalid={Boolean(issue(`benefits.${i}.es`))} className={INPUT} />
                    {issue(`benefits.${i}.es`) ? <p className={ERROR}>{issue(`benefits.${i}.es`)}</p> : null}
                  </div>
                  <div>
                    <label htmlFor={id(`benefit-${i}-en`)} className="sr-only">
                      Beneficio {i + 1} en inglés
                    </label>
                    <textarea id={id(`benefit-${i}-en`)} rows={2} value={benefit.en} placeholder={benefit.es || "En inglés (opcional)"} onChange={(e) => setBenefit("en", e.target.value)} maxLength={SERVICE_LIMITS.benefit} aria-invalid={Boolean(issue(`benefits.${i}.en`))} className={INPUT} />
                    {issue(`benefits.${i}.en`) ? <p className={ERROR}>{issue(`benefits.${i}.en`)}</p> : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => onUpdate({ benefits: row.benefits.filter((_, j) => j !== i) })}
                    className="t-button-sm justify-self-start px-1 py-1 text-muted hover:text-ink sm:mt-2"
                  >
                    Quitar
                  </button>
                </div>
              );
            })}
            {issue("benefits") ? <p className={ERROR}>{issue("benefits")}</p> : null}
            {row.benefits.length < SERVICE_LIMITS.benefits ? (
              <button
                type="button"
                onClick={() => onUpdate({ benefits: [...row.benefits, { es: "", en: "" }] })}
                className="t-button-sm mt-3 border-b border-ink px-1 py-2 hover:border-clay"
              >
                Añadir beneficio
              </button>
            ) : null}
          </div>
          {row.slug ? (
            <p className="text-[13px] leading-[1.5] text-muted sm:col-span-2">
              Identificador: <span className="font-mono">{row.slug}</span> — no cambia aunque cambies el nombre.
            </p>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

function Detail({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactElement<{ id: string }> }) {
  return (
    <div>
      <label htmlFor={children.props.id} className={LABEL}>
        {label}
      </label>
      {children}
      {error ? <p className={ERROR}>{error}</p> : hint ? <p className="mt-1 text-[13px] leading-[1.5] text-muted">{hint}</p> : null}
    </div>
  );
}

function Chip({ children, tone }: { children: React.ReactNode; tone?: "clay" }) {
  return (
    <span className={`t-label px-2 py-0.5 ${tone === "clay" ? "bg-clay text-white" : "bg-blush-50 text-muted"}`}>
      {children}
    </span>
  );
}
