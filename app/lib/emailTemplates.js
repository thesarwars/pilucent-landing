// Professional, brand-aligned HTML email templates for Pilucent.
// Built with table-based layout + inline styles for broad email-client support.

const BRAND = {
	purple: '#6B5BFF',
	purpleDeep: '#5A47E5',
	ink: '#F9F8FF',
	card: '#FFFFFF',
	text: '#1f2430',
	muted: '#6b7280',
	border: '#E8E5F5',
	site: 'https://balanzify.com',
}

const esc = (v = '') =>
	String(v)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/\n/g, '<br/>')

/** Shared shell: gradient header + white card + footer. */
function shell({ preheader = '', heading, accentLabel, bodyHtml }) {
	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<meta name="x-apple-disable-message-reformatting"/>
<title>${esc(heading)}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.ink};-webkit-font-smoothing:antialiased;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.ink};padding:32px 12px;border-collapse:collapse;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px -20px rgba(124,91,255,0.5);">

<!-- Header -->
<tr>
<td style="background:linear-gradient(135deg,${BRAND.purple} 0%,${BRAND.purpleDeep} 100%);padding:38px 40px 34px;text-align:left;">
<div style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">Pilucent</div>
${
	accentLabel
		? `<div style="display:inline-block;margin-top:16px;padding:6px 14px;background:rgba(255,255,255,0.18);border:1px solid rgba(255,255,255,0.35);border-radius:999px;font-size:12px;font-weight:600;color:#ffffff;letter-spacing:0.4px;">${esc(accentLabel)}</div>`
		: ''
}
<div style="margin-top:14px;font-size:26px;line-height:1.25;font-weight:700;color:#ffffff;">${esc(heading)}</div>
</td>
</tr>

<!-- Body -->
<tr>
<td style="padding:36px 40px 32px;color:${BRAND.text};font-size:15px;line-height:1.65;">
${bodyHtml}
</td>
</tr>

<!-- Footer -->
<tr>
<td style="padding:24px 40px 34px;border-top:1px solid ${BRAND.border};background:#FFFFFF;">
<div style="font-size:13px;color:${BRAND.muted};line-height:1.6;">
Pilucent — Smarter accounting, payroll &amp; operations for growing businesses.
</div>
<div style="margin-top:10px;font-size:12px;color:#9aa0ad;">
<a href="${BRAND.site}" style="color:${BRAND.purple};text-decoration:none;font-weight:600;">balanzify.com</a>
&nbsp;·&nbsp; You're receiving this because you contacted us at balanzify.com.
</div>
</td>
</tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

function button(label, href) {
	return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0 6px;"><tr><td style="border-radius:999px;background:linear-gradient(135deg,${BRAND.purple} 0%,${BRAND.purpleDeep} 100%);">
<a href="${href}" style="display:inline-block;padding:13px 30px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:999px;">${esc(label)}</a>
</td></tr></table>`
}

function detailRow(label, value) {
	return `<tr>
<td style="padding:13px 0;border-bottom:1px solid ${BRAND.border};vertical-align:top;width:140px;font-size:13px;font-weight:600;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.4px;">${esc(label)}</td>
<td style="padding:13px 0;border-bottom:1px solid ${BRAND.border};font-size:15px;color:${BRAND.text};">${esc(value || '—')}</td>
</tr>`
}

/* ------------------------- CONTACT FORM ------------------------- */

export function contactUserConfirmation({ firstName }) {
	const name = firstName ? esc(firstName) : 'there'
	const bodyHtml = `
<p style="margin:0 0 16px;">Hi ${name},</p>
<p style="margin:0 0 16px;">Thank you for reaching out to <strong>Pilucent</strong>! We've received your message and a member of our team will be in touch with you shortly.</p>
<p style="margin:0 0 8px;">In the meantime, feel free to explore how Pilucent helps growing businesses simplify accounting, payroll, and operations.</p>
${button('Visit Pilucent', BRAND.site)}
<p style="margin:22px 0 0;color:${BRAND.muted};font-size:14px;">Warm regards,<br/>The Pilucent Team</p>`
	return {
		subject: 'We received your message — Pilucent',
		html: shell({
			preheader: "Thanks for contacting Pilucent — we'll be in touch shortly.",
			accentLabel: 'Message received',
			heading: 'Thanks for getting in touch!',
			bodyHtml,
		}),
	}
}

export function contactAdminNotification({ firstName, lastName, email, message }) {
	const fullName = [firstName, lastName].filter(Boolean).join(' ') || '—'
	const bodyHtml = `
<p style="margin:0 0 20px;">You have a new contact form submission from the Pilucent website.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${detailRow('Name', fullName)}
${detailRow('Email', email)}
${detailRow('Message', message)}
</table>
${button('Reply to ' + (firstName || 'sender'), `mailto:${email}`)}`
	return {
		subject: `New contact form submission — ${fullName}`,
		html: shell({
			preheader: `New contact message from ${fullName} (${email})`,
			accentLabel: 'New lead',
			heading: 'New contact form submission',
			bodyHtml,
		}),
	}
}

/* ------------------------- NEWSLETTER ------------------------- */

export function subscribeUserConfirmation() {
	const bodyHtml = `
<p style="margin:0 0 16px;">Hi there,</p>
<p style="margin:0 0 16px;">Thanks for subscribing to the <strong>Pilucent</strong> newsletter! You're now on the list for practical guides, concise cases, and financial intelligence for the SMB majority.</p>
<p style="margin:0 0 8px;">We'll be in touch whenever we publish something worth your time — no noise, just value.</p>
${button('Read the Blog', BRAND.site + '/blog')}
<p style="margin:22px 0 0;color:${BRAND.muted};font-size:14px;">Warm regards,<br/>The Pilucent Team</p>`
	return {
		subject: "You're subscribed — Pilucent Insights",
		html: shell({
			preheader: "You're on the list for Pilucent Insights.",
			accentLabel: 'Subscription confirmed',
			heading: "You're on the list! 🎉",
			bodyHtml,
		}),
	}
}

export function subscribeAdminNotification({ email }) {
	const bodyHtml = `
<p style="margin:0 0 20px;">A new visitor just subscribed to the Pilucent newsletter from the blog page.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${detailRow('Email', email)}
${detailRow('Source', 'Blog page — newsletter form')}
</table>`
	return {
		subject: `New newsletter subscriber — ${email}`,
		html: shell({
			preheader: `New subscriber: ${email}`,
			accentLabel: 'New subscriber',
			heading: 'New newsletter subscriber',
			bodyHtml,
		}),
	}
}
