import { useState } from "react";
import toastError from "../../errors/toastError";
import type { Error } from "../../types/Error";

export function useLocalStorage(key: string, initialValue: any) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      toastError(error as Error);
      return initialValue;
    }
  });

  const setValue = (value: any) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;

      setStoredValue(valueToStore);

      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      toastError(error as Error);
    }
  };

  return [storedValue, setValue];
}
