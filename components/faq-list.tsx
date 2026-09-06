import type { Dictionary } from "@/lib/dictionaries";

type Item = { q: string; a: string };

/**
 * Static, as in the prototype. With only three short answers an accordion would
 * add interaction cost for no scroll saved, and every answer stays crawlable.
 */
export function FaqList({ items, dict }: { items: Item[]; dict: Dictionary }) {
  return (
    <div>
      <h2 className="reveal mb-7 font-display text-[30px] leading-[1.1] font-light lg:text-[40px]">
        {dict.faq.heading}
      </h2>
      <div className="border-b border-rule">
        {items.map((item) => (
          <div key={item.q} className="border-t border-rule py-5">
            <h3 className="font-display text-[17px] leading-[1.4]">{item.q}</h3>
            <p className="mt-2 text-[15px] leading-[1.7] font-light text-tertiary">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
