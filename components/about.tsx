import type { Dictionary } from "@/lib/dictionaries";
import { imageUrl } from "@/lib/content";
import { PhotoSlot } from "./photo-slot";

/**
 * Yasmín in her own words: the photo beside her introduction and signature,
 * then her three chapters side by side — each opens on its first paragraph,
 * the rest one tap away — and her closing line as a quote.
 */
export function About({ dict }: { dict: Dictionary }) {
  const { about } = dict;

  return (
    <section id="sobre" className="section-x py-14 lg:py-22">
      <div className="grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-22">
        <div className="relative">
          <PhotoSlot
            label={about.photoLabel}
            src={imageUrl("salon-areas/20261012_0092.webp")}
            revealVariant="calm"
            parallax={false}
            focus="50% 35%"
            className="aspect-4/5 w-full"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-4.5 left-5 text-[10px] tracking-[0.3em] text-white uppercase"
          >
            Yai Beauty / Sosúa
          </span>
        </div>

        <div>
          <p className="reveal t-eyebrow eyebrow-rule">{about.eyebrow}</p>
          <h2 className="reveal t-section-title mt-4.5 mb-6.5 text-balance">{about.heading}</h2>
          {about.intro.map((paragraph) => (
            <p key={paragraph} className="reveal mb-4 max-w-[600px] text-[15px] leading-[1.85] text-muted">
              {paragraph}
            </p>
          ))}
          <p className="reveal mt-6.5 font-display text-[38px] leading-none italic">
            {about.signature}
            <span className="mt-2 block font-sans text-[10px] tracking-[0.2em] not-italic text-muted uppercase">
              {about.signatureRole}
            </span>
          </p>
        </div>
      </div>

      <div className="mt-14 grid gap-7 md:grid-cols-3 md:gap-12 lg:mt-20">
        {about.sections.map((chapter, i) => {
          const [first, ...rest] = chapter.body;
          return (
            <article key={chapter.heading} className="reveal border-t border-rule-card pt-5">
              <p className="t-label text-muted">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="my-3.5 font-display text-[27px] leading-[1.12] text-balance">{chapter.heading}</h3>
              <p className="text-[14px] leading-[1.8] text-muted">{first}</p>
              {rest.length > 0 ? (
                <details className="group">
                  <summary className="t-button-sm mt-3.5 inline-flex cursor-pointer list-none items-center gap-3 border-b border-ink after:content-['+'] group-open:after:content-['−'] [&::-webkit-details-marker]:hidden">
                    {about.readMore}
                  </summary>
                  {rest.map((paragraph) => (
                    <p key={paragraph} className="mt-3 text-[14px] leading-[1.8] text-muted">
                      {paragraph}
                    </p>
                  ))}
                </details>
              ) : null}
            </article>
          );
        })}
      </div>

      <blockquote className="reveal mx-auto mt-14 max-w-[860px] text-center font-display text-[length:clamp(28px,3vw,40px)] leading-[1.25] text-balance text-accent italic lg:mt-22">
        {about.closing}
      </blockquote>
    </section>
  );
}
