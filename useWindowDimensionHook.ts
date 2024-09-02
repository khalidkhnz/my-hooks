"use client";
import { useState, useEffect } from "react";

interface WindowDimensions {
  width: number;
  height: number;
}

export default function useWindowDimensionHook(): WindowDimensions {
  const getDefaultDimensions = (): WindowDimensions => {
    // Return default dimensions if window is not defined (e.g., in SSR or test environments)
    return {
      width: 1281,
      height: 720,
    };
  };

  const [windowDimensions, setWindowDimensions] = useState<WindowDimensions>(
    typeof window !== "undefined"
      ? {
          width: window.innerWidth,
          height: window.innerHeight,
        }
      : getDefaultDimensions()
  );

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);

      // Cleanup function to remove event listener
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, []); // Empty dependency array means this effect runs only once after mounting

  return windowDimensions;
}
