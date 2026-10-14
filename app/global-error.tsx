"use client"

// Last-resort error boundary (replaces the root layout), so it carries its
// own minimal markup and inline styles in the calm palette.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#faf7f2", color: "#2b2420" }}>
        <main role="alert" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ maxWidth: 420, textAlign: "center" }}>
            <h1 style={{ fontSize: 24, fontWeight: 600 }}>Something didn&apos;t save.</h1>
            <p style={{ color: "#6b5f57" }}>Your information is still here. Try again.</p>
            <button
              type="button"
              onClick={reset}
              style={{ marginTop: 16, padding: "10px 18px", borderRadius: 8, border: "none", background: "#2a7a69", color: "#fff", fontSize: 16, cursor: "pointer" }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  )
}
