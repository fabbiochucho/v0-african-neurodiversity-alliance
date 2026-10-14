import { Navigation } from "@/components/navigation"
import { DisplaySettings } from "./display-settings"

// Open to everyone: signed-out visitors' choices stay in this browser;
// signed-in users' choices also follow their account.
export default function AccessibilitySettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-12 max-w-2xl space-y-6">
        <header>
          <h1 className="text-4xl font-bold mb-2">Display and sensory settings</h1>
          <p className="text-muted-foreground">Make ANDA calmer, clearer or easier to read. Changes apply straight away.</p>
        </header>
        <DisplaySettings />
      </main>
    </div>
  )
}
