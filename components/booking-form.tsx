"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import { isPlausiblePhone } from "@/lib/phone";

/** Only what the form actually renders crosses the server/client boundary. */
export type BookingOption = { slug: string; name: string };

export type BookingCopy = {
  heading: string;
  intro: string;
  name: string;
  phone: string;
  treatment: string;
  message: string;
  submit: string;
  errorName: string;
  errorPhone: string;
  opening: string;
  prefillIntro: string;
  prefillName: string;
  prefillPhone: string;
  prefillTreatment: string;
  prefillMessage: string;
};

type Props = {
  options: BookingOption[];
  copy: BookingCopy;
  whatsapp: string;
};

// Hydration detection. Hoisted so the store identity is stable across renders.
const noopSubscribe = () => () => {};
const getHydratedSnapshot = () => true;
const getServerSnapshot = () => false;

const FIELD =
  "w-full min-h-11 border-b border-on-dark-field bg-transparent px-0.5 py-3 text-[15px] tracking-normal text-cream normal-case transition-colors focus-visible:border-blush-300 focus-visible:outline-none";
// Visible labels over each field, small and spaced as in the proposal.
const LABEL = "flex flex-col gap-2 text-[10px] leading-none tracking-[0.18em] text-on-dark-intro uppercase";

function buildMessage(copy: BookingCopy, values: Record<string, string>): string {
  const lines = [copy.prefillIntro, ""];
  lines.push(`${copy.prefillName}: ${values.name}`);
  lines.push(`${copy.prefillPhone}: ${values.phone}`);
  if (values.treatment) lines.push(`${copy.prefillTreatment}: ${values.treatment}`);
  if (values.message) lines.push(`${copy.prefillMessage}: ${values.message}`);
  return lines.join("\n");
}

/**
 * This form must not POST anywhere. There is no server, no database and no
 * email — on submit it serializes the fields into a WhatsApp message and opens
 * the deep link. Validation is client-side and deliberately forgiving.
 *
 * The fields are uncontrolled: nothing here needs to re-render per keystroke,
 * so the only state is the error the user has to see. It sits on the dark
 * contact band, which carries the heading and introduction.
 */
export function BookingForm({ options, copy, whatsapp }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  // The form has no server to fall back to: composing the WhatsApp link is the
  // submit. Before hydration a click would fire a native GET, reloading the page
  // with the visitor's name and phone number in the URL — so the button is inert
  // in the server-rendered HTML and enabled once hydrated.
  const ready = useSyncExternalStore(noopSubscribe, getHydratedSnapshot, getServerSnapshot);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const name = String(data.get("name") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();

    if (!name) {
      setError(copy.errorName);
      form.querySelector<HTMLInputElement>('[name="name"]')?.focus();
      return;
    }
    if (!isPlausiblePhone(phone)) {
      setError(copy.errorPhone);
      form.querySelector<HTMLInputElement>('[name="phone"]')?.focus();
      return;
    }

    setError(null);
    setSent(true);

    const text = buildMessage(copy, {
      name,
      phone,
      treatment: String(data.get("treatment") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
    });

    // Opened synchronously inside the submit gesture so the popup blocker and
    // iOS both allow it. `wa.me` falls back to WhatsApp Web on desktop.
    window.open(`${whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-8 grid gap-x-5.5 gap-y-4.5 sm:grid-cols-2">
      <label className={LABEL}>
        {copy.name}
        <input name="name" type="text" required autoComplete="name" className={FIELD} />
      </label>
      <label className={LABEL}>
        {copy.phone}
        <input name="phone" type="tel" required inputMode="tel" autoComplete="tel" className={FIELD} />
      </label>
      <label className={`${LABEL} sm:col-span-2`}>
        {copy.treatment}
        <select name="treatment" defaultValue="" className={FIELD}>
          <option value="" className="text-ink" />
          {options.map((option) => (
            <option key={option.slug} value={option.name} className="text-ink">
              {option.name}
            </option>
          ))}
        </select>
      </label>
      <label className={`${LABEL} sm:col-span-2`}>
        {copy.message}
        <textarea name="message" className={`${FIELD} h-20 resize-y leading-[1.6]`} />
      </label>

      <p aria-live="polite" className="text-[13px] text-blush-300 empty:hidden sm:col-span-2">
        {error ?? (sent ? copy.opening : "")}
      </p>

      <button
        type="submit"
        disabled={!ready}
        className="t-button-sm inline-flex min-h-12 items-center justify-center gap-6 justify-self-start bg-blush-300 px-[23px] py-3.5 text-ink transition-[background-color,translate] duration-200 hover:-translate-y-0.5 hover:bg-white disabled:cursor-default sm:col-span-2"
      >
        {copy.submit}
        <span aria-hidden="true">↗</span>
      </button>
    </form>
  );
}
