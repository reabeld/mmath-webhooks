const { createNotionPage, title, rich, email, select, number } = require('../lib/notion');

const DB_ID = process.env.NOTION_DB_WORKSPACE_BOOKINGS;

// Real field names: Company / Organisation (title), Contact Name,
// Contact Email, Space Type (select), Dates (select),
// Number of People, AV Requirements, IT Requirements, Notes, Status, Source

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const d = req.body;
    const properties = {
      'Company / Organisation': title(d.company || d['Company / Organisation'] || ''),
      'Contact Name':           rich(d.contact_name || ''),
      'Contact Email':          email(d.email),
      'Space Type':             select(d.space_type),
      'Dates':                  select(d.dates),
      'Number of People':       number(d.number_of_people),
      'AV Requirements':        rich(d.av_requirements || ''),
      'IT Requirements':        rich(d.it_requirements || ''),
      'Notes':                  rich(d.notes || d.message || ''),
      'Status':                 select('Enquiry'),
      'Source':                 select('Formspree'),
    };
    await createNotionPage(DB_ID, properties);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('spaces webhook error:', err);
    return res.status(500).json({ error: err.message });
  }
}
