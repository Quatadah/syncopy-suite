import { useEffect } from 'react';

const SEOPerformanceMonitor: React.FC = () => {
  useEffect(() => {
    // Monitor Core Web Vitals
    const monitorCoreWebVitals = () => {
      // Largest Contentful Paint (LCP)
      const observeLCP = () => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          console.log('LCP:', lastEntry.startTime);
          
          // Send to analytics if available
          if (window.gtag) {
            window.gtag('event', 'web_vitals', {
              name: 'LCP',
              value: Math.round(lastEntry.startTime),
              event_category: 'Web Vitals',
            });
          }
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      };

      // First Input Delay (FID)
      const observeFID = () => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            console.log('FID:', entry.processingStart - entry.startTime);
            
            if (window.gtag) {
              window.gtag('event', 'web_vitals', {
                name: 'FID',
                value: Math.round(entry.processingStart - entry.startTime),
                event_category: 'Web Vitals',
              });
            }
          });
        });
        observer.observe({ entryTypes: ['first-input'] });
      };

      // Cumulative Layout Shift (CLS)
      const observeCLS = () => {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          console.log('CLS:', clsValue);
          
          if (window.gtag) {
            window.gtag('event', 'web_vitals', {
              name: 'CLS',
              value: Math.round(clsValue * 1000),
              event_category: 'Web Vitals',
            });
          }
        });
        observer.observe({ entryTypes: ['layout-shift'] });
      };

      // First Contentful Paint (FCP)
      const observeFCP = () => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            console.log('FCP:', entry.startTime);
            
            if (window.gtag) {
              window.gtag('event', 'web_vitals', {
                name: 'FCP',
                value: Math.round(entry.startTime),
                event_category: 'Web Vitals',
              });
            }
          });
        });
        observer.observe({ entryTypes: ['paint'] });
      };

      // Time to Interactive (TTI)
      const measureTTI = () => {
        const tti = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (tti) {
          const ttiValue = tti.loadEventEnd - tti.fetchStart;
          console.log('TTI:', ttiValue);
          
          if (window.gtag) {
            window.gtag('event', 'web_vitals', {
              name: 'TTI',
              value: Math.round(ttiValue),
              event_category: 'Web Vitals',
            });
          }
        }
      };

      // Initialize observers
      if ('PerformanceObserver' in window) {
        observeLCP();
        observeFID();
        observeCLS();
        observeFCP();
        
        // Measure TTI after page load
        window.addEventListener('load', () => {
          setTimeout(measureTTI, 0);
        });
      }
    };

    // Monitor page load performance
    const monitorPageLoad = () => {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          const metrics = {
            dns: navigation.domainLookupEnd - navigation.domainLookupStart,
            tcp: navigation.connectEnd - navigation.connectStart,
            ttfb: navigation.responseStart - navigation.requestStart,
            download: navigation.responseEnd - navigation.responseStart,
            domProcessing: navigation.domContentLoadedEventEnd - navigation.responseEnd,
            total: navigation.loadEventEnd - navigation.fetchStart,
          };

          console.log('Page Load Metrics:', metrics);

          // Send to analytics
          if (window.gtag) {
            Object.entries(metrics).forEach(([key, value]) => {
              window.gtag('event', 'page_load_metric', {
                name: key,
                value: Math.round(value),
                event_category: 'Performance',
              });
            });
          }
        }
      });
    };

    // Monitor resource loading
    const monitorResourceLoading = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'resource') {
            const resource = entry as PerformanceResourceTiming;
            const loadTime = resource.responseEnd - resource.startTime;
            
            // Log slow resources
            if (loadTime > 1000) {
              console.warn('Slow resource:', resource.name, loadTime + 'ms');
            }
          }
        });
      });
      
      observer.observe({ entryTypes: ['resource'] });
    };

    // Monitor JavaScript errors
    const monitorErrors = () => {
      window.addEventListener('error', (event) => {
        console.error('JavaScript Error:', event.error);
        
        if (window.gtag) {
          window.gtag('event', 'exception', {
            description: event.error?.message || 'Unknown error',
            fatal: false,
          });
        }
      });

      window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled Promise Rejection:', event.reason);
        
        if (window.gtag) {
          window.gtag('event', 'exception', {
            description: event.reason?.message || 'Unhandled promise rejection',
            fatal: false,
          });
        }
      });
    };

    // Monitor user interactions for SEO insights
    const monitorUserInteractions = () => {
      // Track scroll depth
      let maxScrollDepth = 0;
      const trackScrollDepth = () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollDepth = Math.round((scrollTop / scrollHeight) * 100);
        
        if (scrollDepth > maxScrollDepth) {
          maxScrollDepth = scrollDepth;
          
          if (window.gtag) {
            window.gtag('event', 'scroll_depth', {
              value: maxScrollDepth,
              event_category: 'Engagement',
            });
          }
        }
      };

      window.addEventListener('scroll', trackScrollDepth, { passive: true });

      // Track time on page
      const startTime = Date.now();
      window.addEventListener('beforeunload', () => {
        const timeOnPage = Date.now() - startTime;
        
        if (window.gtag) {
          window.gtag('event', 'time_on_page', {
            value: Math.round(timeOnPage / 1000),
            event_category: 'Engagement',
          });
        }
      });
    };

    // Initialize all monitoring
    monitorCoreWebVitals();
    monitorPageLoad();
    monitorResourceLoading();
    monitorErrors();
    monitorUserInteractions();

  }, []);

  return null;
};

export default SEOPerformanceMonitor;
