const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_VERSION = '2022-06-28';

async function createNotionPage(databaseId, properties) {
  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      parent: { database_id: databaseId },
      properties,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Notion API error ${res.status}: ${err}`);
  }
  return res.json();
}

function title(value)   { return { title:       [{ text: { content: value || '' } }] }; }
function rich(value)    { return { rich_text:   [{ text: { content: value || '' } }] }; }
function email(value)   { return { email: value || null }; }
function phone(value)   { return { phone_number: value || null }; }
function select(value)  { return value ? { select: { name: value } } : {}; }
function checkbox(v)    { return { checkbox: v === true || v === 'true' || v === 'yes' || v === 'on' }; }
function number(value)  { return { number: value ? parseFloat(value) : null }; }
function date(value)    { return value ? { date: { start: value } } : {}; }

module.exports = { createNotionPage, title, rich, email, phone, select, checkbox, number, date };
