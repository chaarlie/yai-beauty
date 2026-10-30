import Image from "next/image";
import type { Dictionary } from "@/lib/dictionaries";
import type { ResultPair } from "@/lib/content";

export type ResultItem = Omit<ResultPair, "service"> & { label: string };

/**
 * ⚠️ Written client consent is required before any before/after photo ships.
 * This is legal exposure in aesthetics, not a design detail — `getResults()`
 * keeps a pair without a `consent` date out of every production build.
 *
 * The grid reads correctly at 0, 2 or 4 items; at 0 the whole section is
 * omitted by the page rather than rendering an empty band.
 *
 * Each card holds both frames, so a pair never splits across a grid reflow. The
 * halves deliberately skip PhotoSlot's parallax: its zoom and drift would crop
 * the two frames differently, which a comparison can't afford.
 */
export function ResultsGallery({ items, dict }: { items: ResultItem[]; dict: Dictionary }) {
  return (
    <section id="resultados" className="section-x py-14 lg:py-22">
      <div className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="reveal t-eyebrow eyebrow-rule">{dict.results.eyebrow}</p>
          <h2 className="reveal t-section-title mt-4">{dict.results.heading}</h2>
        </div>
        <p className="reveal max-w-[320px] text-[14px] leading-[1.65] text-muted">{dict.results.caption}.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4.5 lg:grid-cols-4">
        {items.map((item) => (
          <figure key={item.label} className="reveal">
            <div
              className={`grid aspect-3/4 gap-0.5 overflow-hidden bg-blush-300 ${item.layout === "stacked" ? "grid-rows-2" : "grid-cols-2"}`}
            >
              <ResultFrame src={item.before} tag={dict.results.before} label={item.label} focus={item.focus} />
              <ResultFrame src={item.after} tag={dict.results.after} label={item.label} focus={item.focus} />
            </div>
            <figcaption className="mt-3 font-display text-[17px] leading-[1.3] sm:text-[21px]">{item.label}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function ResultFrame({ src, tag, label, focus }: { src: string; tag: string; label: string; focus: string }) {
  return (
    <div className="relative overflow-hidden">
      <Image
        src={src}
        alt={`${label} — ${tag}`}
        fill
        sizes="(max-width: 1024px) 50vw, 25vw"
        className="object-cover"
        style={{ objectPosition: focus }}
      />
      <span className="absolute bottom-2.5 left-2.5 bg-cream/90 px-2 py-0.5 text-[10px] leading-[1.6] tracking-[0.16em] uppercase">
        {tag}
      </span>
    </div>
  );
}
