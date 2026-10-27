import { NextResponse } from 'next/server'
import { sendEmail, ADMIN_EMAIL } from '../../lib/email'
import { subscribeUserConfirmation, subscribeAdminNotification } from '../../lib/emailTemplates'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request) {
	let body
	try {
		body = await request.json()
	} catch {
		return NextResponse.json({ success: false, message: 'Invalid request body.' }, { status: 400 })
	}

	const email = (body.email || '').trim()

	if (!EMAIL_RE.test(email)) {
		return NextResponse.json({ success: false, message: 'Please enter a valid email address.' }, { status: 400 })
	}

	const admin = subscribeAdminNotification({ email })
	const user = subscribeUserConfirmation()

	const [adminRes, userRes] = await Promise.all([
		sendEmail({ to: ADMIN_EMAIL, subject: admin.subject, html: admin.html, replyTo: email }),
		sendEmail({ to: email, subject: user.subject, html: user.html }),
	])

	if (!adminRes.ok && !userRes.ok) {
		return NextResponse.json(
			{ success: false, message: adminRes.error || 'Could not subscribe you right now. Please try again.' },
			{ status: 502 }
		)
	}

	return NextResponse.json({ success: true, message: 'Subscribed successfully.' })
}
