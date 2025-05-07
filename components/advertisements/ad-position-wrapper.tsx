import { Suspense } from "react";
import { AdPosition } from "./ad-position";

interface AdPositionWrapperProps {
  position: string;
  pageType?: string;
  pageId?: string;
  className?: string;
  fallback?: React.ReactNode;
}

export function AdPositionWrapper(props: AdPositionWrapperProps) {
  return (
    <Suspense
      fallback={
        props.fallback || (
          <div className="w-full h-full bg-muted/20 animate-pulse" />
        )
      }
    >
      <AdPosition {...props} />
    </Suspense>
  );
}
