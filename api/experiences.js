const { createNotionPage, title, rich, email, select, number } = require('../lib/notion');

const DB_ID = process.env.NOTION_DB_EXPERIENCE_BOOKINGS;

// Real field names: Experience Name (title), Partner / Organiser,
// Contact Name, Contact Email, Experience Type (select),
// Event Day (select), Expected Guests, AV Requirements,
// Catering Requirements, Notes, Status, Source

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const d = req.body;
    const properties = {
      'Experience Name':       title(d.experience_name || d.company || ''),
      'Partner / Organiser':   rich(d.partner_organiser || d.company || ''),
      'Contact Name':          rich(d.contact_name || ''),
      'Contact Email':         email(d.email),
      'Experience Type':       select(d.experience_type),
      'Event Day':             select(d.event_day),
      'Expected Guests':       number(d.expected_guests),
      'AV Requirements':       rich(d.av_requirements || ''),
      'Catering Requirements': rich(d.catering_requirements || ''),
      'Notes':                 rich(d.notes || d.message || ''),
      'Status':                select('Enquiry'),
      'Source':                select('Formspree'),
    };
    await createNotionPage(DB_ID, properties);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('experiences webhook error:', err);
    return res.status(500).json({ error: err.message });
  }
}
