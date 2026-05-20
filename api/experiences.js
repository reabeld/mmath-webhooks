module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const d = req.body;
    const str = (v) => (v && String(v).trim()) || null;
    const props = {
      'subject': { title: [{ text: { content: str(d.name) || str(d.company) || 'New request' } }] },
    };
    const company = str(d.company);
    if (company) props['company'] = { rich_text: [{ text: { content: company } }] };
    const email = str(d.email);
    if (email) props['email'] = { email: email };
    const phone = str(d.phone);
    if (phone) props['phone'] = { phone_number: phone };
    const name = str(d.name);
    if (name) props['name'] = { rich_text: [{ text: { content: name } }] };
    const expType = str(d.experience_type);
    if (expType) props['experience_type'] = { rich_text: [{ text: { content: expType } }] };
    const space = str(d.preferred_space);
    if (space) props['preferred_space'] = { rich_text: [{ text: { content: space } }] };
    const date = str(d.preferred_date);
    if (date) props['preferred_date'] = { rich_text: [{ text: { content: date } }] };
    const guests = str(d.guest_count);
    if (guests) props['guest_count'] = { rich_text: [{ text: { content: guests } }] };
    const desc = str(d.description || d.notes || d.message);
    if (desc) props['description'] = { rich_text: [{ text: { content: desc } }] };
    const notionRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.NOTION_TOKEN,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ parent: { database_id: '364d9a74e6d48189a4cfefb4cc04557d' }, properties: props }),
    });
    if (!notionRes.ok) {
      const err = await notionRes.text();
      console.error('experiences webhook error:', err);
      return res.status(500).json({ error: err });
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('experiences webhook error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
