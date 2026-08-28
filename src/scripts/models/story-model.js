import {
  getAllStories as apiGetAllStories,
  getDetailStory as apiGetDetailStory,
  addStory as apiAddStory,
  addGuestStory as apiAddGuestStory,
} from '../data/api';
import {
  getAllStoriesFromDB,
  getStoryFromDB,
  putStory,
  putStories,
} from '../utils/indexed-db';
import logger from '../utils/logger';

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
    try {
      const response = await apiGetAllStories(options);
      if (!response.error && Array.isArray(response.listStory)) {
        // Cache API response stories to IndexedDB
        await putStories(response.listStory);

        // Fetch cached stories from IndexedDB
        const cachedStories = await getAllStoriesFromDB();
        const finalStories = cachedStories.length > 0 ? cachedStories : response.listStory;

        return {
          ...response,
          data: finalStories.map((item) => new StoryModel(item)),
        };
      }
    } catch (error) {
      logger.warning('API error/offline, fetching stories from IndexedDB:', error);
    }

    // Fallback to IndexedDB cache when offline or API request fails
    const localStories = await getAllStoriesFromDB();
    if (localStories && localStories.length > 0) {
      return {
        error: false,
        message: 'Mengambil data dari penyimpanan lokal (IndexedDB)',
        data: localStories.map((item) => new StoryModel(item)),
      };
    }

    return { error: true, message: 'Gagal memuat story dari server maupun penyimpanan lokal.' };
  }

  static async getDetailStory(options) {
    try {
      const response = await apiGetDetailStory(options);
      if (!response.error && response.story) {
        // Cache detail story to IndexedDB
        await putStory(response.story);
        return {
          ...response,
          data: new StoryModel(response.story),
        };
      }
    } catch (error) {
      logger.warning('API error/offline, fetching story detail from IndexedDB:', error);
    }

    // Fallback to IndexedDB cache
    if (options && options.id) {
      const localStory = await getStoryFromDB(options.id);
      if (localStory) {
        return {
          error: false,
          message: 'Mengambil detail story dari penyimpanan lokal (IndexedDB)',
          data: new StoryModel(localStory),
        };
      }
    }

    return { error: true, message: 'Gagal memuat detail story.' };
  }

  static async addStory(storyData, token) {
    const response = await apiAddStory({ ...storyData, token });
    return response;
  }

  static async addGuestStory(storyData) {
    const response = await apiAddGuestStory({ ...storyData });
    return response;
  }
}
