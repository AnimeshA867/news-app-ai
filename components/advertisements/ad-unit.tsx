"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface AdUnitProps {
  id: string;
  imageUrl?: string | null;
  linkUrl?: string | null;
  adCode?: string | null;
  width: number;
  height: number;
  name: string;
  className?: string;
}

export function AdUnit({
  id,
  imageUrl,
  linkUrl,
  adCode,
  width,
  height,
  name,
  className = "",
}: AdUnitProps) {
  const [loaded, setLoaded] = useState(false);

  // Track impression when component mounts
  useEffect(() => {
    // Only record impression once the element is visible
    if (typeof IntersectionObserver !== "undefined") {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            recordImpression();
            observer.disconnect();
          }
        });
      });

      const element = document.querySelector(`[data-ad-id="${id}"]`);
      if (element) {
        observer.observe(element);
        return () => observer.disconnect();
      }
    } else {
      // Fallback for browsers that don't support IntersectionObserver
      recordImpression();
    }
  }, [id]);

  // Track impression separately to avoid re-creating the effect
  const recordImpression = useCallback(() => {
    fetch(`/api/advertisements/${id}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "impression" }),
    }).catch((err) => console.error("Error tracking ad impression:", err));
  }, [id]);

  // Handle click tracking
  const handleClick = useCallback(() => {
    fetch(`/api/advertisements/${id}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "click" }),
    }).catch((err) => console.error("Error tracking ad click:", err));
  }, [id]);

  // Render custom ad code if provided
  if (adCode) {
    return (
      <div
        className={`ad-unit ${className}`}
        data-ad-id={id}
        style={{ width, height, maxWidth: "100%" }}
      >
        <div
          dangerouslySetInnerHTML={{ __html: adCode }}
          className="w-full h-full"
        />
      </div>
    );
  }

  // Render image ad
  return (
    <div
      className={`ad-unit relative ${className}`}
      data-ad-id={id}
      style={{
        width: width || "auto",
        height: height || "auto",
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      {!loaded && (
        <div className="absolute inset-0 bg-muted/30 flex items-center justify-center">
          <span className="text-xs text-muted-foreground">Advertisement</span>
        </div>
      )}
      {imageUrl &&
        (linkUrl ? (
          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className="flex items-center justify-center w-full h-full"
          >
            <div className="relative flex items-center justify-center">
              <Image
                src={imageUrl}
                alt={`Advertisement: ${name}`}
                width={width}
                height={height}
                className="max-w-full max-h-full object-contain"
                onLoad={() => setLoaded(true)}
                style={{
                  margin: "0 auto", // Center horizontally
                  display: "block",
                }}
              />
            </div>
          </a>
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <Image
              src={imageUrl}
              alt={`Advertisement: ${name}`}
              width={width}
              height={height}
              className="max-w-full max-h-full object-contain"
              onLoad={() => setLoaded(true)}
              style={{
                margin: "0 auto", // Center horizontally
                display: "block",
              }}
            />
          </div>
        ))}
      <div className="absolute top-0 right-0 bg-background/80 px-1 text-[10px] text-muted-foreground">
        Ad
      </div>
    </div>
  );
}
