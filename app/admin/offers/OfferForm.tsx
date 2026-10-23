"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PromoFolder } from "@/components/promo-folder";
import { OFFER_LIMITS, formatDay, offerStatus, type Offer } from "@/lib/offers";

/** The dictionary strings the preview folder needs, per language. */
export type PreviewCopy = { cover: string; validUntil: string; value: string; open: string; close: string };

type Lang = "es" | "en";
type Text = { es: string; en: string };
type TextField = "label" | "heading" | "badge" | "title" | "body";

type FormState = {
  active: boolean;
  startsOn: string;
  endsOn: string;
  label: Text;
  heading: Text;
  badge: Text;
  title: Text;
  body: Text;
  steps: Text[];
  /** Two fixed slots, matching the folder's two word stickers. */
  stickers: [Text, Text];
  rewardService: string;
  valueDOP: string;
};

type Props = {
  offer: Offer | null;
  services: { slug: string; name: string }[];
  pricePrefix: string;
  today: string;
  copy: Record<Lang, PreviewCopy>;
};

const toText = (text?: { es: string; en?: string }): Text => ({ es: text?.es ?? "", en: text?.en ?? "" });
const isBlank = (text: Text) => !text.es.trim() && !text.en.trim();

function initialState(offer: Offer | null): FormState {
  return {
    active: offer?.active ?? true,
    startsOn: offer?.startsOn ?? "",
    endsOn: offer?.endsOn ?? "",
    label: toText(offer?.label),
    heading: toText(offer?.heading),
    badge: toText(offer?.badge),
    title: toText(offer?.title),
    body: toText(offer?.body),
    steps: offer?.steps.length ? offer.steps.map(toText) : [toText()],
    stickers: [toText(offer?.stickers[0]), toText(offer?.stickers[1])],
    rewardService: offer?.rewardService ?? "",
    valueDOP: offer?.valueDOP?.toString() ?? "",
  };
}

/**
 * Blank list entries dropped and filled stickers moved to the front, so the
 * indices the API reports errors at match what's on screen.
 */
function tidy(form: FormState): FormState {
  const stickers = form.stickers.filter((sticker) => !isBlank(sticker));
  return {
    ...form,
    steps: form.steps.filter((step) => !isBlank(step)),
    stickers: [stickers[0] ?? toText(), stickers[1] ?? toText()],
  };
}

function payload(form: FormState) {
  return {
    active: form.active,
    startsOn: form.startsOn || null,
    endsOn: form.endsOn || null,
    label: form.label,
    heading: form.heading,
    badge: form.badge,
    title: form.title,
    body: form.body,
    steps: form.steps,
    stickers: form.stickers.filter((sticker) => !isBlank(sticker)),
    rewardService: form.rewardService || null,
    valueDOP: form.valueDOP.trim() === "" ? null : Number(form.valueDOP),
  };
}

const INPUT =
  "w-full border border-rule-button bg-cream px-3.5 py-3 text-base text-ink outline-none transition-colors focus:border-clay aria-[invalid=true]:border-[#8a3b2e]";
const ERROR = "mt-1.5 text-[13px] leading-[1.5] text-[#8a3b2e]";
const HINT = "mt-1.5 text-[13px] leading-[1.5] text-muted";

/**
 * The offer editor: create or edit, then back to the list. Saves through
 * /admin/api/offers, which validates and answers per-field `issues`; the limits
 * here only count characters as she types. Spanish is required, English is
 * optional and falls back to the Spanish on the English page.
 */
export default function OfferForm({ offer, services, pricePrefix, today, copy }: Props) {
  const router = useRouter();
  const [form, setForm] = useState(() => initialState(offer));
  const [lang, setLang] = useState<Lang>("es");
  const [issues, setIssues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"save" | "delete" | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));
  const setText = (key: TextField, value: string) => setForm((f) => ({ ...f, [key]: { ...f[key], [lang]: value } }));

  /** The error for a field in the current language; a whole-field one shows on the Spanish tab. */
  const issue = (key: string) => issues[`${key}.${lang}`] ?? (lang === "es" ? issues[key] : undefined);
  const tabHasIssue = (tab: Lang) =>
    Object.keys(issues).some((key) => key.endsWith(`.${tab}`) || (tab === "es" && /^(label|heading|badge|title|body)$/.test(key)));

  async function request(url: string, init: RequestInit) {
    const res = await fetch(url, init);
    if (res.status === 401) {
      // The session ended mid-edit (expired, or her password changed elsewhere): sign in again.
      router.push(`/admin/login/?next=${encodeURIComponent(window.location.pathname)}`);
      return null;
    }
    return { res, data: await res.json().catch(() => ({})) };
  }

  async function save() {
    const tidied = tidy(form);
    setForm(tidied);
    setBusy("save");
    setIssues({});
    setError(null);
    try {
      const reply = await request(offer ? `/admin/api/offers/${offer.id}/` : "/admin/api/offers/", {
        method: offer ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload(tidied)),
      });
      if (!reply) return;
      if (!reply.res.ok) {
        setIssues(reply.data.issues ?? {});
        setError(reply.data.error ?? "No se pudo guardar. Inténtalo de nuevo.");
        setBusy(null);
        return;
      }
      router.push("/admin/?done=saved");
      router.refresh();
    } catch {
      setError("No se pudo conectar. Tus cambios siguen aquí; intenta guardar de nuevo.");
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    if (!offer) return;
    if (!window.confirm("¿Eliminar esta oferta? No se puede deshacer.\n\nPara quitarla de la página sin borrarla, desmarca «Mostrar en la página».")) {
      return;
    }
    setBusy("delete");
    setError(null);
    try {
      const reply = await request(`/admin/api/offers/${offer.id}/`, { method: "DELETE" });
      if (!reply) return;
      if (!reply.res.ok) {
        setError(reply.data.error ?? "No se pudo eliminar. Inténtalo de nuevo.");
        setBusy(null);
        return;
      }
      router.push("/admin/?done=deleted");
      router.refresh();
    } catch {
      setError("No se pudo conectar. Intenta eliminar de nuevo.");
    } finally {
      setBusy(null);
    }
  }

  // ── Preview: what the public folder will show, in the language being edited.
  const pick = (text: Text) => (lang === "en" && text.en.trim() ? text.en : text.es);
  const amount = form.valueDOP.trim() === "" ? NaN : Number(form.valueDOP);
  // Same format as formatPrice in lib/content.ts, which this client component can't import.
  const value = Number.isInteger(amount) && amount >= 0 ? `${pricePrefix}${amount.toLocaleString("en-US")}` : null;
  const status = offerStatus({ active: form.active, startsOn: form.startsOn || null, endsOn: form.endsOn || null }, today);

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
      className="mt-10"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/admin/" className="t-label text-muted hover:text-ink">
            ← Ofertas
          </Link>
          <h1 className="mt-3 font-display text-[36px] leading-[1.1] font-light lg:text-[40px]">
            {offer ? "Editar oferta" : "Nueva oferta"}
          </h1>
        </div>
        <StatusNote status={status} startsOn={form.startsOn} />
      </div>

      <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-14">
        <div className="grid gap-12">
          <Section title="Estado y fechas">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => set("active", e.target.checked)}
                className="mt-1 size-5 shrink-0 accent-clay"
              />
              <span>
                <span className="block text-[16px]">Mostrar en la página</span>
                <span className={HINT}>Desmárcalo para ocultarla sin borrarla.</span>
              </span>
            </label>
            <div className="grid gap-5 sm:grid-cols-2">
              <DateField id="startsOn" label="Empieza" hint="Vacío: desde ya." value={form.startsOn} onChange={(v) => set("startsOn", v)} error={issues.startsOn} />
              <DateField id="endsOn" label="Termina" hint="Vacío: sin fecha de fin." value={form.endsOn} onChange={(v) => set("endsOn", v)} error={issues.endsOn} />
            </div>
          </Section>

          <Section
            title="Textos"
            aside={
              <div className="flex border border-rule-button" role="group" aria-label="Idioma de los textos">
                {(["es", "en"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setLang(tab)}
                    aria-pressed={lang === tab}
                    className={`t-button-sm relative px-4 py-2.5 ${lang === tab ? "bg-ink text-cream" : "text-secondary hover:text-ink"}`}
                  >
                    {tab === "es" ? "Español" : "English"}
                    {tabHasIssue(tab) ? (
                      <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-[#c0533f]" aria-label="tiene errores" />
                    ) : null}
                  </button>
                ))}
              </div>
            }
          >
            {lang === "en" ? (
              <p className="bg-blush-50 px-4 py-3 text-[14px] leading-[1.6] text-secondary">
                Opcional. Lo que dejes vacío se mostrará en español en la versión en inglés.
              </p>
            ) : null}
            <TextInput id="label" label="Etiqueta" hint="Encima del título. Ej.: Especial del mes" max={OFFER_LIMITS.label} lang={lang} text={form.label} onChange={(v) => setText("label", v)} error={issue("label")} />
            <TextInput id="badge" label="Frase del cupón" hint="Va en el cupón de la carpeta. Ej.: Facial gratis" max={OFFER_LIMITS.badge} lang={lang} text={form.badge} onChange={(v) => setText("badge", v)} error={issue("badge")} />
            <TextInput id="title" label="Título" hint="La frase principal de la oferta." max={OFFER_LIMITS.title} lang={lang} text={form.title} onChange={(v) => setText("title", v)} error={issue("title")} />
            <TextInput id="body" label="Descripción" max={OFFER_LIMITS.body} lang={lang} text={form.body} onChange={(v) => setText("body", v)} error={issue("body")} multiline />
            <TextInput id="heading" label="Encabezado de la sección" hint="Más abajo en la página, sobre la tarjeta oscura. Ej.: Oferta de referidos" max={OFFER_LIMITS.heading} lang={lang} text={form.heading} onChange={(v) => setText("heading", v)} error={issue("heading")} />
          </Section>

          <Section title="Cómo funciona" hint={`Los pasos de la tarjeta, hasta ${OFFER_LIMITS.steps}. Opcional.`}>
            {form.steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="mt-3.5 w-6 shrink-0 font-mono text-[13px] text-clay">{String(i + 1).padStart(2, "0")}</span>
                <div className="min-w-0 flex-1">
                  <TextInput
                    id={`step-${i}`}
                    label={`Paso ${i + 1}`}
                    hideLabel
                    max={OFFER_LIMITS.step}
                    lang={lang}
                    text={step}
                    onChange={(v) => set("steps", form.steps.map((s, j) => (j === i ? { ...s, [lang]: v } : s)))}
                    error={issues[`steps.${i}.${lang}`]}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => set("steps", form.steps.filter((_, j) => j !== i))}
                  className="t-button-sm mt-3 px-1 py-1 text-muted hover:text-ink"
                >
                  Quitar
                </button>
              </div>
            ))}
            {issues.steps ? <p className={ERROR}>{issues.steps}</p> : null}
            {form.steps.length < OFFER_LIMITS.steps ? (
              <button
                type="button"
                onClick={() => set("steps", [...form.steps, toText()])}
                className="t-button-sm justify-self-start border-b border-ink px-1 py-2 hover:border-clay"
              >
                Añadir paso
              </button>
            ) : null}
          </Section>

          <Section title="Stickers" hint={`Palabras cortas pegadas en la carpeta, hasta ${OFFER_LIMITS.sticker} letras. El valor se añade solo como tercer sticker.`}>
            <div className="grid gap-5 sm:grid-cols-2">
              {form.stickers.map((sticker, i) => (
                <TextInput
                  key={i}
                  id={`sticker-${i}`}
                  label={`Sticker ${i + 1}`}
                  max={OFFER_LIMITS.sticker}
                  lang={lang}
                  text={sticker}
                  onChange={(v) =>
                    set("stickers", form.stickers.map((s, j) => (j === i ? { ...s, [lang]: v } : s)) as [Text, Text])
                  }
                  error={issues[`stickers.${i}.${lang}`]}
                />
              ))}
            </div>
            {issues.stickers ? <p className={ERROR}>{issues.stickers}</p> : null}
          </Section>

          <Section title="Valor">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="valueDOP" className="t-label mb-2 block text-secondary">
                  Valor en {pricePrefix}
                </label>
                <input
                  id="valueDOP"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  value={form.valueDOP}
                  onChange={(e) => set("valueDOP", e.target.value)}
                  aria-invalid={Boolean(issues.valueDOP)}
                  className={INPUT}
                />
                <p className={issues.valueDOP ? ERROR : HINT}>{issues.valueDOP ?? "Vacío: no se muestra un valor."}</p>
              </div>
              <div>
                <label htmlFor="rewardService" className="t-label mb-2 block text-secondary">
                  Tratamiento de regalo
                </label>
                <select
                  id="rewardService"
                  value={form.rewardService}
                  onChange={(e) => set("rewardService", e.target.value)}
                  aria-invalid={Boolean(issues.rewardService)}
                  className={INPUT}
                >
                  <option value="">Ninguno</option>
                  {services.map((service) => (
                    <option key={service.slug} value={service.slug}>
                      {service.name}
                    </option>
                  ))}
                </select>
                <p className={issues.rewardService ? ERROR : HINT}>{issues.rewardService ?? "Opcional. No se muestra en la página."}</p>
              </div>
            </div>
          </Section>
        </div>

        <aside className="lg:sticky lg:top-8 lg:self-start" aria-label="Vista previa">
          <p className="t-label text-muted">Vista previa · {lang === "es" ? "Español" : "English"}</p>
          <p className="t-eyebrow mt-5">{pick(form.label) || "Etiqueta"}</p>
          <p className="mt-3 font-display text-[26px] leading-[1.15] font-light text-balance">
            {pick(form.title) || "El título de la oferta"}
          </p>
          <div className="mt-8">
            <PromoFolder
              cover={copy[lang].cover}
              note={form.endsOn ? copy[lang].validUntil.replace("{date}", formatDay(form.endsOn, lang)) : null}
              label={pick(form.label)}
              headline={pick(form.badge) || "—"}
              value={value ? `${copy[lang].value} ${value}` : null}
              stickers={[...form.stickers.map(pick).filter(Boolean), ...(value ? [value] : [])]}
              openLabel={copy[lang].open}
              closeLabel={copy[lang].close}
            />
          </div>
          <p className={`${HINT} mt-6`}>Toca la carpeta para abrirla o cerrarla.</p>
        </aside>
      </div>

      {/* The actions stay on screen on a long form, and on a phone. */}
      <div className="sticky bottom-0 mt-12 flex flex-wrap items-center gap-4 border-t border-rule bg-cream py-4">
        <button
          type="submit"
          disabled={busy !== null}
          className="t-button min-h-[52px] bg-ink px-8 text-cream transition-colors hover:bg-[#0f0c0b] disabled:opacity-60"
        >
          {busy === "save" ? "Guardando…" : "Guardar"}
        </button>
        <Link href="/admin/" className="t-button-sm border-b border-ink px-1 py-2 hover:border-clay">
          Cancelar
        </Link>
        {offer ? (
          <button
            type="button"
            onClick={() => void remove()}
            disabled={busy !== null}
            className="t-button-sm ml-auto px-1 py-2 text-[#8a3b2e] hover:underline disabled:opacity-60"
          >
            {busy === "delete" ? "Eliminando…" : "Eliminar"}
          </button>
        ) : null}
        {error ? (
          <p role="alert" className="w-full text-[15px] leading-[1.5] text-[#8a3b2e]">
            {error}
          </p>
        ) : null}
      </div>
    </form>
  );
}

function Section({ title, hint, aside, children }: { title: string; hint?: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-rule pb-3">
        <div>
          <h2 className="font-display text-[24px] leading-[1.2] font-light">{title}</h2>
          {hint ? <p className={HINT}>{hint}</p> : null}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

function StatusNote({ status, startsOn }: { status: ReturnType<typeof offerStatus>; startsOn: string }) {
  const text = {
    live: "Al guardar, se verá en la página.",
    scheduled: `Programada: aparece el ${startsOn ? formatDay(startsOn, "es") : ""}.`,
    ended: "Ya terminó: no se verá en la página.",
    off: "Oculta: no se verá en la página.",
  }[status];
  return <p className={`t-label ${status === "live" ? "text-clay" : "text-muted"}`}>{text}</p>;
}

function DateField(props: { id: string; label: string; hint: string; value: string; onChange: (value: string) => void; error?: string }) {
  return (
    <div>
      <label htmlFor={props.id} className="t-label mb-2 block text-secondary">
        {props.label}
      </label>
      <div className="flex gap-2">
        <input
          id={props.id}
          type="date"
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          aria-invalid={Boolean(props.error)}
          className={INPUT}
        />
        {props.value ? (
          <button type="button" onClick={() => props.onChange("")} className="t-button-sm shrink-0 px-2 text-muted hover:text-ink">
            Borrar
          </button>
        ) : null}
      </div>
      <p className={props.error ? ERROR : HINT}>{props.error ?? props.hint}</p>
    </div>
  );
}

function TextInput(props: {
  id: string;
  label: string;
  hint?: string;
  hideLabel?: boolean;
  max: number;
  lang: Lang;
  text: Text;
  onChange: (value: string) => void;
  error?: string;
  multiline?: boolean;
}) {
  const value = props.text[props.lang];
  const id = `${props.id}-${props.lang}`;
  const over = value.length > props.max;
  const shared = {
    id,
    value,
    onChange: (e: { target: { value: string } }) => props.onChange(e.target.value),
    // English shows the Spanish as a placeholder: it's what the English page falls back to.
    placeholder: props.lang === "en" ? props.text.es : undefined,
    "aria-invalid": Boolean(props.error) || over,
    "aria-describedby": `${id}-note`,
    className: INPUT,
  };

  return (
    <div>
      <div className={`mb-2 flex items-baseline justify-between gap-3 ${props.hideLabel ? "sr-only" : ""}`}>
        <label htmlFor={id} className="t-label text-secondary">
          {props.label}
          {props.lang === "es" && !props.hideLabel ? <span className="text-clay"> *</span> : null}
        </label>
      </div>
      {props.multiline ? <textarea rows={4} {...shared} /> : <input type="text" {...shared} />}
      <div id={`${id}-note`} className="flex items-start justify-between gap-3">
        <p className={props.error || over ? ERROR : HINT}>
          {props.error ?? (over ? `Máximo ${props.max} caracteres` : props.hint)}
        </p>
        <span className={`mt-1.5 shrink-0 font-mono text-[11px] ${over ? "text-[#8a3b2e]" : "text-muted"}`}>
          {value.length}/{props.max}
        </span>
      </div>
    </div>
  );
}
