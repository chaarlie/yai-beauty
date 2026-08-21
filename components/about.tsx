import type { Dictionary } from "@/lib/dictionaries";
import { PhotoSlot } from "./photo-slot";

/**
 * Yai's own words, so the section carries real length. The opening stays in the
 * prototype's two-column arrangement; the three chapters below it use the same
 * heading-left / body-right row the treatments and FAQ headers already use, so
 * a long read stays inside the design language rather than becoming a wall.
 */
export function About({ dict }: { dict: Dictionary }) {
  const { about } = dict;

  return (
    <section id="sobre">
      <div className="grid items-center lg:grid-cols-[0.9fr_1.1fr]">
        <PhotoSlot label={about.photoLabel} className="min-h-[320px] lg:min-h-[520px]" />

        <div className="section-x py-14 lg:py-20">
          <p className="t-eyebrow">{about.eyebrow}</p>
          <h2 className="mt-5 max-w-[520px] font-display text-[32px] leading-[1.15] font-light lg:mt-[22px] lg:text-[44px]">
            {about.heading}
          </h2>

          {about.intro.map((paragraph) => (
            <p
              key={paragraph}
              className="mt-6 max-w-[520px] text-[17px] leading-[1.8] font-light text-secondary"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      <div className="section-x pb-16 lg:pb-22">
        {about.sections.map((chapter) => (
          <div
            key={chapter.heading}
            className="grid gap-4 border-t border-rule py-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:py-14"
          >
            <h3 className="max-w-[380px] font-display text-[26px] leading-[1.2] font-light lg:text-[30px]">
              {chapter.heading}
            </h3>
            <div className="max-w-[620px]">
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

        <p className="border-t border-rule pt-10 font-display text-[26px] leading-[1.45] font-light text-balance lg:pt-14 lg:text-[32px]">
          {about.closing}
        </p>
      </div>
    </section>
  );
}
