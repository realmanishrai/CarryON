export const StorageUtil = {
  async get<T>(key: string, defaultValue?: T): Promise<T | undefined> {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        const res = await chrome.storage.local.get([key]);
        return res[key] !== undefined ? res[key] : defaultValue;
      }
      if (typeof localStorage !== 'undefined') {
        const val = localStorage.getItem(key);
        return val ? JSON.parse(val) : defaultValue;
      }
    } catch (e) {
      console.warn(`StorageUtil get error for ${key}:`, e);
    }
    return defaultValue;
  },

  async set<T>(key: string, value: T): Promise<void> {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({ [key]: value });
        return;
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (e) {
      console.warn(`StorageUtil set error for ${key}:`, e);
    }
  },

  async remove(key: string): Promise<void> {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.remove([key]);
        return;
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn(`StorageUtil remove error for ${key}:`, e);
    }
  }
};
