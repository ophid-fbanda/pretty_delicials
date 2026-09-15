# Architecture

This is a **recommendation**, not a requirement you wrote.

## What you stated

- Proper backend
- You prefer **Spring Boot**
- Clients: Android, iPhone, web

## Recommendation (mine, not yours)

| Layer | Suggestion | Why I would choose it |
| --- | --- | --- |
| API | Spring Boot (current 4.x), Java 21 | Matches your preference; fits a real business backend. |
| Database | PostgreSQL | Usual pair with Spring Boot for this kind of app. |
| Clients | One Flutter app for Android, iOS, and web | One UI codebase for the three platforms you named. |

Other options if you want to discuss them:

- Spring Boot + React (web) + Flutter or React Native (phones)
- Spring Boot + native Kotlin / Swift (two phone apps) + a web app

No modules, screens, or API list until there are real product requirements.

## Not decided by you

- Flutter vs separate web and native apps
- PostgreSQL vs something else
- Auth model
- Hosting
