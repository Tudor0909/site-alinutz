const { Resend } = require('resend');

const CONTACT_EMAIL_TO = process.env.CONTACT_EMAIL_TO || 'alinutzservice@gmail.com';
const RESEND_FROM = process.env.RESEND_FROM || 'Alinutz Service <onboarding@resend.dev>';
const recipients = CONTACT_EMAIL_TO.split(',').map((email) => email.trim()).filter(Boolean);

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function normalizeText(value = '') {
  return String(value).trim();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getRequestBody(req) {
  if (!req.body) {
    return {};
  }

  if (typeof req.body !== 'string') {
    return req.body;
  }

  try {
    return JSON.parse(req.body);
  } catch {
    return null;
  }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const body = getRequestBody(req);
  if (!body) {
    return res.status(400).json({
      success: false,
      error: 'Cererea trimisa nu este valida.',
    });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({
      success: false,
      error: 'RESEND_API_KEY is not configured',
    });
  }

  const nume = normalizeText(body.nume);
  const email = normalizeText(body.email).toLowerCase();
  const dispozitiv = normalizeText(body.dispozitiv);
  const mesaj = normalizeText(body.mesaj);

  if (!nume || !email || !dispozitiv || !mesaj) {
    return res.status(400).json({
      success: false,
      error: 'Toate campurile sunt obligatorii.',
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      error: 'Adresa de email nu este valida.',
    });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const submittedAt = new Intl.DateTimeFormat('ro-RO', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Bucharest',
  }).format(new Date());

  try {
    const { data, error } = await resend.emails.send({
      from: RESEND_FROM,
      to: recipients,
      replyTo: email,
      subject: `Mesaj nou de la ${nume} - Alinutz Service`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #111827;">
          <h2 style="margin: 0 0 16px;">Mesaj nou de pe site (Alinutz Service)</h2>
          <p><strong>Trimis la:</strong> ${escapeHtml(submittedAt)}</p>
          <p><strong>Nume:</strong> ${escapeHtml(nume)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Dispozitiv:</strong> ${escapeHtml(dispozitiv)}</p>
          <p><strong>Mesaj:</strong></p>
          <div style="white-space: pre-wrap; padding: 12px; background: #f3f4f6; border-radius: 8px;">${escapeHtml(mesaj)}</div>
        </div>
      `
    });

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
