import type { Business } from "@/lib/content";
import type { Dictionary } from "@/lib/dictionaries";

export function SiteFooter({ business, dict }: { business: Business; dict: Dictionary }) {
  const { address } = business;

  return (
    <footer
      id="contacto"
      className="section-x flex flex-col gap-8 bg-blush-50 py-14 sm:flex-row sm:items-start sm:justify-between"
    >
      <div>
        <p className="font-display text-[20px] leading-none tracking-[0.18em] uppercase">
          {business.name}
        </p>
        <address className="mt-3 text-[15px] leading-[1.9] font-light text-tertiary not-italic">
          {address.street}
          <br />
          {address.building}, {address.city}, R.D.
        </address>
      </div>

      <ul className="text-[15px] leading-[1.9] font-light text-tertiary sm:text-right">
        <li>
          <a href={business.whatsapp} target="_blank" rel="noopener noreferrer" aria-label={dict.footer.phoneLabel}>
            {business.phoneDisplay}
          </a>
        </li>
        <li>
          <a href={`mailto:${business.email}`} aria-label={dict.footer.emailLabel}>
            {business.email}
          </a>
        </li>
        <li>
          <a href={business.instagramUrl} target="_blank" rel="noopener noreferrer">
            {dict.footer.instagramLabel} {business.instagram}
          </a>
        </li>
      </ul>
    </footer>
  );
}
