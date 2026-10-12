import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Standard shadcn cn(). The previous hand-rolled merge kept the *first* of
// any two bg-/text-/border- classes, so `text-sm` silently dropped
// `text-primary-foreground` (buttons had no foreground colour) and no
// className override could ever win over a variant's colour.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type { ClassValue }
