// Server-only module: only import this from route handlers / server code.
// Reads secrets from process.env (no NEXT_PUBLIC_ prefix) so values never reach the client.

const RESEND_ENDPOINT = 'https://api.resend.com/emails'

const API_KEY = process.env.EMAIL_HOST_PASSWORD
const FROM_NAME = 'Pilucent'
const FROM_ADDRESS = process.env.DEFAULT_HOST_USER || 'support@pilucent.com'
const FROM = `${FROM_NAME} <${FROM_ADDRESS}>`

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'Osman.aden@balanzify.ai'

/**
 * Send an email through the Resend HTTP API.
 * Returns { ok, id?, error? } and never throws.
 */
export async function sendEmail({ to, subject, html, replyTo }) {
	if (!API_KEY) {
		return { ok: false, error: 'Email service is not configured (missing API key).' }
	}

	try {
		const res = await fetch(RESEND_ENDPOINT, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${API_KEY}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				from: FROM,
				to: Array.isArray(to) ? to : [to],
				subject,
				html,
				...(replyTo ? { reply_to: replyTo } : {}),
			}),
		})

		const data = await res.json().catch(() => ({}))

		if (!res.ok) {
			return { ok: false, error: data?.message || `Email failed with status ${res.status}` }
		}

		return { ok: true, id: data?.id }
	} catch (err) {
		return { ok: false, error: err?.message || 'Unknown email error' }
	}
}
