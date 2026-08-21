import { whatsappUrl } from "@/lib/whatsapp";

/**
 * Her clients arrive almost entirely from an Instagram bio link on a phone, so
 * the one action that converts gets a permanent slot there. Hidden from `nav`
 * up, where the header CTA is always on screen.
 */
export function MobileBookBar({ label, prefill }: { label: string; prefill?: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-rule-dark bg-ink px-4 py-3 nav:hidden">
      <a
        href={whatsappUrl(prefill)}
        target="_blank"
        rel="noopener noreferrer"
        className="t-button flex min-h-11 items-center justify-center bg-clay px-6 py-3.5 text-white hover:bg-[#a8776d] hover:text-white"
      >
        {label}
      </a>
    </div>
  );
}
