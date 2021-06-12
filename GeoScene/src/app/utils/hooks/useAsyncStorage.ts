import AsyncStorage from '@react-native-community/async-storage';
import { name as appName } from '../../../../app.json';
import { useState } from 'react';

interface useAsyncStoragePayload<T> {
  getStorage: () => Promise<T | null>;
  updateStorage: (data: T) => Promise<T | null>;
  clearStorage: () => void;
}

export const useAsyncStorage = <T>(key: string): useAsyncStoragePayload<T> => {
  let storage: string | null;

  const getStorage = async () => {
    if (!storage) {
      const data = await AsyncStorage.getItem(`${appName}::${key}`);
      storage = data;
    }
    return storage === null ? null : (JSON.parse(storage) as T);
  };

  const updateStorage = (data: T) => {
    const json = JSON.stringify(data);
    AsyncStorage.setItem(`${appName}::${key}`, json);
    storage = json;
    return getStorage();
  };

  const clearStorage = () => {
    AsyncStorage.removeItem(`${appName}::${key}`);
    storage = null;
  };

  return { getStorage, updateStorage, clearStorage };
};

export default useAsyncStorage;
