const DB_ID = process.env.NOTION_DB_INDUSTRY_HUB;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const d = req.body;
    const str = (v) => (v && String(v).trim()) || null;

    const firstName = str(d.first_name || d['First Name']);
    const lastName = str(d.last_name || d['Last Name']);
    const fullName = str(d.full_name) || [firstName, lastName].filter(Boolean).join(' ') || 'Test';

    const properties = {
      'Full Name': { title: [{ text: { content: fullName } }] },
      'Review Status': { select: { name: 'Submitted' } },
      'Source': { select: { name: 'Formspree' } },
    };

    if (firstName) properties['First Name'] = { rich_text: [{ text: { content: firstName } }] };
    if (lastName) properties['Last Name'] = { rich_text: [{ text: { content: lastName } }] };

    const emailVal = str(d.email);
    if (emailVal) properties['Email'] = { email: emailVal };

    const company = str(d.company);
    if (company) properties['Company'] = { rich_text: [{ text: { content: company } }] };

    const role = str(d.role);
    if (role) properties['Role'] = { select: { name: role } };

    const attendance = str(d.attendance_type);
    if (attendance) {
      const val = attendance.includes('Hotel') ? 'Hotel Guest' : 'Day Pass Only';
      properties['Attendance Type'] = { select: { name: val } };
    }

    const message = str(d.message || d.notes);
    if (message) properties['Message'] = { rich_text: [{ text: { content: message } }] };

    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ parent: { database_id: DB_ID }, properties }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('hub-rsvp webhook error:', err);
      return res.status(500).json({ error: err });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('hub-rsvp webhook error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
