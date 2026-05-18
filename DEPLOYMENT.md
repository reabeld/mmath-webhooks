# MMATH 2026 — Formspree → Notion Webhook Deployment

## What this does

Every time someone submits a form on the MMATH website, Formspree sends the data
to a small function hosted on Vercel, which creates a new record in the correct
Notion database automatically. Zero ongoing cost. No third-party subscription.

**7 forms → 7 databases:**

| Form | Endpoint | Notion database |
|---|---|---|
| MMATH Bookings | /api/bookings | Hotel Reservations |
| MMATH Industry Hub RSVP | /api/hub-rsvp | Industry Hub Registrations |
| MMATH Industry Exchange Application | /api/exchange | Industry Exchange |
| MMATH Spaces Enquiry | /api/spaces | Workspace Bookings |
| MMATH Experiences Request | /api/experiences | Experience Bookings |
| MMATH Partner Enquiry | /api/partners | Partners |
| MMATH Merchandise List | /api/merch | Goodies Items |

---

## Step 1 — Create a Notion integration

1. Go to **notion.so/my-integrations**
2. Click **New integration** → name it MMATH Webhooks
3. Select your MMATH workspace
4. Capabilities: tick Read, Update and Insert content
5. Save → copy the Internal Integration Token (starts with ntn_)

### Share each database with the integration

For each of the 7 databases in Notion:
Open the database page → click the ... menu → Connections → search MMATH Webhooks → Confirm.

Databases to share: Hotel Reservations, Industry Hub Registrations, Industry Exchange,
Workspace Bookings, Experience Bookings, Partners, Goodies Items.

---

## Step 2 — Deploy to Vercel

### Option A — GitHub (recommended, 5 minutes)

1. Create a new GitHub repo called mmath-webhooks (can be private)
2. Upload all files from this folder to the repo root
3. Go to vercel.com → Add New Project → import the repo
4. Click Deploy (Vercel auto-detects the config)
5. Your base URL: https://mmath-webhooks.vercel.app

### Option B — Vercel CLI

    npm i -g vercel
    cd mmath-webhooks
    vercel deploy --prod

---

## Step 3 — Add environment variables in Vercel

Vercel project → Settings → Environment Variables:

    NOTION_TOKEN                    ntn_xxxx  (from Step 1)
    NOTION_DB_HOTEL_RESERVATIONS    31ed9a74e6d480cdaa95000b9a05449b
    NOTION_DB_INDUSTRY_HUB          c1342defcd74468a9e557ed5d41a3979
    NOTION_DB_INDUSTRY_EXCHANGE     d4e90c5fc9d244fba5da68103138562b
    NOTION_DB_WORKSPACE_BOOKINGS    3a01d99e1c6f4277bf1f89bbf0b3df65
    NOTION_DB_EXPERIENCE_BOOKINGS   4e622a2ef00e46b78b8c7024011bd75b
    NOTION_DB_PARTNERS              31dd9a74e6d4804b9d2a000bc0b99d30
    NOTION_DB_GOODIES               2ba9a4c073b24a24b9ea917bfdd3e895

After adding variables: Deployments → ... → Redeploy.

---

## Step 4 — Configure Formspree webhooks

For each form in your Formspree dashboard:
Form → Integrations tab → Webhooks → Add webhook → POST → paste URL → Save → Send test.

    MMATH Bookings                  https://mmath-webhooks.vercel.app/api/bookings
    MMATH Industry Hub RSVP         https://mmath-webhooks.vercel.app/api/hub-rsvp
    MMATH Industry Exchange         https://mmath-webhooks.vercel.app/api/exchange
    MMATH Spaces Enquiry            https://mmath-webhooks.vercel.app/api/spaces
    MMATH Experiences Request       https://mmath-webhooks.vercel.app/api/experiences
    MMATH Partner Enquiry           https://mmath-webhooks.vercel.app/api/partners
    MMATH Merchandise List          https://mmath-webhooks.vercel.app/api/merch

---

## Step 5 — Test

Submit a test entry on each website form.
Within 2-3 seconds a new record should appear in the Notion database.

If it does not appear: Vercel dashboard → your project → Functions tab → check logs.

---

## Troubleshooting

Record not created:
- Check Vercel function logs for error messages
- Verify the database was shared with the integration (Step 1)
- Confirm NOTION_TOKEN is correct in Vercel env vars

Select field errors:
- Notion select fields only accept values that exist as options in the field schema
- Add any missing options to the database before the form goes live

Formspree not sending:
- Formspree → form → Integrations → Webhooks → Send test
- Confirm the webhook URL has no trailing slash

---

MMATH 2026 · Webhook integration · Built May 2026
