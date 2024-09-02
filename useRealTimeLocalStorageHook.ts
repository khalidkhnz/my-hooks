"use client";
import { useEffect, useState } from "react";

type KeyType = string;
type InitialValueType<T> = T | (() => T);
type ReturnType<T> = [T, (newValue: T) => void];

function useRealTimeLocalStorage<T>(
  key: KeyType,
  initialValue: InitialValueType<T>
): ReturnType<T> {
  const localStorageAvailable = typeof localStorage !== "undefined";
  const [value, setValue] = useState<T>(() => {
    if (localStorageAvailable) {
      const storedValue = localStorage.getItem(key);
      if (storedValue !== null) {
        try {
          return JSON.parse(storedValue) as T;
        } catch (error) {
          console.error("Error parsing localStorage value:", error);
        }
      }
    }
    return typeof initialValue === "function"
      ? (initialValue as () => T)()
      : initialValue;
  });

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          setValue(JSON.parse(event.newValue) as T);
        } catch (error) {
          console.error("Error parsing localStorage value:", error);
        }
      }
    };

    if (localStorageAvailable) {
      window.addEventListener("storage", handleStorageChange);
    }

    return () => {
      if (localStorageAvailable) {
        window.removeEventListener("storage", handleStorageChange);
      }
    };
  }, [key, localStorageAvailable]);

  const updateValue = (newValue: T) => {
    setValue(newValue);
    if (localStorageAvailable) {
      localStorage.setItem(key, JSON.stringify(newValue));
    }
  };

  return [value, updateValue];
}

export default useRealTimeLocalStorage;
