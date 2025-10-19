// Simple class-variance-authority replacement
type ClassValue = string | undefined | null | false | Record<string, boolean>

function cn(...classes: ClassValue[]): string {
  return classes
    .flat()
    .filter((cls) => typeof cls === "string")
    .join(" ")
}

export function cva(base: string, config?: Record<string, Record<string, string>>) {
  return (variants?: Record<string, string | boolean>) => {
    const classes = [base]

    if (variants && config) {
      Object.entries(variants).forEach(([key, value]) => {
        if (config[key] && config[key][value as string]) {
          classes.push(config[key][value as string])
        }
      })
    }

    return cn(...classes)
  }
}

export type VariantProps<T> = T extends (...args: any[]) => any ? Parameters<T>[0] : never
