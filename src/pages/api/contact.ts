export const prerender = false;

import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.formData();
    const name = data.get('name')?.toString() || '';
    const email = data.get('email')?.toString() || '';
    const subject = data.get('subject')?.toString() || 'General enquiry';
    const message = data.get('message')?.toString() || '';
    const pageUrl = data.get('page_url')?.toString() || '';

    // Basic validation
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Configure Gmail transporter using environment variables
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: import.meta.env.GMAIL_USER,
        pass: import.meta.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"SmallEstateForm.com Contact" <${import.meta.env.GMAIL_USER}>`,
      to: 'amitsharma00261@gmail.com',
      replyTo: email,
      subject: `[SmallEstateForm] ${subject} — from ${name}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#2D5016;padding:1.5rem 2rem;">
            <h2 style="color:#F7F4EF;margin:0;font-size:1.2rem;">New contact from SmallEstateForm.com</h2>
          </div>
          <div style="padding:1.5rem 2rem;border:1px solid #e5e7eb;border-top:none;">
            <table style="width:100%;border-collapse:collapse;font-size:0.9rem;">
              <tr style="border-bottom:1px solid #f3f4f6;">
                <td style="padding:0.75rem 0;color:#6b7280;width:120px;font-weight:500;">Name</td>
                <td style="padding:0.75rem 0;color:#111827;">${name}</td>
              </tr>
              <tr style="border-bottom:1px solid #f3f4f6;">
                <td style="padding:0.75rem 0;color:#6b7280;font-weight:500;">Email</td>
                <td style="padding:0.75rem 0;color:#111827;"><a href="mailto:${email}" style="color:#2D5016;">${email}</a></td>
              </tr>
              <tr style="border-bottom:1px solid #f3f4f6;">
                <td style="padding:0.75rem 0;color:#6b7280;font-weight:500;">Topic</td>
                <td style="padding:0.75rem 0;color:#111827;">${subject}</td>
              </tr>
              ${pageUrl ? `
              <tr style="border-bottom:1px solid #f3f4f6;">
                <td style="padding:0.75rem 0;color:#6b7280;font-weight:500;">Page URL</td>
                <td style="padding:0.75rem 0;color:#6b7280;font-size:0.8rem;">${pageUrl}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding:0.75rem 0;color:#6b7280;font-weight:500;vertical-align:top;">Message</td>
                <td style="padding:0.75rem 0;color:#111827;white-space:pre-wrap;">${message}</td>
              </tr>
            </table>
            <div style="margin-top:1.5rem;padding:1rem;background:#f9fafb;border-radius:4px;font-size:0.8rem;color:#6b7280;">
              Hit reply to respond directly to ${name} at ${email}
            </div>
          </div>
        </div>
      `,
    });

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Contact form error:', err);
    return new Response(
      JSON.stringify({ ok: false, error: 'Failed to send email' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
