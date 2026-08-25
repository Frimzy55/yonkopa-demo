import { openDB } from "idb";

const DB_NAME = "yonkopa_offline_db";
const DB_VERSION = 2;
const STORE_NAME = "offline_auth";

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, {
        keyPath: "id",
      });
    }
  },
});

export async function saveOfflineAuth(user) {
  if (!user || !user.userId) {
    throw new Error(
      "Invalid user information for offline authentication."
    );
  }

  const record = {
    id: "current_officer",
    userId: user.userId,
    full_name: user.full_name || "",
    email: user.email || "",
    phone: user.phone || "",
    role: user.role || "loan_officer",
    username:
      user.username ||
      user.user_name ||
      user.email ||
      "",
    authenticatedAt: Date.now(),
    expiresAt:
      Date.now() +
      7 * 24 * 60 * 60 * 1000,
  };

  const db = await dbPromise;

  await db.put(STORE_NAME, record);

  return record;
}

export async function getOfflineAuth() {
  const db = await dbPromise;

  const record = await db.get(
    STORE_NAME,
    "current_officer"
  );

  if (!record) {
    return null;
  }

  if (
    record.expiresAt &&
    Date.now() > record.expiresAt
  ) {
    await db.delete(
      STORE_NAME,
      "current_officer"
    );

    return null;
  }

  return record;
}

export async function clearOfflineAuth() {
  const db = await dbPromise;

  await db.delete(
    STORE_NAME,
    "current_officer"
  );
}

export async function isOfflineAuthAvailable() {
  const record = await getOfflineAuth();

  return Boolean(record);
}