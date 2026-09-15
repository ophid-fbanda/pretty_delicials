# Pretty's Delici-als — brand

This is the visual and product identity for the app. The source mark lives at [`assets/brand/logo.jpg`](../assets/brand/logo.jpg).

![Pretty's Delici-als logo](../assets/brand/logo.jpg)

## Name

| Use | Form |
| --- | --- |
| Legal / trading name | Pretty's Delici-als |
| Short name | Pretty's |
| App title | Pretty's Delici-als |
| Tagline | Savory Treats & More |
| Repo / package | `pretty_delicials` |

**Decision (proposed):** the product is a kitchen operations app for this brand, not a generic bakery SaaS. Screens, sample catalog, and copy should say *Pretty's Delici-als*, not "Bakery Manager".

## What the mark tells us

The logo is a black square with white script and a food cluster:

- sausage rolls
- a stuffed wrap
- a golden baked pie / chicken bake
- samosas

This is a **savory kitchen**, not a cake-and-cupcake bakery. Production, stock, and orders should be built around pastry, wraps, pies, and fried/baked snacks first. Sweet items can exist later under "and more".

## Visual system (from the mark)

| Token | Value | Use |
| --- | --- | --- |
| Ink | `#0A0A0A` | App chrome, login, splash |
| Paper | `#F7F4EE` | Light content surfaces |
| Cream | `#FFF8F0` | Cards on dark |
| Gold | `#E0A84A` | Primary accent (pastry / crust) |
| Ember | `#C45C1A` | Emphasis, hot-order states |
| Sage | `#3E6B4F` | Success, ready-for-pickup |
| White | `#FFFFFF` | Type on black |

Type direction:

- Wordmark *Pretty's* is a high-contrast script. In UI, use a distinctive display face only for the splash and login header.
- *DELICI-ALS* and the tagline are condensed, wide-tracked sans. Use a clean sans for the rest of the app.

**Assumption:** we will not try to recreate the script as a custom font in v1. The logo image is the brand lockup; UI type is system / open sans-serif plus the gold/black palette.

## Tone of voice

Warm, direct, kitchen-floor language.

- Prefer "today's bake", "holding", "ready for collection" over enterprise words.
- Avoid "SKU" in the UI unless the owner asks for it. Internally we can still have SKUs.
- The app should feel like the counter and the kitchen, not a warehouse ERP.
