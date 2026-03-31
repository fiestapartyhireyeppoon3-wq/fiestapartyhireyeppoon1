
const express = require('express');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'fiesta.db'));
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS inventory (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  chairs INTEGER NOT NULL DEFAULT 120,
  tables INTEGER NOT NULL DEFAULT 30,
  decorations INTEGER NOT NULL DEFAULT 20
);
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  event_date TEXT NOT NULL,
  event_type TEXT NOT NULL,
  package_name TEXT NOT NULL,
  guest_count INTEGER NOT NULL,
  setup_hours INTEGER NOT NULL,
  venue TEXT NOT NULL,
  message TEXT DEFAULT '',
  extras TEXT DEFAULT '[]',
  extras_total REAL NOT NULL DEFAULT 0,
  total_price REAL NOT NULL DEFAULT 0,
  chairs_needed INTEGER NOT NULL DEFAULT 0,
  tables_needed INTEGER NOT NULL DEFAULT 0,
  decor_needed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO inventory (id, chairs, tables, decorations)
SELECT 1, 120, 30, 20
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE id = 1);
`);

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const getInventory = () => db.prepare('SELECT chairs, tables, decorations FROM inventory WHERE id = 1').get();
const setInventory = db.prepare('UPDATE inventory SET chairs = ?, tables = ?, decorations = ? WHERE id = 1');

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, app: 'fiesta-party-hire-yeppoon-fullstack' });
});

app.get('/api/inventory', (_req, res) => {
  res.json({ inventory: getInventory() });
});

app.post('/api/inventory/reset', (_req, res) => {
  setInventory.run(120, 30, 20);
  res.json({ ok: true, inventory: getInventory() });
});

app.get('/api/bookings', (_req, res) => {
  const bookings = db.prepare('SELECT * FROM bookings ORDER BY datetime(created_at) DESC, id DESC').all();
  res.json({ bookings, inventory: getInventory() });
});

app.get('/api/bookings/export', (_req, res) => {
  const bookings = db.prepare('SELECT * FROM bookings ORDER BY datetime(created_at) DESC, id DESC').all();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="fiesta-bookings.json"');
  res.send(JSON.stringify({ exported_at: new Date().toISOString(), inventory: getInventory(), bookings }, null, 2));
});

app.post('/api/bookings', (req, res) => {
  const body = req.body || {};
  const required = ['name', 'phone', 'email', 'event_date', 'event_type', 'package_name', 'venue'];
  for (const field of required) {
    if (!body[field]) return res.status(400).json({ error: `${field} is required` });
  }

  const inventory = getInventory();
  const chairsNeeded = Number(body.chairs_needed || 0);
  const tablesNeeded = Number(body.tables_needed || 0);
  const decorNeeded = Number(body.decor_needed || 0);

  if (chairsNeeded > inventory.chairs || tablesNeeded > inventory.tables || decorNeeded > inventory.decorations) {
    return res.status(400).json({ error: 'Selected booking exceeds available inventory.' });
  }

  const insert = db.prepare(`
    INSERT INTO bookings (
      name, phone, email, event_date, event_type, package_name, guest_count, setup_hours,
      venue, message, extras, extras_total, total_price, chairs_needed, tables_needed, decor_needed
    ) VALUES (
      @name, @phone, @email, @event_date, @event_type, @package_name, @guest_count, @setup_hours,
      @venue, @message, @extras, @extras_total, @total_price, @chairs_needed, @tables_needed, @decor_needed
    )
  `);

  const tx = db.transaction((payload) => {
    const result = insert.run({
      name: String(payload.name).trim(),
      phone: String(payload.phone).trim(),
      email: String(payload.email).trim(),
      event_date: String(payload.event_date).trim(),
      event_type: String(payload.event_type).trim(),
      package_name: String(payload.package_name).trim(),
      guest_count: Number(payload.guest_count || 0),
      setup_hours: Number(payload.setup_hours || 0),
      venue: String(payload.venue).trim(),
      message: String(payload.message || '').trim(),
      extras: JSON.stringify(Array.isArray(payload.extras) ? payload.extras : []),
      extras_total: Number(payload.extras_total || 0),
      total_price: Number(payload.total_price || 0),
      chairs_needed: chairsNeeded,
      tables_needed: tablesNeeded,
      decor_needed: decorNeeded
    });
    setInventory.run(inventory.chairs - chairsNeeded, inventory.tables - tablesNeeded, inventory.decorations - decorNeeded);
    return db.prepare('SELECT * FROM bookings WHERE id = ?').get(result.lastInsertRowid);
  });

  const booking = tx(body);
  res.status(201).json({ ok: true, booking, inventory: getInventory() });
});

app.delete('/api/bookings/:id', (req, res) => {
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  const inventory = getInventory();
  const tx = db.transaction(() => {
    db.prepare('DELETE FROM bookings WHERE id = ?').run(req.params.id);
    setInventory.run(
      inventory.chairs + Number(booking.chairs_needed || 0),
      inventory.tables + Number(booking.tables_needed || 0),
      inventory.decorations + Number(booking.decor_needed || 0)
    );
  });
  tx();
  res.json({ ok: true, inventory: getInventory() });
});

app.delete('/api/bookings', (_req, res) => {
  db.prepare('DELETE FROM bookings').run();
  setInventory.run(120, 30, 20);
  res.json({ ok: true, inventory: getInventory() });
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Fiesta Party Hire Yeppoon running on http://localhost:${PORT}`);
});
