import { openDB } from 'idb';

const DB_NAME = 'storytel-db';
const DB_VERSION = 1;
const STORE_NAME = 'stories';

function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('synced', 'synced', { unique: false });
      }
    },
  });
}

export async function putStory(story) {
  if (!story || !story.id) return null;
  const itemToSave = {
    ...story,
    synced: story.synced !== undefined ? story.synced : true,
  };

  const db = await getDB();
  await db.put(STORE_NAME, itemToSave);
  return itemToSave;
}

export async function putStories(stories = []) {
  if (!Array.isArray(stories) || stories.length === 0) return [];
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  for (const story of stories) {
    if (story && story.id) {
      await store.put({
        ...story,
        synced: story.synced !== undefined ? story.synced : true,
      });
    }
  }

  await tx.done;
  return stories;
}

export async function getAllStoriesFromDB() {
  const db = await getDB();
  return (await db.getAll(STORE_NAME)) || [];
}

export async function getUnsyncedStoriesFromDB() {
  const all = await getAllStoriesFromDB();
  return all.filter((item) => item.synced === false);
}

export async function getStoryFromDB(id) {
  if (!id) return null;
  const db = await getDB();
  return (await db.get(STORE_NAME, id)) || null;
}

export async function markStoryAsSynced(id) {
  const story = await getStoryFromDB(id);
  if (story) {
    story.synced = true;
    await putStory(story);
  }
}

export async function deleteStoryFromDB(id) {
  if (!id) return null;
  const db = await getDB();
  await db.delete(STORE_NAME, id);
  return id;
}

export async function clearStoriesFromDB() {
  const db = await getDB();
  await db.clear(STORE_NAME);
  return true;
}
