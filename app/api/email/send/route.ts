import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { to, subject, html, text } = await request.json();

    if (!to || !subject) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject' },
        { status: 400 }
      );
    }

    const result = await resend.emails.send({
      from: 'InspectHub <noreply@inspectHub.com>',
      to,
      subject,
      html: html || `<p>${text}</p>`,
      text: text || subject,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, id: result.data?.id }, { status: 200 });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
