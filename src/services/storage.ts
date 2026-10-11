import { Monitor } from '../types';

const STORAGE_KEY = 'pengo_monitors_v3';

export const INITIAL_MONITORS: Monitor[] = [];

export class StorageService {
  static getMonitors(): Monitor[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return [];
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static saveMonitors(monitors: Monitor[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(monitors));
    } catch (e) {
      console.warn('Failed to save monitors', e);
    }
  }

  static clearAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear monitors', e);
    }
  }
}
