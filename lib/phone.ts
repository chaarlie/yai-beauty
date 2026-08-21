/**
 * Loose validation, deliberately. This gates a WhatsApp deep link, not a
 * payment — a false rejection costs a booking, a false accept costs nothing.
 *
 * Stripping separators is what makes DR formats work in all the shapes people
 * write them (`809-961-6156`, `(829) 961 6156`, `+1 849 961 6156`). Foreign
 * numbers pass too: a large share of Sosúa clients are expats and tourists
 * carrying their home SIM.
 */
export function isPlausiblePhone(input: string): boolean {
  const digits = input.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}
