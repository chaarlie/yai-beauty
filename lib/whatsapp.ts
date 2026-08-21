import { getBusiness } from "./content";

/**
 * Every CTA on this site ends at WhatsApp. There is no server, no database and
 * no email — see the handoff's non-obvious constraints.
 */
export function whatsappUrl(prefill?: string): string {
  const { whatsapp } = getBusiness();
  if (!prefill) return whatsapp;
  return `${whatsapp}?text=${encodeURIComponent(prefill)}`;
}
