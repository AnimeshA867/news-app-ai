"use client";

import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    // Update the state initially
    const updateMatches = () => {
      setMatches(media.matches);
    };

    // Set up initial value
    updateMatches();

    // Set up event listener for changes
    media.addEventListener("change", updateMatches);

    // Clean up
    return () => {
      media.removeEventListener("change", updateMatches);
    };
  }, [query]);

  return matches;
}
