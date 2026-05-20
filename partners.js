module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const d = req.body;
    const str = (v) => (v && String(v).trim()) || null;
    const props = {
      'Review Status': { select: { name: 'Submitted' } },
      'Source': { select: { name: 'Formspree' } },
      'subject': { title: [{ text: { content: str(d.company) || str(d.name) || 'New enquiry' } }] },
    };
    const company = str(d.company);
    if (company) props['company'] = { rich_text: [{ text: { content: company } }] };
    const email = str(d.email);
    if (email) props['email'] = { email: email };
    const name = str(d.name);
    if (name) props['name'] = { rich_text: [{ text: { content: name } }] };
    const orgType = str(d.organisation_type);
    if (orgType) props['organisation_type'] = { rich_text: [{ text: { content: orgType } }] };
    const message = str(d.message || d.notes);
    if (message) props['message'] = { rich_text: [{ text: { content: message } }] };
    const notionRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.NOTION_TOKEN,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ parent: { database_id: '364d9a74e6d4817eab21ff1c5a14b13b' }, properties: props }),
    });
    if (!notionRes.ok) {
      const err = await notionRes.text();
      console.error('partners webhook error:', err);
      return res.status(500).json({ error: err });
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('partners webhook error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
