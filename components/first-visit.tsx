import type { Dictionary } from "@/lib/dictionaries";

/** The proposal's three steps for someone who has never been: book, evaluation, home care. */
export function FirstVisit({ dict }: { dict: Dictionary }) {
  const { visit } = dict;

  return (
    <section className="section-x bg-band py-12 lg:py-16">
      {/* A real heading styled small, so the steps sit under it in the outline. */}
      <h2 className="reveal t-eyebrow">{visit.eyebrow}</h2>
      <div className="mt-8 grid gap-6.5 md:grid-cols-3 md:gap-12">
        {visit.steps.map((step) => (
          <article key={step.label} className="reveal border-t border-rule-card pt-5">
            <p className="t-eyebrow text-[10px] text-muted">{step.label}</p>
            <h3 className="my-3.5 font-display text-[30px] leading-[1.08]">{step.title}</h3>
            <p className="text-[14px] leading-[1.7] text-muted">{step.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
