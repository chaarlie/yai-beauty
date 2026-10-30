export type NavItem = { href: string; label: string };
type Labels = Record<"services" | "offers" | "prices" | "results" | "about" | "contact", string>;

/** In page order, so the header underline steps through the menu as you scroll. */
export function navItems(labels: Labels, visible: { hasPromo: boolean; hasResults: boolean }): NavItem[] {
  return [
    { href: "#tratamientos", label: labels.services },
    { href: "#precios", label: labels.prices },
    ...(visible.hasPromo ? [{ href: "#ofertas", label: labels.offers }] : []),
    ...(visible.hasResults ? [{ href: "#resultados", label: labels.results }] : []),
    { href: "#sobre", label: labels.about },
    { href: "#contacto", label: labels.contact },
  ];
}
