import type { Dictionary } from "@/lib/dictionaries";

/**
 * Questions on the right, each opening in place, as in the proposal. Plain
 * <details>: no script, and the answers stay in the page for search engines.
 */
export function FaqList({ dict }: { dict: Dictionary }) {
  const { faq } = dict;

  return (
    <section className="section-x py-14 lg:py-22">
      <div className="grid gap-7 lg:grid-cols-[0.8fr_1.2fr] lg:gap-22">
        <div>
          <p className="reveal t-eyebrow eyebrow-rule">{faq.eyebrow}</p>
          <h2 className="reveal t-section-title mt-4">{faq.heading}</h2>
        </div>
        <div className="reveal">
          {faq.items.map((item) => (
            <details key={item.q} className="group border-b border-rule py-5.5 first:border-t">
              <summary className="flex cursor-pointer list-none justify-between gap-4 text-[16px] leading-[1.5] after:text-accent after:content-['+'] group-open:after:content-['−'] [&::-webkit-details-marker]:hidden">
                {item.q}
              </summary>
              <p className="mt-3.5 text-[14px] leading-[1.7] text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
