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

  function renderRoles() {
    const roles = user.roles;
    roleList.innerHTML = roles
      .map(
        (role) =>
            `<button type="button" class="role-btn${role === "Client" && (view === "home" || view === "client") ? " is-on" : ""}" data-role="${role}">${role}</button>`
      )
      .join("");
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
    renderCartDock();
  }

  function enterApp(nextUser) {
    user = nextUser;
    view = "home";
    category = "All";
    authScreen.hidden = true;
    appScreen.hidden = false;
    phoneShell.classList.add("is-app");
    closeOverlays();
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
    enterApp({
      phone,
      name: preferredName || "Client",
      email,
      roles: ["Client"],
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
      phoneShell.classList.remove("is-app");
      secretInput.value = "";
      return;
    }
    view = nav === "home" ? "home" : nav;
    render();
  });

  roleList.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-role]");
    if (!btn) return;
    closeOverlays();
    view = "home";
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
    }
  });

  stage.addEventListener("change", (event) => {
    if (event.target.id === "location-select") {
      selectedLocationId = event.target.value || null;
      render();
    }
  });

  stage.addEventListener("input", (event) => {
    if (event.target.id === "cash-have") {
      payment.cashOnHand = event.target.value;
      updateChangeHint();
    }
    if (event.target.id === "eco-number") payment.ecoNumber = event.target.value;
  });

  document.getElementById("cart-dock").addEventListener("click", () => {
    closeOverlays();
    view = "cart";
    render();
  });

  setMode("login");
});
