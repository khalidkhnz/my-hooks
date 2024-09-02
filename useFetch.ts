import { useState, useEffect, useRef } from 'react';

// Define the shape of the response data using a generic type
type FetchResponse<T> = {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  revalidate: () => void;
};

// Define the fetch options, extending the standard RequestInit interface
function useFetch<T>(url: string, options: RequestInit = {}): FetchResponse<T> {
  const [data, setData] = useState<T | null>(null); // Initialize state for the data
  const [error, setError] = useState<Error | null>(null); // Initialize state for the error
  const [isLoading, setIsLoading] = useState<boolean>(true); // Initialize state for loading
  const fetchRef = useRef<AbortController | null>(null); // Ref to track ongoing fetch requests

  useEffect(() => {
    if (!url) return; // Exit early if no URL is provided

    setIsLoading(true);
    setError(null);

    // If a request is already in progress, cancel it
    if (fetchRef.current) {
      fetchRef.current.abort();
    }

    const controller = new AbortController();
    fetchRef.current = controller;

    // Fetch the data
    fetch(url, { ...options, signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json() as Promise<T>;
      })
      .then((fetchedData) => {
        setData(fetchedData);
        setIsLoading(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err);
          setIsLoading(false);
        }
      });

    // Cleanup function to abort fetch on component unmount or URL change
    return () => controller.abort();
  }, [url, options]);

  // Manual revalidation (re-fetching)
  const revalidate = () => {
    setIsLoading(true);
    setError(null);

    fetch(url, options)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json() as Promise<T>;
      })
      .then((fetchedData) => {
        setData(fetchedData);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err);
        setIsLoading(false);
      });
  };

  return { data, error, isLoading, revalidate };
}

export default useFetch;
