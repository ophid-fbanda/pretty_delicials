export const SCHEMA_VERSION = "6";

export const RESET = `
PRAGMA foreign_keys = OFF;
DROP TABLE IF EXISTS order_reject_reasons;
DROP TABLE IF EXISTS order_steps;
DROP TABLE IF EXISTS order_lines;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS locations;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS item_prices;
DROP TABLE IF EXISTS product_prices;
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
  id INTEGER PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Management', 'Kitchen', 'Delivery')),
  UNIQUE (account_id, role)
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
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS sizes (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS flavours (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS catalog_items (
  id TEXT PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  size_id INTEGER NOT NULL REFERENCES sizes(id),
  flavour_id INTEGER NOT NULL REFERENCES flavours(id),
  available INTEGER NOT NULL DEFAULT 1 CHECK (available IN (0, 1)),
  UNIQUE (category_id, size_id, flavour_id)
);

CREATE TABLE IF NOT EXISTS item_prices (
  id INTEGER PRIMARY KEY,
  item_id TEXT NOT NULL REFERENCES catalog_items(id),
  amount REAL NOT NULL,
  set_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS shop_products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category_id INTEGER NOT NULL REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS product_prices (
  id INTEGER PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES shop_products(id),
  amount REAL NOT NULL,
  set_at INTEGER NOT NULL
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
  fare REAL NOT NULL DEFAULT 0,
  pay TEXT,
  cancelled INTEGER NOT NULL DEFAULT 0 CHECK (cancelled IN (0, 1)),
  notes TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS order_lines (
  id INTEGER PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id),
  name TEXT NOT NULL,
  qty INTEGER NOT NULL,
  product_id TEXT NOT NULL REFERENCES shop_products(id),
  product_price_id INTEGER NOT NULL REFERENCES product_prices(id)
);

CREATE TABLE IF NOT EXISTS order_steps (
  id INTEGER PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  seq INTEGER NOT NULL,
  name TEXT NOT NULL,
  at INTEGER
);

CREATE TABLE IF NOT EXISTS order_reject_reasons (
  id INTEGER PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  reason TEXT NOT NULL
);

CREATE TRIGGER IF NOT EXISTS product_prices_no_update
BEFORE UPDATE ON product_prices
BEGIN
  SELECT RAISE(ABORT, 'product prices cannot be changed');
END;

CREATE TRIGGER IF NOT EXISTS product_prices_no_delete
BEFORE DELETE ON product_prices
BEGIN
  SELECT RAISE(ABORT, 'product prices cannot be deleted');
END;

CREATE TRIGGER IF NOT EXISTS item_prices_no_update
BEFORE UPDATE ON item_prices
BEGIN
  SELECT RAISE(ABORT, 'item prices cannot be changed');
END;

CREATE TRIGGER IF NOT EXISTS item_prices_no_delete
BEFORE DELETE ON item_prices
BEGIN
  SELECT RAISE(ABORT, 'item prices cannot be deleted');
END;

CREATE TRIGGER IF NOT EXISTS order_lines_no_update
BEFORE UPDATE ON order_lines
BEGIN
  SELECT RAISE(ABORT, 'order lines cannot be changed');
END;

CREATE TRIGGER IF NOT EXISTS order_lines_no_delete
BEFORE DELETE ON order_lines
BEGIN
  SELECT RAISE(ABORT, 'order lines cannot be deleted');
END;

CREATE TRIGGER IF NOT EXISTS orders_money_no_update
BEFORE UPDATE OF fare, pay, account_id ON orders
BEGIN
  SELECT RAISE(ABORT, 'order payment cannot be changed');
END;
`;
