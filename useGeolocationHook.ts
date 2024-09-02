"use client";
import { useState, useEffect } from "react";

// Define types for latitude, longitude, and error
type LocationType = {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
};

const useGeolocation = (): LocationType => {
  const [location, setLocation] = useState<LocationType>({
    latitude: null,
    longitude: null,
    error: null,
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            error: null,
          });
        },
        (error) => {
          setLocation((prevLocation) => ({
            ...prevLocation,
            error: error.message || "Unknown error",
          }));
        }
      );
    } else {
      setLocation((prevLocation) => ({
        ...prevLocation,
        error: "Geolocation is not supported by this browser.",
      }));
    }
  }, []);

  return location;
};

export default useGeolocation;
