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
    <section id="resultados" className="section-x bg-blush-50 py-16 lg:py-22">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between lg:mb-9">
        <h2 className="reveal font-display text-[32px] leading-[1.1] font-light lg:text-[46px]">
          {dict.results.heading}
        </h2>
        <p className="reveal t-label-wide text-photo-caption sm:text-right">{dict.results.caption}</p>
      </div>

      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {items.map((item) => (
          <figure key={item.label} className="reveal">
            <div
              className={`grid aspect-3/4 gap-0.5 ${item.layout === "stacked" ? "grid-rows-2" : "grid-cols-2"}`}
            >
              <ResultFrame src={item.before} tag={dict.results.before} label={item.label} focus={item.focus} />
              <ResultFrame src={item.after} tag={dict.results.after} label={item.label} focus={item.focus} />
            </div>
            <figcaption className="t-label mt-3 text-photo-caption">{item.label}</figcaption>
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
      <span className="absolute top-2 left-2 bg-blush-50 px-2.5 py-1.5 font-mono text-[10px] leading-[1.5] tracking-[0.1em] text-[#7a5a4c]">
        {tag}
      </span>
    </div>
  );
}
