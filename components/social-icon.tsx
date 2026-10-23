type IconName = "whatsapp" | "facebook" | "instagram" | "link" | "share";

/** Small monochrome marks; the surrounding control supplies its accessible name. */
export function SocialIcon({ name }: { name: IconName }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {name === "whatsapp" ? <><path d="M20.5 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.2-4.7a8.5 8.5 0 1 1 16.3-3.8Z" /><path d="m8.3 7.2 1.5 2.4-1 1.1c.8 1.8 2.2 3.1 4 3.8l1-1.2 2.5 1.3c.2 1.7-1 2.4-2.4 2.1-4.1-.9-7.1-3.9-7.7-7.2-.2-1.2.8-2.5 2.1-2.3Z" /></> : null}
      {name === "facebook" ? <path stroke="none" fill="currentColor" d="M14.5 22v-9h3l.5-3.5h-3.5V7.3c0-1 .3-1.8 1.8-1.8H18V2.3c-.7-.1-1.6-.3-2.7-.3-2.8 0-4.8 1.7-4.8 4.9v2.6H7V13h3.5v9Z" /> : null}
      {name === "instagram" ? <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none" /></> : null}
      {name === "link" ? <><path d="m10 13 4-4M8.5 15.5l-1 1a3.5 3.5 0 0 1-5-5l4-4a3.5 3.5 0 0 1 5 0M15.5 8.5l1-1a3.5 3.5 0 0 1 5 5l-4 4a3.5 3.5 0 0 1-5 0" /></> : null}
      {name === "share" ? <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4" /></> : null}
    </svg>
  );
}
