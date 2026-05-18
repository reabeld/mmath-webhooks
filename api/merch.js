const { createNotionPage, title, rich, email, select, number, date } = require('../lib/notion');

const DB_ID = process.env.NOTION_DB_GOODIES;

// Real field names: Item (title), Supplier, Category (select),
// Distribution (select), Guest Tier (select), Quantity,
// Unit Cost, Delivery Location, Notes, Status, Source

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const d = req.body;
    const properties = {
      'Item':              title(d.item_name || d.item || ''),
      'Supplier':          rich(d.supplier || ''),
      'Category':          select(d.category),
      'Distribution':      select(d.distribution),
      'Guest Tier':        select(d.guest_tier),
      'Quantity':          number(d.quantity),
      'Unit Cost':         number(d.unit_cost),
      'Delivery Location': rich(d.delivery_location || 'Storage room · Room Mate Aitana · Oct 18'),
      'Notes':             rich(d.notes || d.message || ''),
      'Status':            select('Planned'),
      'Source':            select('Formspree'),
    };
    await createNotionPage(DB_ID, properties);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('merch webhook error:', err);
    return res.status(500).json({ error: err.message });
  }
}
