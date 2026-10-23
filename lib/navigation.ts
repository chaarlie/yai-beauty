export type NavItem = { href: string; label: string };
type Labels = Record<"services" | "offers" | "prices" | "results" | "about" | "contact", string>;

export function navItems(labels: Labels, visible: { hasPromo: boolean; hasResults: boolean }): NavItem[] {
  return [
    { href: "#tratamientos", label: labels.services },
    ...(visible.hasPromo ? [{ href: "#ofertas", label: labels.offers }] : []),
    { href: "#tratamientos", label: labels.prices },
    ...(visible.hasResults ? [{ href: "#resultados", label: labels.results }] : []),
    { href: "#sobre", label: labels.about },
    { href: "#contacto", label: labels.contact },
  ];
}
