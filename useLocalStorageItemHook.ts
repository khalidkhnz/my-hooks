"use client";
import { useEffect, useState } from "react";

// Define a generic type for the item
type ItemType<T> = T | undefined;

function useLocalStorageItem<T = undefined>(
  key: string,
  defaultValue?: ItemType<T>
): ItemType<T> {
  const defaultDefaultValue: ItemType<T> = undefined; // Default default value

  const [item, setItem] = useState<ItemType<T>>(
    defaultValue ?? defaultDefaultValue
  );

  useEffect(() => {
    const storedItem = localStorage.getItem(key);

    if (storedItem !== null && storedItem !== undefined) {
      try {
        const parsedItem = JSON.parse(storedItem) as ItemType<T>;
        setItem(parsedItem);
      } catch (error) {
        console.error("Error parsing localStorage item:", error);
        setItem(defaultValue ?? defaultDefaultValue); // Fallback to default value if parsing fails
      }
    } else {
      setItem(defaultValue ?? defaultDefaultValue);
    }
  }, [key, defaultValue, defaultDefaultValue]);

  return item;
}

export default useLocalStorageItem;
