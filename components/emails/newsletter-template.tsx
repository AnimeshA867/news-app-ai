import React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface NewsletterEmailProps {
  previewText?: string;
  headline: string;
  intro?: string;
  articles: {
    title: string;
    excerpt: string;
    url: string;
    imageUrl?: string;
  }[];
  siteInfo: {
    siteName: string;
    siteUrl: string;
    logoUrl?: string;
  };
}

export const NewsletterEmail = ({
  previewText = "Latest news and updates from our platform",
  headline = "This Week's Top Stories",
  intro,
  articles,
  siteInfo,
}: NewsletterEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with logo */}
          <Section style={header}>
            {siteInfo.logoUrl && (
              <Img
                src={siteInfo.logoUrl}
                width={120}
                height={40}
                alt={siteInfo.siteName}
                style={logo}
              />
            )}
            <Heading style={heading}>{siteInfo.siteName}</Heading>
          </Section>

          {/* Main headline */}
          <Heading style={newsletterHeading}>{headline}</Heading>

          {/* Optional intro text */}
          {intro && <Text style={introText}>{intro}</Text>}

          {/* Articles */}
          {articles.map((article, index) => (
            <Section key={index} style={articleSection}>
              {article.imageUrl && (
                <Link href={article.url}>
                  <Img
                    src={article.imageUrl}
                    width={600}
                    height={300}
                    alt={article.title}
                    style={articleImage}
                  />
                </Link>
              )}
              <Heading as="h2" style={articleHeading}>
                <Link href={article.url} style={articleLink}>
                  {article.title}
                </Link>
              </Heading>
              <Text style={articleExcerpt}>{article.excerpt}</Text>
              <Link href={article.url} style={readMoreLink}>
                Read More →
              </Link>
            </Section>
          ))}

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} {siteInfo.siteName}. All rights
              reserved.
            </Text>
            <Text style={footerText}>
              <Link href={`${siteInfo.siteUrl}/unsubscribe`} style={footerLink}>
                Unsubscribe
              </Link>{" "}
              •{" "}
              <Link href={`${siteInfo.siteUrl}/privacy`} style={footerLink}>
                Privacy Policy
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0",
  maxWidth: "600px",
};

const header = {
  padding: "20px",
  borderBottom: "1px solid #e6ebf1",
  textAlign: "center" as const,
};

const logo = {
  margin: "0 auto",
};

const heading = {
  fontSize: "24px",
  fontWeight: "bold",
  marginTop: "10px",
};

const newsletterHeading = {
  fontSize: "28px",
  fontWeight: "bold",
  padding: "0 20px",
  marginBottom: "10px",
};

const introText = {
  margin: "0 0 24px",
  padding: "0 20px",
  fontSize: "16px",
  lineHeight: "1.5",
  color: "#444",
};

const articleSection = {
  padding: "20px",
  borderBottom: "1px solid #e6ebf1",
};

const articleImage = {
  width: "100%",
  objectFit: "cover" as const,
  borderRadius: "6px",
  marginBottom: "16px",
};

const articleHeading = {
  fontSize: "20px",
  lineHeight: "1.3",
  fontWeight: "600",
  margin: "0 0 10px",
};

const articleLink = {
  color: "#111",
  textDecoration: "none",
};

const articleExcerpt = {
  margin: "0 0 16px",
  fontSize: "16px",
  lineHeight: "1.5",
  color: "#444",
};

const readMoreLink = {
  color: "#3498db",
  textDecoration: "none",
  fontWeight: "600",
};

const footer = {
  padding: "20px",
  borderTop: "1px solid #e6ebf1",
};

const footerText = {
  fontSize: "14px",
  color: "#666",
  textAlign: "center" as const,
  margin: "5px 0",
};

const footerLink = {
  color: "#666",
  textDecoration: "underline",
};

export default NewsletterEmail;
