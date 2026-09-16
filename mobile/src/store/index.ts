import * as SQLite from "expo-sqlite";
import { expoDriver } from "./driver";
import { createStore } from "./store";

export async function openAppStore() {
  const db = await SQLite.openDatabaseAsync("pretty_delicials.db");
  return createStore(expoDriver(db));
}

export { Store, createStore } from "./store";
export * from "./types";
