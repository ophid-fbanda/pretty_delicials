# Pretty's Delici-als — requirements

Living product spec. Status: **draft for discussion**. Decisions below are proposed until you mark them accepted.

Related:

- Brand: [`brand.md`](brand.md)
- Stack and platform choices: [`architecture.md`](architecture.md)

---

## 1. What we are building

An operations app for **Pretty's Delici-als** so the business can run the kitchen, the counter, and the books from one place: **Android, iPhone, web**, with a **Spring Boot** backend.

It is not a customer-facing food-delivery marketplace in v1. Customers do not browse and check out in the first release. Staff and the owner do.

### Why this shape

The logo is sausage rolls, wraps, pies, and samosas. The daily work is closer to a savory kitchen / takeaway than a wedding-cake bakery:

- batch production in the morning
- a hot/holding counter through the day
- walk-in and collection orders
- catering trays for offices and events
- ingredients that spoil (mince, chicken, pastry, salad)

**Decision (proposed):** call the product a *kitchen operations app* in docs. Keep "bakery" only where pastry production is the right word.

---

## 2. Who uses it

| Role | Who | What they need |
| --- | --- | --- |
| Owner | You | Today's money, what sold, what is left, who is working, what to bake tomorrow |
| Manager | Trusted staff | Same as owner minus payroll/settings, plus closing the till |
| Kitchen | Cooks / bakers | What to make, how many, recipes, when it must be ready |
| Counter | Front of house | Take orders, take payment, mark collected, see what is available *now* |

**Assumption:** one business, one location in v1. Multi-branch comes later.

**Open:** is there a separate cashier vs counter role, or is Counter enough?

---

## 3. Jobs the app must do

These are the jobs, in the order the kitchen actually feels them.

1. Know what is on the menu today, and what is sold out.
2. Take an order without leaving the counter (walk-in, collection, catering).
3. Tell the kitchen what to cook or assemble next.
4. Keep ingredient and packaging stock from silently running out.
5. See how the day is going before close.
6. Know who signed in and who can change prices.

Everything else (delivery tracking, loyalty, supplier invoices, recipes costing to the gram) is valuable, but it is not the first slice.

---

## 4. Release slices

### MVP — run a trading day

Must be true before we call v1 usable:

- Sign in with email/password. Roles: Owner, Manager, Kitchen, Counter.
- Catalog of savory products with category, price, and available / sold-out.
- Seed catalog matches the brand: sausage rolls, wraps, pies, samosas, plus a small "and more" group.
- Create, list, and progress orders: `new → in kitchen → ready → collected / cancelled`.
- Line items with quantity and notes ("no salad", "extra chilli").
- Simple inventory: ingredients and finished goods, with on-hand quantity and a low-stock flag.
- Dashboard: today's order count, takings, items to make, low stock.
- Same API for phone and web. Web is the comfortable back office. Phones are for the floor.

### Next — production and catering

- Production plan: "bake 40 sausage rolls, 20 chicken pies by 08:30".
- Recipes: product → ingredients and yield.
- Catering orders with event date, headcount, and platter composition.
- Payments recorded (cash / card / EFT), not a full card-processor integration yet.
- Shift open/close and a basic Z-report.

### Later

- Supplier orders and goods-in.
- Recipe costing and suggested price.
- Delivery routes.
- Customer accounts and repeat catering contacts.
- Customer-facing ordering (WhatsApp, web menu, or app) if you want that channel.
- Multi-location.
- Offline-first counter mode.

---

## 5. Catalog (savory first)

**Decision (proposed) starter categories:**

| Category | Examples from the mark |
| --- | --- |
| Rolls | Sausage rolls, other pastry rolls |
| Wraps | Chicken / salad wraps as on the lockup |
| Pies & bakes | Golden chicken pie / bake |
| Samosas | Meat and vegetable |
| Platters | Mixed savory trays for catering |
| Drinks & more | Soft drinks, extras — placeholder until you send the real menu |

Each product needs:

- name, category, description
- sell price
- unit (each, pack, tray)
- available today (yes/no) and optional daily limit
- photo later; v1 can ship without photos except the brand logo

**Open:** send the real menu, prices, and pack sizes when you have them. Until then the app uses a branded sample catalog so screens are not empty.

---

## 6. Orders

An order is a ticket, not a shopping cart.

| Field | Notes |
| --- | --- |
| Channel | Walk-in, collection, catering, phone |
| Customer name / phone | Optional for walk-in, required for collection and catering |
| Wanted-by time | Now, or a slot later today, or a catering date |
| Lines | Product, qty, unit price snapshot, notes |
| Status | See MVP |
| Totals | Subtotal, optional discount, total |

**Decision (proposed):** prices are snapshotted on the line when the order is placed, so a later price change does not rewrite yesterday's tickets.

**Open:** do you take deposits on catering? If yes, we add a deposit field in the next slice, not in MVP.

---

## 7. Kitchen board

Kitchen staff should not hunt through a full order list.

**Decision (proposed):** a Kitchen view that shows only `in kitchen` (and maybe `new`) lines, grouped by product: "8 sausage rolls, 3 chicken wraps". Completing a batch marks those lines ready.

**Assumption:** there is no printer integration in v1. The phone *is* the ticket.

---

## 8. Stock

Two kinds of stock, even if the UI is one list at first:

- **Ingredients** — pastry, mince, chicken, wraps, oil, boxes.
- **Finished goods** — how many sausage rolls are actually in the warmer.

MVP only needs name, unit, on-hand qty, low-stock threshold, and a manual adjust ("used 2kg mince", "baked 30 rolls").

Recipes that auto-decrement ingredients on bake belong in the *Next* slice.

**Open:** do you already track stock on paper or a spreadsheet? If you share that sheet, the first inventory list should copy it.

---

## 9. Money

MVP dashboard shows today's takings as the sum of non-cancelled orders. That is enough to know if the day is working.

We do **not** integrate PayFast / Stripe / a card machine in v1 unless you say that is blocking.

**Open:** South Africa or another country? Currency, tax (VAT), and receipt rules follow that. Default assumption: **ZAR**, prices VAT-inclusive, no tax line on the ticket until you confirm.

---

## 10. Platforms and UX

| Surface | Primary job |
| --- | --- |
| Web | Owner back office: catalog, prices, reports, catering, staff |
| Android / iPhone | Login, dashboard, new order, kitchen board, stock adjust |
| All three | Same account, same data |

**Decision (proposed):** one Flutter client for Android, iPhone, and web, talking to Spring Boot. See [`architecture.md`](architecture.md).

Phone UX is thumb-first, dark brand chrome, large "New order" action. Web can be denser tables.

The logo is the splash and login face of the app.

---

## 11. Access and safety

- Every mutating action is an authenticated user.
- Only Owner can create users and change roles.
- Manager can change prices and stock. Kitchen cannot. Counter can sell and mark collected.
- Passwords hashed. Sessions as JWT (or equivalent) over HTTPS.
- Audit later: who changed a price, who wrote off stock. Not MVP.

**Assumption:** no public registration. The owner creates staff accounts.

---

## 12. What we are explicitly not doing in v1

So the first build stays shippable:

- No customer app / public menu checkout
- No live maps or driver tracking
- No accounting package sync (Xero, Sage)
- No WhatsApp bot
- No AI menu photography
- No multi-tenant "sell this to other bakeries"

---

## 13. Acceptance for MVP

We will call MVP done when:

1. Owner can sign in on web and on a phone-sized layout.
2. A counter user can take a 3-line walk-in order and mark it collected.
3. Kitchen can see that order's items and mark them ready.
4. Dashboard numbers move when the order is collected.
5. A sausage roll can be marked sold out and then it cannot be added to a new order.
6. Sample Pretty's catalog is loaded on a fresh database.
7. Automated API tests cover login, catalog, and the order status path.

---

## 14. Open questions (need you)

Answer in any form — notes, photos of paper systems, a menu PDF, a voice dump. I will fold them into this file.

1. **Menu** — real items, prices, and what you actually sell every day vs catering-only.
2. **Location & hours** — one kitchen? stall + kitchen? hours of trade?
3. **How orders arrive today** — walk-in only, WhatsApp, Instagram, phone, corporate email?
4. **Payments** — cash, card machine, EFT, SnapScan / similar?
5. **Country / VAT** — confirm ZAR and tax handling.
6. **Staff** — how many people on a shift, and do they share a till?
7. **Must-have on day one** — anything that would make the app useless if missing (e.g. "I must print A4 catering quotes").
8. **Language** — English only, or English + another language on tickets?

---

## 15. Change log

| Date | What |
| --- | --- |
| 2026-09-15 | First draft from repo start + brand lockup. Stack preference: Spring Boot. Clients: Android, iPhone, web. |
