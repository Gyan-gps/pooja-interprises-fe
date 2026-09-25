import { readStorage, writeStorage } from "../storage";

/**
 * Generic localStorage-backed CRUD repository, seeded once from static data.
 *
 * Every method returns a Promise even though the implementation is
 * synchronous — that's deliberate. It means the day this app gets a real
 * backend, each repository file becomes a `fetch()` call and nothing that
 * calls it (AppDataProvider, or any component) has to change.
 */
export function createRepository<T extends { id: ID }, ID = T["id"]>(
  storageKey: string,
  seed: T[]
) {
  function readAll(): T[] {
    return readStorage<T[]>(storageKey, seed);
  }

  function writeAll(items: T[]): void {
    writeStorage(storageKey, items);
  }

  return {
    async list(): Promise<T[]> {
      return readAll();
    },

    async get(id: ID): Promise<T | undefined> {
      return readAll().find(item => item.id === id);
    },

    async create(item: T): Promise<T> {
      const items = readAll();
      writeAll([item, ...items]);
      return item;
    },

    async update(id: ID, patch: Partial<T>): Promise<T> {
      const items = readAll();
      let updated: T | undefined;
      const next = items.map(item => {
        if (item.id !== id) return item;
        updated = { ...item, ...patch };
        return updated;
      });
      if (!updated) throw new Error(`No record with id "${String(id)}" in ${storageKey}`);
      writeAll(next);
      return updated;
    },

    async remove(id: ID): Promise<void> {
      writeAll(readAll().filter(item => item.id !== id));
    },
  };
}
