# Swati Sharma Makeup Artistry — website

A React website with an Express (Node.js) backend API.

- **Home page**: introduction, how booking works, service menu with prices, enquiry form, contact details with map.
- **Enquiry form**: clients pick a service from the menu, add their date, venue and number of people. Enquiries are saved on the server and (optionally) emailed to parasharakash422@gmail.com.
- **Admin page** at `/admin`: see every enquiry, call or WhatsApp the client in one tap, and mark it New / Contacted / Booked / Closed.

```
swati-makeup/
├── client/                 React app (Vite)
│   └── src/components/     Header, Hero, About, Menu, EnquiryForm, Contact, Footer, Admin
└── server/                 Express API
    ├── index.js            API routes
    ├── data/business.json  Name, phone, email, address, hours  ← edit here
    ├── data/services.json  Service menu and prices             ← edit here
    └── lib/                Enquiry storage and email
```

## Run it on your computer

Needs Node.js 20 or newer.

```bash
npm install          # installs the dev runner
npm run setup        # installs server + client packages
cp server/.env.example server/.env   # then edit server/.env
npm run dev
```

Open http://localhost:5173 for the site and http://localhost:5173/admin for enquiries
(log in with the `ADMIN_KEY` from `server/.env`).

## Turn on email alerts for new enquiries

1. On the Gmail account, turn on 2-Step Verification.
2. Create an App Password at https://myaccount.google.com/apppasswords.
3. Put it in `server/.env` as `SMTP_PASS=...` and restart the server.

Without this, enquiries are still saved and shown at `/admin`.

## Change prices, services or contact details

- Prices and services: `server/data/services.json` (each item has a name, description, duration, price in rupees and a shade colour for its dot).
- Phone, email, address, hours, tagline: `server/data/business.json`.
- Restart the server after editing.

## API

| Method | Path                  | What it does                                   |
| ------ | --------------------- | ---------------------------------------------- |
| GET    | `/api/business`       | Contact details                                |
| GET    | `/api/services`       | Service menu                                   |
| POST   | `/api/enquiries`      | Submit an enquiry (validated, spam-limited)    |
| GET    | `/api/enquiries`      | List enquiries — header `x-admin-key` required |
| PATCH  | `/api/enquiries/:id`  | Change status — header `x-admin-key` required  |

## Put it online

The simplest setup is one Node server that serves both the API and the built site:

```bash
npm run setup
npm run build
npm start            # serves everything on PORT (default 5000)
```

This works on Render, Railway, a Hostinger/DigitalOcean VPS, or any host that runs Node.js.
Set the `.env` values in the host's environment settings. Enquiries are stored in
`server/data/enquiries.json`, so pick a host with a persistent disk (a VPS, or Render/Railway
with a volume attached).

If you host the React site separately (e.g. Netlify/Vercel), build it with
`VITE_API_URL=https://your-api-domain` and set `CORS_ORIGIN` on the server to the site's address.
