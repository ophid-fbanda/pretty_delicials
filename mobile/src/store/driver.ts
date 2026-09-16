import type { Driver, SqlValue } from "./types";
import type { Database } from "sql.js";
import type * as SQLite from "expo-sqlite";

export function expoDriver(db: SQLite.SQLiteDatabase): Driver {
  return {
    exec: (sql) => db.execAsync(sql),
    run: async (sql, params = []) => {
      await db.runAsync(sql, params);
    },
    all: (sql, params = []) => db.getAllAsync(sql, params),
    get: async (sql, params = []) => {
      const row = await db.getFirstAsync(sql, params);
      return (row as never) ?? null;
    },
  };
}

export function sqlJsDriver(db: Database): Driver {
  return {
    exec: async (sql) => {
      db.exec(sql);
    },
    run: async (sql, params = []) => {
      db.run(sql, params as SqlValue[]);
    },
    all: async <T>(sql: string, params: SqlValue[] = []) => {
      const stmt = db.prepare(sql);
      try {
        if (params.length) stmt.bind(params);
        const rows: T[] = [];
        while (stmt.step()) rows.push(stmt.getAsObject() as T);
        return rows;
      } finally {
        stmt.free();
      }
    },
    get: async <T>(sql: string, params: SqlValue[] = []) => {
      const stmt = db.prepare(sql);
      try {
        if (params.length) stmt.bind(params);
        if (!stmt.step()) return null;
        return stmt.getAsObject() as T;
      } finally {
        stmt.free();
      }
    },
  };
}
