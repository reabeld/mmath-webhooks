module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const d = req.body;
    const str = (v) => (v && String(v).trim()) || null;
    const props = {
      'Review Status': { select: { name: 'Submitted' } },
      'Source': { select: { name: 'Formspree' } },
      'subject': { title: [{ text: { content: str(d.company) || str(d.contact_name) || 'New enquiry' } }] },
    };
    const company = str(d.company);
    if (company) props['company'] = { rich_text: [{ text: { content: company } }] };
    const email = str(d.email);
    if (email) props['email'] = { email: email };
    const contact = str(d.contact_name);
    if (contact) props['contact_name'] = { rich_text: [{ text: { content: contact } }] };
    const spaceType = str(d.space_type);
    if (spaceType) props['space_type'] = { rich_text: [{ text: { content: spaceType } }] };
    const dates = str(d.dates);
    if (dates) props['dates'] = { rich_text: [{ text: { content: dates } }] };
    const people = str(d.number_of_people);
    if (people) props['number_of_people'] = { rich_text: [{ text: { content: people } }] };
    const notes = str(d.notes || d.message);
    if (notes) props['notes'] = { rich_text: [{ text: { content: notes } }] };
    const notionRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.NOTION_TOKEN,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ parent: { database_id: '364d9a74e6d481db8a19f5b4c9cac582' }, properties: props }),
    });
    if (!notionRes.ok) {
      const err = await notionRes.text();
      console.error('spaces webhook error:', err);
      return res.status(500).json({ error: err });
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('spaces webhook error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
