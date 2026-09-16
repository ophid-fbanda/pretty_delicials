import { RESET, SCHEMA, SCHEMA_VERSION } from "./schema";
import {
  ACCOUNT_ROLES,
  ACCOUNTS,
  ADJUSTMENTS,
  BRANCHES,
  CATALOG_ITEMS,
  CATEGORIES,
  EXPENSES,
  FARES,
  FLAVOURS,
  ORDERS,
  SHOP_PRODUCTS,
  SIZES,
  STAFF,
  VEHICLES,
} from "./seed";
import {
  TEAM_ROLES,
  TRACK_STEPS,
  type Account,
  type Branch,
  type Catalog,
  type ClientAccount,
  type Driver,
  type Fare,
  type MoneyRow,
  type Order,
  type OrderLine,
  type Reports,
  type SavedLocation,
  type Session,
  type ShopProduct,
  type StaffMember,
  type TeamRole,
  type Vehicle,
} from "./types";

type AccountRow = {
  id: string;
  name: string;
  phone: string;
  email: string;
  disabled: number;
};

type OrderRow = {
  id: string;
  account_id: string | null;
  status: string;
  mins: number;
  kitchen_staff_id: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  total: number | null;
  fare: number | null;
  pay: string | null;
  cancelled: number;
  notes: string;
  created_at: number;
};

function flag(n: number) {
  return n === 1;
}

function asRole(value: string): TeamRole | null {
  return (TEAM_ROLES as readonly string[]).includes(value) ? (value as TeamRole) : null;
}

function landingView(roles: TeamRole[]) {
  if (roles.includes("Admin")) return "admin";
  if (roles.includes("Management")) return "mgmt";
  if (roles.includes("Kitchen")) return "kitchen";
  if (roles.includes("Delivery")) return "delivery";
  return "home";
}

function stampNamesForStatus(status: string): string[] {
  if (status === "incoming" || status === "created") return ["created"];
  if (status === "accepted") return ["created", "accepted"];
  if (status === "processing") return ["created", "accepted", "sent to kitchen", "processing"];
  if (status === "ready") return ["created", "accepted", "sent to kitchen", "processing", "ready"];
  if (status === "loaded") return ["created", "accepted", "sent to kitchen", "processing", "ready", "loaded"];
  if (status === "in transit") {
    return ["created", "accepted", "sent to kitchen", "processing", "ready", "loaded", "in transit"];
  }
  if (status === "delivered") return [...TRACK_STEPS];
  return ["created"];
}

export class Store {
  constructor(private db: Driver) {}

  private listeners = new Set<() => void>();

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit() {
    this.listeners.forEach((fn) => fn());
  }

  async boot() {
    await this.db.exec("PRAGMA foreign_keys = ON");
    const version = await this.db.get<{ value: string }>("SELECT value FROM meta WHERE key = ?", ["schema_version"]).catch(() => null);
    if (version?.value === SCHEMA_VERSION) return;
    await this.db.exec(RESET);
    await this.db.exec(SCHEMA);
    await this.seed();
    await this.db.run("INSERT INTO meta (key, value) VALUES (?, ?)", ["schema_version", SCHEMA_VERSION]);
  }

  private async seed() {
    const now = Date.now();
    for (const account of ACCOUNTS) {
      await this.db.run(
        `INSERT INTO accounts (id, name, phone, email, secret, disabled) VALUES (?, ?, ?, ?, ?, ?)`,
        [account.id, account.name, account.phone, account.email, account.secret, account.disabled]
      );
    }
    for (const row of STAFF) {
      await this.db.run(`INSERT INTO staff (account_id, on_duty, cleared) VALUES (?, ?, ?)`, [row.accountId, row.onDuty, row.cleared]);
    }
    for (const row of ACCOUNT_ROLES) {
      await this.db.run(`INSERT INTO account_roles (account_id, role) VALUES (?, ?)`, [row.accountId, row.role]);
    }
    for (const shop of BRANCHES) {
      await this.db.run(`INSERT INTO branches (id, name, address, phone, lat, lng, open) VALUES (?, ?, ?, ?, ?, ?, ?)`, [
        shop.id,
        shop.name,
        shop.address,
        shop.phone,
        shop.lat,
        shop.lng,
        shop.open,
      ]);
    }
    for (const name of CATEGORIES) await this.db.run("INSERT INTO categories (name) VALUES (?)", [name]);
    for (const name of SIZES) await this.db.run("INSERT INTO sizes (name) VALUES (?)", [name]);
    for (const name of FLAVOURS) await this.db.run("INSERT INTO flavours (name) VALUES (?)", [name]);
    const categoryIds = await this.idsByName("categories");
    const sizeIds = await this.idsByName("sizes");
    const flavourIds = await this.idsByName("flavours");
    for (const item of CATALOG_ITEMS) {
      await this.db.run(
        `INSERT INTO catalog_items (id, category_id, size_id, flavour_id, price, available) VALUES (?, ?, ?, ?, ?, ?)`,
        [item.id, categoryIds.get(item.category)!, sizeIds.get(item.size)!, flavourIds.get(item.flavour)!, item.price, item.available]
      );
    }
    for (const product of SHOP_PRODUCTS) {
      await this.db.run(`INSERT INTO shop_products (id, name, category_id, price) VALUES (?, ?, ?, ?)`, [
        product.id,
        product.name,
        categoryIds.get(product.category)!,
        product.price,
      ]);
    }
    for (const vehicle of VEHICLES) {
      await this.db.run(`INSERT INTO vehicles (id, plate, status, assignee_id, fuel) VALUES (?, ?, ?, ?, ?)`, [
        vehicle.id,
        vehicle.plate,
        vehicle.status,
        vehicle.assigneeId,
        vehicle.fuel,
      ]);
    }
    for (const fare of FARES) await this.db.run("INSERT INTO fares (id, area, amount) VALUES (?, ?, ?)", [fare.id, fare.area, fare.amount]);
    for (const row of EXPENSES) await this.db.run("INSERT INTO expenses (id, note, amount) VALUES (?, ?, ?)", [row.id, row.note, row.amount]);
    for (const row of ADJUSTMENTS) await this.db.run("INSERT INTO adjustments (id, note, amount) VALUES (?, ?, ?)", [row.id, row.note, row.amount]);
    for (const order of ORDERS) {
      await this.insertOrder({
        id: order.id,
        accountId: null,
        status: order.status,
        mins: order.mins,
        kitchenStaffId: order.kitchenStaffId,
        address: order.address,
        lat: order.lat,
        lng: order.lng,
        total: null,
        fare: null,
        pay: null,
        cancelled: order.status === "cancelled",
        reasons: order.reasons ?? [],
        notes: order.notes ?? "",
        createdAt: now,
        lines: order.lines,
      });
    }
  }

  private async insertOrder(input: {
    id: string;
    accountId: string | null;
    status: string;
    mins: number;
    kitchenStaffId: string | null;
    address: string | null;
    lat: number | null;
    lng: number | null;
    total: number | null;
    fare: number | null;
    pay: string | null;
    cancelled: boolean;
    reasons: string[];
    notes: string;
    createdAt: number;
    lines: OrderLine[];
  }) {
    await this.db.run(
      `INSERT INTO orders (id, account_id, status, mins, kitchen_staff_id, address, lat, lng, total, fare, pay, cancelled, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.id,
        input.accountId,
        input.status,
        input.mins,
        input.kitchenStaffId,
        input.address,
        input.lat,
        input.lng,
        input.total,
        input.fare,
        input.pay,
        input.cancelled ? 1 : 0,
        input.notes,
        input.createdAt,
      ]
    );
    for (const line of input.lines) {
      await this.db.run(`INSERT INTO order_lines (order_id, name, qty, product_id, price) VALUES (?, ?, ?, ?, ?)`, [
        input.id,
        line.name,
        line.qty,
        line.productId ?? null,
        line.price ?? null,
      ]);
    }
    for (const reason of input.reasons) {
      await this.db.run(`INSERT INTO order_reject_reasons (order_id, reason) VALUES (?, ?)`, [input.id, reason]);
    }
    const stamped = new Set(input.cancelled ? ["created"] : stampNamesForStatus(input.status));
    for (let seq = 0; seq < TRACK_STEPS.length; seq++) {
      const name = TRACK_STEPS[seq];
      await this.db.run(`INSERT INTO order_steps (order_id, seq, name, at) VALUES (?, ?, ?, ?)`, [
        input.id,
        seq,
        name,
        stamped.has(name) ? input.createdAt : null,
      ]);
    }
  }

  private async rolesFor(accountId: string): Promise<TeamRole[]> {
    const rows = await this.db.all<{ role: string }>("SELECT role FROM account_roles WHERE account_id = ? ORDER BY role", [accountId]);
    return rows.map((row) => asRole(row.role)).filter((role): role is TeamRole => role !== null);
  }

  private async accountByPhone(phone: string) {
    return this.db.get<AccountRow>("SELECT id, name, phone, email, disabled FROM accounts WHERE phone = ?", [phone]);
  }

  private mapAccount(row: AccountRow): Account {
    return {
      id: row.id,
      name: row.name,
      phone: row.phone,
      email: row.email,
      disabled: flag(row.disabled),
    };
  }

  private sessionFrom(account: Account, roles: TeamRole[]): Session {
    return {
      id: account.id,
      phone: account.phone,
      name: account.name,
      email: account.email,
      roles,
      trackId: null,
    };
  }

  async login(phone: string, secret: string, preferredName = "", email = "") {
    let row = await this.accountByPhone(phone);
    if (!row) {
      const created = await this.insertAccount({
        name: preferredName || "Admin",
        phone,
        email,
        secret,
        disabled: false,
      });
      await this.replaceRoles(created.id, ["Admin"]);
      row = (await this.accountByPhone(phone)) as AccountRow;
    }
    const account = this.mapAccount(row);
    const roles = await this.rolesFor(account.id);
    return { session: this.sessionFrom(account, roles), view: landingView(roles) };
  }

  async createAccount(phone: string, preferredName: string, email: string, secret: string) {
    let row = await this.accountByPhone(phone);
    if (!row) {
      await this.insertAccount({
        name: preferredName,
        phone,
        email,
        secret,
        disabled: false,
      });
    }
    return {
      session: { id: (await this.accountByPhone(phone))!.id, phone, name: preferredName, email, roles: [] as TeamRole[], trackId: null },
      view: "home" as const,
    };
  }

  private async insertAccount(input: { name: string; phone: string; email: string; secret: string; disabled: boolean }) {
    const id = "a-" + Date.now();
    await this.db.run(`INSERT INTO accounts (id, name, phone, email, secret, disabled) VALUES (?, ?, ?, ?, ?, ?)`, [
      id,
      input.name,
      input.phone,
      input.email,
      input.secret,
      input.disabled ? 1 : 0,
    ]);
    this.emit();
    return { id, name: input.name, phone: input.phone, email: input.email, disabled: input.disabled };
  }

  async listStaff(): Promise<StaffMember[]> {
    const rows = await this.db.all<AccountRow & { on_duty: number; cleared: number }>(
      `SELECT a.id, a.name, a.phone, a.email, a.disabled, s.on_duty, s.cleared
       FROM staff s
       JOIN accounts a ON a.id = s.account_id
       ORDER BY a.name`
    );
    const members: StaffMember[] = [];
    for (const row of rows) {
      members.push({
        ...this.mapAccount(row),
        roles: await this.rolesFor(row.id),
        onDuty: flag(row.on_duty),
        cleared: flag(row.cleared),
      });
    }
    return members;
  }

  async listClients(): Promise<ClientAccount[]> {
    const rows = await this.db.all<AccountRow>(
      `SELECT a.id, a.name, a.phone, a.email, a.disabled
       FROM accounts a
       WHERE NOT EXISTS (SELECT 1 FROM account_roles r WHERE r.account_id = a.id)
       ORDER BY a.name`
    );
    return rows.map((row) => this.mapAccount(row));
  }

  private async replaceRoles(accountId: string, roles: TeamRole[]) {
    await this.db.run("DELETE FROM account_roles WHERE account_id = ?", [accountId]);
    for (const role of roles) {
      await this.db.run("INSERT INTO account_roles (account_id, role) VALUES (?, ?)", [accountId, role]);
    }
    const staff = await this.db.get<{ account_id: string }>("SELECT account_id FROM staff WHERE account_id = ?", [accountId]);
    if (roles.length === 0) {
      await this.db.run("DELETE FROM staff WHERE account_id = ?", [accountId]);
      return;
    }
    if (!staff) {
      await this.db.run("INSERT INTO staff (account_id, on_duty, cleared) VALUES (?, 0, 0)", [accountId]);
    }
  }

  async saveRoles(accountId: string, roles: TeamRole[]) {
    await this.replaceRoles(accountId, roles);
    this.emit();
  }

  async resetSecret(accountId: string, secret: string) {
    await this.db.run("UPDATE accounts SET secret = ? WHERE id = ?", [secret, accountId]);
    this.emit();
  }

  async setDisabled(accountId: string, disabled: boolean) {
    await this.db.run("UPDATE accounts SET disabled = ? WHERE id = ?", [disabled ? 1 : 0, accountId]);
    this.emit();
  }

  async recruit(accountId: string, roles: TeamRole[]) {
    await this.db.run("UPDATE accounts SET disabled = 0 WHERE id = ?", [accountId]);
    await this.replaceRoles(accountId, roles);
    await this.db.run("UPDATE staff SET on_duty = 1, cleared = 0 WHERE account_id = ?", [accountId]);
    this.emit();
  }

  async clearDuty(accountId: string) {
    await this.db.run("UPDATE staff SET cleared = 1 WHERE account_id = ?", [accountId]);
    this.emit();
  }

  async listBranches(): Promise<Branch[]> {
    const rows = await this.db.all<{
      id: string;
      name: string;
      address: string;
      phone: string;
      lat: string;
      lng: string;
      open: number;
    }>("SELECT * FROM branches ORDER BY name");
    return rows.map((row) => ({ ...row, open: flag(row.open) }));
  }

  async renameBranch(id: string, name: string) {
    await this.db.run("UPDATE branches SET name = ? WHERE id = ?", [name, id]);
    this.emit();
  }

  async setShopOpen(id: string, open: boolean) {
    await this.db.run("UPDATE branches SET open = ? WHERE id = ?", [open ? 1 : 0, id]);
    this.emit();
  }

  private async idsByName(table: "categories" | "sizes" | "flavours") {
    const rows = await this.db.all<{ id: number; name: string }>(`SELECT id, name FROM ${table}`);
    return new Map(rows.map((row) => [row.name, row.id]));
  }

  async catalog(): Promise<Catalog> {
    const categories = await this.db.all<{ id: number; name: string }>("SELECT id, name FROM categories");
    const sizes = await this.db.all<{ id: number; name: string }>("SELECT id, name FROM sizes");
    const flavours = await this.db.all<{ id: number; name: string }>("SELECT id, name FROM flavours");
    const items = await this.db.all<{
      id: string;
      category_id: number;
      size_id: number;
      flavour_id: number;
      category: string;
      size: string;
      flavour: string;
      price: number;
      available: number;
    }>(
      `SELECT i.id, i.category_id, i.size_id, i.flavour_id, i.price, i.available,
              c.name AS category, s.name AS size, f.name AS flavour
       FROM catalog_items i
       JOIN categories c ON c.id = i.category_id
       JOIN sizes s ON s.id = i.size_id
       JOIN flavours f ON f.id = i.flavour_id`
    );
    return {
      categories,
      sizes,
      flavours,
      items: items.map((item) => ({
        id: item.id,
        categoryId: item.category_id,
        sizeId: item.size_id,
        flavourId: item.flavour_id,
        category: item.category,
        size: item.size,
        flavour: item.flavour,
        price: item.price,
        available: flag(item.available),
      })),
    };
  }

  async addTerm(kind: "categories" | "sizes" | "flavours", name: string) {
    const table = kind === "categories" ? "categories" : kind === "sizes" ? "sizes" : "flavours";
    await this.db.run(`INSERT INTO ${table} (name) VALUES (?)`, [name]);
    this.emit();
  }

  async addItem(item: { categoryId: number; sizeId: number; flavourId: number; price: number }) {
    const id = "i-" + Date.now();
    await this.db.run(
      `INSERT INTO catalog_items (id, category_id, size_id, flavour_id, price, available) VALUES (?, ?, ?, ?, ?, 1)`,
      [id, item.categoryId, item.sizeId, item.flavourId, item.price]
    );
    this.emit();
  }

  async toggleItem(id: string) {
    const row = await this.db.get<{ available: number }>("SELECT available FROM catalog_items WHERE id = ?", [id]);
    if (!row) return;
    await this.db.run("UPDATE catalog_items SET available = ? WHERE id = ?", [row.available ? 0 : 1, id]);
    this.emit();
  }

  async shopProducts(): Promise<ShopProduct[]> {
    const rows = await this.db.all<{
      id: string;
      name: string;
      category_id: number;
      category: string;
      price: number;
    }>(
      `SELECT p.id, p.name, p.price, p.category_id, c.name AS category
       FROM shop_products p
       JOIN categories c ON c.id = p.category_id`
    );
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      categoryId: row.category_id,
      category: row.category,
      price: row.price,
    }));
  }

  async listVehicles(): Promise<Vehicle[]> {
    const rows = await this.db.all<{
      id: string;
      plate: string;
      status: string;
      assignee_id: string | null;
      fuel: number;
    }>("SELECT * FROM vehicles ORDER BY plate");
    return rows.map((row) => ({
      id: row.id,
      plate: row.plate,
      status: row.status,
      assigneeId: row.assignee_id,
      fuel: row.fuel,
    }));
  }

  async registerVehicle(plate: string) {
    await this.db.run(`INSERT INTO vehicles (id, plate, status, assignee_id, fuel) VALUES (?, ?, 'yard', NULL, 100)`, [
      "v-" + Date.now(),
      plate,
    ]);
    this.emit();
  }

  async setVehicle(id: string, patch: { assigneeId?: string | null; status?: string; fuel?: number }) {
    const current = (await this.listVehicles()).find((v) => v.id === id);
    if (!current) return;
    const assigneeId = patch.assigneeId === undefined ? current.assigneeId : patch.assigneeId;
    const status = patch.status ?? current.status;
    const fuel = patch.fuel ?? current.fuel;
    await this.db.run("UPDATE vehicles SET assignee_id = ?, status = ?, fuel = ? WHERE id = ?", [assigneeId, status, fuel, id]);
    this.emit();
  }

  async returnVehicle(id: string) {
    await this.db.run("UPDATE vehicles SET assignee_id = NULL, status = 'yard' WHERE id = ?", [id]);
    this.emit();
  }

  async listFares(): Promise<Fare[]> {
    return this.db.all<Fare>("SELECT * FROM fares");
  }

  async addFare(area: string, amount: number) {
    await this.db.run("INSERT INTO fares (id, area, amount) VALUES (?, ?, ?)", ["f-" + Date.now(), area, amount]);
    this.emit();
  }

  async listExpenses(): Promise<MoneyRow[]> {
    return this.db.all<MoneyRow>("SELECT * FROM expenses");
  }

  async listAdjustments(): Promise<MoneyRow[]> {
    return this.db.all<MoneyRow>("SELECT * FROM adjustments");
  }

  async addMoney(kind: "expenses" | "adjustments", note: string, amount: number) {
    const table = kind === "expenses" ? "expenses" : "adjustments";
    await this.db.run(`INSERT INTO ${table} (id, note, amount) VALUES (?, ?, ?)`, [kind[0] + Date.now(), note, amount]);
    this.emit();
  }

  async reports(): Promise<Reports> {
    const today = await this.db.get<{ n: number }>("SELECT COUNT(*) AS n FROM orders");
    const spent = await this.db.get<{ n: number }>("SELECT COALESCE(SUM(amount), 0) AS n FROM expenses");
    const adj = await this.db.get<{ n: number }>("SELECT COALESCE(SUM(amount), 0) AS n FROM adjustments");
    return { todayOrders: today?.n ?? 0, expenses: spent?.n ?? 0, adjustments: adj?.n ?? 0 };
  }

  async listLocations(accountId: string): Promise<SavedLocation[]> {
    const rows = await this.db.all<{ id: string; account_id: string; name: string; detail: string }>(
      "SELECT * FROM locations WHERE account_id = ?",
      [accountId]
    );
    return rows.map((row) => ({ id: row.id, accountId: row.account_id, name: row.name, detail: row.detail }));
  }

  async addLocation(accountId: string, name: string, detail: string) {
    const id = "loc-" + Date.now();
    await this.db.run("INSERT INTO locations (id, account_id, name, detail) VALUES (?, ?, ?, ?)", [id, accountId, name, detail]);
    this.emit();
    return id;
  }

  async listOrders(): Promise<Order[]> {
    const rows = await this.db.all<OrderRow>("SELECT * FROM orders ORDER BY id DESC");
    return Promise.all(rows.map((row) => this.hydrate(row)));
  }

  async getOrder(id: string) {
    const row = await this.db.get<OrderRow>("SELECT * FROM orders WHERE id = ?", [id]);
    return row ? this.hydrate(row) : null;
  }

  private async hydrate(row: OrderRow): Promise<Order> {
    const lines = await this.db.all<OrderLine & { product_id: string | null; price: number | null }>(
      "SELECT name, qty, product_id, price FROM order_lines WHERE order_id = ?",
      [row.id]
    );
    const steps = await this.db.all<{ name: string; at: number | null; seq: number }>(
      "SELECT name, at, seq FROM order_steps WHERE order_id = ? ORDER BY seq",
      [row.id]
    );
    const reasons = await this.db.all<{ reason: string }>("SELECT reason FROM order_reject_reasons WHERE order_id = ?", [row.id]);
    return {
      id: row.id,
      accountId: row.account_id,
      status: row.status,
      mins: row.mins,
      kitchenStaffId: row.kitchen_staff_id,
      address: row.address,
      lat: row.lat,
      lng: row.lng,
      total: row.total,
      fare: row.fare,
      pay: row.pay,
      cancelled: flag(row.cancelled),
      reasons: reasons.map((r) => r.reason),
      notes: row.notes,
      createdAt: row.created_at,
      lines: lines.map((line) => ({
        name: line.name,
        qty: line.qty,
        productId: line.product_id ?? undefined,
        price: line.price ?? undefined,
      })),
      steps,
    };
  }

  async placeOrder(input: {
    accountId: string;
    lines: OrderLine[];
    total: number;
    fare: number;
    locationName: string | null;
    pay: string;
  }) {
    const next = await this.nextOrderId();
    const createdAt = Date.now();
    await this.insertOrder({
      id: next,
      accountId: input.accountId,
      status: "incoming",
      mins: 0,
      kitchenStaffId: null,
      address: input.locationName,
      lat: null,
      lng: null,
      total: input.total,
      fare: input.fare,
      pay: input.pay,
      cancelled: false,
      reasons: [],
      notes: "",
      createdAt,
      lines: input.lines,
    });
    this.emit();
    return next;
  }

  private async nextOrderId() {
    const row = await this.db.get<{ id: string }>("SELECT id FROM orders WHERE id LIKE 'PD-%' ORDER BY id DESC");
    const n = row?.id ? Number(row.id.slice(3)) : 1040;
    return "PD-" + String((Number.isFinite(n) ? n : 1040) + 1);
  }

  async cancelOrder(id: string) {
    await this.db.run("UPDATE orders SET cancelled = 1, status = 'cancelled' WHERE id = ?", [id]);
    this.emit();
  }

  async accept(orderId: string) {
    const order = await this.getOrder(orderId);
    if (!order || order.status !== "incoming") return;
    await this.db.run("UPDATE orders SET status = 'processing' WHERE id = ?", [orderId]);
    await this.stampThrough(orderId, "processing");
    this.emit();
  }

  async reject(orderId: string, reasons: string[], notes: string) {
    const order = await this.getOrder(orderId);
    if (!order || order.status !== "incoming") return;
    await this.db.run("UPDATE orders SET status = 'rejected', notes = ? WHERE id = ?", [notes, orderId]);
    await this.db.run("DELETE FROM order_reject_reasons WHERE order_id = ?", [orderId]);
    for (const reason of reasons) {
      await this.db.run("INSERT INTO order_reject_reasons (order_id, reason) VALUES (?, ?)", [orderId, reason]);
    }
    this.emit();
  }

  async ready(orderId: string) {
    const order = await this.getOrder(orderId);
    if (!order || order.status !== "processing") return;
    await this.db.run("UPDATE orders SET status = 'ready' WHERE id = ?", [orderId]);
    await this.stampThrough(orderId, "ready");
    this.emit();
  }

  async load(orderIds: string[]) {
    for (const id of orderIds) {
      const order = await this.getOrder(id);
      if (order?.status === "ready") {
        await this.db.run("UPDATE orders SET status = 'loaded' WHERE id = ?", [id]);
        await this.stampThrough(id, "loaded");
      }
    }
    this.emit();
  }

  async unload(orderId: string) {
    const order = await this.getOrder(orderId);
    if (!order || order.status !== "loaded") return;
    await this.db.run("UPDATE orders SET status = 'ready' WHERE id = ?", [orderId]);
    await this.db.run("UPDATE order_steps SET at = NULL WHERE order_id = ? AND name = 'loaded'", [orderId]);
    this.emit();
  }

  async transitLoaded() {
    const loaded = (await this.listOrders()).filter((o) => o.status === "loaded");
    for (const order of loaded) {
      await this.db.run("UPDATE orders SET status = 'in transit' WHERE id = ?", [order.id]);
      await this.stampThrough(order.id, "in transit");
    }
    this.emit();
  }

  async delivered(orderId: string) {
    const order = await this.getOrder(orderId);
    if (!order || order.status !== "in transit") return;
    await this.db.run("UPDATE orders SET status = 'delivered' WHERE id = ?", [orderId]);
    await this.stampThrough(orderId, "delivered");
    this.emit();
  }

  async failed(orderId: string) {
    const order = await this.getOrder(orderId);
    if (!order || order.status !== "in transit") return;
    await this.db.run("UPDATE orders SET status = 'failed' WHERE id = ?", [orderId]);
    this.emit();
  }

  private async stampThrough(orderId: string, upTo: string) {
    const idx = TRACK_STEPS.indexOf(upTo as (typeof TRACK_STEPS)[number]);
    if (idx < 0) return;
    const now = Date.now();
    for (let seq = 0; seq <= idx; seq++) {
      await this.db.run("UPDATE order_steps SET at = COALESCE(at, ?) WHERE order_id = ? AND seq = ?", [now, orderId, seq]);
    }
  }
}

export async function createStore(driver: Driver) {
  const store = new Store(driver);
  await store.boot();
  return store;
}
