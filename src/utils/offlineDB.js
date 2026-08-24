import { openDB } from "idb";

const DB_NAME = "yonkopa_offline_db";
const DB_VERSION = 1;
const STORE_NAME = "kyc_drafts";

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, {
        keyPath: "id",
      });
    }
  },
});

export const makeDraftKey = (userId, draftUuid) =>
  `${userId}_${draftUuid}`;

export const saveOfflineDraft = async ({
  userId,
  draftUuid,
  formData,
  currentStep,
  draftFiles,
  clientPhotoFile,
  guarantorPhotoFile,
  collateralPhotoFile,
  ownershipDocumentFile,
  clientDocuments,
  guarantorDocuments,
}) => {
  const db = await dbPromise;

  const record = {
    id: makeDraftKey(userId, draftUuid),
    userId: String(userId),
    draftUuid: String(draftUuid),
    formData: formData || {},
    currentStep: Number(currentStep || 1),
    draftFiles: draftFiles || {},
    clientPhotoFile: clientPhotoFile || null,
    guarantorPhotoFile: guarantorPhotoFile || null,
    collateralPhotoFile: collateralPhotoFile || null,
    ownershipDocumentFile: ownershipDocumentFile || null,
    clientDocuments: clientDocuments || [],
    guarantorDocuments: guarantorDocuments || [],
    updatedAt: new Date().toISOString(),
    synced: false,
  };

  await db.put(STORE_NAME, record);

  return record;
};

export const getOfflineDraft = async (userId, draftUuid) => {
  const db = await dbPromise;

  return db.get(
    STORE_NAME,
    makeDraftKey(userId, draftUuid)
  );
};

export const deleteOfflineDraft = async (userId, draftUuid) => {
  const db = await dbPromise;

  await db.delete(
    STORE_NAME,
    makeDraftKey(userId, draftUuid)
  );
};

export const getPendingOfflineDrafts = async () => {
  const db = await dbPromise;

  const all = await db.getAll(STORE_NAME);

  return all.filter((draft) => !draft.synced);
};

export const markDraftSynced = async (userId, draftUuid) => {
  const db = await dbPromise;

  const key = makeDraftKey(userId, draftUuid);
  const draft = await db.get(STORE_NAME, key);

  if (!draft) return;

  draft.synced = true;
  draft.syncedAt = new Date().toISOString();

  await db.put(STORE_NAME, draft);
};