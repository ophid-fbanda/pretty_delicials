export const TEAM_ROLES = ["Admin", "Management", "Kitchen", "Delivery"] as const;
export type TeamRole = (typeof TEAM_ROLES)[number];

export const TRACK_STEPS = [
  "created",
  "accepted",
  "sent to kitchen",
  "processing",
  "ready",
  "loaded",
  "in transit",
  "delivered",
] as const;
export type TrackStepName = (typeof TRACK_STEPS)[number];

export const REJECT_REASONS = ["Out of stock", "Too busy", "Can't make this", "Other"] as const;

export const SHOP_CATEGORIES = ["All", "Rolls", "Wraps", "Pies", "Samosas"] as const;

export const DELIVERY_FARE = 3;

export const BASE = {
  name: "Avondale",
  address: "12 King George, Avondale",
  lat: -17.784,
  lng: 31.035,
};

export type Account = {
  id: string;
  name: string;
  phone: string;
  email: string;
  disabled: boolean;
};

export type StaffMember = Account & {
  roles: TeamRole[];
  onDuty: boolean;
  cleared: boolean;
};

export type ClientAccount = Account;

export type Session = {
  id: string;
  phone: string;
  name: string;
  email: string;
  roles: TeamRole[];
  trackId: string | null;
};

export type Branch = {
  id: string;
  name: string;
  address: string;
  phone: string;
  lat: string;
  lng: string;
  open: boolean;
};

export type CatalogTerm = {
  id: number;
  name: string;
};

export type CatalogItem = {
  id: string;
  categoryId: number;
  sizeId: number;
  flavourId: number;
  category: string;
  size: string;
  flavour: string;
  price: number;
  available: boolean;
};

export type Catalog = {
  categories: CatalogTerm[];
  sizes: CatalogTerm[];
  flavours: CatalogTerm[];
  items: CatalogItem[];
};

export type ShopProduct = {
  id: string;
  name: string;
  categoryId: number;
  category: string;
  price: number;
};

export type Vehicle = {
  id: string;
  plate: string;
  status: string;
  assigneeId: string | null;
  fuel: number;
};

export type Fare = { id: string; area: string; amount: number };
export type MoneyRow = { id: string; note: string; amount: number };

export type SavedLocation = { id: string; accountId: string; name: string; detail: string };

export type OrderLine = { name: string; qty: number; productId?: string; price?: number };

export type OrderStep = { name: string; at: number | null; seq: number };

export type Order = {
  id: string;
  accountId: string | null;
  status: string;
  mins: number;
  kitchenStaffId: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  total: number | null;
  fare: number | null;
  pay: string | null;
  cancelled: boolean;
  reasons: string[];
  notes: string;
  createdAt: number;
  lines: OrderLine[];
  steps: OrderStep[];
};

export type Reports = {
  todayOrders: number;
  expenses: number;
  adjustments: number;
};

export type SqlValue = string | number | null;

export type Driver = {
  exec(sql: string): Promise<void>;
  run(sql: string, params?: SqlValue[]): Promise<void>;
  all<T>(sql: string, params?: SqlValue[]): Promise<T[]>;
  get<T>(sql: string, params?: SqlValue[]): Promise<T | null>;
};
