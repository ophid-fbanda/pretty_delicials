# Architecture

Recommendations below are **mine**. They are not product requirements.

## What you have stated

- Bakery management app
- Android, iPhone, web
- A proper backend
- You prefer Spring Boot, and asked what I think is best

## Backend — what I would use

**Spring Boot 4 on Java 21, with PostgreSQL.**

That is also my own pick, not only because you already lean that way.

A bakery management backend is a business system: users, rules, money-shaped numbers, stock that must not go negative by accident, history you can trust. The job of the server is to be the source of truth for three clients, not a thin wrapper around a spreadsheet or a hosted BaaS.

| Option | Verdict | Why |
| --- | --- | --- |
| **Spring Boot** | **Use this** | Strong default for a multi-client business API: transactions, security, migrations, testing, long life. Independent of whether the UI is Flutter, React, or native. |
| NestJS (Node / TypeScript) | Runner-up | Fine API framework. Worth it mainly if the *web* app is also TypeScript. Does not share a language with Flutter or with native iOS. Slightly less of a “proper backend” default than Spring for this kind of system. |
| Django / Laravel | Not first | Excellent if the product were a web admin that *is* the app. You asked for Android and iPhone as well, so the real product is an API. Their admin UIs do not replace those clients. |
| Go | Not first | Great for simple, fast APIs. You would hand-build more of the business layer that Spring already has. |
| Firebase / Supabase | No | Fast to sketch. Not a proper backend for core business rules. You will fight it once invariants matter. |

**Database:** PostgreSQL either way. I would not start on MySQL, MongoDB, or a spreadsheet.

**Not part of this choice:** screens, modules, or an API list. Those wait on real product requirements.

## Clients (not decided)

You named three platforms. The backend above does not force a UI stack. We should pick clients next, after you accept or reject this backend.

## Change log

| Date | What |
| --- | --- |
| 2026-09-15 | Backend recommendation: Spring Boot + PostgreSQL. Alternatives recorded as discussion, not as your spec. |
