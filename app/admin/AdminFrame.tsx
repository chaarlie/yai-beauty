import Link from "next/link";
import { signOut } from "@/lib/admin/login";

export type AdminSection = "offers" | "services";

const SECTIONS: { id: AdminSection; href: string; label: string }[] = [
  { id: "offers", href: "/admin/", label: "Ofertas" },
  { id: "services", href: "/admin/services/", label: "Servicios y precios" },
];

/**
 * The header every signed-in /admin screen shares: the two sections, who's in,
 * sign out. Sign-out is a form posting the server action, so it works before
 * any JavaScript loads.
 */
export default function AdminFrame({
  email,
  section,
  children,
}: {
  email: string;
  section: AdminSection;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[1120px] px-5 pb-16 lg:px-8">
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-rule py-5">
        <div className="flex flex-wrap items-center gap-x-7 gap-y-2">
          <span className="t-eyebrow">Yai Beauty · Admin</span>
          <nav aria-label="Secciones del admin" className="flex gap-5">
            {SECTIONS.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                aria-current={item.id === section ? "page" : undefined}
                className={`t-button-sm border-b px-1 py-1.5 ${item.id === section ? "border-ink text-ink" : "border-transparent text-secondary hover:border-clay hover:text-ink"}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden text-[14px] font-light text-muted sm:inline">{email}</span>
          <form action={signOut}>
            <button type="submit" className="t-button-sm border-b border-ink px-1 py-2 hover:border-clay">
              Salir
            </button>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}
