"use client";
import { useCallback } from "react";

const useRemoveLocalStorageItem = () => {
  const removeItem = useCallback((key: string) => {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error(
          `Error removing item with key "${key}" from localStorage:`,
          error
        );
      }
    } else {
      console.warn(
        `localStorage is not available. Key "${key}" was not removed.`
      );
    }
  }, []);

  return removeItem;
};

export default useRemoveLocalStorageItem;
