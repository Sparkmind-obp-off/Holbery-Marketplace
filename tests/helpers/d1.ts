// Minimal D1 adapter over node:sqlite for tests (no network, no Cloudflare account).
import { DatabaseSync } from 'node:sqlite'
import { readFileSync } from 'node:fs'

class Stmt {
  private args: unknown[] = []
  constructor(private db: DatabaseSync, private sql: string) {}
  bind(...args: unknown[]) {
    this.args = args
    return this
  }
  async first<T>(): Promise<T | null> {
    const row = this.db.prepare(this.sql).get(...(this.args as never[]))
    return (row as T) ?? null
  }
  async all<T>() {
    return { results: this.db.prepare(this.sql).all(...(this.args as never[])) as T[] }
  }
  async run() {
    const r = this.db.prepare(this.sql).run(...(this.args as never[]))
    return { meta: { changes: Number(r.changes), last_row_id: Number(r.lastInsertRowid) } }
  }
}

export function createTestD1() {
  const db = new DatabaseSync(':memory:')
  db.exec(readFileSync(new URL('../../migrations/0001_orders.sql', import.meta.url), 'utf8'))
  const d1 = {
    prepare: (sql: string) => new Stmt(db, sql),
    batch: async (stmts: Stmt[]) => Promise.all(stmts.map((s) => s.run())),
    exec: async (sql: string) => db.exec(sql)
  }
  return { d1: d1 as unknown as D1Database, raw: db }
}
