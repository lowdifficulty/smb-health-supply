# SMB Health Supply — Ordering Portal

Wound care skin substitute and collagen ordering and tracking platform for **app.smbhealthsupply.com**.

## Features

- **Home** — Platform overview with quick stats and navigation
- **New Client Sign On** — Register healthcare facilities with NPI and contact details
- **Place Order** — Order skin substitutes and collagen products with patient/clinical info
- **Order Tracking** — Full order details, line items, notes, and shipment status
- **Dashboard** — Open order value, notes due, open orders, and status breakdown

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS 4
- React Router
- LocalStorage for data persistence (demo-ready; swap for API/backend in production)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Build for Production

```bash
npm run build
npm run preview
```

Deploy the `dist/` folder to your hosting provider for **app.smbhealthsupply.com**.

## Product Catalog

Includes 6 skin substitutes (Apligraf, Dermagraft, EpiFix, PuraPly AM, TheraSkin, Integra Bilayer) and 4 collagen products (HeliMend, Helistat, Oasis, PriMatrix).

Sample clients and orders are seeded on first load.
