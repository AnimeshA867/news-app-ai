"use client";

import { useEffect, useState, useMemo } from "react";
import { AdUnit } from "./ad-unit";

interface AdPositionProps {
  position: string;
  pageType?: string;
  pageId?: string;
  className?: string;
  fallback?: React.ReactNode;
}

export function AdPosition({
  position,
  pageType = "global",
  pageId,
  className,
  fallback,
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
    return params.toString();
  }, [position, pageType, pageId]);

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

  if (loading) {
    return (
      fallback || (
        <div className="w-full h-full bg-muted/20 animate-pulse rounded" />
      )
    );
  }

  if (error || !ad) {
    return fallback || null;
  }

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
