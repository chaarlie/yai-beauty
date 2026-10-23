"use client";

import { SocialIcon } from "./social-icon";
import { useRef, useState } from "react";

export type ShareLabels = {
  label: string;
  whatsapp: string;
  facebook: string;
  instagram: string;
  copy: string;
  copied: string;
  instagramSaved: string;
  failed: string;
  instagramHint: string;
};

type Props = {
  /** The offer's own page, absolute — its preview tags show that offer. */
  url: string;
  /** One line that travels with the link. */
  text: string;
  /** Same-origin path of the story-sized image (1080×1920). */
  storyImagePath: string;
  fileName: string;
  labels: ShareLabels;
  tone: "light" | "dark";
};

const TONES = {
  light: { label: "text-muted", pill: "border-rule-button text-ink hover:border-clay", note: "text-secondary" },
  dark: { label: "text-on-dark-label", pill: "border-rule-dark text-cream hover:border-clay", note: "text-on-dark-caption" },
};

/**
 * Share an offer to WhatsApp, Facebook or Instagram, or copy its link.
 *
 * WhatsApp and Facebook take a link and build their preview from the offer
 * page's Open Graph tags. Instagram has no web share link at all, so on a phone
 * the button hands the offer's story image to the system share sheet (Instagram
 * is in it); where that isn't available it saves the image and copies the link.
 *
 * iOS only opens the share sheet straight from a tap, so the image is fetched
 * ahead — on hover, touch or focus — and the tap itself only shares.
 */
export function ShareOffer({ url, text, storyImagePath, fileName, labels, tone }: Props) {
  const [note, setNote] = useState<string | null>(null);
  const image = useRef<Promise<File> | null>(null);
  const style = TONES[tone];

  const loadImage = () => {
    image.current ??= fetch(storyImagePath)
      .then((res) => {
        if (!res.ok) throw new Error(`story image ${res.status}`);
        return res.blob();
      })
      .then((blob) => new File([blob], fileName, { type: blob.type || "image/png" }));
    // A failed fetch can be retried on the next attempt.
    image.current.catch(() => (image.current = null));
    return image.current;
  };

  async function copyLink(message: string) {
    try {
      await navigator.clipboard.writeText(url);
      setNote(message);
    } catch {
      setNote(url);
    }
  }

  async function shareToInstagram() {
    setNote(null);
    try {
      const file = await loadImage();
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: `${text}\n${url}` });
        return;
      }
      const href = URL.createObjectURL(file);
      const link = Object.assign(document.createElement("a"), { href, download: fileName });
      link.click();
      URL.revokeObjectURL(href);
      await copyLink(labels.instagramSaved);
    } catch (error) {
      // Closing the share sheet isn't a failure.
      if ((error as { name?: string })?.name === "AbortError") return;
      setNote(labels.failed);
    }
  }

  const iconButton = `inline-flex size-11 shrink-0 items-center justify-center border transition-colors ${style.pill}`;
  const message = encodeURIComponent(`${text}\n${url}`);
  const controls = (
    <>
      <div className="flex flex-wrap items-center gap-2.5" role="group" aria-label={labels.label}>
        <span className={`t-label mr-1 ${style.label}`}>{labels.label}</span>
        <a href={`https://wa.me/?text=${message}`} target="_blank" rel="noopener noreferrer" aria-label={labels.whatsapp} title={labels.whatsapp} className={iconButton}>
          <SocialIcon name="whatsapp" />
        </a>
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" aria-label={labels.facebook} title={labels.facebook} className={iconButton}>
          <SocialIcon name="facebook" />
        </a>
        <button type="button" aria-label={labels.instagram} title={labels.instagramHint}
          onClick={() => void shareToInstagram()}
          onPointerEnter={() => void loadImage().catch(() => {})}
          onTouchStart={() => void loadImage().catch(() => {})}
          onFocus={() => void loadImage().catch(() => {})} className={iconButton}>
          <SocialIcon name="instagram" />
        </button>
        <button type="button" aria-label={labels.copy} title={labels.copy} onClick={() => void copyLink(labels.copied)} className={iconButton}>
          <SocialIcon name="link" />
        </button>
      </div>
      <p aria-live="polite" className={`mt-2 min-h-[1.5em] text-[13px] leading-[1.5] break-words ${style.note}`}>{note}</p>
    </>
  );

  return <div className="mt-6">{controls}</div>;
}
