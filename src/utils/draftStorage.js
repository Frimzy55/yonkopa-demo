import { openDB } from "idb";

const DB_NAME = "yonkopa_offline_db";
const DB_VERSION = 3;

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

export async function saveDraftToIndexedDB(
  draftUuid,
  data
) {
  if (!draftUuid) {
    throw new Error(
      "draftUuid is required."
    );
  }

  const db = await dbPromise;

  const record = {
    draftUuid,
    ...data,
    updatedAt: Date.now(),
  };

  await db.put(
    DRAFT_STORE,
    record
  );
}

export async function loadDraftFromIndexedDB(
  draftUuid
) {
  if (!draftUuid) {
    return null;
  }

  const db = await dbPromise;

  return await db.get(
    DRAFT_STORE,
    draftUuid
  );
}

export async function deleteDraftFromIndexedDB(
  draftUuid
) {
  if (!draftUuid) {
    return;
  }

  const db = await dbPromise;

  await db.delete(
    DRAFT_STORE,
    draftUuid
  );
}

export async function getAllDraftsFromIndexedDB() {
  const db = await dbPromise;

  return await db.getAll(
    DRAFT_STORE
  );
}