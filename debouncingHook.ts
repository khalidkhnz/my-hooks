"use client";
import { useEffect, useState } from "react";

// Define a generic type for the value
type ValueType<T> = T;

const useDebounce = <T>(value: ValueType<T>, delay: number): ValueType<T> => {
  const [debouncedValue, setDebouncedValue] = useState<ValueType<T>>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay || 500);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
