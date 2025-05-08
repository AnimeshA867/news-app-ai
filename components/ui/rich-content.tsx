"use client";

import React from "react";
import parse, { domToReact, HTMLReactParserOptions } from "html-react-parser";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface RichContentProps {
  content: string;
  className?: string;
}

export function RichContent({ content, className }: RichContentProps) {
  const options: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (domNode.type === "tag") {
        const element = domNode as any;

        // Handle links
        if (element.name === "a" && element.attribs.href) {
          const href = element.attribs.href;
          // External link
          if (href.startsWith("http")) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {domToReact(element.children, options)}
              </a>
            );
          }
          // Internal link
          return (
            <Link href={href} className="text-primary hover:underline">
              {domToReact(element.children, options)}
            </Link>
          );
        }
      }
    },
  };

  return (
    <div className={cn("rich-content", className)}>
      {parse(content, options)}
    </div>
  );
}
