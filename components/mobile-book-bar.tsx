import { whatsappUrl } from "@/lib/whatsapp";

/**
 * Her clients arrive almost entirely from an Instagram bio link on a phone, so
 * the one action that converts gets a permanent slot there. Hidden from `nav`
 * up, where the header CTA is always on screen.
 */
export function MobileBookBar({ label, prefill }: { label: string; prefill?: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-rule bg-cream px-5 pt-2.5 pb-[calc(10px+env(safe-area-inset-bottom))] nav:hidden">
      <a
        href={whatsappUrl(prefill)}
        target="_blank"
        rel="noopener noreferrer"
        className="t-button-sm flex min-h-12 items-center justify-center gap-6 bg-ink px-6 py-3.5 text-white hover:bg-[#574238] hover:text-white"
      >
        {label}
        <span aria-hidden="true">↗</span>
      </a>
    </div>
  );
}
