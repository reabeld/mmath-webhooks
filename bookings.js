const { createNotionPage, title, rich, email, phone, date } = require('../lib/notion');

const DB_ID = process.env.NOTION_DB_HOTEL_RESERVATIONS;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const d = req.body;

    // Only include properties that have actual values
    const properties = {
      'Last Name': { title: [{ text: { content: d['Last Name'] || d['last_name'] || 'Test' } }] },
      'Source':    { select: { name: 'Formspree' } },
    };

    // Optional fields — only add if value exists
    if (d['First Name'] || d['first_name'])
      properties['First Name '] = { rich_text: [{ text: { content: d['First Name'] || d['first_name'] } }] };

    if (d['Email'] || d['email'])
      properties['Email'] = { email: d['Email'] || d['email'] };

    if (d['Phone'] || d['phone'])
      properties['Phone'] = { phone_number: d['Phone'] || d['phone'] };

    if (d['Company Name'] || d['company'])
      properties['Company Name'] = { rich_text: [{ text: { content: d['Company Name'] || d['company'] } }] };

    if (d['Room Type'] || d['room_type'])
      properties['Room Type '] = { select: { name: d['Room Type'] || d['room_type'] } };

    if (d['Amount of Rooms'] || d['amount_of_rooms'])
      properties['Amount of Rooms '] = { select: { name: String(d['Amount of Rooms'] || d['amount_of_rooms']) } };

    if (d['How Many guests per room'] || d['guests_per_room'])
      properties['How Many guests per room'] = { select: { name: String(d['How Many guests per room'] || d['guests_per_room']) } };

    if (d['Comments'] || d['notes'] || d['message'])
      properties['Comments'] = { rich_text: [{ text: { content: d['Comments'] || d['notes'] || d['message'] } }] };

    const checkIn = d['Check In Date'] || d['check_in'];
    if (checkIn) properties['Check In Date '] = { date: { start: checkIn } };

    const checkOut = d['Check Out'] || d['check_out'];
    if (checkOut) properties['Check Out'] = { date: { start: checkOut } };

    await createNotionPage(DB_ID, properties);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('bookings webhook error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
