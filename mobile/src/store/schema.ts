export const SCHEMA_VERSION = "2";

export const RESET = `
PRAGMA foreign_keys = OFF;
DROP TABLE IF EXISTS order_reject_reasons;
DROP TABLE IF EXISTS order_steps;
DROP TABLE IF EXISTS order_lines;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS locations;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS shop_products;
DROP TABLE IF EXISTS catalog_items;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS sizes;
DROP TABLE IF EXISTS flavours;
DROP TABLE IF EXISTS fares;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS adjustments;
DROP TABLE IF EXISTS branches;
DROP TABLE IF EXISTS account_roles;
DROP TABLE IF EXISTS staff;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS people;
DROP TABLE IF EXISTS catalog_terms;
DROP TABLE IF EXISTS meta;
PRAGMA foreign_keys = ON;
`;

export const SCHEMA = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL DEFAULT '',
  secret TEXT NOT NULL DEFAULT '',
  disabled INTEGER NOT NULL DEFAULT 0 CHECK (disabled IN (0, 1))
);

CREATE TABLE IF NOT EXISTS account_roles (
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Management', 'Kitchen', 'Delivery')),
  PRIMARY KEY (account_id, role)
);

CREATE TABLE IF NOT EXISTS staff (
  account_id TEXT PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
  on_duty INTEGER NOT NULL DEFAULT 0 CHECK (on_duty IN (0, 1)),
  cleared INTEGER NOT NULL DEFAULT 0 CHECK (cleared IN (0, 1))
);

CREATE TABLE IF NOT EXISTS branches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  lat TEXT NOT NULL,
  lng TEXT NOT NULL,
  open INTEGER NOT NULL DEFAULT 1 CHECK (open IN (0, 1))
);

CREATE TABLE IF NOT EXISTS categories (
  name TEXT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS sizes (
  name TEXT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS flavours (
  name TEXT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS catalog_items (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL REFERENCES categories(name),
  size TEXT NOT NULL REFERENCES sizes(name),
  flavour TEXT NOT NULL REFERENCES flavours(name),
  price REAL NOT NULL,
  available INTEGER NOT NULL DEFAULT 1 CHECK (available IN (0, 1)),
  UNIQUE (category, size, flavour)
);

CREATE TABLE IF NOT EXISTS shop_products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL REFERENCES categories(name),
  price REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS vehicles (
  id TEXT PRIMARY KEY,
  plate TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('yard', 'loading', 'out')),
  assignee_id TEXT REFERENCES staff(account_id) ON DELETE SET NULL,
  fuel INTEGER NOT NULL CHECK (fuel BETWEEN 0 AND 100)
);

CREATE TABLE IF NOT EXISTS fares (
  id TEXT PRIMARY KEY,
  area TEXT NOT NULL,
  amount REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  note TEXT NOT NULL,
  amount REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS adjustments (
  id TEXT PRIMARY KEY,
  note TEXT NOT NULL,
  amount REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  detail TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  account_id TEXT REFERENCES accounts(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN (
    'incoming', 'accepted', 'processing', 'ready', 'loaded',
    'in transit', 'delivered', 'rejected', 'cancelled', 'failed'
  )),
  mins INTEGER NOT NULL DEFAULT 0,
  kitchen_staff_id TEXT REFERENCES staff(account_id) ON DELETE SET NULL,
  address TEXT,
  lat REAL,
  lng REAL,
  total REAL,
  fare REAL,
  pay TEXT,
  cancelled INTEGER NOT NULL DEFAULT 0 CHECK (cancelled IN (0, 1)),
  notes TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS order_lines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  qty INTEGER NOT NULL,
  product_id TEXT REFERENCES shop_products(id) ON DELETE SET NULL,
  price REAL
);

CREATE TABLE IF NOT EXISTS order_steps (
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  seq INTEGER NOT NULL,
  name TEXT NOT NULL,
  at INTEGER,
  PRIMARY KEY (order_id, seq)
);

CREATE TABLE IF NOT EXISTS order_reject_reasons (
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  PRIMARY KEY (order_id, reason)
);
`;
