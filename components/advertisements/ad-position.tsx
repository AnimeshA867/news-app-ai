"use client";

import { useEffect, useState, useMemo } from "react";
import { AdUnit } from "./ad-unit";

interface AdPositionProps {
  position: string;
  pageType?: string;
  pageId?: string;
  adIndex?: number; // Add this prop to identify which ad in sequence to show
  className?: string;
  fallback?: React.ReactNode;
  hideContainer?: boolean;
  useAdDimensions?: boolean;
}

export function AdPosition({
  position,
  pageType = "global",
  pageId,
  adIndex = 0, // Default to first ad
  className,
  fallback,
  hideContainer = false,
  useAdDimensions = false,
}: AdPositionProps) {
  const [ad, setAd] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize query parameters to avoid re-creating on each render
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.append("position", position);
    params.append("pageType", pageType);
    if (pageId) params.append("pageId", pageId);
    params.append("index", adIndex.toString()); // Add the index parameter
    return params.toString();
  }, [position, pageType, pageId, adIndex]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchAd = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/advertisements/display?${queryParams}`,
          {
            signal: controller.signal,
          }
        );

        if (!isMounted) return;

        if (!response.ok) {
          throw new Error("Failed to fetch advertisement");
        }

        const data = await response.json();
        if (isMounted) {
          setAd(data);
        }
      } catch (error) {
        if (error.name !== "AbortError" && isMounted) {
          console.error("Error fetching ad:", error);
          setError((error as Error).message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAd();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [queryParams]);

  // If loading and we have a fallback, show the fallback
  if (loading) {
    return fallback || null;
  }

  // If there's an error or no ad and hideContainer is true, return null
  if ((error || !ad) && hideContainer) {
    return null;
  }

  // If there's an error or no ad but hideContainer is false, show fallback
  if (error || !ad) {
    return fallback || null;
  }

  // If we're using the ad's dimensions, apply them to a wrapping div
  if (useAdDimensions) {
    return (
      <div
        className={className}
        style={{
          width: ad.width ? `${ad.width}px` : "auto",
          maxWidth: "100%",
          height: ad.height ? `${ad.height}px` : "auto",
        }}
      >
        <AdUnit
          id={ad.id}
          imageUrl={ad.imageUrl}
          linkUrl={ad.linkUrl}
          adCode={ad.adCode}
          width={ad.width}
          height={ad.height}
          name={ad.name}
        />
      </div>
    );
  }

  // Original rendering if not using ad dimensions
  return (
    <div className={className}>
      <AdUnit
        id={ad.id}
        imageUrl={ad.imageUrl}
        linkUrl={ad.linkUrl}
        adCode={ad.adCode}
        width={ad.width}
        height={ad.height}
        name={ad.name}
      />
    </div>
  );
}
