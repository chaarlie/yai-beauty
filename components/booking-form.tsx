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
  "w-full min-h-11 border-b border-on-dark-field bg-transparent px-0.5 py-3.5 text-[15px] font-light text-cream placeholder:text-on-dark-caption focus-visible:border-clay focus-visible:outline-none";

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
 * so the only state is the error the user has to see.
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
    <div className="bg-ink px-7 py-12 text-cream lg:px-12 lg:py-13">
      <h2 className="font-display text-[30px] leading-[1.1] font-light lg:text-[40px]">
        {copy.heading}
      </h2>
      <p className="mt-4 mb-8 text-[15px] leading-[1.7] font-light text-on-dark-intro">
        {copy.intro}
      </p>

      <form onSubmit={handleSubmit} noValidate className="grid gap-3.5 sm:grid-cols-2">
        <input name="name" type="text" required placeholder={copy.name} aria-label={copy.name} className={FIELD} />
        <input
          name="phone"
          type="tel"
          required
          inputMode="tel"
          autoComplete="tel"
          placeholder={copy.phone}
          aria-label={copy.phone}
          className={FIELD}
        />
        <select name="treatment" aria-label={copy.treatment} defaultValue="" className={`${FIELD} sm:col-span-2`}>
          <option value="" className="text-ink">
            {copy.treatment}
          </option>
          {options.map((option) => (
            <option key={option.slug} value={option.name} className="text-ink">
              {option.name}
            </option>
          ))}
        </select>
        <textarea
          name="message"
          placeholder={copy.message}
          aria-label={copy.message}
          className={`${FIELD} h-16 resize-none leading-[1.6] sm:col-span-2`}
        />

        <p aria-live="polite" className="sm:col-span-2 empty:hidden text-[13px] font-light text-blush-300">
          {error ?? (sent ? copy.opening : "")}
        </p>

        <button
          type="submit"
          disabled={!ready}
          className="t-button mt-3.5 min-h-11 w-full bg-clay px-6 py-[18px] tracking-[0.18em] text-white transition-colors duration-100 hover:bg-[#a8776d] disabled:cursor-default sm:col-span-2"
        >
          {copy.submit}
        </button>
      </form>
    </div>
  );
}
