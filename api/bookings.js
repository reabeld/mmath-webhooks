const DB_ID = process.env.NOTION_DB_HOTEL_RESERVATIONS;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const d = req.body;
    const str = (v) => (v && String(v).trim()) || null;

    const properties = {
      'Last Name': { title: [{ text: { content: str(d.last_name) || 'Unknown' } }] },
      'Source':    { select: { name: 'Formspree' } },
    };

    const firstName = str(d.first_name);
    if (firstName) properties['First Name '] = { rich_text: [{ text: { content: firstName } }] };

    const emailVal = str(d.email);
    if (emailVal) properties['Email'] = { email: emailVal };

    const company = str(d.company);
    if (company) properties['Company Name'] = { rich_text: [{ text: { content: company } }] };

    const comments = str(d.notes || d.message || d.rooms_detail);
    if (comments) properties['Comments'] = { rich_text: [{ text: { content: comments } }] };

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
      console.error('bookings webhook error:', err);
      return res.status(500).json({ error: err });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('bookings webhook error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
