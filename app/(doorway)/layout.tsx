/*
  Root layout for the bare `/` doorway alone. The site's real root layouts sit
  under app/[lang] (so <html lang> carries the language) and app/admin, which
  left this page without one — Next 16.4 refuses to build that. The route group
  keeps the URL at `/`. Nothing renders here long enough to need styling: the
  page's inline script redirects before React loads.
*/
export default function DoorwayLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
