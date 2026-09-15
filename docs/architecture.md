# Architecture

Status: **proposed**. Product requirements live in [`requirements.md`](requirements.md).

## Recommendation

| Layer | Choice | Why |
| --- | --- | --- |
| API | **Spring Boot 4**, Java 21 | Your preference, and the right one here: orders, stock, roles, and reports are transactional business data. Spring Boot gives us a proper service, not a spreadsheet with a UI. |
| Database | **PostgreSQL** | Default for this kind of app. Local/dev can use an embedded database for tests. |
| Clients | **One Flutter app** (Android, iOS, web) | Three platforms without three UIs. The kitchen phone, the owner's iPhone, and the back-office browser share screens and the same API. |
| Auth | Email + password, JWT, role-based access | Fits a staff app. No customer login in v1. |

## Why not the other common splits

- **Spring Boot + separate React web + React Native** — two client codebases. Fine if the web app becomes a heavy POS later. Too much for v1.
- **Kotlin Multiplatform** — excellent on phones, weaker/less standard for web UI.
- **Firebase / Supabase as the backend** — faster to sketch, poorer fit once you want production plans, costing, and audit. You asked for a proper backend.

If you later want a denser desktop-style till, we can add a web-only module. We should not start there.

## Shape of the system

```
┌──────────────── Flutter (Android / iPhone / Web) ────────────────┐
│  Login  Dashboard  Orders  Kitchen  Catalog  Stock  Staff       │
└────────────────────────────┬─────────────────────────────────────┘
                             │ HTTPS JSON  /api/v1
┌────────────────────────────▼─────────────────────────────────────┐
│  Spring Boot                                                     │
│  Auth  Catalog  Orders  Kitchen  Inventory  Reports              │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                       PostgreSQL
```

## API sketch (MVP)

All under `/api/v1`, JSON, authenticated except health and login.

| Area | Endpoints (indicative) |
| --- | --- |
| Auth | `POST /auth/login` `GET /auth/me` |
| Catalog | `GET/POST /products` `PATCH /products/{id}` |
| Orders | `GET/POST /orders` `POST /orders/{id}/status` |
| Kitchen | `GET /kitchen/queue` |
| Stock | `GET /stock` `POST /stock/{id}/adjustments` |
| Dashboard | `GET /dashboard/today` |
| Staff | `GET/POST /staff` (Owner) |

## Brand in the clients

Splash and login use [`assets/brand/logo.jpg`](../assets/brand/logo.jpg). Palette is in [`brand.md`](brand.md).

## What we will not invent yet

- Kubernetes, Kafka, Redis, microservices
- Native Swift/Kotlin apps beside Flutter
- A second "customer" app

Those can be argued in when a requirement appears. They are not required to run Pretty's day.
