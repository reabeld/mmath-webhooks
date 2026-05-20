const { createNotionPage, title, rich, email, select } = require('../lib/notion');

const DB_ID = process.env.NOTION_DB_INDUSTRY_HUB;

// Real field names: Full Name (title), First Name, Last Name,
// Email, Company, Role (select), Attendance Type (select),
// Review Status (select), Message, Source

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const d = req.body;
    const firstName = d.first_name || d['First Name'] || '';
    const lastName  = d.last_name  || d['Last Name']  || '';
    const rawAttendance = d.attendance_type || '';
    const attendance = rawAttendance.includes('Hotel') ? 'Hotel Guest' : 'Day Pass Only';
    const properties = {
      'Full Name':       title(`${firstName} ${lastName}`.trim()),
      'First Name':      rich(firstName),
      'Last Name':       rich(lastName),
      'Email':           email(d.email),
      'Company':         rich(d.company || ''),
      'Role':            select(d.role),
      'Attendance Type': select(attendance),
      'Review Status':   select('Submitted'),
      'Message':         rich(d.message || ''),
      'Source':          select('Formspree'),
    };
    await createNotionPage(DB_ID, properties);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('hub-rsvp webhook error:', err);
    return res.status(500).json({ error: err.message });
  }
}
