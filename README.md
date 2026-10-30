# Yai Beauty Esthetic

Bilingual salon website for Sosúa, built with Next.js, React and TypeScript. Public pages live at `/es/` and `/en/`. Booking buttons compose a WhatsApp message; the site does not reserve appointments or store customer booking submissions. The Spanish `/admin/` area manages promotional offers in Sanity.

## Local setup

Use Node.js 24 LTS (the test runner loads TypeScript directly).

1. Run `npm ci`.
2. Copy `.env.example` to `.env.local` and fill in the Sanity and admin settings.
3. Run `npm run dev` and open `http://localhost:3000/es/`.

The public site can run without Sanity credentials; promotions are then hidden. Admin access requires configuration. Never commit `.env.local`, tokens, or invite URLs.

## Content and photos

- Sanity `service` documents: treatment names, prices in DOP and benefits, edited at `/admin/services/`. Benefits show beside the photo of treatments that have one.
- `lib/services.json`: categories, business contact details and result-photo consent dates.
- `dictionaries/es.json` and `dictionaries/en.json`: interface copy.
- `lib/content.ts`: content access and the public Supabase photo bucket.
- Sanity `offer` documents: promotions edited through `/admin/`; Spanish text is required, English falls back to Spanish.

Result pairs without a consent date are excluded from production, and their menu link disappears when the gallery is empty. Development still shows these pairs for layout review. Keep unapproved photos out of public storage: omitting a gallery entry does not make its storage URL private.

## Sanity and authentication

Create the content dataset (default `production`) and a **private** dataset named `admin`. Set `SANITY_ADMIN_DATASET` to the private dataset name; never point it at the public content dataset. The server write token needs access to offers, services and the private account document. A read token is needed only if the content dataset is private.

Set `ADMIN_EMAIL` and generate a secret with `npm run admin:invite -- --secret`. Save that secret as `ADMIN_SESSION_SECRET` locally and in the deployment environment.

- Initial local account: `npm run admin:invite -- --local`.
- Production account or password recovery: `npm run admin:invite` using the target deployment's settings.

Send the resulting private link to the owner securely. It expires after seven days; using it changes the password stamp, invalidates other links against that stamp, and revokes older sessions. The same command handles password recovery; there is no recovery email service.

Login has no attempt limit: nobody is ever locked out. A wrong password just takes a moment longer to answer.

## Deployment

Deploy as a Next.js server application (for example, Vercel), not a static export. Add the environment variables from `.env.example` to the deployment, then run the production build.

Set `SITE_URL` to the canonical public origin. Its default is the existing `https://yai-beauty.vercel.app`; update it when moving to a custom domain. It controls canonical URLs, language alternates, sitemap links, structured data and invite links. The sharing card is generated locally at `/opengraph-image` without an external image service.

Public promotions refresh on saves and through hourly, request-triggered revalidation. Scheduling uses the Dominican Republic timezone; it is not an exact midnight scheduler. A content-service failure hides promotions while leaving the salon page available.

## Verification

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`

Tests cover conditional navigation, token verification, concurrent login limits, storage failures and offer date/validation rules.

Before deployment, also check both languages on a phone, keyboard menu navigation and Escape, resizing an open menu to desktop, WhatsApp messages, and an offer save/delete while offline. Offline operations should display an error, retain form input and re-enable the controls. Confirm private-dataset permissions and exercise the admin workflow against a staging dataset before production.
