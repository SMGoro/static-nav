import { useState, useEffect, useCallback } from 'react';
import { StorageManager } from '../utils/storage';

/**
 * 自定义Hook：使用localStorage进行状态管理
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // 获取初始值
  const [storedValue, setStoredValue] = useState<T>(() => {
    const item = StorageManager.get<T>(key);
    return item !== null ? item : initialValue;
  });

  // 设置值的函数
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      // 允许传入函数来更新值
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      StorageManager.set(key, valueToStore);
    } catch (error) {
      console.error(`设置localStorage值失败 (${key}):`, error);
    }
  }, [key, storedValue]);

  // 删除值的函数
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      StorageManager.remove(key);
    } catch (error) {
      console.error(`删除localStorage值失败 (${key}):`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * 自定义Hook：监听localStorage变化
 */
export function useStorageListener(key: string, callback: (newValue: any) => void) {
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = JSON.parse(e.newValue);
          callback(newValue);
        } catch (error) {
          console.error(`解析localStorage变化失败 (${key}):`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, callback]);
}

/**
 * 自定义Hook：批量管理localStorage
 */
export function useBatchStorage() {
  const [isLoading, setIsLoading] = useState(false);

  const batchSet = useCallback(async (items: Record<string, any>) => {
    setIsLoading(true);
    try {
      for (const [key, value] of Object.entries(items)) {
        StorageManager.set(key, value);
      }
      return true;
    } catch (error) {
      console.error('批量设置localStorage失败:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const batchGet = useCallback((keys: string[]) => {
    const result: Record<string, any> = {};
    for (const key of keys) {
      result[key] = StorageManager.get(key);
    }
    return result;
  }, []);

  const batchRemove = useCallback((keys: string[]) => {
    try {
      for (const key of keys) {
        StorageManager.remove(key);
      }
      return true;
    } catch (error) {
      console.error('批量删除localStorage失败:', error);
      return false;
    }
  }, []);

  return {
    isLoading,
    batchSet,
    batchGet,
    batchRemove,
  };
}
