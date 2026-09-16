import type { TeamRole } from "./types";

export const ACCOUNTS = [
  { id: "seed-admin", name: "Admin", phone: "0771111111", email: "", disabled: 0, secret: "test123" },
  { id: "seed-k", name: "Tariro", phone: "0771110001", email: "", disabled: 0, secret: "test123" },
  { id: "seed-d", name: "Blessing", phone: "0771110002", email: "", disabled: 0, secret: "test123" },
  { id: "seed-m", name: "Nyasha", phone: "0771110003", email: "", disabled: 0, secret: "test123" },
  { id: "seed-c1", name: "Chipo", phone: "0772220001", email: "", disabled: 0, secret: "test123" },
  { id: "seed-c2", name: "Farai", phone: "0772220002", email: "", disabled: 1, secret: "test123" },
];

export const ACCOUNT_ROLES: { accountId: string; role: TeamRole }[] = [
  { accountId: "seed-admin", role: "Admin" },
  { accountId: "seed-admin", role: "Management" },
  { accountId: "seed-k", role: "Kitchen" },
  { accountId: "seed-d", role: "Delivery" },
  { accountId: "seed-m", role: "Management" },
];

export const STAFF = [
  { accountId: "seed-admin", onDuty: 0, cleared: 1 },
  { accountId: "seed-k", onDuty: 1, cleared: 0 },
  { accountId: "seed-d", onDuty: 1, cleared: 0 },
  { accountId: "seed-m", onDuty: 1, cleared: 1 },
];

export const BRANCHES = [
  { id: "b1", name: "Avondale", address: "12 King George, Avondale", phone: "0771000100", lat: "-17.784", lng: "31.035", open: 1 },
  { id: "b2", name: "CBD", address: "44 Julius Nyerere, Harare", phone: "0771000101", lat: "-17.831", lng: "31.052", open: 0 },
];

export const CATEGORIES = ["Rolls", "Wraps", "Pies", "Samosas"];
export const SIZES = ["Mini", "Regular", "Family"];
export const FLAVOURS = ["Sausage", "Chicken", "Beef", "Veg"];

export const CATALOG_ITEMS = [
  { id: "i1", category: "Rolls", size: "Regular", flavour: "Sausage", price: 2.5, available: 1 },
  { id: "i2", category: "Wraps", size: "Regular", flavour: "Chicken", price: 3.5, available: 1 },
  { id: "i3", category: "Pies", size: "Regular", flavour: "Chicken", price: 4.5, available: 1 },
  { id: "i4", category: "Samosas", size: "Mini", flavour: "Beef", price: 1.5, available: 0 },
];

export const SHOP_PRODUCTS = [
  { id: "sausage-roll", name: "Sausage roll", category: "Rolls", price: 2.5 },
  { id: "mini-rolls", name: "Mini rolls", category: "Rolls", price: 4 },
  { id: "chicken-wrap", name: "Chicken wrap", category: "Wraps", price: 3.5 },
  { id: "salad-wrap", name: "Salad wrap", category: "Wraps", price: 3 },
  { id: "chicken-pie", name: "Chicken pie", category: "Pies", price: 4.5 },
  { id: "steak-pie", name: "Steak pie", category: "Pies", price: 4.5 },
  { id: "beef-samosa", name: "Beef samosa", category: "Samosas", price: 1.5 },
  { id: "veg-samosa", name: "Veg samosa", category: "Samosas", price: 1.2 },
];

export const VEHICLES = [
  { id: "v1", plate: "AET 1234", status: "out", assigneeId: "seed-d", fuel: 62 },
  { id: "v2", plate: "AEF 7781", status: "yard", assigneeId: null, fuel: 90 },
];

export const FARES = [
  { id: "f1", area: "Avondale", amount: 3 },
  { id: "f2", area: "CBD", amount: 2.5 },
  { id: "f3", area: "Borrowdale", amount: 5 },
];

export const EXPENSES = [
  { id: "e1", note: "Flour 25kg", amount: 42 },
  { id: "e2", note: "Gas refill", amount: 18 },
];

export const ADJUSTMENTS = [{ id: "a1", note: "Till short Avondale", amount: -4.5 }];

type SeedOrder = {
  id: string;
  status: string;
  mins: number;
  kitchenStaffId: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  lines: { name: string; qty: number }[];
  reasons?: string[];
  notes?: string;
};

export const ORDERS: SeedOrder[] = [
  { id: "PD-1048", status: "ready", mins: 4, kitchenStaffId: "seed-k", address: "27 St Patrick, Avondale", lat: -17.787, lng: 31.038, lines: [{ name: "Chicken pie", qty: 3 }] },
  { id: "PD-1047", status: "ready", mins: 6, kitchenStaffId: "seed-k", address: "8 Crowhill, Borrowdale", lat: -17.776, lng: 31.083, lines: [{ name: "Sausage roll", qty: 6 }, { name: "Mini rolls", qty: 1 }] },
  { id: "PD-1046", status: "ready", mins: 8, kitchenStaffId: "seed-k", address: "44 Julius Nyerere, CBD", lat: -17.831, lng: 31.052, lines: [{ name: "Beef samosa", qty: 10 }] },
  { id: "PD-1045", status: "loaded", mins: 11, kitchenStaffId: "seed-k", address: "3 East Road, Belgravia", lat: -17.805, lng: 31.045, lines: [{ name: "Chicken wrap", qty: 2 }] },
  { id: "PD-1042", status: "incoming", mins: 3, kitchenStaffId: null, address: null, lat: null, lng: null, lines: [{ name: "Sausage roll", qty: 4 }, { name: "Chicken wrap", qty: 2 }] },
  { id: "PD-1041", status: "incoming", mins: 8, kitchenStaffId: null, address: null, lat: null, lng: null, lines: [{ name: "Steak pie", qty: 2 }] },
  { id: "PD-1040", status: "processing", mins: 14, kitchenStaffId: "seed-k", address: null, lat: null, lng: null, lines: [{ name: "Mini rolls", qty: 1 }, { name: "Veg samosa", qty: 6 }] },
  { id: "PD-1039", status: "ready", mins: 22, kitchenStaffId: "seed-k", address: null, lat: null, lng: null, lines: [{ name: "Chicken pie", qty: 3 }] },
  { id: "PD-1038", status: "accepted", mins: 12, kitchenStaffId: "seed-k", address: null, lat: null, lng: null, lines: [{ name: "Sausage roll", qty: 2 }] },
  { id: "PD-1037", status: "in transit", mins: 22, kitchenStaffId: "seed-k", address: "Avondale drop", lat: -17.784, lng: 31.035, lines: [{ name: "Chicken wrap", qty: 1 }] },
  { id: "PD-1036", status: "in transit", mins: 35, kitchenStaffId: "seed-k", address: "19 Churchill, Gunhill", lat: -17.79, lng: 31.06, lines: [{ name: "Beef samosa", qty: 10 }] },
  { id: "PD-1035", status: "delivered", mins: 50, kitchenStaffId: "seed-k", address: "Home · Chisipite", lat: -17.788, lng: 31.09, lines: [{ name: "Salad wrap", qty: 1 }] },
  { id: "PD-1034", status: "rejected", mins: 6, kitchenStaffId: "seed-k", address: null, lat: null, lng: null, lines: [{ name: "Steak pie", qty: 1 }], reasons: ["Out of stock"], notes: "" },
  { id: "PD-1033", status: "processing", mins: 41, kitchenStaffId: "seed-k", address: null, lat: null, lng: null, lines: [{ name: "Mini rolls", qty: 2 }] },
  { id: "PD-1031", status: "failed", mins: 40, kitchenStaffId: "seed-k", address: "Gate 2, Highlands", lat: -17.8, lng: 31.07, lines: [{ name: "Steak pie", qty: 2 }] },
];
