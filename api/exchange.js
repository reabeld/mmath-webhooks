const { createNotionPage, title, rich, email, phone, select } = require('../lib/notion');

const DB_ID = process.env.NOTION_DB_INDUSTRY_EXCHANGE;

// Real field names from Industry Exchange Applications database:
// Full Name (title), Title / Position, Company, Email, Phone,
// Sector (select), Why Attending, Application Status (select),
// Program (select), Notes, Source

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const d = req.body;
    const properties = {
      'Full Name':          title(d.full_name || d['Full Name'] || ''),
      'Title / Position':   rich(d.title_position || d['title'] || ''),
      'Company':            rich(d.company || ''),
      'Email':              email(d.email),
      'Phone':              phone(d.phone),
      'Sector':             select(d.sector),
      'Why Attending':      rich(d.why_attend || d.why_attending || ''),
      'Notes':              rich(d.message || d.notes || ''),
      'Application Status': select('Submitted'),
      'Program':            select('C-Suite Session'),
      'Source':             select('Formspree'),
    };
    await createNotionPage(DB_ID, properties);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('exchange webhook error:', err);
    return res.status(500).json({ error: err.message });
  }
}
