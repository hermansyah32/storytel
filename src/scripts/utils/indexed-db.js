import { openDB } from 'idb';

const DB_NAME = 'storytel-db';
const DB_VERSION = 2;
const STORE_NAME = 'bookmarks';

function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (oldVersion < 2) {
        if (db.objectStoreNames.contains('stories')) {
          db.deleteObjectStore('stories');
        }
      }
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
}

export async function addBookmark(story) {
  if (!story || !story.id) return null;
  const itemToSave = {
    id: story.id,
    name: story.name,
    description: story.description,
    photoUrl: story.photoUrl,
    createdAt: story.createdAt,
    lat: story.lat,
    lon: story.lon,
    bookmarkedAt: new Date().toISOString(),
  };

  const db = await getDB();
  await db.put(STORE_NAME, itemToSave);
  return itemToSave;
}

export async function deleteBookmark(id) {
  if (!id) return null;
  const db = await getDB();
  await db.delete(STORE_NAME, id);
  return id;
}

export async function getAllBookmarks() {
  const db = await getDB();
  return (await db.getAll(STORE_NAME)) || [];
}

export async function getBookmarkById(id) {
  if (!id) return null;
  const db = await getDB();
  return (await db.get(STORE_NAME, id)) || null;
}

export async function isBookmarked(id) {
  if (!id) return false;
  const item = await getBookmarkById(id);
  return !!item;
}
