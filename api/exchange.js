const DB_ID = process.env.NOTION_DB_INDUSTRY_EXCHANGE;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const d = req.body;
    const str = (v) => (v && String(v).trim()) || null;

    const fullName = str(d.full_name) || 'Unknown';

    const properties = {
      'Full Name':          { title: [{ text: { content: fullName } }] },
      'Application Status': { select: { name: 'Submitted' } },
      'Source':             { select: { name: 'Formspree' } },
    };

    const company = str(d.company);
    if (company) properties['Company'] = { rich_text: [{ text: { content: company } }] };

    const emailVal = str(d.email);
    if (emailVal) properties['Email'] = { email: emailVal };

    const phone = str(d.phone);
    if (phone) properties['Phone'] = { phone_number: phone };

    const title = str(d.title);
    if (title) properties['Title / Position'] = { rich_text: [{ text: { content: title } }] };

    const sector = str(d.sector);
    if (sector) properties['Sector'] = { select: { name: sector } };

    const motivation = str(d.motivation || d.why_attend);
    if (motivation) properties['Why Attending'] = { rich_text: [{ text: { content: motivation } }] };

    const notes = str(d.message || d.notes);
    if (notes) properties['Notes'] = { rich_text: [{ text: { content: notes } }] };

    const response = await fetch('https://api.notion.com/v1/p
