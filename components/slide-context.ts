import { createContext, useContext } from "react";

/**
 * Tells what's inside a carousel slide whether that slide is the one showing.
 * Outside a carousel there's no provider, and everything counts as showing.
 */
export const SlideContext = createContext<{ active: boolean } | null>(null);

export function useSlideActive(): boolean {
  return useContext(SlideContext)?.active ?? true;
}
