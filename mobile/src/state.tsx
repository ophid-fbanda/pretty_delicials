import { createContext, useContext } from "react";
import type { Store, Session } from "./store";

export type AppCtxValue = {
  store: Store;
  session: Session;
  setSession: (session: Session | null) => void;
  view: string;
  setView: (view: string) => void;
  tick: number;
};

export const AppCtx = createContext<AppCtxValue | null>(null);

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp outside shell");
  return ctx;
}
