"use client";

import { useEffect, useState } from "react";

// Define types for key and initial value
type KeyType = string;
type InitialValueType<T> = T | (() => T);

// Define a generic type for the return value of the hook
type ReturnType<T> = [T, (newValue: T) => void];

function useSessionStorage<T>(
  key: KeyType,
  initialValue: InitialValueType<T>
): ReturnType<T> {
  const [value, setValue] = useState<T>(() => {
    const storedValue = sessionStorage.getItem(key);
    if (storedValue !== null) {
      try {
        return JSON.parse(storedValue) as T;
      } catch (error) {
        console.error("Error parsing sessionStorage value:", error);
      }
    }
    // If there's no stored value or parsing fails, return initial value
    return typeof initialValue === "function"
      ? (initialValue as () => T)()
      : initialValue;
  });

  useEffect(() => {
    const storedValue = sessionStorage.getItem(key);
    if (storedValue !== null) {
      try {
        setValue(JSON.parse(storedValue) as T);
      } catch (error) {
        console.error("Error parsing sessionStorage value:", error);
      }
    }
  }, [key]);

  const updateValue = (newValue: T) => {
    setValue(newValue);
    sessionStorage.setItem(key, JSON.stringify(newValue));
  };

  return [value, updateValue];
}

export default useSessionStorage;
