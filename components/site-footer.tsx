"use client";

import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";
import { useEffect, useState } from "react";
import { Category } from "@/lib/generated";
import { SiteSettings } from "./providers/settings-provider";

interface NavigationLink {
  id: string;
  name: string;
  href: string;
  group: string;
  order: number;
}

interface GroupedLinks {
  [key: string]: NavigationLink[];
}

export function SiteFooter() {
  const [settings, setSettings] = useState<SiteSettings>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [footerLinks, setFooterLinks] = useState<GroupedLinks>({
    Company: [],
    Advertising: [],
    Legal: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch settings
        const settingsRes = await fetch("/api/settings");
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setSettings(settingsData || { siteName: "NewsHub" });
        }

        // Fetch categories
        const categoriesRes = await fetch("/api/categories");
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          if (categoriesData && categoriesData.categories) {
            setCategories(categoriesData.categories);
          }
        }

        // Fetch navigation links
        const navRes = await fetch("/api/navigation");
        if (navRes.ok) {
          const navData = await navRes.json();
          if (navData && navData.links) {
            setFooterLinks(navData.links);
          }
        }
      } catch (error) {
        console.error("Error fetching footer data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Helper function to render link groups
  const renderLinkGroup = (groupName: string) => {
    const links = footerLinks[groupName] || [];
    return (
      <div>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
          {groupName}
        </h3>
        <ul className="space-y-2">
          {isLoading ? (
            <li className="text-sm text-muted-foreground">Loading...</li>
          ) : links.length > 0 ? (
            links.map((link) => (
              <li key={link.id}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  {link.name}
                </Link>
              </li>
            ))
          ) : (
            <li className="text-sm text-muted-foreground">
              No links available
            </li>
          )}
        </ul>
      </div>
    );
  };

  return (
    <footer className="border-t bg-muted/40">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* First column - Logo and socials */}
          <div>
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                <span className="text-lg font-bold text-primary-foreground">
                  {settings?.siteName.charAt(0)}
                </span>
              </div>
              <span className="text-xl font-bold tracking-tight">
                {settings?.siteName}
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              {settings?.description}
            </p>
            <div className="mt-6 flex space-x-4">
              {settings?.facebookUrl && (
                <Link
                  href={settings.facebookUrl}
                  className="text-foreground/70 hover:text-primary"
                >
                  <Facebook className="h-5 w-5" />
                  <span className="sr-only">Facebook</span>
                </Link>
              )}
              {settings?.twitterUrl && (
                <Link
                  href={settings.twitterUrl}
                  className="text-foreground/70 hover:text-primary"
                >
                  <Twitter className="h-5 w-5" />
                  <span className="sr-only">Twitter</span>
                </Link>
              )}
              {settings?.instagramUrl && (
                <Link
                  href={settings.instagramUrl}
                  className="text-foreground/70 hover:text-primary"
                >
                  <Instagram className="h-5 w-5" />
                  <span className="sr-only">Instagram</span>
                </Link>
              )}
              {settings?.linkedinUrl && (
                <Link
                  href={settings.linkedinUrl}
                  className="text-foreground/70 hover:text-primary"
                >
                  <Linkedin className="h-5 w-5" />
                  <span className="sr-only">LinkedIn</span>
                </Link>
              )}
              {settings?.youtubeUrl && (
                <Link
                  href={settings.youtubeUrl}
                  className="text-foreground/70 hover:text-primary"
                >
                  <Youtube className="h-5 w-5" />
                  <span className="sr-only">YouTube</span>
                </Link>
              )}
            </div>
          </div>

          {/* Second column - Categories */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Categories
            </h3>
            <ul className="space-y-2">
              {isLoading ? (
                <li className="text-sm text-muted-foreground">Loading...</li>
              ) : categories.length > 0 ? (
                categories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/category/${category.slug}`}
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-sm text-muted-foreground">
                  No categories available
                </li>
              )}
            </ul>
          </div>

          {/* Third and Fourth columns - Footer links */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {renderLinkGroup("Company")}
              {renderLinkGroup("Advertising")}
              {renderLinkGroup("Legal")}
            </div>
          </div>
        </div>
        <div className="mt-12 border-t pt-8">
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} {settings?.siteName}. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
