import { useState, useEffect } from "react";

/**
 * Custom hook for responsive design
 * @param query Media query string e.g. '(max-width: 768px)'
 * @returns Boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    // Set initial value
    setMatches(mediaQuery.matches);

    // Create an event listener
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);

    // Add the listener
    mediaQuery.addEventListener("change", handler);

    // Clean up on unmount
    return () => mediaQuery.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

// Common breakpoints
export const BREAKPOINTS = {
  sm: "(max-width: 640px)",
  md: "(max-width: 768px)",
  lg: "(max-width: 1024px)",
  xl: "(max-width: 1280px)",
};
