import type { KeyboardEvent } from "react";

/** Roving tabs/radios share arrow, Home and End navigation, skipping disabled options. */
export function navigateOptions(event: KeyboardEvent<HTMLElement>) {
  if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
  const options = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
  if (!options.length) return;
  const current = options.indexOf(event.target as HTMLButtonElement);
  let next = current;
  if (event.key === "Home") next = 0;
  else if (event.key === "End") next = options.length - 1;
  else next = (current + (["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1) + options.length) % options.length;
  event.preventDefault();
  options[next].focus();
  options[next].click();
}
