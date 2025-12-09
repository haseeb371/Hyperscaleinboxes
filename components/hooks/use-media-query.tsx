"use client";

import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    // Update the state with the current value
    const updateMatches = (): void => {
      setMatches(media.matches);
    };

    // Set the initial value
    updateMatches();

    // Add the callback as a listener
    media.addEventListener("change", updateMatches);

    // Remove the listener on cleanup
    return () => {
      media.removeEventListener("change", updateMatches);
    };
  }, [query]);

  return matches;
}