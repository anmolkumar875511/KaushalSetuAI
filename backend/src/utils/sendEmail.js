import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
});

const emailWrapper = (content) => `
<div style="
  background:#f8fafc;
  padding:40px 16px;
  font-family:Inter,Arial,sans-serif;
">
  <div style="
    max-width:520px;
    margin:auto;
    background:#ffffff;
    border-radius:24px;
    overflow:hidden;
    border:1px solid #e5e7eb;
    box-shadow:0 8px 24px rgba(15,23,42,0.06);
  ">

    <!-- HEADER -->
    <div style="
      padding:28px;
      text-align:center;
      border-bottom:1px solid #e5e7eb;
    ">
      <div style="
        display:inline-block;
        padding:10px 18px;
        border-radius:999px;
        color:black;
        font-weight:800;
        letter-spacing:1px;
        font-size:14px;
        text-transform:uppercase;
      ">
        KaushalSetuAI
      </div>
    </div>

    <!-- BODY -->
    <div style="
      padding:32px;
      color:#0f172a;
    ">
      ${content}
    </div>

    <!-- FOOTER -->
    <div style="
      padding:20px;
      text-align:center;
      font-size:12px;
      color:#64748b;
      background:#f8fafc;
      border-top:1px solid #e5e7eb;
    ">
      © ${new Date().getFullYear()} KaushalSetuAI  
      <br />
      Bridging Skills to Success
    </div>

  </div>
</div>
`;

export const sendOTPEmail = async (to, otp) => {
    await transporter.sendMail({
        from: `"KaushalSetuAI" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Verify your KaushalSetuAI email',
        html: emailWrapper(`
            <h2 style="
              font-size:22px;
              font-weight:800;
              margin-bottom:12px;
              color:#0f172a;
            ">
              Email Verification
            </h2>

            <p style="
              font-size:15px;
              line-height:1.6;
              color:#334155;
            ">
              Welcome to <strong>KaushalSetuAI</strong>.  
              Use the OTP below to verify your email address.
            </p>

            <div style="
              margin:28px 0;
              text-align:center;
              padding:18px;
              background:#2A6FA8;
              border-radius:16px;
              color:#ffffff;
              font-size:30px;
              letter-spacing:6px;
              font-weight:800;
            ">
              ${otp}
            </div>

            <p style="
              font-size:13px;
              color:#64748b;
              line-height:1.6;
            ">
              This OTP is valid for <strong>10 minutes</strong>.<br/>
              If you didn’t request this, you can safely ignore this email.
            </p>
        `),
    });
};

export const sendWelcomeEmail = async (to, name) => {
    await transporter.sendMail({
        from: `"KaushalSetuAI" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Welcome to KaushalSetuAI',
        html: emailWrapper(`
            <h2 style="
              font-size:22px;
              font-weight:800;
              margin-bottom:12px;
              color:#0f172a;
            ">
              Welcome, ${name}!
            </h2>

            <p style="
              font-size:15px;
              line-height:1.6;
              color:#334155;
            ">
              Your email has been successfully verified.  
              You’re now officially part of <strong>SkillBridge</strong>.
            </p>

            <div style="text-align:center;margin:32px 0">
              <a href="${process.env.FRONTEND_URL}"
                style="
                  background:#2A6FA8;
                  color:#ffffff;
                  padding:14px 34px;
                  border-radius:999px;
                  text-decoration:none;
                  font-weight:800;
                  font-size:12px;
                  text-transform:uppercase;
                  letter-spacing:1.2px;
                  display:inline-block;
                ">
                Go to Dashboard
              </a>
            </div>

            <p style="
              font-size:14px;
              color:#475569;
              line-height:1.6;
            ">
              Start exploring opportunities, building skills,  
              and bridging the gap between learning and success.
            </p>
        `),
    });
};

export const sendPasswordResetEmail = async (to, resetLink) => {
    await transporter.sendMail({
        from: `"KaushalSetuAI" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Reset your KaushalSetuAI password',
        html: emailWrapper(`
            <h2 style="
              font-size:22px;
              font-weight:800;
              margin-bottom:12px;
              color:#0f172a;
            ">
              Password Reset
            </h2>

            <p style="
              font-size:15px;
              line-height:1.6;
              color:#334155;
            ">
              We received a request to reset your KaushalSetuAI password.
            </p>

            <div style="text-align:center;margin:32px 0">
              <a href="${resetLink}"
                style="
                  background:#2A6FA8;
                  color:#ffffff;
                  padding:14px 34px;
                  border-radius:999px;
                  text-decoration:none;
                  font-weight:800;
                  font-size:12px;
                  text-transform:uppercase;
                  letter-spacing:1.2px;
                  display:inline-block;
                ">
                Reset Password
              </a>
            </div>

            <p style="
              font-size:13px;
              color:#64748b;
              line-height:1.6;
            ">
              If you didn’t request this, you can safely ignore this email.
            </p>
        `),
    });
};
