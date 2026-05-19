const DB_ID = process.env.NOTION_DB_HOTEL_RESERVATIONS;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const d = req.body;

    const str = (v) => (v && String(v).trim()) || null;

    const properties = {
      'Last Name': { title: [{ text: { content: str(d['Last Name'] || d['last_name']) || 'Test' } }] },
      'Source':    { select: { name: 'Formspree' } },
    };

    const firstName = str(d['First Name'] || d['first_name']);
    if (firstName) properties['First Name '] = { rich_text: [{ text: { content: firstName } }] };

    const emailVal = str(d['Email'] || d['email']);
    if (emailVal) properties['Email'] = { email: emailVal };

    const phoneVal = str(d['Phone'] || d['phone']);
    if (phoneVal) properties['Phone'] = { phone_number: phoneVal };

    const company = str(d['Company Name'] || d['company']);
    if (company) properties['Company Name'] = { rich_text: [{ text: { content: company } }] };

    const roomType = str(d['Room Type'] || d['room_type']);
    if (roomType) properties['Room Type '] = { select: { name: roomType } };

    const rooms = str(d['Amount of Rooms'] || d['amount_of_rooms']);
    if (rooms) properties['Amount of Rooms '] = { select: { name: rooms } };

    const guests = str(d['How Many guests per room'] || d['guests_per_room']);
    if (guests) properties['How Many guests per room'] = { select: { name: guests } };

    const comments = str(d['Comments'] || d['notes'] || d['message']);
    if (comments) properties['Comments'] = { rich_text: [{ text: { content: comments } }] };

    const checkIn = str(d['Check In Date'] || d['check_in']);
    if (checkIn) properties['Check In Date '] = { date: { start: checkIn } };

    const checkOut = str(d['Check Out'] || d['check_out']);
    if (checkOut) properties['Check Out'] = { date: { start: checkOut } };

    const res2 = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ parent: { database_id: DB_ID }, properties }),
    });

    if (!res2.ok) {
      const err = await res2.text();
      console.error('bookings webhook error:', err);
      return res.status(500).json({ error: err });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('bookings webhook error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
