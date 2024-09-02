"use client";
import { useEffect, RefObject } from "react";

// Define types for ref and buttonRef
type RefType<T extends HTMLElement> = RefObject<T>;
type ButtonRefType<T extends HTMLElement> = RefObject<T>;

const useDetectOutsideClick = <T extends HTMLElement>(
  ref: RefType<T>,
  handler: () => void,
  buttonRef: ButtonRefType<T>
): void => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef?.current?.contains(event.target as Node)) return;

      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, handler, buttonRef]);
};

export default useDetectOutsideClick;
