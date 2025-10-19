type ClassValue = string | undefined | null | false | Record<string, boolean>

function clsx(...inputs: ClassValue[]): string {
  const classes: string[] = []

  for (const input of inputs) {
    if (!input) continue

    if (typeof input === "string") {
      classes.push(input)
    } else if (typeof input === "object") {
      for (const [key, value] of Object.entries(input)) {
        if (value) {
          classes.push(key)
        }
      }
    }
  }

  return classes.join(" ")
}

function twMerge(...inputs: ClassValue[]): string {
  // Simple implementation that removes conflicting Tailwind classes
  const classes = clsx(...inputs)
    .split(" ")
    .filter(Boolean)
  const seen = new Set<string>()
  const result: string[] = []

  for (const cls of classes) {
    // Extract the base class name (before any : or /)
    const base = cls.split(":")[0].split("/")[0]

    // Check if we've already seen a conflicting class
    let isConflict = false
    for (const existing of seen) {
      const existingBase = existing.split(":")[0].split("/")[0]
      // Simple conflict detection for common Tailwind patterns
      if (
        base === existingBase ||
        (base.startsWith("bg-") && existingBase.startsWith("bg-")) ||
        (base.startsWith("text-") && existingBase.startsWith("text-")) ||
        (base.startsWith("border-") && existingBase.startsWith("border-")) ||
        (base.startsWith("p-") && existingBase.startsWith("p-")) ||
        (base.startsWith("m-") && existingBase.startsWith("m-")) ||
        (base.startsWith("w-") && existingBase.startsWith("w-")) ||
        (base.startsWith("h-") && existingBase.startsWith("h-"))
      ) {
        isConflict = true
        break
      }
    }

    if (!isConflict) {
      result.push(cls)
      seen.add(cls)
    }
  }

  return result.join(" ")
}

export function cn(...inputs: ClassValue[]): string {
  return twMerge(...inputs)
}

export type { ClassValue }
