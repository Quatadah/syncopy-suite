import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "profile";
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  noindex?: boolean;
  nofollow?: boolean;
}

const defaultSEO: Required<SEOProps> = {
  title: "Syncopy - Your Clipboard, Everywhere",
  description:
    "The most powerful clipboard manager that syncs across all your devices. Never lose important content again with smart organization and instant search.",
  keywords:
    "clipboard manager, sync, productivity, cross-platform, clipboard history, copy paste, organize clips, open source, free",
  image: "/syncopy-logo.png",
  url: "https://syncopy.app",
  type: "website",
  author: "Syncopy Team",
  publishedTime: "2024-01-01T00:00:00Z",
  modifiedTime: new Date().toISOString(),
  section: "Productivity Tools",
  tags: ["clipboard", "productivity", "sync", "open source"],
  noindex: false,
  nofollow: false,
};

export const useSEO = (seoProps: SEOProps = {}) => {
  const seo = { ...defaultSEO, ...seoProps };

  useEffect(() => {
    // Update document title
    document.title = seo.title;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, property = false) => {
      const attribute = property ? "property" : "name";
      let meta = document.querySelector(
        `meta[${attribute}="${name}"]`
      ) as HTMLMetaElement;

      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    // Basic meta tags
    updateMetaTag("description", seo.description);
    updateMetaTag("keywords", seo.keywords);
    updateMetaTag("author", seo.author);

    // Open Graph tags
    updateMetaTag("og:title", seo.title, true);
    updateMetaTag("og:description", seo.description, true);
    updateMetaTag("og:image", seo.image, true);
    updateMetaTag("og:url", seo.url, true);
    updateMetaTag("og:type", seo.type, true);
    updateMetaTag("og:site_name", "Syncopy", true);

    // Twitter Card tags
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", seo.title);
    updateMetaTag("twitter:description", seo.description);
    updateMetaTag("twitter:image", seo.image);
    updateMetaTag("twitter:site", "@syncopy_app");

    // Additional meta tags
    updateMetaTag(
      "robots",
      `${seo.noindex ? "noindex" : "index"},${
        seo.nofollow ? "nofollow" : "follow"
      }`
    );
    updateMetaTag("theme-color", "#3b82f6");
    updateMetaTag("msapplication-TileColor", "#3b82f6");
    updateMetaTag("apple-mobile-web-app-title", "Syncopy");
    updateMetaTag("application-name", "Syncopy");

    // Canonical URL
    let canonical = document.querySelector(
      'link[rel="canonical"]'
    ) as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", seo.url);

    // Article specific meta tags
    if (seo.type === "article") {
      updateMetaTag("article:author", seo.author, true);
      updateMetaTag("article:published_time", seo.publishedTime, true);
      updateMetaTag("article:modified_time", seo.modifiedTime, true);
      updateMetaTag("article:section", seo.section, true);

      seo.tags.forEach((tag) => {
        const tagMeta = document.createElement("meta");
        tagMeta.setAttribute("property", "article:tag");
        tagMeta.setAttribute("content", tag);
        document.head.appendChild(tagMeta);
      });
    }

    // JSON-LD structured data
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": seo.type === "article" ? "Article" : "WebApplication",
      name: seo.title,
      description: seo.description,
      url: seo.url,
      image: seo.image,
      author: {
        "@type": "Organization",
        name: seo.author,
      },
      publisher: {
        "@type": "Organization",
        name: "Syncopy",
        logo: {
          "@type": "ImageObject",
          url: seo.image,
        },
      },
      ...(seo.type === "article" && {
        datePublished: seo.publishedTime,
        dateModified: seo.modifiedTime,
        articleSection: seo.section,
        keywords: seo.tags.join(", "),
      }),
      ...(seo.type === "WebApplication" && {
        applicationCategory: "ProductivityApplication",
        operatingSystem: "Web Browser, Windows, macOS, Linux, iOS, Android",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        featureList: [
          "Cross-platform clipboard sync",
          "End-to-end encryption",
          "Smart search and organization",
          "Code snippet support",
          "Rich content support",
          "Keyboard shortcuts",
          "Multiple boards",
          "Full history tracking",
        ],
      }),
    };

    // Remove existing JSON-LD
    const existingJsonLd = document.querySelector(
      'script[type="application/ld+json"]'
    );
    if (existingJsonLd) {
      existingJsonLd.remove();
    }

    // Add new JSON-LD
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
  }, [seo]);

  return seo;
};
