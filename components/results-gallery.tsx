import type { Dictionary } from "@/lib/dictionaries";
import { PhotoSlot } from "./photo-slot";

export type ResultItem = { label: string; src?: string };

/**
 * ⚠️ Written client consent is required before any before/after photo ships.
 * This is legal exposure in aesthetics, not a design detail — an item without
 * signed consent must simply not be in this array.
 *
 * The grid reads correctly at 0, 2 or 4 items; at 0 the whole section is
 * omitted by the page rather than rendering an empty band.
 */
export function ResultsGallery({ items, dict }: { items: ResultItem[]; dict: Dictionary }) {
  return (
    <section id="resultados" className="section-x bg-blush-50 py-16 lg:py-22">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between lg:mb-9">
        <h2 className="reveal font-display text-[32px] leading-[1.1] font-light lg:text-[46px]">
          {dict.results.heading}
        </h2>
        <p className="reveal t-label-wide text-photo-caption sm:text-right">{dict.results.caption}</p>
      </div>

      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {items.map((item) => (
          <PhotoSlot
            key={item.label}
            label={item.label}
            src={item.src}
            size="sm"
            className="aspect-3/4"
          />
        ))}
      </div>
    </section>
  );
}
