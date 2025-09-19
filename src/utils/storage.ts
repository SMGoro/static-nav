/**
 * 统一的本地存储工具类
 * 提供类型安全的localStorage操作
 */

export class StorageManager {
  /**
   * 获取存储的数据
   */
  static get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue ?? null;
      }
      return JSON.parse(item);
    } catch (error) {
      console.error(`获取存储数据失败 (${key}):`, error);
      return defaultValue ?? null;
    }
  }

  /**
   * 保存数据到存储
   */
  static set<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`保存存储数据失败 (${key}):`, error);
      return false;
    }
  }

  /**
   * 删除存储的数据
   */
  static remove(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`删除存储数据失败 (${key}):`, error);
      return false;
    }
  }

  /**
   * 检查是否存在某个key
   */
  static has(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }

  /**
   * 清空所有存储数据
   */
  static clear(): boolean {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('清空存储数据失败:', error);
      return false;
    }
  }

  /**
   * 获取所有存储的key
   */
  static getAllKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        keys.push(key);
      }
    }
    return keys;
  }

  /**
   * 获取存储大小（字节）
   */
  static getStorageSize(): number {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total;
  }
}

/**
 * 存储键常量
 */
export const STORAGE_KEYS = {
  // AI相关
  AI_CONFIG: 'ai_config',
  AI_CHAT_HISTORY: 'ai_chat_history',
  
  // 数据管理
  APP_DATA: 'static_nav_data',
  BACKUP_DATA: 'static_nav_backup',
  
  // 用户设置
  THEME: 'theme',
  USER_PREFERENCES: 'user_preferences',
  
  // 表单数据
  WEBSITE_FORM_DRAFT: 'website_form_draft',
  
  // 分享相关
  SHARE_DATA: 'share_data',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

