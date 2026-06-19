import db from '../db';

export type RunResult = {
  lastID: number;
  changes: number;
};

export function dbAll<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows: T[]) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

export function dbGet<T>(sql: string, params: unknown[] = []): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row: T | undefined) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export function dbRun(sql: string, params: unknown[] = []): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function runCallback(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}
