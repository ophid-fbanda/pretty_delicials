# Architecture

Stack choices only. Not a product spec.

## What you have stated

- Bakery management app
- Android, iPhone, web
- A proper backend
- You prefer Spring Boot; you then agreed **Spring Boot + PostgreSQL**
- Next: discuss the web frontend

## Backend — agreed

**Spring Boot 4 on Java 21, PostgreSQL.**

The API is the source of truth. Android, iPhone, and web all call it. Comparison of rejected backends stays in the change log below; we are not reopening that unless you want to.

## Web frontend — not agreed

You asked why React and not Vue. They are **peers** for this app. Vue is not a weaker product fit.

Both would be a TypeScript Vite SPA that calls the Spring Boot API. Spring Boot stays the only server. Neither needs Next.js or Nuxt in front.

| Option | Verdict | Why |
| --- | --- | --- |
| Vue 3 + TypeScript (Vite) | Equal to React for this app | Templates and single-file components are often faster to write. Vue 3 + Pinia + TypeScript is solid. Admin UI kits exist (Element Plus, Naive UI, PrimeVue). |
| React + TypeScript (Vite) | Equal to Vue for this app | Larger hiring pool and more off-the-shelf table/form libraries. That is why it is a common default — not because Vue cannot do the job. |
| Next.js / Nuxt | Not first | Extra Node server in front of Spring. Useful for a public marketing site. Not needed for a signed-in management app. |
| Angular | Not first | Common next to Spring. Heavier than this needs. |
| Flutter web | Only if one UI for all platforms | Reason to pick it is sharing with Android/iPhone, not because it beats Vue or React in the browser. |
| Thymeleaf / server-rendered Spring | No | You still need an API for phones. Do not build the web UI twice. |

**Why I named React first:** ecosystem size and habit, not a technical gap. For a bakery management UI talking to Spring, Vue 3 does the same work. If you prefer Vue, we should use Vue.

**TypeScript either way.** Plain JavaScript is a poor trade.

UI kit waits until Vue vs React is locked. No screens until you state product requirements.

### Effect on Android and iPhone

Vue or React on the web both mean the phones are a **separate** UI codebase. The React-vs-Vue choice does not change that.

If you would rather have **one** UI for web + Android + iPhone, that is Flutter for all three, and web would not be Vue or React.

## Change log

| Date | What |
| --- | --- |
| 2026-09-15 | Backend recommendation: Spring Boot + PostgreSQL. |
| 2026-09-15 | You agreed the backend. Web recommendation: React + TypeScript (Vite SPA). |
| 2026-09-15 | You asked why React not Vue. Recorded as peers; React was a default, not a better fit. |
