module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const d = req.body;
    const str = (v) => (v && String(v).trim()) || null;
    const props = {
      'subject': { title: [{ text: { content: str(d.item_name) || str(d.item) || 'New item' } }] },
    };
    const itemName = str(d.item_name || d.item);
    if (itemName) props['item_name'] = { rich_text: [{ text: { content: itemName } }] };
    const supplier = str(d.supplier);
    if (supplier) props['supplier'] = { rich_text: [{ text: { content: supplier } }] };
    const category = str(d.category);
    if (category) props['category'] = { rich_text: [{ text: { content: category } }] };
    const quantity = str(d.quantity);
    if (quantity) props['quantity'] = { rich_text: [{ text: { content: quantity } }] };
    const unitCost = str(d.unit_cost);
    if (unitCost) props['unit_cost'] = { rich_text: [{ text: { content: unitCost } }] };
    const email = str(d.email);
    if (email) props['email'] = { email: email };
    const notes = str(d.notes || d.message);
    if (notes) props['notes'] = { rich_text: [{ text: { content: notes } }] };
    const notionRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.NOTION_TOKEN,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ parent: { database_id: '364d9a74e6d48196b0ecdc3439ef5158' }, properties: props }),
    });
    if (!notionRes.ok) {
      const err = await notionRes.text();
      console.error('merch webhook error:', err);
      return res.status(500).json({ error: err });
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('merch webhook error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
