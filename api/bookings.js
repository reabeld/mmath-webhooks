const { createNotionPage, title, rich, email, phone, select, checkbox, date } = require('../lib/notion');

const DB_ID = process.env.NOTION_DB_HOTEL_RESERVATIONS;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const d = req.body;

    const properties = {
      'Last Name':          title(d['Last Name'] || d['last_name'] || ''),
      'First Name ':        rich(d['First Name'] || d['first_name'] || ''),
      'Email':              email(d['Email'] || d['email']),
      'Phone':              phone(d['Phone'] || d['phone']),
      'Company Name':       rich(d['Company Name'] || d['company'] || ''),
      'Room Type ':         select(d['Room Type'] || d['room_type']),
      'Amount of Rooms ':   select(d['Amount of Rooms'] || d['amount_of_rooms']),
      'How Many guests per room': select(d['How Many guests per room'] || d['guests_per_room']),
      'Comments':           rich(d['Comments'] || d['notes'] || d['message'] || ''),
      'Source':             select('Formspree'),
    };

    const checkIn = d['Check In Date'] || d['check_in'];
    const checkOut = d['Check Out'] || d['check_out'];
    if (checkIn)  properties['Check In Date '] = date(checkIn);
    if (checkOut) properties['Check Out']       = date(checkOut);

    const breakfast = d['The Room Rate does not include breakfast. Do you want to add? '] || d['breakfast'];
    if (breakfast) properties['The Room Rate does not include breakfast. Do you want to add? '] = { multi_select: [{ name: breakfast }] };

    await createNotionPage(DB_ID, properties);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('bookings webhook error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
