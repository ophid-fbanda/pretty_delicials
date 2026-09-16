export type ThemeName = "client" | "admin" | "mgmt" | "kitchen" | "delivery";

export type Theme = {
  name: ThemeName;
  title: string;
  bg: string;
  glow: string;
  card: string;
  ink: string;
  muted: string;
  hair: string;
  barBg: string;
  barInk: string;
  accent: string;
  go: string;
  stop: string;
  chip: string;
  shadow: string;
};

export const loginTheme = {
  ink: "#070707",
  panel: "#121212",
  line: "rgba(255, 248, 240, 0.12)",
  paper: "#fff8f0",
  muted: "#c9bba8",
  gold: "#e0a84a",
  goldDeep: "#c4892e",
  ember: "#c45c1a",
  danger: "#ff8a70",
};

export const themes: Record<ThemeName, Theme> = {
  client: {
    name: "client",
    title: "Pretty's",
    bg: "#f3d9b6",
    glow: "rgba(196, 92, 26, 0.28)",
    card: "#fff8ee",
    ink: "#2a160c",
    muted: "#8a5230",
    hair: "#e4c8a8",
    barBg: "#b44514",
    barInk: "#fff6e8",
    accent: "#d4a03a",
    go: "#4d6b32",
    stop: "#b44514",
    chip: "#f3d08a",
    shadow: "rgba(72, 28, 8, 0.12)",
  },
  admin: {
    name: "admin",
    title: "Office",
    bg: "#e4d6c2",
    glow: "rgba(80, 52, 24, 0.18)",
    card: "#f7f0e4",
    ink: "#1c1410",
    muted: "#6e5340",
    hair: "#d4c3aa",
    barBg: "#2a1d14",
    barInk: "#f3e6d2",
    accent: "#b8893a",
    go: "#3f5a38",
    stop: "#8a3d22",
    chip: "#e4d0a8",
    shadow: "rgba(42, 29, 20, 0.12)",
  },
  mgmt: {
    name: "mgmt",
    title: "House",
    bg: "#ead9a8",
    glow: "rgba(160, 110, 20, 0.22)",
    card: "#fff8e6",
    ink: "#2a1808",
    muted: "#7a5a20",
    hair: "#e0cc8c",
    barBg: "#8a5310",
    barInk: "#fff6e0",
    accent: "#c4892e",
    go: "#4d6b32",
    stop: "#a34a14",
    chip: "#f3d08a",
    shadow: "rgba(122, 50, 20, 0.12)",
  },
  kitchen: {
    name: "kitchen",
    title: "Kitchen",
    bg: "#f4e4cc",
    glow: "rgba(160, 50, 16, 0.16)",
    card: "#fff9f2",
    ink: "#2c140c",
    muted: "#865038",
    hair: "#e8cbb0",
    barBg: "#7a2e12",
    barInk: "#fff4e6",
    accent: "#c45c1a",
    go: "#4a6430",
    stop: "#a33a14",
    chip: "#f0d4a0",
    shadow: "rgba(122, 50, 20, 0.12)",
  },
  delivery: {
    name: "delivery",
    title: "Run",
    bg: "#d9cbb0",
    glow: "rgba(36, 22, 12, 0.18)",
    card: "#f4ead8",
    ink: "#1a120c",
    muted: "#6a4a32",
    hair: "#cbb898",
    barBg: "#1a120c",
    barInk: "#f3e2c8",
    accent: "#c4892e",
    go: "#3d5c38",
    stop: "#8a2e14",
    chip: "#e2c48a",
    shadow: "rgba(26, 18, 12, 0.16)",
  },
};

const ADMIN_VIEWS = new Set(["admin", "staff", "clients"]);
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

export function themeForView(view: string): Theme {
  if (ADMIN_VIEWS.has(view)) return themes.admin;
  if (MGMT_VIEWS.has(view)) return themes.mgmt;
  if (view === "kitchen") return themes.kitchen;
  if (view === "delivery") return themes.delivery;
  return themes.client;
}

export function isAdminView(view: string) {
  return ADMIN_VIEWS.has(view);
}
export function isMgmtView(view: string) {
  return MGMT_VIEWS.has(view);
}
export function isKitchenView(view: string) {
  return view === "kitchen";
}
export function isDeliveryView(view: string) {
  return view === "delivery";
}

export function money(n: number) {
  return Number(n).toFixed(2);
}

export const serif = "Fraunces_600SemiBold";
export const sans = "Karla_400Regular";
export const sansSemi = "Karla_600SemiBold";
export const sansBold = "Karla_700Bold";
