import { NextResponse } from 'next/server'
import { sendEmail, ADMIN_EMAIL } from '../../lib/email'
import { contactUserConfirmation, contactAdminNotification } from '../../lib/emailTemplates'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request) {
	let body
	try {
		body = await request.json()
	} catch {
		return NextResponse.json({ success: false, message: 'Invalid request body.' }, { status: 400 })
	}

	const firstName = (body.firstName || '').trim()
	const lastName = (body.lastName || '').trim()
	const email = (body.email || '').trim()
	const message = (body.message || '').trim()

	if (!firstName || !email || !message) {
		return NextResponse.json(
			{ success: false, message: 'First name, email and message are required.' },
			{ status: 400 }
		)
	}
	if (!EMAIL_RE.test(email)) {
		return NextResponse.json({ success: false, message: 'Please enter a valid email address.' }, { status: 400 })
	}

	const admin = contactAdminNotification({ firstName, lastName, email, message })
	const user = contactUserConfirmation({ firstName })

	const [adminRes, userRes] = await Promise.all([
		// Notify the team; reply-to the visitor so the team can respond directly.
		sendEmail({ to: ADMIN_EMAIL, subject: admin.subject, html: admin.html, replyTo: email }),
		// Confirmation to the visitor.
		sendEmail({ to: email, subject: user.subject, html: user.html }),
	])

	if (!adminRes.ok && !userRes.ok) {
		return NextResponse.json(
			{ success: false, message: adminRes.error || 'Could not send your message. Please try again.' },
			{ status: 502 }
		)
	}

	return NextResponse.json({ success: true, message: 'Message sent successfully.' })
}
