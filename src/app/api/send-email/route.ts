import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const { to, subject, html } = await request.json();

        // API Key yoksa simüle et
        if (!process.env.RESEND_API_KEY) {
            console.log('📧 [MOCK EMAIL] To:', to);
            console.log('Subject:', subject);
            console.log('HTML:', html); // Log content for debug
            return NextResponse.json({ success: true, mock: true });
        }

        const { data, error } = await resend.emails.send({
            from: 'LinguaElite <onboarding@resend.dev>', // Default testing domain
            to: [to], // In sandbox, only authorized emails allowed
            subject: subject,
            html: html,
        });

        if (error) {
            return NextResponse.json({ error }, { status: 400 });
        }

        return NextResponse.json({ data });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
