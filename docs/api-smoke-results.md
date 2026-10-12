# RÃ©sultats du smoke test API

ExÃ©cution : 2026-10-12 10:28:39 +01:00

Ce test utilise le compte administrateur de formation. Les Ã©critures emploient uniquement des charges invalides ou lâ€™identifiant `0`; aucune donnÃ©e persistante nâ€™est crÃ©Ã©e ou modifiÃ©e.

| MÃ©thode | Route | Attendu | HTTP | CORS | RÃ©sultat |
|---|---|---:|---:|---|---|
| POST | `/Auth/login` | 2xx | 200 | `*` | OK |
| GET | `/Clients` | 2xx | 200 | `*` | OK |
| GET | `/Comptes` | 2xx | 200 | `*` | OK |
| GET | `/Guichets` | 2xx | 200 | `*` | OK |
| GET | `/TypesComptes` | 2xx | 200 | `*` | OK |
| GET | `/Health` | 2xx | 200 | `*` | OK |
| GET | `/Clients/search?term=__ibank_smoke_no_match__` | 2xx | 200 | `*` | OK |
| GET | `/Clients/1` | 2xx | 200 | `*` | OK |
| GET | `/Comptes/0` | 4xx | 404 | `*` | OK |
| GET | `/Guichets/0` | 4xx | 404 | `*` | OK |
| GET | `/TypesComptes/0` | 4xx | 404 | `*` | OK |
| GET | `/Transactions/compte/0` | 2xx | 200 | `*` | OK |
| POST | `/Auth/agent` | 4xx | 400 | `*` | OK |
| POST | `/Clients` | 4xx | 400 | `*` | OK |
| PUT | `/Clients/0` | 4xx | 400 | `*` | OK |
| DELETE | `/Clients/0` | 4xx | 404 | `*` | OK |
| POST | `/Comptes` | 4xx | 400 | `*` | OK |
| PUT | `/Comptes/0` | 4xx | 404 | `*` | OK |
| POST | `/Guichets` | 4xx | 400 | `*` | OK |
| PUT | `/Guichets/0` | 4xx | 400 | `*` | OK |
| DELETE | `/Guichets/0` | 4xx | 404 | `*` | OK |
| POST | `/TypesComptes` | 4xx | 400 | `*` | OK |
| PUT | `/TypesComptes/0` | 4xx | 400 | `*` | OK |
| DELETE | `/TypesComptes/0` | 4xx | 404 | `*` | OK |
| POST | `/Transactions/depot` | 4xx | 400 | `*` | OK |
| POST | `/Transactions/retrait` | 4xx | 400 | `*` | OK |
| POST | `/Transactions/virement` | 4xx | 400 | `*` | OK |
