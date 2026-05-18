const { createNotionPage, title, rich, email, phone, select, checkbox, date } = require('../lib/notion');

const DB_ID = process.env.NOTION_DB_HOTEL_RESERVATIONS;

// Exact field names from the Formspree form already connected to this database:
//   Last Name (title), First Name , Email, Phone, Company Name,
//   Room Type , Check In Date , Check Out,
//   Amount of Rooms , How Many guests per room,
//   The Room Rate does not include breakfast. Do you want to add? ,
//   I agree to the Terms and Conditions..., Comments

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const d = req.body;

    const properties = {
      'Last Name':                          title(d['last_name'] || d['Last Name'] || ''),
      'First Name ':                        rich(d['first_name'] || d['First Name'] || ''),
      'Email':                              email(d['email'] || d['Email']),
      'Phone':                              phone(d['phone'] || d['Phone']),
      'Company Name':                       rich(d['company'] || d['Company Name'] || ''),
      'Room Type ':                         select(d['room_type'] || d['Room Type']),
      'Comments':                           rich(d['notes'] || d['message'] || d['Comments'] || ''),
      'Source':                             select('Formspree'),
    };

    // Dates
    const checkIn = d['check_in'] || d['Check In Date'];
    const checkOut = d['check_out'] || d['Check Out'];
    if (checkIn)  properties['Check In Date ']  = date(checkIn);
    if (checkOut) properties['Check Out']        = date(checkOut);

    await createNotionPage(DB_ID, properties);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('bookings webhook error:', err);
    return res.status(500).json({ error: err.message });
  }
}
