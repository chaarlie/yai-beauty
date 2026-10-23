import type { Dictionary } from "@/lib/dictionaries";
import { imageUrl } from "@/lib/content";
import { PhotoSlot } from "./photo-slot";

export function About({ dict }: { dict: Dictionary }) {
  const { about } = dict;

  return (
    <section id="sobre" className="section-x py-14 lg:py-24">
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        {/* Pinned identity block. `self-start` keeps it from stretching so it
            can actually travel; it stays under the sticky header via top-24. */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="reveal t-eyebrow">{about.eyebrow}</p>
          <h2 className="fade-in mt-5 max-w-[420px] font-display text-[32px] leading-[1.15] font-light lg:mt-[22px] lg:text-[44px]">
            {about.heading}
          </h2>
          <PhotoSlot
            label={about.photoLabel}
            src={imageUrl("salon-areas/20261012_0092.webp")}
            revealVariant="calm"
            parallax={false}
            focus="50% 35%"
            className="mt-8 aspect-4/5 lg:mt-10"
          />
        </div>

        {/* The bio — the tall, scrolling column. */}
        <div>
          {about.intro.map((paragraph, i) => (
            <p
              key={paragraph}
              className={`reveal max-w-[620px] text-[17px] leading-[1.8] font-light text-secondary ${i > 0 ? "mt-6" : ""}`}
            >
              {paragraph}
            </p>
          ))}

          {about.sections.map((chapter) => (
            <div key={chapter.heading} className="reveal mt-10 border-t border-rule pt-10 lg:mt-14 lg:pt-14">
              <h3 className="max-w-[420px] font-display text-[26px] leading-[1.2] font-light lg:text-[30px]">
                {chapter.heading}
              </h3>
              <div className="mt-4 max-w-[620px]">
                {chapter.body.map((paragraph, i) => (
                  <p
                    key={paragraph}
                    className={`text-[16px] leading-[1.8] font-light text-secondary ${i > 0 ? "mt-5" : ""}`}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          ))}

          <p className="reveal mt-10 border-t border-rule pt-10 font-display text-[26px] leading-[1.45] font-light text-balance lg:mt-14 lg:pt-14 lg:text-[32px]">
            {about.closing}
          </p>
        </div>
      </div>
    </section>
  );
}
