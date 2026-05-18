const { createNotionPage, title, rich, email, select, number } = require('../lib/notion');

const DB_ID = process.env.NOTION_DB_PARTNERS;

// Real field names: Name (title), Contact Person, Email,
// Type (select), Category (select), Deal Value, Notes, Status, Source

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const d = req.body;
    const notes = [
      d.activation_idea ? `Activation idea: ${d.activation_idea}` : '',
      d.notes || d.message || '',
    ].filter(Boolean).join('\n');
    const properties = {
      'Name':           title(d.company || ''),
      'Contact Person': rich(d.contact_name || ''),
      'Email':          email(d.email),
      'Type':           select(d.partner_type || 'Partner'),
      'Category':       select(d.category || 'Event Partner'),
      'Deal Value':     number(d.deal_value),
      'Notes':          rich(notes),
      'Status':         select('Prospect'),
      'Source':         select('Formspree'),
    };
    await createNotionPage(DB_ID, properties);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('partners webhook error:', err);
    return res.status(500).json({ error: err.message });
  }
}
