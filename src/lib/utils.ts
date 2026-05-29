import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Standard shadcn `cn` utility — clsx + tailwind-merge. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
