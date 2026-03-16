import nodemailer from 'nodemailer';

/* ── Transport ── */
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false },
});

/* ─────────────────────────────────────────────
   BRAND TOKENS  (mirrors theme.js light mode)
───────────────────────────────────────────── */
const B = {
    primary: '#2A6FA8',
    secondary: '#F97316',
    bgPage: '#F1F5F9',
    bgCard: '#FFFFFF',
    border: '#E2E8F0',
    textMain: '#0F172A',
    textSub: '#64748B',
    textMuted: '#94A3B8',
    mono: '"DM Mono", "Courier New", monospace',
    sans: '"DM Sans", "Inter", Arial, sans-serif',
};

/* ─────────────────────────────────────────────
   SHARED WRAPPER
───────────────────────────────────────────── */
const emailWrapper = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:${B.bgPage};font-family:${B.sans};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${B.bgPage};padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:${B.bgCard};border-radius:16px;overflow:hidden;border:1px solid ${B.border};">

          <!-- HEADER -->
          <tr>
            <td style="padding:24px;text-align:center;border-bottom:1px solid ${B.border};">
              <span style="font-family:${B.mono};font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${B.textSub};">
                KaushalSetuAI
              </span>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:32px;color:${B.textMain};">
              ${content}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:20px;text-align:center;background:${B.bgPage};border-top:1px solid ${B.border};">
              <p style="margin:0;font-family:${B.mono};font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:${B.textMuted};">
                © ${new Date().getFullYear()} KaushalSetuAI · Bridging Skills to Success
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/* ─────────────────────────────────────────────
   SHARED PRIMITIVES
───────────────────────────────────────────── */
const heading = (text) => `
  <h2 style="margin:0 0 12px;font-size:20px;font-weight:700;color:${B.textMain};line-height:1.3;">
    ${text}
  </h2>
`;

const body = (text) => `
  <p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:${B.textSub};">
    ${text}
  </p>
`;

const ctaButton = (href, label) => `
  <div style="text-align:center;margin:28px 0;">
    <a href="${href}" style="display:inline-block;background:${B.primary};color:#ffffff;padding:12px 32px;border-radius:8px;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;font-family:${B.mono};">
      ${label}
    </a>
  </div>
`;

const note = (text) => `
  <p style="margin:16px 0 0;font-size:12px;line-height:1.7;color:${B.textMuted};">
    ${text}
  </p>
`;

/* ─────────────────────────────────────────────
   OTP EMAIL
───────────────────────────────────────────── */
export const sendOTPEmail = async (to, otp) => {
    await transporter.sendMail({
        from: `"KaushalSetuAI" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Verify your KaushalSetuAI email',
        html: emailWrapper(`
            ${heading('Email Verification')}
            ${body('Welcome to <strong>KaushalSetuAI</strong>. Use the code below to verify your email address.')}

            <div style="margin:24px 0;text-align:center;padding:20px;background:${B.primary};border-radius:12px;">
              <span style="font-family:${B.mono};font-size:28px;font-weight:700;letter-spacing:8px;color:#ffffff;">
                ${otp}
              </span>
            </div>

            ${note("This code is valid for <strong>10 minutes</strong>.<br/>If you didn't request this, you can safely ignore this email.")}
        `),
    });
};

/* ─────────────────────────────────────────────
   WELCOME EMAIL
───────────────────────────────────────────── */
export const sendWelcomeEmail = async (to, name) => {
    await transporter.sendMail({
        from: `"KaushalSetuAI" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Welcome to KaushalSetuAI',
        html: emailWrapper(`
            ${heading(`Welcome, ${name}!`)}
            ${body("Your email has been successfully verified. You're now officially part of <strong>KaushalSetuAI</strong>.")}
            ${ctaButton(process.env.FRONTEND_URL, 'Go to Dashboard')}
            ${note('Start exploring opportunities, building skills, and bridging the gap between learning and success.')}
        `),
    });
};

/* ─────────────────────────────────────────────
   PASSWORD RESET EMAIL
───────────────────────────────────────────── */
export const sendPasswordResetEmail = async (to, resetLink) => {
    await transporter.sendMail({
        from: `"KaushalSetuAI" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Reset your KaushalSetuAI password',
        html: emailWrapper(`
            ${heading('Password Reset')}
            ${body('We received a request to reset your KaushalSetuAI password. Click the button below to proceed.')}
            ${ctaButton(resetLink, 'Reset Password')}
            ${note("This link expires in <strong>1 hour</strong>.<br/>If you didn't request this, you can safely ignore this email.")}
        `),
    });
};
