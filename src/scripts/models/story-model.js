import {
  getAllStories as apiGetAllStories,
  getDetailStory as apiGetDetailStory,
  addStory as apiAddStory,
  addGuestStory as apiAddGuestStory,
} from '../data/api';
import {
  addBookmark,
  deleteBookmark,
  getAllBookmarks,
  getBookmarkById,
  isBookmarked,
} from '../utils/indexed-db';

export default class StoryModel {
  constructor({ id, name, description, photoUrl, createdAt, lat, lon }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.photoUrl = photoUrl;
    this.createdAt = createdAt;
    this.lat = lat;
    this.lon = lon;
  }

  static async getAllStories(options) {
    const response = await apiGetAllStories(options);
    if (!response.error && Array.isArray(response.listStory)) {
      return {
        ...response,
        data: response.listStory.map((item) => new StoryModel(item)),
      };
    }
    return response;
  }

  static async getDetailStory(options) {
    const response = await apiGetDetailStory(options);
    if (!response.error && response.story) {
      return {
        ...response,
        data: new StoryModel(response.story),
      };
    }
    return response;
  }

  static async addStory(storyData, token) {
    return await apiAddStory({ ...storyData, token });
  }

  static async addGuestStory(storyData) {
    return await apiAddGuestStory({ ...storyData });
  }

  // Bookmark Operations via IndexedDB
  static async bookmarkStory(story) {
    return await addBookmark(story);
  }

  static async unbookmarkStory(id) {
    return await deleteBookmark(id);
  }

  static async getBookmarkedStories() {
    const bookmarks = await getAllBookmarks();
    return bookmarks.map((item) => new StoryModel(item));
  }

  static async isStoryBookmarked(id) {
    return await isBookmarked(id);
  }
}
