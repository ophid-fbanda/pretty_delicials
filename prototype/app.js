document.addEventListener("DOMContentLoaded", () => {
  const CATEGORIES = ["All", "Rolls", "Wraps", "Pies", "Samosas"];
  const PRODUCTS = [
    { id: "sausage-roll", name: "Sausage roll", category: "Rolls", price: 2.5 },
    { id: "mini-rolls", name: "Mini rolls", category: "Rolls", price: 4 },
    { id: "chicken-wrap", name: "Chicken wrap", category: "Wraps", price: 3.5 },
    { id: "salad-wrap", name: "Salad wrap", category: "Wraps", price: 3 },
    { id: "chicken-pie", name: "Chicken pie", category: "Pies", price: 4.5 },
    { id: "steak-pie", name: "Steak pie", category: "Pies", price: 4.5 },
    { id: "beef-samosa", name: "Beef samosa", category: "Samosas", price: 1.5 },
    { id: "veg-samosa", name: "Veg samosa", category: "Samosas", price: 1.2 },
  ];
  const TRACK_STEPS = [
    "created",
    "accepted",
    "sent to kitchen",
    "processing",
    "ready",
    "loaded",
    "in transit",
    "delivered",
  ];
  const DELIVERY_FARE = 3;

  const TEAM_ROLES = ["Admin", "Management", "Kitchen", "Delivery"];
  let people = [
    { id: "seed-admin", name: "Admin", phone: "0771111111", email: "", roles: ["Admin", "Management"], disabled: false, onDuty: false, cleared: true },
    { id: "seed-k", name: "Tariro", phone: "0771110001", email: "", roles: ["Kitchen"], disabled: false, onDuty: true, cleared: false },
    { id: "seed-d", name: "Blessing", phone: "0771110002", email: "", roles: ["Delivery"], disabled: false, onDuty: true, cleared: false },
    { id: "seed-m", name: "Nyasha", phone: "0771110003", email: "", roles: ["Management"], disabled: false, onDuty: true, cleared: true },
    { id: "seed-c1", name: "Chipo", phone: "0772220001", email: "", roles: [], disabled: false },
    { id: "seed-c2", name: "Farai", phone: "0772220002", email: "", roles: [], disabled: true },
  ];
  let branches = [
    { id: "b1", name: "Avondale", address: "12 King George, Avondale", phone: "0771000100", lat: "-17.784", lng: "31.035", open: true },
    { id: "b2", name: "CBD", address: "44 Julius Nyerere, Harare", phone: "0771000101", lat: "-17.831", lng: "31.052", open: false },
  ];
  let catalog = {
    categories: ["Rolls", "Wraps", "Pies", "Samosas"],
    sizes: ["Mini", "Regular", "Family"],
    flavours: ["Sausage", "Chicken", "Beef", "Veg"],
    items: [
      { id: "i1", category: "Rolls", size: "Regular", flavour: "Sausage", price: 2.5, available: true },
      { id: "i2", category: "Wraps", size: "Regular", flavour: "Chicken", price: 3.5, available: true },
      { id: "i3", category: "Pies", size: "Regular", flavour: "Chicken", price: 4.5, available: true },
      { id: "i4", category: "Samosas", size: "Mini", flavour: "Beef", price: 1.5, available: false },
    ],
  };
  let vehicles = [
    { id: "v1", plate: "AET 1234", status: "out", assigneeId: "seed-d", fuel: 62 },
    { id: "v2", plate: "AEF 7781", status: "yard", assigneeId: null, fuel: 90 },
  ];
  let fares = [
    { id: "f1", area: "Avondale", amount: 3 },
    { id: "f2", area: "CBD", amount: 2.5 },
    { id: "f3", area: "Borrowdale", amount: 5 },
  ];
  let expenses = [
    { id: "e1", note: "Flour 25kg", amount: 42 },
    { id: "e2", note: "Gas refill", amount: 18 },
  ];
  let adjustments = [{ id: "a1", note: "Till short Avondale", amount: -4.5 }];
  let kitchenOrders = [
    { id: "PD-1038", status: "accepted", mins: 12, staffId: "seed-k" },
    { id: "PD-1037", status: "out for delivery", mins: 22, staffId: "seed-k" },
    { id: "PD-1036", status: "delivered", mins: 55, staffId: "seed-k" },
    { id: "PD-1035", status: "cancelled", mins: 8, staffId: null },
    { id: "PD-1034", status: "rejected", mins: 6, staffId: "seed-k" },
    { id: "PD-1033", status: "processing", mins: 41, staffId: "seed-k" },
  ];
  const REJECT_REASONS = ["Out of stock", "Too busy", "Can't make this", "Other"];
  let bakeOrders = [
    { id: "PD-1042", status: "incoming", mins: 3, lines: [{ name: "Sausage roll", qty: 4 }, { name: "Chicken wrap", qty: 2 }], reasons: [], notes: "" },
    { id: "PD-1041", status: "incoming", mins: 8, lines: [{ name: "Steak pie", qty: 2 }], reasons: [], notes: "" },
    { id: "PD-1040", status: "processing", mins: 14, lines: [{ name: "Mini rolls", qty: 1 }, { name: "Veg samosa", qty: 6 }], reasons: [], notes: "" },
    { id: "PD-1039", status: "ready", mins: 22, lines: [{ name: "Chicken pie", qty: 3 }], reasons: [], notes: "" },
    { id: "PD-1036", status: "in transit", mins: 35, lines: [{ name: "Beef samosa", qty: 10 }], reasons: [], notes: "" },
    { id: "PD-1035", status: "delivered", mins: 50, lines: [{ name: "Salad wrap", qty: 1 }], reasons: [], notes: "" },
  ];
  let kitchenTab = "incoming";
  let kitchenOpenId = null;
  let rejectDraft = { reasons: [], notes: "" };
  let runOrders = [
    { id: "PD-1048", status: "ready", address: "27 St Patrick, Avondale", lat: -17.787, lng: 31.038, lines: [{ name: "Chicken pie", qty: 3 }] },
    { id: "PD-1047", status: "ready", address: "8 Crowhill, Borrowdale", lat: -17.776, lng: 31.083, lines: [{ name: "Sausage roll", qty: 6 }, { name: "Mini rolls", qty: 1 }] },
    { id: "PD-1046", status: "ready", address: "44 Julius Nyerere, CBD", lat: -17.831, lng: 31.052, lines: [{ name: "Beef samosa", qty: 10 }] },
    { id: "PD-1045", status: "loaded", address: "3 East Road, Belgravia", lat: -17.805, lng: 31.045, lines: [{ name: "Chicken wrap", qty: 2 }] },
    { id: "PD-1036", status: "in transit", address: "19 Churchill, Gunhill", lat: -17.79, lng: 31.06, lines: [{ name: "Beef samosa", qty: 10 }] },
    { id: "PD-1035", status: "delivered", address: "Home · Chisipite", lat: -17.788, lng: 31.09, lines: [{ name: "Salad wrap", qty: 1 }] },
    { id: "PD-1031", status: "failed", address: "Gate 2, Highlands", lat: -17.8, lng: 31.07, lines: [{ name: "Steak pie", qty: 2 }] },
  ];
  const BASE = { name: "Avondale", address: "12 King George, Avondale", lat: -17.784, lng: 31.035 };
  let runTab = "collect";
  let runPicked = {};
  let runFocusId = null;
  let runMapMode = "all";
  let selectedVehicleId = null;
  const MGMT_VIEWS = new Set([
    "mgmt",
    "mgmt-branches",
    "mgmt-products",
    "mgmt-categories",
    "mgmt-sizes",
    "mgmt-flavours",
    "mgmt-items",
    "mgmt-vehicles",
    "mgmt-vehicle",
    "mgmt-staff",
    "mgmt-finance",
    "mgmt-expenses",
    "mgmt-adjustments",
    "mgmt-reports",
    "mgmt-kitchen",
    "mgmt-more",
  ]);
  let roleDrafts = {};
  let staffQuery = "";
  let clientQuery = "";
  const phoneEl = document.getElementById("phone");
  const authScreen = document.getElementById("auth-screen");
  const appScreen = document.getElementById("app-screen");
  const phoneShell = document.getElementById("shell");
  const form = document.getElementById("auth-form");
  const hint = document.getElementById("form-hint");
  const errorEl = document.getElementById("form-error");
  const submitBtn = document.getElementById("submit-btn");
  const extras = document.querySelectorAll(".extra");
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const secretInput = document.getElementById("secret");
  const stage = document.getElementById("stage");
  const cartDock = document.getElementById("cart-dock");
  const runNav = document.getElementById("run-nav");
  const runDock = document.getElementById("run-dock");
  const pop = document.getElementById("pop");
  const popCard = document.getElementById("pop-card");
  const burgerBtn = document.getElementById("burger-btn");
  const drawer = document.getElementById("drawer");
  const drawerBackdrop = document.getElementById("drawer-backdrop");
  const userMenu = document.getElementById("user-menu");
  const roleList = document.getElementById("role-list");

  let mode = "login";
  let user = null;
  let view = "home";
  let category = "All";
  let cart = {};
  let locations = [];
  let selectedLocationId = null;
  let orders = [];
  let nextOrder = 1041;
  let payment = { method: "cash", cashOnHand: "", ecoNumber: "" };
  let tickTimer = null;

  function money(n) {
    return Number(n).toFixed(2);
  }

  function product(id) {
    return PRODUCTS.find((item) => item.id === id);
  }

  function cartLines() {
    return Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => ({ ...product(id), qty }));
  }

  function cartCount() {
    return cartLines().reduce((sum, line) => sum + line.qty, 0);
  }

  function cartSubtotal() {
    return cartLines().reduce((sum, line) => sum + line.price * line.qty, 0);
  }

  function selectedLocation() {
    return locations.find((item) => item.id === selectedLocationId) || null;
  }

  function fare() {
    return selectedLocation() ? DELIVERY_FARE : 0;
  }

  function cartTotal() {
    return cartSubtotal() + fare();
  }

  function setMode(next) {
    mode = next;
    const creating = mode === "create";
    document.querySelectorAll(".mode-btn").forEach((btn) => {
      const on = btn.dataset.mode === mode;
      btn.classList.toggle("is-on", on);
      btn.setAttribute("aria-selected", String(on));
    });
    extras.forEach((field) => {
      field.hidden = !creating;
    });
    nameInput.required = creating;
    secretInput.autocomplete = creating ? "new-password" : "current-password";
    hint.textContent = creating
      ? "Phone, preferred name, and a secret. Email is optional."
      : "Phone number and your secret.";
    submitBtn.textContent = creating ? "Create account" : "Login";
    errorEl.hidden = true;
  }

  function closeOverlays() {
    drawer.hidden = true;
    drawerBackdrop.hidden = true;
    userMenu.hidden = true;
  }

  function openDrawer() {
    userMenu.hidden = true;
    drawer.hidden = false;
    drawerBackdrop.hidden = false;
  }

  function isAdminView() {
    return view === "admin" || view === "staff" || view === "clients";
  }

  function isMgmtView() {
    return MGMT_VIEWS.has(view);
  }

  function isKitchenView() {
    return view === "kitchen";
  }

  function isDeliveryView() {
    return view === "delivery";
  }

  function personName(id) {
    const person = people.find((p) => p.id === id);
    return person ? person.name : "—";
  }

  function renderRoles() {
    const team = user.roles || [];
    burgerBtn.hidden = team.length === 0;
    const items = [];
    if (team.length) items.push({ label: "Shopping", view: "home" });
    if (team.includes("Admin")) items.push({ label: "Administration", view: "admin" });
    if (team.includes("Management")) items.push({ label: "Management", view: "mgmt" });
    team
      .filter((role) => role !== "Admin" && role !== "Management")
      .forEach((role) => items.push({ label: role, view: role.toLowerCase() }));
    roleList.innerHTML = items
      .map((item) => {
        const on =
          (item.view === "home" && !isAdminView() && !isMgmtView() && !isKitchenView() && !isDeliveryView()) ||
          (item.view === "admin" && isAdminView()) ||
          (item.view === "mgmt" && isMgmtView()) ||
          (item.view === "kitchen" && isKitchenView()) ||
          (item.view === "delivery" && isDeliveryView());
        return `<button type="button" class="role-btn${on ? " is-on" : ""}" data-view="${item.view}">${item.label}</button>`;
      })
      .join("");
  }

  function choiceCard(go, title, sub) {
    return `<button type="button" class="choice-card" data-go="${go}">
      <strong>${title}</strong>
      <span>${sub}</span>
    </button>`;
  }

  function backBtn(go, label) {
    return `<button type="button" class="ghost back" data-go="${go}">${label}</button>`;
  }

  function draftsFor(person) {
    if (!roleDrafts[person.id]) roleDrafts[person.id] = person.roles.slice();
    return roleDrafts[person.id];
  }

  function ticksHtml(person) {
    const selected = draftsFor(person);
    return TEAM_ROLES.map(
      (role) =>
        `<label class="tick"><input type="checkbox" data-role-tick="${person.id}" value="${role}"${
          selected.includes(role) ? " checked" : ""
        } /> ${role}</label>`
    ).join("");
  }

  function matchesPerson(person, query) {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [person.name, person.phone, person.email].join(" ").toLowerCase().includes(q);
  }

  function syncUserRoles(person) {
    if (user && user.phone === person.phone) user.roles = person.roles.slice();
  }

  function renderAdmin() {
    const staffN = people.filter((p) => p.roles.length).length;
    const clientN = people.filter((p) => !p.roles.length).length;
    stage.innerHTML = `<h2 class="page-h">Administration</h2>
      <p class="muted">Accounts only.</p>
      <div class="choice">
        <button type="button" class="choice-card" data-admin="staff">
          <strong>Staff</strong>
          <span>${staffN} with roles</span>
        </button>
        <button type="button" class="choice-card" data-admin="clients">
          <strong>Clients</strong>
          <span>${clientN} with no role</span>
        </button>
      </div>`;
  }

  function renderStaff() {
    const list = people.filter((p) => p.roles.length && matchesPerson(p, staffQuery));
    const cards = list
      .map((person) => {
        return `<article class="who-card">
          <h2>${person.name}</h2>
          <p class="muted">${person.phone}${person.email ? " · " + person.email : ""}</p>
          <div class="ticks">${ticksHtml(person)}</div>
          <div class="who-actions">
            <button type="button" class="ghost" data-reset-secret="${person.id}">Reset secret</button>
            <button type="button" class="submit save-roles" data-save-roles="${person.id}">Save</button>
          </div>
        </article>`;
      })
      .join("");
    stage.innerHTML = `<button type="button" class="ghost back" data-admin="admin">Back</button>
      <h2 class="page-h">Staff</h2>
      <label class="field"><span>Search</span><input id="staff-search" value="${staffQuery}" placeholder="Name or phone" /></label>
      <div class="who-grid">${cards || `<p class="muted">No staff match.</p>`}</div>`;
  }

  function renderClients() {
    const list = people.filter((p) => !p.roles.length && matchesPerson(p, clientQuery));
    const cards = list
      .map((person) => {
        return `<article class="who-card">
          <h2>${person.name}</h2>
          <p class="muted">${person.phone}${person.email ? " · " + person.email : ""}</p>
          <p class="muted">${person.disabled ? "Disabled" : "Active"}</p>
          <div class="who-actions">
            <button type="button" class="ghost" data-disable="${person.id}">${
              person.disabled ? "Enable" : "Disable"
            }</button>
            <button type="button" class="submit" data-recruit="${person.id}">Recruit</button>
          </div>
        </article>`;
      })
      .join("");
    stage.innerHTML = `<button type="button" class="ghost back" data-admin="admin">Back</button>
      <h2 class="page-h">Clients</h2>
      <label class="field"><span>Search</span><input id="client-search" value="${clientQuery}" placeholder="Name or phone" /></label>
      <div class="who-grid">${cards || `<p class="muted">No clients match.</p>`}</div>`;
  }

  function renderMgmt() {
    const openN = branches.filter((b) => b.open).length;
    const itemN = catalog.items.length;
    const outN = vehicles.filter((v) => v.status === "out").length;
    const dutyN = people.filter((p) => p.roles.length && p.onDuty).length;
    const stuckN = kitchenOrders.filter((o) => o.mins > 30 && o.status !== "delivered" && o.status !== "cancelled" && o.status !== "rejected").length;
    stage.innerHTML = `<h2 class="page-h">Management</h2>
      <div class="choice">
        ${choiceCard("mgmt-branches", "Branches", openN + " open of " + branches.length)}
        ${choiceCard("mgmt-products", "Products", itemN + " items")}
        ${choiceCard("mgmt-vehicles", "Vehicles", outN + " out")}
        ${choiceCard("mgmt-staff", "Staff", dutyN + " on duty")}
        ${choiceCard("mgmt-finance", "Finance", expenses.length + " expenses")}
        ${choiceCard("mgmt-kitchen", "Kitchen", stuckN ? stuckN + " stuck" : "today")}
        ${choiceCard("mgmt-more", "More", fares.length + " fares")}
      </div>`;
  }

  function renderBranches() {
    const cards = branches
      .map((shop) => {
        return `<article class="who-card fit">
          <div class="who-top">
            <h2>${shop.name}</h2>
            <span class="flag ${shop.open ? "open" : "shut"}">${shop.open ? "Open" : "Closed"}</span>
          </div>
          <p class="muted">${shop.address}</p>
          <p class="muted">${shop.phone}</p>
          <p class="muted">${shop.lat}, ${shop.lng}</p>
          <div class="who-actions tiny-row">
            <button type="button" class="ghost" data-rename-branch="${shop.id}">Rename</button>
            <button type="button" class="submit" data-toggle-shop="${shop.id}">${shop.open ? "Close" : "Open"}</button>
          </div>
        </article>`;
      })
      .join("");
    stage.innerHTML = `${backBtn("mgmt", "Back")}
      <h2 class="page-h">Branches</h2>
      <div class="who-grid">${cards}</div>`;
  }

  function renderProductsHub() {
    stage.innerHTML = `${backBtn("mgmt", "Back")}
      <h2 class="page-h">Products</h2>
      <div class="choice">
        ${choiceCard("mgmt-categories", "Categories", catalog.categories.length + "")}
        ${choiceCard("mgmt-sizes", "Sizes", catalog.sizes.length + "")}
        ${choiceCard("mgmt-flavours", "Flavours", catalog.flavours.length + "")}
        ${choiceCard("mgmt-items", "Items", catalog.items.length + " from the three")}
      </div>`;
  }

  function renderTermList(kind, title, singular) {
    const list = catalog[kind];
    const rows = list
      .map((name) => `<div class="line"><strong>${name}</strong></div>`)
      .join("");
    stage.innerHTML = `${backBtn("mgmt-products", "Back")}
      <h2 class="page-h">${title}</h2>
      <div>${rows}</div>
      <button type="button" class="submit" data-add-term="${kind}">Add ${singular}</button>`;
  }

  function renderItems() {
    const cards = catalog.items
      .map((item) => {
        return `<article class="who-card fit">
          <div class="who-top">
            <h2>${item.flavour} ${item.category.toLowerCase()}</h2>
            <span class="flag ${item.available ? "open" : "shut"}">${item.available ? "Available" : "Off"}</span>
          </div>
          <p class="muted">${item.size} · ${item.category}</p>
          <p class="muted">${money(item.price)}</p>
          <div class="who-actions">
            <button type="button" class="ghost" data-toggle-item="${item.id}">${
              item.available ? "Make unavailable" : "Make available"
            }</button>
          </div>
        </article>`;
      })
      .join("");
    stage.innerHTML = `${backBtn("mgmt-products", "Back")}
      <h2 class="page-h">Items</h2>
      <p class="muted">Each item is a category, size and flavour, with a price.</p>
      <div class="who-grid">${cards}</div>
      <button type="button" class="submit" id="add-item">Add item</button>`;
  }

  function renderVehicles() {
    const cards = vehicles
      .map((v) => {
        const who = v.assigneeId ? personName(v.assigneeId) : "No assignee";
        return `<button type="button" class="who-card fit" data-open-vehicle="${v.id}">
          <strong>${v.plate}</strong>
          <p class="muted">${v.status} · ${who} · fuel ${v.fuel}%</p>
        </button>`;
      })
      .join("");
    stage.innerHTML = `${backBtn("mgmt", "Back")}
      <h2 class="page-h">Vehicles</h2>
      <div class="who-grid">${cards}</div>
      <button type="button" class="submit" id="register-vehicle">Register</button>`;
  }

  function renderVehicle() {
    const v = vehicles.find((item) => item.id === selectedVehicleId);
    if (!v) {
      view = "mgmt-vehicles";
      renderVehicles();
      return;
    }
    const drivers = people.filter((p) => p.roles.includes("Delivery"));
    const opts = `<option value="">No assignee</option>` + drivers
      .map((p) => `<option value="${p.id}"${p.id === v.assigneeId ? " selected" : ""}>${p.name}</option>`)
      .join("");
    const statuses = ["yard", "loading", "out"]
      .map((s) => `<option value="${s}"${v.status === s ? " selected" : ""}>${s}</option>`)
      .join("");
    stage.innerHTML = `${backBtn("mgmt-vehicles", "Back")}
      <h2 class="page-h">${v.plate}</h2>
      <div class="map-box"><em>Map</em></div>
      <label class="field"><span>Assignee</span><select id="veh-assignee">${opts}</select></label>
      <label class="field"><span>Status</span><select id="veh-status">${statuses}</select></label>
      <p class="muted">Fuel ${v.fuel}%</p>
      <div class="fuel"><div class="fuel-track"><span style="width:${v.fuel}%"></span></div></div>
      <div class="tiny-row">
        <button type="button" class="ghost" data-fuel="-10">Fuel −</button>
        <button type="button" class="ghost" data-fuel="10">Fuel +</button>
      </div>
      <button type="button" class="submit" id="return-vehicle">Return</button>`;
  }

  function renderMgmtStaff() {
    const list = people.filter((p) => p.roles.length);
    const cards = list
      .map((person) => {
        const next = person.cleared ? "Keeps roles tomorrow" : "Not cleared — no roles tomorrow";
        return `<article class="who-card fit">
          <div class="who-top">
            <h2>${person.name}</h2>
            <span class="flag ${person.onDuty ? "open" : "shut"}">${person.onDuty ? "On duty" : "Off"}</span>
          </div>
          <p class="muted">${person.roles.join(", ")}</p>
          <p class="muted">${next}</p>
          <div class="who-actions">
            <button type="button" class="submit" data-clear-duty="${person.id}" ${person.cleared ? "disabled" : ""}>${
              person.cleared ? "Cleared" : "Clear for next day"
            }</button>
          </div>
        </article>`;
      })
      .join("");
    stage.innerHTML = `${backBtn("mgmt", "Back")}
      <h2 class="page-h">Staff</h2>
      <p class="muted">On duty now. Clear a shift so they keep roles tomorrow. Uncleared staff lose roles for the next day.</p>
      <div class="who-grid">${cards}</div>`;
  }

  function renderFinanceHub() {
    stage.innerHTML = `${backBtn("mgmt", "Back")}
      <h2 class="page-h">Finance</h2>
      <div class="choice">
        ${choiceCard("mgmt-expenses", "Expenses", expenses.length + "")}
        ${choiceCard("mgmt-adjustments", "Adjustments", adjustments.length + "")}
        ${choiceCard("mgmt-reports", "Reports", "today")}
      </div>`;
  }

  function renderMoneyList(kind, title, rows) {
    const lines = rows
      .map((row) => `<div class="line"><div><strong>${row.note}</strong></div><strong>${money(row.amount)}</strong></div>`)
      .join("");
    stage.innerHTML = `${backBtn("mgmt-finance", "Back")}
      <h2 class="page-h">${title}</h2>
      ${lines || `<p class="muted">None yet.</p>`}
      <button type="button" class="submit" data-add-money="${kind}">Add</button>`;
  }

  function renderReports() {
    const spent = expenses.reduce((s, e) => s + e.amount, 0);
    const adj = adjustments.reduce((s, e) => s + e.amount, 0);
    const today = kitchenOrders.length;
    stage.innerHTML = `${backBtn("mgmt-finance", "Back")}
      <h2 class="page-h">Reports</h2>
      <div class="line"><span>Today's orders</span><strong>${today}</strong></div>
      <div class="line"><span>Expenses</span><strong>${money(spent)}</strong></div>
      <div class="line"><span>Adjustments</span><strong>${money(adj)}</strong></div>
      <p class="muted">Today only. Prototype numbers.</p>`;
  }

  function renderKitchen() {
    const staff = people.filter((p) => p.roles.includes("Kitchen") && p.onDuty);
    const chips = staff.map((p) => `<span class="k-chip">${p.name}</span>`).join("") || `<span class="muted">No kitchen staff on duty.</span>`;
    const cards = kitchenOrders
      .map((order) => {
        const stuck = order.mins > 30 && !["delivered", "cancelled", "rejected"].includes(order.status);
        const label = stuck ? "stuck >30min" : order.status;
        return `<article class="k-order${stuck ? " is-stuck" : ""}">
          <div class="who-top">
            <strong>${order.id}</strong>
            <span class="flag ${stuck ? "stuck" : order.status === "out for delivery" ? "out" : "open"}">${label}</span>
          </div>
          <p class="muted">${order.mins} min · ${order.staffId ? personName(order.staffId) : "—"}</p>
        </article>`;
      })
      .join("");
    stage.innerHTML = `${backBtn("mgmt", "Back")}
      <h2 class="page-h">Kitchen</h2>
      <p class="muted">Kitchen staff on duty</p>
      <div class="k-staff">${chips}</div>
      <p class="muted">Today's orders</p>
      ${cards}`;
  }

  function bakeLinesHtml(order) {
    return order.lines
      .map((line) => `<div class="line"><strong>${line.name}</strong><span>${line.qty}</span></div>`)
      .join("");
  }

  function bakeBits(order) {
    return order.lines.map((line) => `<span class="bit">${line.qty} ${line.name}</span>`).join("");
  }

  function kitchenTabsHtml() {
    const incomingN = bakeOrders.filter((o) => o.status === "incoming").length;
    const benchN = bakeOrders.filter((o) => o.status === "processing").length;
    const tabs = [
      ["incoming", "Incoming", incomingN],
      ["bench", "Kitchen", benchN],
      ["out", "Out", null],
    ];
    return `<div class="work-tabs">${tabs
      .map(
        ([id, label, n]) =>
          `<button type="button" class="work-tab${kitchenTab === id ? " is-on" : ""}" data-k-tab="${id}">${label}${
            n == null ? "" : ` <em>${n}</em>`
          }</button>`
      )
      .join("")}</div>`;
  }

  function bakeTicket(order, kind) {
    const flag =
      kind === "out"
        ? `<span class="flag ${order.status === "rejected" ? "shut" : order.status === "delivered" || order.status === "ready" ? "open" : "out"}">${order.status}</span>`
        : `<span class="muted">${order.mins} min</span>`;
    return `<button type="button" class="who-card fit ticket" data-k-open="${order.id}">
      <div class="who-top"><strong class="ticket-no">${order.id}</strong>${flag}</div>
      <div class="bits">${bakeBits(order)}</div>
    </button>`;
  }

  function renderKitchenRole() {
    if (kitchenOpenId) {
      renderBakeOpen();
      return;
    }
    let body = "";
    if (kitchenTab === "incoming") {
      const list = bakeOrders.filter((o) => o.status === "incoming");
      body = list.map((o) => bakeTicket(o, "incoming")).join("") || `<p class="muted">No incoming orders.</p>`;
    } else if (kitchenTab === "bench") {
      const list = bakeOrders.filter((o) => o.status === "processing");
      body = list.map((o) => bakeTicket(o, "bench")).join("") || `<p class="muted">Nothing on the bench.</p>`;
    } else {
      const list = bakeOrders.filter((o) => !["incoming", "processing"].includes(o.status));
      body = list.map((o) => bakeTicket(o, "out")).join("") || `<p class="muted">Nothing past the kitchen yet.</p>`;
    }
    stage.innerHTML = `<h2 class="page-h">Kitchen</h2>${kitchenTabsHtml()}<div class="who-grid">${body}</div>`;
  }

  function renderBakeOpen() {
    const order = bakeOrders.find((o) => o.id === kitchenOpenId);
    if (!order) {
      kitchenOpenId = null;
      renderKitchenRole();
      return;
    }
    const incoming = order.status === "incoming";
    const onBench = order.status === "processing";
    let actions = `<p class="muted">Kitchen cannot change this now.</p>`;
    if (incoming) {
      actions = `<div class="act-row">
        <button type="button" class="accept" data-accept-bake="${order.id}">Accept</button>
        <button type="button" class="reject-btn" data-reject-bake="${order.id}">Reject</button>
      </div>`;
    } else if (onBench) {
      actions = `<button type="button" class="submit ready-go" data-ready-bake="${order.id}">Ready</button>`;
    } else if (order.status === "rejected") {
      const why = order.reasons.length ? order.reasons.join(", ") : "Rejected";
      actions = `<p class="muted">Rejected. Kitchen cannot change this now.</p>
        <p class="muted">${why}${order.notes ? " — " + order.notes : ""}</p>`;
    }
    stage.innerHTML = `<button type="button" class="ghost back" data-k-back>Back</button>
      <p class="ticket-no big">${order.id}</p>
      <p class="muted">${order.mins} min</p>
      ${bakeLinesHtml(order)}
      ${actions}`;
  }

  function openReject(id) {
    const order = bakeOrders.find((o) => o.id === id);
    if (!order) return;
    rejectDraft = { reasons: [], notes: "" };
    const ticks = REJECT_REASONS.map(
      (reason) => `<label class="tick"><input type="checkbox" data-reject-tick value="${reason}" /> ${reason}</label>`
    ).join("");
    popCard.innerHTML = `<h2>Reject ${order.id}</h2>
      <p class="muted">Tick why. Notes are optional.</p>
      <div class="ticks">${ticks}</div>
      <label class="field"><span>Notes</span><textarea id="reject-notes" rows="3" placeholder="Anything the team should know"></textarea></label>
      <p class="error" id="reject-error" hidden></p>
      <button type="button" class="reject-btn" id="confirm-reject" data-id="${order.id}">Confirm reject</button>
      <button type="button" class="ghost" id="close-pop">Close</button>`;
    pop.hidden = false;
  }

  function renderMore() {
    const rows = fares
      .map((f) => `<div class="line"><div><strong>${f.area}</strong></div><strong>${money(f.amount)}</strong></div>`)
      .join("");
    stage.innerHTML = `${backBtn("mgmt", "Back")}
      <h2 class="page-h">More</h2>
      <p class="muted">Delivery fares. Not on Vehicles.</p>
      ${rows}
      <button type="button" class="submit" id="add-fare">Add fare</button>`;
  }

  function openRenameBranch(id) {
    const shop = branches.find((b) => b.id === id);
    if (!shop) return;
    popCard.innerHTML = `<h2>Rename</h2>
      <label class="field"><span>Name</span><input id="branch-name" value="${shop.name}" /></label>
      <button type="button" class="submit" id="confirm-rename" data-id="${shop.id}">Save</button>
      <button type="button" class="ghost" id="close-pop">Close</button>`;
    pop.hidden = false;
  }

  function openAddTerm(kind) {
    const label = kind.slice(0, -1);
    popCard.innerHTML = `<h2>Add ${label}</h2>
      <label class="field"><span>Name</span><input id="term-name" placeholder="Name" /></label>
      <p class="error" id="term-error" hidden></p>
      <button type="button" class="submit" id="confirm-term" data-kind="${kind}">Add</button>
      <button type="button" class="ghost" id="close-pop">Close</button>`;
    pop.hidden = false;
  }

  function openAddItem() {
    const opts = (arr) => arr.map((n) => `<option value="${n}">${n}</option>`).join("");
    popCard.innerHTML = `<h2>Add item</h2>
      <label class="field"><span>Category</span><select id="item-cat">${opts(catalog.categories)}</select></label>
      <label class="field"><span>Size</span><select id="item-size">${opts(catalog.sizes)}</select></label>
      <label class="field"><span>Flavour</span><select id="item-flavour">${opts(catalog.flavours)}</select></label>
      <label class="field"><span>Price</span><input id="item-price" type="number" min="0" step="0.01" placeholder="0.00" /></label>
      <p class="error" id="item-error" hidden></p>
      <button type="button" class="submit" id="confirm-item">Add</button>
      <button type="button" class="ghost" id="close-pop">Close</button>`;
    pop.hidden = false;
  }

  function openRegisterVehicle() {
    popCard.innerHTML = `<h2>Register vehicle</h2>
      <label class="field"><span>Plate</span><input id="veh-plate" placeholder="AET 0000" /></label>
      <p class="error" id="veh-error" hidden></p>
      <button type="button" class="submit" id="confirm-vehicle">Register</button>
      <button type="button" class="ghost" id="close-pop">Close</button>`;
    pop.hidden = false;
  }

  function openAddMoney(kind) {
    popCard.innerHTML = `<h2>Add ${kind === "expenses" ? "expense" : "adjustment"}</h2>
      <label class="field"><span>Note</span><input id="money-note" placeholder="What for" /></label>
      <label class="field"><span>Amount</span><input id="money-amount" type="number" step="0.01" placeholder="0.00" /></label>
      <p class="error" id="money-error" hidden></p>
      <button type="button" class="submit" id="confirm-money" data-kind="${kind}">Add</button>
      <button type="button" class="ghost" id="close-pop">Close</button>`;
    pop.hidden = false;
  }

  function openAddFare() {
    popCard.innerHTML = `<h2>Add fare</h2>
      <label class="field"><span>Area</span><input id="fare-area" placeholder="Suburb" /></label>
      <label class="field"><span>Fare</span><input id="fare-amount" type="number" min="0" step="0.01" placeholder="0.00" /></label>
      <p class="error" id="fare-error" hidden></p>
      <button type="button" class="submit" id="confirm-fare">Add</button>
      <button type="button" class="ghost" id="close-pop">Close</button>`;
    pop.hidden = false;
  }

  function openRecruit(id) {
    const person = people.find((p) => p.id === id);
    if (!person) return;
    roleDrafts[person.id] = [];
    popCard.innerHTML = `<h2>Recruit ${person.name}</h2>
      <p class="muted">${person.phone}</p>
      <p class="muted">Tick roles and confirm. They become staff.</p>
      <div class="ticks">${ticksHtml(person)}</div>
      <p class="error" id="recruit-error" hidden></p>
      <button type="button" class="submit" id="confirm-recruit" data-id="${person.id}">Confirm</button>
      <button type="button" class="ghost" id="close-pop">Close</button>`;
    pop.hidden = false;
  }

  function openResetSecret(id) {
    const person = people.find((p) => p.id === id);
    if (!person) return;
    popCard.innerHTML = `<h2>Reset secret</h2>
      <p class="muted">${person.name} · ${person.phone}</p>
      <label class="field"><span>New secret</span><input id="reset-secret" type="password" placeholder="New secret" /></label>
      <p class="error" id="reset-error" hidden></p>
      <button type="button" class="submit" id="confirm-reset" data-id="${person.id}">Confirm</button>
      <button type="button" class="ghost" id="close-pop">Close</button>`;
    pop.hidden = false;
  }

  function closePop() {
    pop.hidden = true;
    popCard.innerHTML = "";
  }

  function renderCartDock() {
    const count = cartCount();
    const show = count > 0 && (view === "home" || view === "client");
    cartDock.hidden = !show;
    phoneShell.classList.toggle("has-cart", show);
    if (!show) return;
    document.getElementById("cart-dock-count").textContent = String(count);
    document.getElementById("cart-dock-total").textContent = money(cartSubtotal());
  }

  function runBits(order) {
    return order.lines.map((line) => `<span class="bit">${line.qty} ${line.name}</span>`).join("");
  }

  function pinStyle(lat, lng) {
    const x = Math.max(12, Math.min(88, ((lng - 31.02) / 0.08) * 100));
    const y = Math.max(16, Math.min(84, ((lat + 17.86) / 0.1) * 100));
    return `left:${x}%;top:${y}%`;
  }

  function pinClass(status) {
    if (status === "loaded") return "loaded";
    if (status === "in transit") return "transit";
    if (status === "delivered") return "delivered";
    if (status === "failed") return "failed";
    return "ready";
  }

  function flagFor(status) {
    if (status === "delivered" || status === "ready") return "open";
    if (status === "failed") return "shut";
    if (status === "in transit") return "out";
    return "stuck";
  }

  function renderRunChrome() {
    const on = isDeliveryView();
    runNav.hidden = !on;
    phoneShell.classList.toggle("has-run", on);
    if (!on) {
      runDock.hidden = true;
      phoneShell.classList.remove("has-run-dock");
      return;
    }
    const tabs = [
      ["collect", "Collect"],
      ["loaded", "Loaded"],
      ["map", "Map"],
      ["today", "Today"],
    ];
    runNav.innerHTML = tabs
      .map(
        ([id, label]) =>
          `<button type="button" class="${runTab === id ? "is-on" : ""}" data-run-tab="${id}">${label}</button>`
      )
      .join("");
    const pickedN = Object.values(runPicked).filter(Boolean).length;
    const loadedN = runOrders.filter((o) => o.status === "loaded").length;
    if (runTab === "collect" && pickedN) {
      runDock.hidden = false;
      runDock.className = "run-dock";
      runDock.dataset.runAct = "load";
      runDock.innerHTML = `<span>${pickedN}</span><span>Load</span>`;
    } else if (runTab === "loaded" && loadedN) {
      runDock.hidden = false;
      runDock.className = "run-dock night";
      runDock.dataset.runAct = "transit";
      runDock.innerHTML = `<span>Transit</span>`;
    } else {
      runDock.hidden = true;
      delete runDock.dataset.runAct;
    }
    phoneShell.classList.toggle("has-run-dock", !runDock.hidden);
  }

  function renderDelivery() {
    if (runTab === "collect") renderRunCollect();
    else if (runTab === "loaded") renderRunLoaded();
    else if (runTab === "map") renderRunMap();
    else renderRunToday();
  }

  function renderRunCollect() {
    const list = runOrders.filter((o) => o.status === "ready");
    const slips = list
      .map((o) => {
        const on = !!runPicked[o.id];
        return `<label class="slip${on ? " is-on" : ""}">
          <input type="checkbox" data-run-tick="${o.id}"${on ? " checked" : ""} />
          <span class="slip-mark"></span>
          <div>
            <strong>${o.id}</strong>
            <p class="muted">${o.address}</p>
            <div class="bits">${runBits(o)}</div>
          </div>
        </label>`;
      })
      .join("");
    stage.innerHTML = `<p class="run-kicker">Ready for collection</p>
      <h2 class="page-h">What goes on the van</h2>
      <div class="slip-list">${slips || `<p class="muted">Nothing waiting.</p>`}</div>`;
  }

  function renderRunLoaded() {
    const list = runOrders.filter((o) => o.status === "loaded");
    const slips = list
      .map(
        (o) => `<article class="slip loaded-slip">
          <div>
            <strong>${o.id}</strong>
            <p class="muted">${o.address}</p>
            <div class="bits">${runBits(o)}</div>
          </div>
          <button type="button" class="ghost" data-run-remove="${o.id}">Remove</button>
        </article>`
      )
      .join("");
    stage.innerHTML = `<p class="run-kicker">On the van</p>
      <h2 class="page-h">Loaded</h2>
      <div class="slip-list">${slips || `<p class="muted">Van is empty. Tick ready orders and Load.</p>`}</div>`;
  }

  function renderRunMap() {
    const focus = runOrders.find((o) => o.id === runFocusId);
    const baseOn = runMapMode === "base";
    const pins = runOrders
      .map((o) => {
        const on = runFocusId === o.id && !baseOn;
        return `<button type="button" class="pin ${pinClass(o.status)}${on ? " is-on" : ""}" style="${pinStyle(o.lat, o.lng)}" ${
          o.status === "in transit" ? `data-run-open="${o.id}"` : `data-run-pin="${o.id}"`
        }><span>${o.id.slice(-2)}</span></button>`;
      })
      .join("");
    const card = baseOn
      ? `<div class="map-note"><strong>Return to base</strong><p class="muted">${BASE.address}</p></div>`
      : focus
        ? `<div class="map-note"><strong>${focus.id}</strong><p class="muted">${focus.address}</p><span class="flag ${flagFor(focus.status)}">${focus.status}</span></div>`
        : `<div class="map-note"><p class="muted">Every stop on the run. Tap a pin. Base is home.</p></div>`;
    stage.innerHTML = `<p class="run-kicker">Run map</p>
      <div class="run-map-field">${pins}<button type="button" class="pin base${baseOn ? " is-on" : ""}" style="${pinStyle(BASE.lat, BASE.lng)}" data-run-base><span>B</span></button><button type="button" class="base-chip" data-run-base>Base</button></div>
      ${card}`;
  }

  function renderRunToday() {
    const stops = runOrders
      .map((o, i) => {
        const open = o.status === "in transit" ? `data-run-open="${o.id}"` : `data-run-pin="${o.id}"`;
        return `<button type="button" class="stop" ${open}>
          <span class="stop-n">${i + 1}</span>
          <div><strong>${o.id}</strong><p class="muted">${o.address}</p></div>
          <span class="flag ${flagFor(o.status)}">${o.status}</span>
        </button>`;
      })
      .join("");
    stage.innerHTML = `<p class="run-kicker">Today's loads</p>
      <h2 class="page-h">By order</h2>
      <div class="stop-list">${stops}</div>`;
  }

  function openRunChoice(id) {
    const order = runOrders.find((o) => o.id === id);
    if (!order || order.status !== "in transit") return;
    popCard.innerHTML = `<h2>${order.id}</h2>
      <p class="muted">${order.address}</p>
      <button type="button" class="submit" id="run-show-map" data-id="${order.id}">Map</button>
      <button type="button" class="accept" id="run-show-delivery" data-id="${order.id}">Delivery</button>
      <button type="button" class="ghost" id="close-pop">Close</button>`;
    pop.hidden = false;
  }

  function openRunDelivery(id) {
    const order = runOrders.find((o) => o.id === id);
    if (!order) return;
    popCard.innerHTML = `<h2>Delivery ${order.id}</h2>
      <p class="muted">${order.address}</p>
      <div class="act-row">
        <button type="button" class="accept" id="run-delivered" data-id="${order.id}">Delivered</button>
        <button type="button" class="reject-btn" id="run-failed" data-id="${order.id}">Failed</button>
      </div>
      <button type="button" class="ghost" id="close-pop">Close</button>`;
    pop.hidden = false;
  }

  function stamp(date) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }

  function currentStep(order) {
    if (order.cancelled) return -1;
    let idx = -1;
    order.steps.forEach((item, i) => {
      if (item.at) idx = i;
    });
    return idx;
  }

  function advanceOrders() {
    const now = new Date();
    orders.forEach((order) => {
      if (order.cancelled) return;
      const idx = currentStep(order);
      if (idx < 0 || idx >= TRACK_STEPS.length - 1) return;
      if (now - order.steps[idx].at < 4000) return;
      order.steps[idx + 1].at = now;
    });
    if (view === "track" || view === "history") render();
  }

  function ensureTicker() {
    if (tickTimer) return;
    tickTimer = setInterval(advanceOrders, 700);
  }

  function renderHome() {
    const list = PRODUCTS.filter((item) => category === "All" || item.category === category);
    const chips = CATEGORIES.map(
      (name) =>
        `<button type="button" class="chip${category === name ? " is-on" : ""}" data-cat="${name}">${name}</button>`
    ).join("");
    const rows = list
      .map((item) => {
        const qty = cart[item.id] || 0;
        const lineTotal = item.price * qty;
        return `<article class="prow">
          <img class="prow-pic" src="img/face.jpg" alt="" />
          <div class="prow-words">
            <h2>${item.name}</h2>
            <p>${item.category}</p>
          </div>
          <div class="prow-money">
            <div class="prow-price">${money(item.price)}</div>
            <div class="prow-total">${qty ? "Total " + money(lineTotal) : ""}</div>
          </div>
          <div class="qty qty-vert">
            <button type="button" class="qty-btn plus" data-qty="${item.id}" data-dir="1">+</button>
            <span class="qty-val">${qty}</span>
            <button type="button" class="qty-btn minus" data-qty="${item.id}" data-dir="-1">−</button>
          </div>
        </article>`;
      })
      .join("");
    stage.innerHTML = `<div class="cats">${chips}</div><div class="products">${rows}</div>`;
  }

  function renderCart() {
    const lines = cartLines();
    if (!lines.length) {
      stage.innerHTML = `<h2 class="page-h">Cart</h2><p class="muted">Nothing in the cart yet.</p>`;
      return;
    }
    const rows = lines
      .map(
        (line) => `<div class="line">
          <div>
            <strong>${line.name}</strong>
            <div class="meta">${line.qty} × ${money(line.price)}</div>
          </div>
          <div>
            <div>${money(line.price * line.qty)}</div>
            <button type="button" class="remove-btn" data-remove="${line.id}">Remove</button>
          </div>
        </div>`
      )
      .join("");
    const locOptions = locations
      .map(
        (item) =>
          `<option value="${item.id}"${item.id === selectedLocationId ? " selected" : ""}>${item.name}</option>`
      )
      .join("");
    const locBlock = locations.length
      ? `<label class="field"><span>Deliver to</span>
          <select id="location-select"><option value="">Choose a location</option>${locOptions}</select>
        </label>
        <p class="muted">Pick where this order should go. You can keep several locations.</p>`
      : `<p class="muted">No location yet — add one in My Account if you want a delivery fare on this order.</p>`;
    const fareLine = selectedLocation()
      ? `<div class="line"><span>Delivery fare</span><strong>${money(DELIVERY_FARE)}</strong></div>`
      : `<div class="line"><span>Delivery fare</span><span class="meta">Add a location to see it</span></div>`;
    stage.innerHTML = `<h2 class="page-h">Cart</h2>
      ${rows}
      <div class="totals">
        ${locBlock}
        <div class="line"><span>Items</span><strong>${money(cartSubtotal())}</strong></div>
        ${fareLine}
        <div class="line"><span>Total</span><strong>${money(cartTotal())}</strong></div>
      </div>
      <button type="button" class="submit" id="finalize-btn">Finalize order</button>`;
  }

  function renderPay() {
    const total = cartTotal();
    const cashOn = payment.method === "cash";
    const extra = cashOn
      ? `<label class="field"><span>Amount you have</span>
          <input id="cash-have" type="number" min="0" step="0.01" inputmode="decimal" value="${payment.cashOnHand}" placeholder="So we prepare change" />
        </label>
        <p class="muted" id="change-hint"></p>`
      : `<label class="field"><span>EcoCash number</span>
          <input id="eco-number" type="tel" inputmode="tel" value="${payment.ecoNumber}" placeholder="Dummy EcoCash steps" />
        </label>
        <p class="muted">Dummy EcoCash: enter the number, then proceed. Nothing is sent.</p>`;
    stage.innerHTML = `<h2 class="page-h">Payment</h2>
      <p class="muted">Total ${money(total)}</p>
      <div class="pay-row">
        <button type="button" class="pay-btn${payment.method === "cash" ? " is-on" : ""}" data-pay="cash">Cash</button>
        <button type="button" class="pay-btn${payment.method === "ecocash" ? " is-on" : ""}" data-pay="ecocash">EcoCash</button>
      </div>
      ${extra}
      <p class="error" id="pay-error" hidden></p>
      <button type="button" class="submit" id="pay-go">Proceed</button>`;
    if (cashOn) updateChangeHint();
  }

  function updateChangeHint() {
    const hintEl = document.getElementById("change-hint");
    if (!hintEl) return;
    const have = Number(payment.cashOnHand);
    if (!payment.cashOnHand) {
      hintEl.textContent = "Enter what you will hand over so delivery can prepare change.";
      return;
    }
    const change = have - cartTotal();
    hintEl.textContent =
      change >= 0 ? `Change to prepare: ${money(change)}` : "That is less than the total.";
  }

  function placeOrder(payNote) {
    const id = "PD-" + nextOrder++;
    const created = new Date();
    const order = {
      id,
      lines: cartLines(),
      total: cartTotal(),
      fare: fare(),
      location: selectedLocation() ? selectedLocation().name : null,
      pay: payNote,
      cancelled: false,
      steps: TRACK_STEPS.map((name, index) => ({
        name,
        at: index === 0 ? created : null,
      })),
    };
    orders.unshift(order);
    cart = {};
    ensureTicker();
    view = "confirm";
    render();
    document.getElementById("new-order-no").dataset.order = id;
  }

  function renderConfirm() {
    const order = orders[0];
    stage.innerHTML = `<h2 class="page-h">Order placed</h2>
      <p class="muted">Tap the number to track this order.</p>
      <p><button type="button" class="order-number" id="new-order-no" data-order="${order.id}">${order.id}</button></p>
      <p class="muted">${order.pay}</p>`;
  }

  function renderTrack(orderId) {
    const order = orders.find((item) => item.id === orderId);
    if (!order) {
      stage.innerHTML = `<h2 class="page-h">Track</h2><p class="muted">No order.</p>`;
      return;
    }
    const idx = currentStep(order);
    const steps = order.steps
      .map((step, i) => {
        const state = order.cancelled
          ? ""
          : i < idx
            ? " is-done"
            : i === idx
              ? " is-now"
              : "";
        const done = step.at
          ? `<div class="stamp">${stamp(step.at)}</div>`
          : `<div class="stamp">waiting</div>`;
        const pic = i === idx && !order.cancelled
          ? `<img src="img/face.jpg" alt="" />`
          : "";
        return `<li class="tl${state}">
          <div class="tl-rail"><span class="tl-node">${pic}</span></div>
          <div class="tl-body"><strong>${step.name}</strong>${done}</div>
        </li>`;
      })
      .join("");
    const cancel =
      !order.cancelled && idx < TRACK_STEPS.length - 1
        ? `<button type="button" class="ghost" id="cancel-order" data-order="${order.id}">Cancel order</button>`
        : "";
    stage.innerHTML = `<h2 class="page-h">Tracking</h2>
      <p class="tag${order.cancelled ? " cancelled" : ""}">${order.cancelled ? "Cancelled" : order.id}</p>
      <ol class="timeline">${steps}</ol>
      ${cancel}`;
  }

  function renderHistory() {
    if (!orders.length) {
      stage.innerHTML = `<h2 class="page-h">My History</h2><p class="muted">No orders yet.</p>`;
      return;
    }
    const items = orders
      .map((order) => {
        const last = order.cancelled
          ? "cancelled"
          : order.steps.filter((s) => s.at).at(-1).name;
        return `<button type="button" class="history-item" data-track="${order.id}">
          <div class="tag${order.cancelled ? " cancelled" : ""}">${order.cancelled ? "Cancelled" : last}</div>
          <strong>${order.id}</strong>
          <div class="meta">${order.lines.map((l) => l.name).join(", ")}</div>
        </button>`;
      })
      .join("");
    stage.innerHTML = `<h2 class="page-h">My History</h2><p class="muted">Every order, including cancelled.</p>${items}`;
  }

  function renderAccount() {
    const loc = locations
      .map((item) => `<div class="line"><div><strong>${item.name}</strong><div class="meta">${item.detail}</div></div></div>`)
      .join("");
    stage.innerHTML = `<h2 class="page-h">My Account</h2>
      <p class="muted">${user.name}<br>${user.phone}${user.email ? "<br>" + user.email : ""}</p>
      <h3>Locations</h3>
      ${loc || `<p class="muted">None yet.</p>`}
      <label class="field"><span>Location name</span><input id="loc-name" placeholder="Home, work…" /></label>
      <label class="field"><span>Details</span><input id="loc-detail" placeholder="Street, suburb" /></label>
      <button type="button" class="submit" id="add-loc">Save location</button>`;
  }

  function renderHelp() {
    stage.innerHTML = `<h2 class="page-h">Help</h2>
      <p class="muted">This is the look-and-behaviour prototype. Track an order by tapping its number. Roles other than Client are not built on this screen yet.</p>`;
  }

  function render() {
    document.getElementById("avatar-letter").textContent = (user.name || "P").slice(0, 1).toUpperCase();
    renderRoles();
    if (view === "home" || view === "client") renderHome();
    else if (view === "cart") renderCart();
    else if (view === "pay") renderPay();
    else if (view === "confirm") renderConfirm();
    else if (view === "track") renderTrack(user.trackId);
    else if (view === "history") renderHistory();
    else if (view === "account") renderAccount();
    else if (view === "help") renderHelp();
    else if (view === "admin") renderAdmin();
    else if (view === "staff") renderStaff();
    else if (view === "clients") renderClients();
    else if (view === "mgmt") renderMgmt();
    else if (view === "mgmt-branches") renderBranches();
    else if (view === "mgmt-products") renderProductsHub();
    else if (view === "mgmt-categories") renderTermList("categories", "Categories", "category");
    else if (view === "mgmt-sizes") renderTermList("sizes", "Sizes", "size");
    else if (view === "mgmt-flavours") renderTermList("flavours", "Flavours", "flavour");
    else if (view === "mgmt-items") renderItems();
    else if (view === "mgmt-vehicles") renderVehicles();
    else if (view === "mgmt-vehicle") renderVehicle();
    else if (view === "mgmt-staff") renderMgmtStaff();
    else if (view === "mgmt-finance") renderFinanceHub();
    else if (view === "mgmt-expenses") renderMoneyList("expenses", "Expenses", expenses);
    else if (view === "mgmt-adjustments") renderMoneyList("adjustments", "Adjustments", adjustments);
    else if (view === "mgmt-reports") renderReports();
    else if (view === "mgmt-kitchen") renderKitchen();
    else if (view === "mgmt-more") renderMore();
    else if (view === "kitchen") renderKitchenRole();
    else if (view === "delivery") renderDelivery();
    renderCartDock();
    renderRunChrome();
  }

  function enterApp(nextUser) {
    user = nextUser;
    if (nextUser.roles.includes("Admin")) view = "admin";
    else if (nextUser.roles.includes("Management")) view = "mgmt";
    else if (nextUser.roles.includes("Kitchen")) view = "kitchen";
    else if (nextUser.roles.includes("Delivery")) view = "delivery";
    else view = "home";
    kitchenTab = "incoming";
    kitchenOpenId = null;
    runTab = "collect";
    runPicked = {};
    runFocusId = null;
    runMapMode = "all";
    category = "All";
    authScreen.hidden = true;
    appScreen.hidden = false;
    phoneShell.classList.add("is-app");
    closeOverlays();
    closePop();
    render();
  }

  document.querySelectorAll(".mode-btn").forEach((btn) => {
    btn.addEventListener("click", () => setMode(btn.dataset.mode));
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    errorEl.hidden = true;
    const phone = phoneEl.value.trim();
    const preferredName = nameInput.value.trim();
    const email = emailInput.value.trim();
    const secret = secretInput.value;
    if (!phone) {
      errorEl.textContent = "Phone number is required.";
      errorEl.hidden = false;
      return;
    }
    if (mode === "create" && !preferredName) {
      errorEl.textContent = "Preferred name is required.";
      errorEl.hidden = false;
      return;
    }
    if (email && !email.includes("@")) {
      errorEl.textContent = "Enter a real email, or leave it blank.";
      errorEl.hidden = false;
      return;
    }
    if (!secret) {
      errorEl.textContent = "Secret is required.";
      errorEl.hidden = false;
      return;
    }
    let person = people.find((p) => p.phone === phone);
    if (mode === "create") {
      if (!person) {
        person = {
          id: "p-" + Date.now(),
          name: preferredName,
          phone,
          email,
          roles: [],
          disabled: false,
          onDuty: false,
          cleared: false,
        };
        people.push(person);
      }
      enterApp({
        phone,
        name: preferredName,
        email,
        roles: [],
        trackId: null,
      });
      return;
    }
    if (!person) {
      person = {
        id: "p-" + Date.now(),
        name: preferredName || "Admin",
        phone,
        email,
        roles: ["Admin"],
        disabled: false,
        onDuty: false,
        cleared: false,
      };
      people.push(person);
    }
    enterApp({
      phone,
      name: person.name,
      email: person.email || email,
      roles: person.roles.slice(),
      trackId: null,
    });
  });

  document.getElementById("burger-btn").addEventListener("click", () => {
    if (drawer.hidden) openDrawer();
    else closeOverlays();
  });
  drawerBackdrop.addEventListener("click", closeOverlays);

  document.getElementById("user-btn").addEventListener("click", () => {
    drawer.hidden = true;
    drawerBackdrop.hidden = true;
    userMenu.hidden = !userMenu.hidden;
  });

  userMenu.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-user-nav]");
    if (!btn) return;
    const nav = btn.dataset.userNav;
    closeOverlays();
    if (nav === "logout") {
      user = null;
      cart = {};
      view = "home";
      appScreen.hidden = true;
      authScreen.hidden = false;
      closePop();
      phoneShell.classList.remove("is-app", "has-run", "has-run-dock");
      runNav.hidden = true;
      runDock.hidden = true;
      secretInput.value = "";
      return;
    }
    view = nav === "home" ? "home" : nav;
    render();
  });

  roleList.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-view]");
    if (!btn) return;
    closeOverlays();
    view = btn.dataset.view;
    if (view === "kitchen") {
      kitchenTab = "incoming";
      kitchenOpenId = null;
    }
    if (view === "delivery") {
      runTab = "collect";
      runPicked = {};
      runFocusId = null;
      runMapMode = "all";
    }
    render();
  });

  stage.addEventListener("click", (event) => {
    const cat = event.target.closest("[data-cat]");
    if (cat) {
      category = cat.dataset.cat;
      render();
      return;
    }
    const qty = event.target.closest("[data-qty]");
    if (qty) {
      const id = qty.dataset.qty;
      const dir = Number(qty.dataset.dir);
      cart[id] = Math.max(0, (cart[id] || 0) + dir);
      render();
      return;
    }
    const remove = event.target.closest("[data-remove]");
    if (remove) {
      cart[remove.dataset.remove] = 0;
      if (!cartCount()) view = "home";
      render();
      return;
    }
    if (event.target.id === "finalize-btn") {
      if (!cartCount()) return;
      payment = { method: "cash", cashOnHand: "", ecoNumber: "" };
      view = "pay";
      render();
      return;
    }
    const pay = event.target.closest("[data-pay]");
    if (pay) {
      payment.method = pay.dataset.pay;
      render();
      return;
    }
    if (event.target.id === "pay-go") {
      const err = document.getElementById("pay-error");
      if (payment.method === "cash") {
        const have = Number(payment.cashOnHand);
        if (!payment.cashOnHand || Number.isNaN(have)) {
          err.textContent = "Enter the amount you have.";
          err.hidden = false;
          return;
        }
        if (have < cartTotal()) {
          err.textContent = "That is less than the total.";
          err.hidden = false;
          return;
        }
        placeOrder("Cash. Change to prepare: " + money(have - cartTotal()));
        return;
      }
      if (!payment.ecoNumber.trim()) {
        err.textContent = "Enter your EcoCash number.";
        err.hidden = false;
        return;
      }
      placeOrder("EcoCash dummy · " + payment.ecoNumber.trim());
      return;
    }
    if (event.target.id === "new-order-no" || event.target.closest("[data-track]")) {
      const id = event.target.dataset.order || event.target.closest("[data-track]").dataset.track;
      user.trackId = id;
      view = "track";
      render();
      return;
    }
    if (event.target.id === "cancel-order") {
      const order = orders.find((item) => item.id === event.target.dataset.order);
      if (order) order.cancelled = true;
      render();
      return;
    }
    if (event.target.id === "add-loc") {
      const locName = document.getElementById("loc-name").value.trim();
      const detail = document.getElementById("loc-detail").value.trim();
      if (!locName) return;
      const item = { id: "loc-" + Date.now(), name: locName, detail };
      locations.push(item);
      if (!selectedLocationId) selectedLocationId = item.id;
      render();
      return;
    }
    const adminGo = event.target.closest("[data-admin]");
    if (adminGo) {
      view = adminGo.dataset.admin;
      render();
      return;
    }
    const saveRoles = event.target.closest("[data-save-roles]");
    if (saveRoles) {
      const person = people.find((p) => p.id === saveRoles.dataset.saveRoles);
      if (person) {
        person.roles = (roleDrafts[person.id] || person.roles).slice();
        syncUserRoles(person);
        if (!user.roles.length) view = "home";
      }
      render();
      return;
    }
    const disable = event.target.closest("[data-disable]");
    if (disable) {
      const person = people.find((p) => p.id === disable.dataset.disable);
      if (person) person.disabled = !person.disabled;
      render();
      return;
    }
    const recruit = event.target.closest("[data-recruit]");
    if (recruit) {
      openRecruit(recruit.dataset.recruit);
      return;
    }
    const reset = event.target.closest("[data-reset-secret]");
    if (reset) {
      openResetSecret(reset.dataset.resetSecret);
      return;
    }
    const go = event.target.closest("[data-go]");
    if (go) {
      view = go.dataset.go;
      render();
      return;
    }
    const renameBranch = event.target.closest("[data-rename-branch]");
    if (renameBranch) {
      openRenameBranch(renameBranch.dataset.renameBranch);
      return;
    }
    const toggleShop = event.target.closest("[data-toggle-shop]");
    if (toggleShop) {
      const shop = branches.find((b) => b.id === toggleShop.dataset.toggleShop);
      if (shop) shop.open = !shop.open;
      render();
      return;
    }
    const addTerm = event.target.closest("[data-add-term]");
    if (addTerm) {
      openAddTerm(addTerm.dataset.addTerm);
      return;
    }
    const toggleItem = event.target.closest("[data-toggle-item]");
    if (toggleItem) {
      const item = catalog.items.find((i) => i.id === toggleItem.dataset.toggleItem);
      if (item) item.available = !item.available;
      render();
      return;
    }
    if (event.target.id === "add-item") {
      openAddItem();
      return;
    }
    const openVeh = event.target.closest("[data-open-vehicle]");
    if (openVeh) {
      selectedVehicleId = openVeh.dataset.openVehicle;
      view = "mgmt-vehicle";
      render();
      return;
    }
    if (event.target.id === "register-vehicle") {
      openRegisterVehicle();
      return;
    }
    const fuelBtn = event.target.closest("[data-fuel]");
    if (fuelBtn) {
      const v = vehicles.find((item) => item.id === selectedVehicleId);
      if (v) v.fuel = Math.max(0, Math.min(100, v.fuel + Number(fuelBtn.dataset.fuel)));
      render();
      return;
    }
    if (event.target.id === "return-vehicle") {
      const v = vehicles.find((item) => item.id === selectedVehicleId);
      if (v) {
        v.assigneeId = null;
        v.status = "yard";
      }
      render();
      return;
    }
    const clearDuty = event.target.closest("[data-clear-duty]");
    if (clearDuty && !clearDuty.disabled) {
      const person = people.find((p) => p.id === clearDuty.dataset.clearDuty);
      if (person) person.cleared = true;
      render();
      return;
    }
    const addMoney = event.target.closest("[data-add-money]");
    if (addMoney) {
      openAddMoney(addMoney.dataset.addMoney);
      return;
    }
    if (event.target.id === "add-fare") {
      openAddFare();
      return;
    }
    const kTab = event.target.closest("[data-k-tab]");
    if (kTab) {
      kitchenTab = kTab.dataset.kTab;
      kitchenOpenId = null;
      render();
      return;
    }
    const kOpen = event.target.closest("[data-k-open]");
    if (kOpen) {
      kitchenOpenId = kOpen.dataset.kOpen;
      render();
      return;
    }
    if (event.target.closest("[data-k-back]")) {
      kitchenOpenId = null;
      render();
      return;
    }
    const acceptBake = event.target.closest("[data-accept-bake]");
    if (acceptBake) {
      const order = bakeOrders.find((o) => o.id === acceptBake.dataset.acceptBake);
      if (order && order.status === "incoming") {
        order.status = "processing";
        kitchenOpenId = null;
        kitchenTab = "bench";
      }
      render();
      return;
    }
    const rejectBake = event.target.closest("[data-reject-bake]");
    if (rejectBake) {
      openReject(rejectBake.dataset.rejectBake);
      return;
    }
    const readyBake = event.target.closest("[data-ready-bake]");
    if (readyBake) {
      const order = bakeOrders.find((o) => o.id === readyBake.dataset.readyBake);
      if (order && order.status === "processing") {
        order.status = "ready";
        kitchenOpenId = null;
        kitchenTab = "bench";
      }
      render();
      return;
    }
    const runRemove = event.target.closest("[data-run-remove]");
    if (runRemove) {
      const order = runOrders.find((o) => o.id === runRemove.dataset.runRemove);
      if (order && order.status === "loaded") order.status = "ready";
      render();
      return;
    }
    const runPin = event.target.closest("[data-run-pin]");
    if (runPin) {
      runFocusId = runPin.dataset.runPin;
      runMapMode = "all";
      runTab = "map";
      render();
      return;
    }
    if (event.target.closest("[data-run-base]")) {
      runMapMode = "base";
      runFocusId = null;
      runTab = "map";
      render();
      return;
    }
    const runOpen = event.target.closest("[data-run-open]");
    if (runOpen) openRunChoice(runOpen.dataset.runOpen);
  });

  stage.addEventListener("change", (event) => {
    if (event.target.id === "location-select") {
      selectedLocationId = event.target.value || null;
      render();
    }
    const runTick = event.target.closest("[data-run-tick]");
    if (runTick) {
      runPicked[runTick.dataset.runTick] = runTick.checked;
      render();
      return;
    }
    if (event.target.id === "veh-assignee") {
      const v = vehicles.find((item) => item.id === selectedVehicleId);
      if (v) v.assigneeId = event.target.value || null;
    }
    if (event.target.id === "veh-status") {
      const v = vehicles.find((item) => item.id === selectedVehicleId);
      if (v) v.status = event.target.value;
    }
    const tick = event.target.closest("[data-role-tick]");
    if (tick) {
      const id = tick.dataset.roleTick;
      const role = tick.value;
      const current = roleDrafts[id] || [];
      roleDrafts[id] = tick.checked
        ? TEAM_ROLES.filter((item) => current.includes(item) || item === role)
        : current.filter((item) => item !== role);
    }
  });

  stage.addEventListener("input", (event) => {
    if (event.target.id === "cash-have") {
      payment.cashOnHand = event.target.value;
      updateChangeHint();
    }
    if (event.target.id === "eco-number") payment.ecoNumber = event.target.value;
    if (event.target.id === "staff-search") {
      staffQuery = event.target.value;
      render();
      const field = document.getElementById("staff-search");
      if (field) {
        field.focus();
        field.setSelectionRange(staffQuery.length, staffQuery.length);
      }
    }
    if (event.target.id === "client-search") {
      clientQuery = event.target.value;
      render();
      const field = document.getElementById("client-search");
      if (field) {
        field.focus();
        field.setSelectionRange(clientQuery.length, clientQuery.length);
      }
    }
  });

  document.getElementById("cart-dock").addEventListener("click", () => {
    closeOverlays();
    view = "cart";
    render();
  });

  runNav.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-run-tab]");
    if (!tab) return;
    runTab = tab.dataset.runTab;
    if (runTab !== "map") {
      runMapMode = "all";
    }
    render();
  });

  runDock.addEventListener("click", () => {
    if (runDock.dataset.runAct === "load") {
      Object.keys(runPicked).forEach((id) => {
        if (!runPicked[id]) return;
        const order = runOrders.find((o) => o.id === id);
        if (order && order.status === "ready") order.status = "loaded";
      });
      runPicked = {};
      runTab = "loaded";
      render();
      return;
    }
    if (runDock.dataset.runAct === "transit") {
      runOrders.forEach((o) => {
        if (o.status === "loaded") o.status = "in transit";
      });
      runTab = "map";
      runMapMode = "all";
      runFocusId = null;
      render();
    }
  });

  pop.addEventListener("click", (event) => {
    if (event.target === pop || event.target.id === "close-pop") {
      closePop();
      return;
    }
    if (event.target.id === "confirm-reject") {
      const order = bakeOrders.find((o) => o.id === event.target.dataset.id);
      const err = document.getElementById("reject-error");
      if (!rejectDraft.reasons.length) {
        err.textContent = "Tick at least one reason.";
        err.hidden = false;
        return;
      }
      if (order && order.status === "incoming") {
        order.status = "rejected";
        order.reasons = rejectDraft.reasons.slice();
        order.notes = ((document.getElementById("reject-notes") || {}).value || "").trim();
      }
      closePop();
      kitchenOpenId = null;
      kitchenTab = "incoming";
      render();
      return;
    }
    if (event.target.id === "run-show-map") {
      runFocusId = event.target.dataset.id;
      runMapMode = "all";
      runTab = "map";
      closePop();
      render();
      return;
    }
    if (event.target.id === "run-show-delivery") {
      openRunDelivery(event.target.dataset.id);
      return;
    }
    if (event.target.id === "run-delivered" || event.target.id === "run-failed") {
      const order = runOrders.find((o) => o.id === event.target.dataset.id);
      if (order && order.status === "in transit") {
        order.status = event.target.id === "run-delivered" ? "delivered" : "failed";
      }
      closePop();
      render();
      return;
    }
    if (event.target.id === "confirm-rename") {
      const shop = branches.find((b) => b.id === event.target.dataset.id);
      const name = (document.getElementById("branch-name") || {}).value || "";
      if (shop && name.trim()) shop.name = name.trim();
      closePop();
      render();
      return;
    }
    if (event.target.id === "confirm-term") {
      const kind = event.target.dataset.kind;
      const name = ((document.getElementById("term-name") || {}).value || "").trim();
      const err = document.getElementById("term-error");
      if (!name) {
        err.textContent = "Enter a name.";
        err.hidden = false;
        return;
      }
      if (catalog[kind].includes(name)) {
        err.textContent = "Already there.";
        err.hidden = false;
        return;
      }
      catalog[kind].push(name);
      closePop();
      render();
      return;
    }
    if (event.target.id === "confirm-item") {
      const category = document.getElementById("item-cat").value;
      const size = document.getElementById("item-size").value;
      const flavour = document.getElementById("item-flavour").value;
      const price = Number(document.getElementById("item-price").value);
      const err = document.getElementById("item-error");
      if (!document.getElementById("item-price").value || Number.isNaN(price) || price < 0) {
        err.textContent = "Enter a price.";
        err.hidden = false;
        return;
      }
      const exists = catalog.items.some(
        (i) => i.category === category && i.size === size && i.flavour === flavour
      );
      if (exists) {
        err.textContent = "That combination is already an item.";
        err.hidden = false;
        return;
      }
      catalog.items.push({
        id: "i-" + Date.now(),
        category,
        size,
        flavour,
        price,
        available: true,
      });
      closePop();
      render();
      return;
    }
    if (event.target.id === "confirm-vehicle") {
      const plate = ((document.getElementById("veh-plate") || {}).value || "").trim();
      const err = document.getElementById("veh-error");
      if (!plate) {
        err.textContent = "Enter a plate.";
        err.hidden = false;
        return;
      }
      vehicles.push({ id: "v-" + Date.now(), plate, status: "yard", assigneeId: null, fuel: 100 });
      closePop();
      render();
      return;
    }
    if (event.target.id === "confirm-money") {
      const kind = event.target.dataset.kind;
      const note = ((document.getElementById("money-note") || {}).value || "").trim();
      const amount = Number((document.getElementById("money-amount") || {}).value);
      const err = document.getElementById("money-error");
      if (!note || Number.isNaN(amount)) {
        err.textContent = "Note and amount are required.";
        err.hidden = false;
        return;
      }
      const row = { id: kind[0] + Date.now(), note, amount };
      if (kind === "expenses") expenses.push(row);
      else adjustments.push(row);
      closePop();
      render();
      return;
    }
    if (event.target.id === "confirm-fare") {
      const area = ((document.getElementById("fare-area") || {}).value || "").trim();
      const amount = Number((document.getElementById("fare-amount") || {}).value);
      const err = document.getElementById("fare-error");
      if (!area || Number.isNaN(amount)) {
        err.textContent = "Area and fare are required.";
        err.hidden = false;
        return;
      }
      fares.push({ id: "f-" + Date.now(), area, amount });
      closePop();
      render();
      return;
    }
    if (event.target.id === "confirm-reset") {
      const id = event.target.dataset.id;
      const person = people.find((p) => p.id === id);
      const next = (document.getElementById("reset-secret") || {}).value || "";
      const err = document.getElementById("reset-error");
      if (!next.trim()) {
        err.textContent = "Enter a new secret.";
        err.hidden = false;
        return;
      }
      person.secret = next;
      closePop();
      return;
    }
    if (event.target.id === "confirm-recruit") {
      const id = event.target.dataset.id;
      const person = people.find((p) => p.id === id);
      const roles = roleDrafts[id] || [];
      const err = document.getElementById("recruit-error");
      if (!roles.length) {
        err.textContent = "Tick at least one role.";
        err.hidden = false;
        return;
      }
      person.roles = roles.slice();
      person.disabled = false;
      person.onDuty = true;
      person.cleared = false;
      syncUserRoles(person);
      closePop();
      view = "staff";
      render();
    }
  });

  pop.addEventListener("change", (event) => {
    const rejectTick = event.target.closest("[data-reject-tick]");
    if (rejectTick) {
      const reason = rejectTick.value;
      rejectDraft.reasons = rejectTick.checked
        ? REJECT_REASONS.filter((item) => rejectDraft.reasons.includes(item) || item === reason)
        : rejectDraft.reasons.filter((item) => item !== reason);
      return;
    }
    const tick = event.target.closest("[data-role-tick]");
    if (!tick) return;
    const id = tick.dataset.roleTick;
    const role = tick.value;
    const current = roleDrafts[id] || [];
    roleDrafts[id] = tick.checked
      ? TEAM_ROLES.filter((item) => current.includes(item) || item === role)
      : current.filter((item) => item !== role);
  });

  setMode("login");
});
