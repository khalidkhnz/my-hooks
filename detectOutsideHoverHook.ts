"use client";
import { useEffect, RefObject } from "react";

// Define types for ref and buttonRef
type RefType<T extends HTMLElement> = RefObject<T>;
type ButtonRefType<T extends HTMLElement> = RefObject<T>;

const useDetectOutsideHover = <T extends HTMLElement>(
  ref: RefType<T>,
  handler: () => void,
  buttonRef?: ButtonRefType<T>,
): void => {
  useEffect(() => {
    const handleHoverOutside = (event: MouseEvent) => {
      if (buttonRef?.current?.contains(event.target as Node)) return;

      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    document.addEventListener("mouseover", handleHoverOutside);
    return () => {
      document.removeEventListener("mouseover", handleHoverOutside);
    };
  }, [ref, handler, buttonRef]);
};

export default useDetectOutsideHover;
