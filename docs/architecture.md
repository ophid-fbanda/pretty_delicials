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

## Web frontend — recommendation (not yet agreed)

**React + TypeScript, as a Vite SPA, talking to the Spring Boot API.**

That is the best *web* frontend for a bakery management app: logged-in screens, tables, forms, filters. The browser loads the app and calls `/api`. Spring Boot stays the only server.

| Option | Verdict | Why |
| --- | --- | --- |
| **React + TypeScript (Vite SPA)** | **Use this for web** | Strongest fit for a management UI. Huge ecosystem for tables, forms, and data fetching. No second backend. |
| Next.js | Not first | Adds a Node server in front of Spring. Useful for a public marketing site or SEO. Not needed for a signed-in management app. |
| Angular | Runner-up | Common next to Spring. Heavier than this app needs. |
| Vue | Fine, not first | Same idea as React, smaller ecosystem for this kind of UI. |
| Flutter web | Only if one UI for all platforms | Good enough in a browser. Weaker than React for dense admin UI. The reason to pick it is sharing with Android/iPhone, not because it is the best web. |
| Thymeleaf / server-rendered Spring | No | You still need an API for phones. Do not build the web UI twice (HTML on the server and JSON clients). |

**TypeScript is part of the recommendation.** Plain JavaScript for a long-lived management app is a poor trade.

UI kit (for example Tailwind + shadcn, or MUI) can wait until the web choice is locked. No screens or pages until you state product requirements.

### Effect on Android and iPhone

Choosing React for web means the phones will be a **separate** UI codebase (Flutter, React Native, or native). That is the cost of using the best web stack.

If you would rather have **one** UI for web + Android + iPhone, say so before we lock React. In that case Flutter for all three is the honest alternative, and web would not be React.

## Change log

| Date | What |
| --- | --- |
| 2026-09-15 | Backend recommendation: Spring Boot + PostgreSQL. |
| 2026-09-15 | You agreed the backend. Web recommendation: React + TypeScript (Vite SPA). |
