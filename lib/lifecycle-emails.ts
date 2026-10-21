import { appUrl, escapeHtml } from "@/lib/digest"
import { COPYRIGHT_HOLDER, LEGAL_POSTAL_ADDRESS } from "@/lib/legal"

// Welcome and check-in reminder emails, sent by app/api/cron/lifecycle-emails.

function shell(body: string, footer: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f5f8f7;font-family:Arial,Helvetica,sans-serif;color:#1e2a27">
<div style="max-width:600px;margin:0 auto;padding:24px 16px">
<p style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#2A7A69;font-weight:bold;margin:0">Africa NeuroDiversity Alliance</p>
${body}
<p style="margin:24px 0 0;font-size:12px;color:#5b6b67">${footer}</p>
<p style="margin:8px 0 0;font-size:12px;color:#5b6b67">${COPYRIGHT_HOLDER}, ${LEGAL_POSTAL_ADDRESS}</p>
</div></body></html>`
}

const button = (href: string, label: string) =>
  `<p><a href="${escapeHtml(href)}" style="display:inline-block;background:#2A7A69;color:#ffffff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:bold">${label}</a></p>`

const hello = (firstName: string | null) => `Hello${firstName ? ` ${escapeHtml(firstName)}` : ""},`

export function welcomeEmail(firstName: string | null) {
  const base = appUrl()
  return {
    subject: "Welcome to ANDA",
    html: shell(
      `<h1 style="font-size:24px;margin:4px 0 16px">Welcome to ANDA</h1>
<p>${hello(firstName)}</p>
<p>Thank you for joining. Here's how to get started:</p>
<ol>
<li>Add the person you support (a child, a student or yourself).</li>
<li>Set a few goals and log a short check-in each week.</li>
<li>Find support near you in the directory, and ask questions in the community.</li>
</ol>
${button(`${base}/dashboard`, "Go to your dashboard")}
<p>Questions? Reply to this email.</p>`,
      `You're getting this once because you created an ANDA account.`,
    ),
  }
}

export function reminderEmail(firstName: string | null, optOutUrl: string) {
  const base = appUrl()
  return {
    subject: "A quick check-in this week?",
    html: shell(
      `<h1 style="font-size:22px;margin:4px 0 16px">A quick check-in this week?</h1>
<p>${hello(firstName)}</p>
<p>You haven't logged a check-in for a week. A minute a week is enough to see progress over time, and it makes your reports more useful.</p>
${button(`${base}/dashboard`, "Log a check-in")}`,
      `We send this at most once a week, only when no check-in was logged. <a href="${escapeHtml(optOutUrl)}" style="color:#5b6b67">Stop check-in reminders</a>.`,
    ),
  }
}
