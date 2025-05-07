import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";
import { prisma } from "@/lib/prisma";

export async function SiteFooter() {
  // Fetch settings
  const settings = (await prisma.setting.findFirst()) || {
    siteName: "NewsHub",
  };

  return (
    <footer className="border-t bg-muted/40">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                <span className="text-lg font-bold text-primary-foreground">
                  {settings.siteName.charAt(0)}
                </span>
              </div>
              <span className="text-xl font-bold tracking-tight">
                {settings.siteName}
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Delivering the latest breaking news and top stories from around
              the world.
            </p>
            <div className="mt-6 flex space-x-4">
              <Link href="#" className="text-foreground/70 hover:text-primary">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-foreground/70 hover:text-primary">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-foreground/70 hover:text-primary">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-foreground/70 hover:text-primary">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link href="#" className="text-foreground/70 hover:text-primary">
                <Youtube className="h-5 w-5" />
                <span className="sr-only">YouTube</span>
              </Link>
            </div>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Categories
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/category/politics"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Politics
                </Link>
              </li>
              <li>
                <Link
                  href="/category/world"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  World
                </Link>
              </li>
              <li>
                <Link
                  href="/category/business"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Business
                </Link>
              </li>
              <li>
                <Link
                  href="/category/technology"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Technology
                </Link>
              </li>
              <li>
                <Link
                  href="/category/entertainment"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Entertainment
                </Link>
              </li>
              <li>
                <Link
                  href="/category/sports"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Sports
                </Link>
              </li>
              <li>
                <Link
                  href="/category/health"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Health
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Company
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="/advertise"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Advertise
                </Link>
              </li>
              <li>
                <Link
                  href="/ethics"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Ethics Policy
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/accessibility"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Accessibility
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t pt-8">
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} {settings.siteName}. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
