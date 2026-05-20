module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const d = req.body;
    const str = (v) => (v && String(v).trim()) || null;

    const props = {
      'Review Status': { select: { name: 'Submitted' } },
      'Source': { select: { name: 'Formspree' } },
      'subject': { title: [{ text: { content: str(d.full_name) || str(d.company) || 'New application' } }] },
    };

    const company = str(d.company);
    if (company) props['company'] = { rich_text: [{ text: { content: company } }] };

    const emailVal = str(d.email);
    if (emailVal) props['email'] = { email: emailVal };

    const title = str(d.title);
    if (title) props['title_position'] = { rich_text: [{ text: { content: title } }] };

    const sector = str(d.sector);
    if (sector) props['sector'] = { rich_text: [{ text: { content: sector } }] };

    const motivation = str(d.motivation || d.why_attend);
    if (motivation) props['motivation'] = { rich_text: [{ text: { content: motivation } }] };

    const fullName = str(d.full_name);
    if (fullName) props['full_name'] = { rich_text: [{ text: { content: fullName } }] };

    const notionRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.NOTION_TOKEN,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent: { database_id: '364d9a74e6d481e08fdcdc183a5e3440' },
        properties: props,
      }),
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
