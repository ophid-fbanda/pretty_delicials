import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";
import initSqlJs from "sql.js";
import { sqlJsDriver } from "./driver";
import { createStore } from "./store";

const require = createRequire(import.meta.url);

async function openStore() {
  const wasm = readFileSync(require.resolve("sql.js/dist/sql-wasm.wasm"));
  const SQL = await initSqlJs({ wasmBinary: wasm });
  return createStore(sqlJsDriver(new SQL.Database()));
}

test("seeded Admin login lands in Administration", async () => {
  const store = await openStore();
  const { session, view } = await store.login("0771111111", "test123");
  assert.equal(session.name, "Admin");
  assert.deepEqual(session.roles, ["Admin", "Management"]);
  assert.equal(view, "admin");
});

test("Kitchen and Delivery share one order row", async () => {
  const store = await openStore();
  const order = await store.getOrder("PD-1036");
  assert.ok(order);
  assert.equal(order.status, "in transit");
  assert.equal(order.lines[0].name, "Beef samosa");
  assert.equal(order.address, "19 Churchill, Gunhill");
});

test("Client placeOrder becomes kitchen incoming then delivery ready", async () => {
  const store = await openStore();
  const { session } = await store.login("0772220001", "test123");
  const id = await store.placeOrder({
    accountId: session.id,
    lines: [{ name: "Sausage roll", qty: 2, productId: "sausage-roll", price: 2.5 }],
    total: 5,
    fare: 3,
    locationName: "Home",
    pay: "Cash. Change to prepare: 5.00",
  });
  let order = await store.getOrder(id);
  assert.equal(order?.status, "incoming");
  await store.accept(id);
  order = await store.getOrder(id);
  assert.equal(order?.status, "processing");
  await store.ready(id);
  order = await store.getOrder(id);
  assert.equal(order?.status, "ready");
  await store.load([id]);
  order = await store.getOrder(id);
  assert.equal(order?.status, "loaded");
  await store.transitLoaded();
  order = await store.getOrder(id);
  assert.equal(order?.status, "in transit");
  await store.delivered(id);
  order = await store.getOrder(id);
  assert.equal(order?.status, "delivered");
});

test("reject keeps the order out of the bench", async () => {
  const store = await openStore();
  await store.reject("PD-1042", ["Out of stock"], "No sausage");
  const order = await store.getOrder("PD-1042");
  assert.equal(order?.status, "rejected");
  assert.deepEqual(order?.reasons, ["Out of stock"]);
});

test("clients are accounts with no roles and no staff duty", async () => {
  const store = await openStore();
  const staff = await store.listStaff();
  const clients = await store.listClients();
  assert.equal(staff.some((row) => row.phone === "0772220001"), false);
  const chipo = clients.find((row) => row.phone === "0772220001");
  assert.ok(chipo);
  assert.equal("onDuty" in chipo, false);
  assert.equal("cleared" in chipo, false);
  assert.equal("roles" in chipo, false);
  const tariro = staff.find((row) => row.phone === "0771110001");
  assert.deepEqual(tariro?.roles, ["Kitchen"]);
  assert.equal(tariro?.onDuty, true);
});

test("recruit writes roles onto staff; stripping roles returns a client", async () => {
  const store = await openStore();
  const chipo = (await store.listClients()).find((row) => row.phone === "0772220001");
  assert.ok(chipo);
  await store.recruit(chipo.id, ["Kitchen"]);
  const asStaff = (await store.listStaff()).find((row) => row.id === chipo.id);
  assert.deepEqual(asStaff?.roles, ["Kitchen"]);
  assert.equal(asStaff?.onDuty, true);
  await store.saveRoles(chipo.id, []);
  assert.equal((await store.listStaff()).some((row) => row.id === chipo.id), false);
  assert.ok((await store.listClients()).some((row) => row.id === chipo.id));
});

test("catalog items point at category ids, not names as keys", async () => {
  const store = await openStore();
  const catalog = await store.catalog();
  const rolls = catalog.categories.find((row) => row.name === "Rolls");
  assert.ok(rolls);
  assert.equal(typeof rolls.id, "number");
  const sausage = catalog.items.find((row) => row.id === "i1");
  assert.equal(sausage?.categoryId, rolls.id);
  assert.equal(sausage?.category, "Rolls");
});
