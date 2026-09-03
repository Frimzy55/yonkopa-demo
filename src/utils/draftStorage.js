import { openDB } from "idb";

const DB_NAME = "yonkopa_offline_db";
const DB_VERSION = 4;
const DRAFT_STORE = "drafts";

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("offline_auth")) {
      db.createObjectStore("offline_auth", {
        keyPath: "identifier",
      });
    }

    if (!db.objectStoreNames.contains(DRAFT_STORE)) {
      db.createObjectStore(DRAFT_STORE, {
        keyPath: "draftUuid",
      });
    }
  },
});

function normalizeDraftUuid(value) {
  if (typeof value === "string") {
    const uuid = value.trim();
    return uuid || null;
  }

  return null;
}

export async function saveDraftToIndexedDB(draftUuidOrData, data = {}) {
  let draftUuid;
  let draftData;

  // Supports:
  // saveDraftToIndexedDB("uuid", {...})
  // AND
  // saveDraftToIndexedDB({ draftUuid: "uuid", ... })
  if (
    draftUuidOrData &&
    typeof draftUuidOrData === "object" &&
    !Array.isArray(draftUuidOrData)
  ) {
    draftUuid = normalizeDraftUuid(
      draftUuidOrData.draftUuid ||
        draftUuidOrData.draft_uuid
    );

    draftData = { ...draftUuidOrData };
    delete draftData.draftUuid;
    delete draftData.draft_uuid;
  } else {
    draftUuid = normalizeDraftUuid(draftUuidOrData);
    draftData = data && typeof data === "object" ? { ...data } : {};
  }

  if (!draftUuid) {
    throw new Error("A valid draftUuid is required.");
  }

  const db = await dbPromise;

  const record = {
    ...draftData,
    draftUuid,
    updatedAt: Date.now(),
  };

  // Make sure IndexedDB never receives an invalid key
  if (
    typeof record.draftUuid !== "string" ||
    !record.draftUuid.trim()
  ) {
    throw new Error("Invalid draftUuid supplied to IndexedDB.");
  }

  await db.put(DRAFT_STORE, record);

  return record;
}

export async function loadDraftFromIndexedDB(draftUuid) {
  const uuid = normalizeDraftUuid(draftUuid);

  if (!uuid) {
    return null;
  }

  const db = await dbPromise;

  return await db.get(DRAFT_STORE, uuid);
}

export async function deleteDraftFromIndexedDB(draftUuid) {
  const uuid = normalizeDraftUuid(draftUuid);

  if (!uuid) {
    return;
  }

  const db = await dbPromise;

  await db.delete(DRAFT_STORE, uuid);
}

export async function getAllDraftsFromIndexedDB() {
  const db = await dbPromise;

  return await db.getAll(DRAFT_STORE);
}