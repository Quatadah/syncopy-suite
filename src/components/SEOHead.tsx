import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  noindex?: boolean;
  nofollow?: boolean;
  structuredData?: any;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'Clippy - Your Clipboard, Organized',
  description = 'The most powerful clipboard manager for productivity. Never lose important content again with smart organization and instant search.',
  keywords = 'clipboard manager, sync, productivity, cross-platform, clipboard history, copy paste, organize clips, open source, free',
  image = '/clippy-logo.png',
  url = 'https://clippy.app',
  type = 'website',
  author = 'Clippy Team',
  publishedTime,
  modifiedTime,
  section,
  tags = [],
  noindex = false,
  nofollow = false,
  structuredData
}) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, property = false) => {
      const attribute = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('author', author);

    // Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:site_name', 'Clippy', true);

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);
    updateMetaTag('twitter:site', '@clippy_app');

    // Additional meta tags
    updateMetaTag('robots', `${noindex ? 'noindex' : 'index'},${nofollow ? 'nofollow' : 'follow'}`);
    updateMetaTag('theme-color', '#3b82f6');
    updateMetaTag('msapplication-TileColor', '#3b82f6');
    updateMetaTag('apple-mobile-web-app-title', 'Clippy');
    updateMetaTag('application-name', 'Clippy');

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

    // Article specific meta tags
    if (type === 'article') {
      updateMetaTag('article:author', author, true);
      if (publishedTime) updateMetaTag('article:published_time', publishedTime, true);
      if (modifiedTime) updateMetaTag('article:modified_time', modifiedTime, true);
      if (section) updateMetaTag('article:section', section, true);
      
      tags.forEach(tag => {
        const tagMeta = document.createElement('meta');
        tagMeta.setAttribute('property', 'article:tag');
        tagMeta.setAttribute('content', tag);
        document.head.appendChild(tagMeta);
      });
    }

    // JSON-LD structured data
    const jsonLd = structuredData || {
      '@context': 'https://schema.org',
      '@type': type === 'article' ? 'Article' : 'WebApplication',
      name: title,
      description: description,
      url: url,
      image: image,
      author: {
        '@type': 'Organization',
        name: author,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Clippy',
        logo: {
          '@type': 'ImageObject',
          url: image,
        },
      },
      ...(type === 'article' && {
        datePublished: publishedTime,
        dateModified: modifiedTime,
        articleSection: section,
        keywords: tags.join(', '),
      }),
      ...(type === 'WebApplication' && {
        applicationCategory: 'ProductivityApplication',
        operatingSystem: 'Web Browser, Windows, macOS, Linux, iOS, Android',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        featureList: [
          'Smart clipboard organization',
          'Secure storage',
          'Instant search and filtering',
          'Code snippet support',
          'Rich content support',
          'Keyboard shortcuts',
          'Multiple boards',
          'Full history tracking',
        ],
      }),
    };

    // Remove existing JSON-LD
    const existingJsonLd = document.querySelector('script[type="application/ld+json"]');
    if (existingJsonLd) {
      existingJsonLd.remove();
    }

    // Add new JSON-LD
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);

  }, [title, description, keywords, image, url, type, author, publishedTime, modifiedTime, section, tags, noindex, nofollow, structuredData]);

  return null; // This component doesn't render anything
};

export default SEOHead;
