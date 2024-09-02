"use client";

import { useEffect, useState } from "react";

// Define types for key and initial value
type KeyType = string;
type InitialValueType<T> = T | (() => T);

// Define a generic type for the return value of the hook
type ReturnType<T> = [T, (newValue: T) => void];

function useLocalStorage<T>(
  key: KeyType,
  initialValue: InitialValueType<T>
): ReturnType<T> {
  // Check if localStorage is available
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
    // If localStorage is not available or parsing fails, return initial value
    return typeof initialValue === "function"
      ? (initialValue as () => T)()
      : initialValue;
  });

  useEffect(() => {
    if (localStorageAvailable) {
      const storedValue = localStorage.getItem(key);
      if (storedValue !== null) {
        try {
          setValue(JSON.parse(storedValue) as T);
        } catch (error) {
          console.error("Error parsing localStorage value:", error);
        }
      }
    }
  }, [key, localStorageAvailable]);

  const updateValue = (newValue: T) => {
    setValue(newValue);
    if (localStorageAvailable) {
      localStorage.setItem(key, JSON.stringify(newValue));
    }
  };

  return [value, updateValue];
}

export default useLocalStorage;
