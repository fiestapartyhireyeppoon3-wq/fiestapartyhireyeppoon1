# Fiesta Party Hire Yeppoon — Full-Stack Website

This package turns the uploaded Fiesta Party Hire Yeppoon site into a full-stack Node.js + Express + SQLite project.

## Features

- Preserves the single-site public landing page style
- Real booking form connected to SQLite
- Admin dashboard modal backed by API
- Booking export as JSON
- Inventory tracking and booking analytics
- GitHub-ready folder structure

## Quick start

```bash
npm install
npm start
```

Then open:

```bash
http://localhost:3000
```

## Project structure

- `server.js` — Express server + SQLite API
- `public/index.html` — main website
- `public/assets/css/style.css` — styles
- `public/assets/js/script.js` — frontend behavior
- `data/fiesta.db` — auto-created SQLite database

## API routes

- `GET /api/health`
- `GET /api/inventory`
- `GET /api/bookings`
- `POST /api/bookings`
- `DELETE /api/bookings/:id`
- `DELETE /api/bookings`
- `POST /api/inventory/reset`
- `GET /api/bookings/export`

## Deploy notes

For GitHub, push the full project. To run it, deploy on a Node-capable host such as Render, Railway, VPS, or your own server.

GitHub Pages alone will not run the backend because it only hosts static files.
