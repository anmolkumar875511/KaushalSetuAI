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
    success: '#16A34A',
    warning: '#D97706',
    danger: '#DC2626',
    bgPage: '#F1F5F9',
    bgCard: '#FFFFFF',
    bgMuted: '#F8FAFC',
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
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${B.bgCard};border-radius:16px;overflow:hidden;border:1px solid ${B.border};">

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

const divider = () => `
  <div style="height:1px;background:${B.border};margin:24px 0;"></div>
`;

const sectionLabel = (text) => `
  <p style="margin:0 0 10px;font-family:${B.mono};font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${B.textMuted};">
    ${text}
  </p>
`;

const pill = (text, color) => `
  <span style="display:inline-block;padding:3px 10px;border-radius:999px;background:${color}18;border:1px solid ${color}40;font-family:${B.mono};font-size:11px;font-weight:700;color:${color};margin:3px 4px 3px 0;">
    ${text}
  </span>
`;

const scoreRing = (score, color) => `
  <div style="text-align:center;margin:20px 0;">
    <div style="display:inline-block;width:90px;height:90px;border-radius:50%;border:4px solid ${color};line-height:82px;text-align:center;">
      <span style="font-family:${B.mono};font-size:24px;font-weight:900;color:${color};">${score}</span>
    </div>
  </div>
`;

const bulletList = (items, iconChar, iconColor) =>
    items
        .map(
            (item) => `
      <tr>
        <td style="padding:6px 0;vertical-align:top;">
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-right:10px;vertical-align:top;">
                <span style="font-size:12px;color:${iconColor};font-weight:700;">${iconChar}</span>
              </td>
              <td>
                <span style="font-size:13px;line-height:1.6;color:${B.textSub};">${item}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `
        )
        .join('');

/* ─────────────────────────────────────────────
   EXISTING: OTP EMAIL
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
   EXISTING: WELCOME EMAIL
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
   EXISTING: PASSWORD RESET EMAIL
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

/* ─────────────────────────────────────────────
   NEW: MOCK INTERVIEW REPORT EMAIL
   Sent after completeInterview()
───────────────────────────────────────────── */
export const sendInterviewReportEmail = async (
    to,
    {
        name,
        jobRole,
        experienceLevel,
        overallScore,
        overallFeedback,
        strengths = [],
        areasToImprove = [],
        answers = [],
        duration,
        interviewId,
    }
) => {
    const scoreColor = overallScore >= 70 ? B.success : overallScore >= 45 ? B.warning : B.danger;

    const scoreLabel =
        overallScore >= 70
            ? 'Strong Performance'
            : overallScore >= 45
              ? 'Room for Growth'
              : 'Needs Improvement';

    const durationStr = duration ? `${Math.floor(duration / 60)}m ${duration % 60}s` : null;

    const answersHtml = answers
        .slice(0, 5)
        .map((a, i) => {
            const sc = a.aiEvaluation?.score ?? 0;
            const qColor = sc >= 8 ? B.success : sc >= 5 ? B.warning : B.danger;
            return `
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid ${B.border};">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:top;padding-right:12px;">
                    <span style="font-family:${B.mono};font-size:10px;font-weight:700;color:${B.textMuted};">Q${i + 1}</span>
                  </td>
                  <td style="vertical-align:top;width:100%;">
                    <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:${B.textMain};line-height:1.5;">${a.question}</p>
                    ${a.aiEvaluation?.feedback ? `<p style="margin:0;font-size:12px;line-height:1.6;color:${B.textSub};">${a.aiEvaluation.feedback}</p>` : ''}
                  </td>
                  <td style="vertical-align:top;text-align:right;padding-left:12px;white-space:nowrap;">
                    <span style="font-family:${B.mono};font-size:13px;font-weight:700;color:${qColor};">${sc}/10</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        `;
        })
        .join('');

    const hasMoreAnswers = answers.length > 5;

    await transporter.sendMail({
        from: `"KaushalSetuAI" <${process.env.EMAIL_USER}>`,
        to,
        subject: `Your Mock Interview Report — ${jobRole}`,
        html: emailWrapper(`
            ${heading(`Interview Complete, ${name}!`)}
            ${body(`Here's your full performance report for the <strong>${jobRole}</strong> mock interview (${experienceLevel} level).`)}

            <!-- Score ring -->
            ${scoreRing(overallScore, scoreColor)}
            <p style="text-align:center;margin:-8px 0 20px;font-family:${B.mono};font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${scoreColor};">
              ${scoreLabel}${durationStr ? ` · ${durationStr}` : ''}
            </p>

            ${divider()}

            <!-- Overall feedback -->
            ${
                overallFeedback
                    ? `
              ${sectionLabel('Overall Feedback')}
              <div style="padding:16px;background:${B.bgMuted};border-radius:10px;border:1px solid ${B.border};margin-bottom:20px;">
                <p style="margin:0;font-size:13px;line-height:1.7;color:${B.textSub};">${overallFeedback}</p>
              </div>
            `
                    : ''
            }

            <!-- Strengths & Improvements side by side -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
              <tr>
                ${
                    strengths.length > 0
                        ? `
                <td style="vertical-align:top;padding-right:10px;width:50%;">
                  ${sectionLabel('Strengths')}
                  <table cellpadding="0" cellspacing="0">
                    ${bulletList(strengths, '✓', B.success)}
                  </table>
                </td>
                `
                        : ''
                }
                ${
                    areasToImprove.length > 0
                        ? `
                <td style="vertical-align:top;padding-left:${strengths.length > 0 ? '10px' : '0'};width:50%;">
                  ${sectionLabel('Areas to Improve')}
                  <table cellpadding="0" cellspacing="0">
                    ${bulletList(areasToImprove, '→', B.warning)}
                  </table>
                </td>
                `
                        : ''
                }
              </tr>
            </table>

            ${divider()}

            <!-- Per-question breakdown (first 5) -->
            ${
                answers.length > 0
                    ? `
              ${sectionLabel(`Question Breakdown${hasMoreAnswers ? ' (top 5)' : ''}`)}
              <table width="100%" cellpadding="0" cellspacing="0">
                ${answersHtml}
              </table>
              ${hasMoreAnswers ? note(`${answers.length - 5} more questions available in the full report.`) : ''}
            `
                    : ''
            }

            ${divider()}

            ${ctaButton(`${process.env.FRONTEND_URL}/mock-interview/${interviewId}/results`, 'View Full Report')}

            ${note('Keep practising — consistent mock interviews are the fastest way to build confidence and land your dream role.')}
        `),
    });
};

/* ─────────────────────────────────────────────
   NEW: RESUME IMPROVEMENT REPORT EMAIL
   Sent after getResumeImprovements()
───────────────────────────────────────────── */
export const sendResumeImprovementEmail = async (
    to,
    { name, overallScore, topPriorities = [], atsKeywords = [], dimensions = {} }
) => {
    const scoreColor = overallScore >= 70 ? B.success : overallScore >= 45 ? B.warning : B.danger;

    const scoreLabel =
        overallScore >= 70
            ? 'Strong Resume'
            : overallScore >= 45
              ? 'Needs Work'
              : 'Needs Major Improvement';

    const dimOrder = ['summary', 'skills', 'experience', 'projects', 'overall'];
    const dimLabel = {
        summary: 'Summary',
        skills: 'Skills',
        experience: 'Experience',
        projects: 'Projects',
        overall: 'ATS / Overall',
    };

    const dimHtml = dimOrder
        .filter((key) => dimensions[key])
        .map((key) => {
            const d = dimensions[key];
            const sevColor =
                d.severity === 'critical'
                    ? B.danger
                    : d.severity === 'good'
                      ? B.success
                      : B.warning;
            const barWidth = Math.round((d.score / 10) * 100);
            return `
              <tr>
                <td style="padding:12px 0;border-bottom:1px solid ${B.border};">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                        <span style="font-size:13px;font-weight:700;color:${B.textMain};">${dimLabel[key]}</span>
                        <span style="margin-left:8px;font-family:${B.mono};font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${sevColor};">${d.severity}</span>
                      </td>
                      <td style="text-align:right;">
                        <span style="font-family:${B.mono};font-size:13px;font-weight:700;color:${sevColor};">${d.score}/10</span>
                      </td>
                    </tr>
                    <tr>
                      <td colspan="2" style="padding-top:6px;">
                        <!-- Score bar -->
                        <div style="height:4px;background:${B.border};border-radius:2px;">
                          <div style="height:4px;width:${barWidth}%;background:${sevColor};border-radius:2px;"></div>
                        </div>
                        ${
                            d.tips?.length > 0
                                ? `
                          <ul style="margin:8px 0 0;padding-left:16px;">
                            ${d.tips.map((t) => `<li style="font-size:12px;line-height:1.6;color:${B.textSub};margin-bottom:4px;">${t}</li>`).join('')}
                          </ul>
                        `
                                : ''
                        }
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            `;
        })
        .join('');

    await transporter.sendMail({
        from: `"KaushalSetuAI" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Your Resume Improvement Report — KaushalSetuAI',
        html: emailWrapper(`
            ${heading(`Resume Report, ${name}!`)}
            ${body("Here's your personalised AI resume analysis. Act on these insights to improve your chances with recruiters and ATS systems.")}

            <!-- Score ring -->
            ${scoreRing(overallScore, scoreColor)}
            <p style="text-align:center;margin:-8px 0 20px;font-family:${B.mono};font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${scoreColor};">
              ${scoreLabel}
            </p>

            ${divider()}

            <!-- Top priorities -->
            ${
                topPriorities.length > 0
                    ? `
              ${sectionLabel('Top Priorities')}
              <table cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                ${topPriorities
                    .map(
                        (p, i) => `
                  <tr>
                    <td style="padding:5px 0;vertical-align:top;">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding-right:10px;vertical-align:top;">
                            <span style="display:inline-block;width:20px;height:20px;border-radius:50%;background:${B.primary}20;text-align:center;line-height:20px;font-family:${B.mono};font-size:10px;font-weight:800;color:${B.primary};">${i + 1}</span>
                          </td>
                          <td>
                            <span style="font-size:13px;line-height:1.6;color:${B.textSub};">${p}</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                `
                    )
                    .join('')}
              </table>
            `
                    : ''
            }

            <!-- ATS keywords -->
            ${
                atsKeywords.length > 0
                    ? `
              ${sectionLabel('Missing ATS Keywords')}
              <div style="margin-bottom:20px;">
                ${atsKeywords.map((kw) => pill(kw, B.warning)).join('')}
              </div>
              ${note('Add these keywords naturally to your resume to improve ATS match rates.')}
            `
                    : ''
            }

            ${divider()}

            <!-- Dimension breakdown -->
            ${sectionLabel('Section Breakdown')}
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
              ${dimHtml}
            </table>

            ${ctaButton(`${process.env.FRONTEND_URL}/resume/improve`, 'View Full Report')}

            ${note('Your resume is the first impression you make. Small improvements here lead to significantly more interview calls.')}
        `),
    });
};

/* ─────────────────────────────────────────────
   NEW: ASSESSMENT RESULT EMAIL
   Sent after submitAssessment()
───────────────────────────────────────────── */
export const sendAssessmentResultEmail = async (
    to,
    { name, topic, score, maxScore, duration, ratingBefore, ratingAfter, delta, tier }
) => {
    const pct = Math.round((score / maxScore) * 100);
    const scoreColor = pct >= 70 ? B.success : pct >= 40 ? B.warning : B.danger;

    const passed = pct >= 50;
    const ratingGained = delta > 0;
    const ratingColor = ratingGained ? B.success : B.danger;
    const durationStr = duration ? `${Math.round(duration)}s` : null;

    const tierColors = {
        Bronze: '#CD7F32',
        Silver: '#94A3B8',
        Gold: '#CA8A04',
        Platinum: '#64748B',
        Diamond: '#0EA5E9',
    };
    const tierColor = tier?.color || B.primary;

    await transporter.sendMail({
        from: `"KaushalSetuAI" <${process.env.EMAIL_USER}>`,
        to,
        subject: `Assessment Result — ${topic}`,
        html: emailWrapper(`
            ${heading(`Assessment Result, ${name}!`)}
            ${body(`You've completed the <strong>${topic}</strong> assessment. Here's how you did.`)}

            <!-- Score ring -->
            ${scoreRing(pct, scoreColor)}
            <p style="text-align:center;margin:-8px 0 4px;font-family:${B.mono};font-size:22px;font-weight:900;color:${scoreColor};">
              ${score} / ${maxScore}
            </p>
            <p style="text-align:center;margin:0 0 20px;font-family:${B.mono};font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${scoreColor};">
              ${passed ? 'Passed' : 'Failed'}${durationStr ? ` · ${durationStr}` : ''}
            </p>

            ${divider()}

            <!-- Rating change -->
            ${
                ratingBefore !== undefined && ratingAfter !== undefined
                    ? `
              ${sectionLabel('Rating Update')}
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <!-- Before -->
                  <td style="text-align:center;padding:16px;background:${B.bgMuted};border-radius:10px 0 0 10px;border:1px solid ${B.border};border-right:none;">
                    ${sectionLabel('Before')}
                    <span style="font-family:${B.mono};font-size:22px;font-weight:900;color:${B.textSub};">${ratingBefore}</span>
                  </td>
                  <!-- Arrow + delta -->
                  <td style="text-align:center;padding:16px;background:${B.bgMuted};border-top:1px solid ${B.border};border-bottom:1px solid ${B.border};">
                    <span style="font-size:20px;color:${ratingColor};">${ratingGained ? '▲' : '▼'}</span>
                    <br/>
                    <span style="font-family:${B.mono};font-size:13px;font-weight:800;color:${ratingColor};">
                      ${ratingGained ? '+' : ''}${delta}
                    </span>
                  </td>
                  <!-- After -->
                  <td style="text-align:center;padding:16px;background:${B.bgMuted};border-radius:0 10px 10px 0;border:1px solid ${B.border};border-left:none;">
                    ${sectionLabel('After')}
                    <span style="font-family:${B.mono};font-size:22px;font-weight:900;color:${ratingColor};">${ratingAfter}</span>
                  </td>
                </tr>
              </table>
            `
                    : ''
            }

            <!-- Current tier -->
            ${
                tier
                    ? `
              ${sectionLabel('Current Tier')}
              <div style="text-align:center;margin-bottom:20px;">
                <span style="display:inline-block;padding:8px 24px;border-radius:999px;background:${tierColor}18;border:2px solid ${tierColor}50;font-family:${B.mono};font-size:14px;font-weight:800;letter-spacing:0.1em;color:${tierColor};text-transform:uppercase;">
                  ${tier?.title || tier}
                </span>
              </div>
            `
                    : ''
            }

            ${divider()}

            ${ctaButton(`${process.env.FRONTEND_URL}/past_assessment`, 'View All Assessments')}

            ${note(
                passed
                    ? 'Great work! Keep taking assessments to climb the leaderboard.'
                    : "Don't be discouraged — review the topic and try again. Every attempt improves your understanding."
            )}
        `),
    });
};
