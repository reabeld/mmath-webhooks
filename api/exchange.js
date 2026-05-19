const DB_ID = process.env.NOTION_DB_INDUSTRY_EXCHANGE;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const d = req.body;
    const str = (v) => (v && String(v).trim()) || null;

    const fullName = str(d.full_name) || str(d.company) || 'Unknown';

    const props = {
      'Full Name': { title: [{ text: { content: fullName } }] },
      'Application Status': { select: { name: 'Submitted' } },
      'Source': { select: { name: 'Formspree' } },
    };

    const company = str(d.company);
    if (company) props['Company'] = { rich_text: [{ text: { content: company } }] };

    const emailVal = str(d.email);
    if (emailVal) props['Email'] = { email: emailVal };

    const phone = str(d.phone);
    if (phone) props['Phone'] = { phone_number: phone };

    const title = str(d.title);
    if (title) props['Title / Position'] = { rich_text: [{ text: { content: title } }] };

    const sector = str(d.sector);
    if (sector) props['Sector'] = { select: { name: sector } };

    const motivation = str(d.motivation || d.why_attend);
    if (motivation) props['Why Attending'] = { rich_text: [{ text: { content: motivation } }] };

    const notes = str(d.message || d.notes);
    if (notes) props['Notes'] = { rich_text: [{ text: { content: notes } }] };

    const notionRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.NOTION_TOKEN,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ parent: { database_id: DB_ID }, properties: props }),
    });

    if (!notionRes.ok) {
      const err = await notionRes.text();
      console.error('exchange webhook error:', err);
      return res.status(500).json({ error: err });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('exchange webhook error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
