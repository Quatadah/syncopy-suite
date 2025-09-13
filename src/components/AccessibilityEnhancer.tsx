import { useEffect } from 'react';

const AccessibilityEnhancer: React.FC = () => {
  useEffect(() => {
    // Add skip navigation link
    const addSkipLink = () => {
      const skipLink = document.createElement('a');
      skipLink.href = '#main-content';
      skipLink.textContent = 'Skip to main content';
      skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:shadow-lg';
      skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: #3b82f6;
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 1000;
        transition: top 0.3s;
      `;
      
      skipLink.addEventListener('focus', () => {
        skipLink.style.top = '6px';
      });
      
      skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
      });
      
      document.body.insertBefore(skipLink, document.body.firstChild);
    };

    // Add ARIA landmarks
    const addLandmarks = () => {
      const main = document.querySelector('main');
      if (!main) {
        const mainElement = document.createElement('main');
        mainElement.id = 'main-content';
        mainElement.setAttribute('role', 'main');
        mainElement.setAttribute('aria-label', 'Main content');
        
        // Find the main content area and wrap it
        const root = document.getElementById('root');
        if (root) {
          const content = root.querySelector('div:not([role])');
          if (content) {
            content.setAttribute('role', 'main');
            content.id = 'main-content';
          }
        }
      }
    };

    // Add focus management for modals and dialogs
    const addFocusManagement = () => {
      // Focus trap for modals
      const modals = document.querySelectorAll('[role="dialog"], [role="alertdialog"]');
      modals.forEach(modal => {
        const focusableElements = modal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (firstElement) {
          firstElement.focus();
        }

        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'Tab') {
            if (e.shiftKey) {
              if (document.activeElement === firstElement) {
                lastElement?.focus();
                e.preventDefault();
              }
            } else {
              if (document.activeElement === lastElement) {
                firstElement?.focus();
                e.preventDefault();
              }
            }
          }
        };

        modal.addEventListener('keydown', handleKeyDown);
      });
    };

    // Add keyboard navigation improvements
    const addKeyboardNavigation = () => {
      // Add keyboard support for custom interactive elements
      const customButtons = document.querySelectorAll('[data-custom-button]');
      customButtons.forEach(button => {
        button.setAttribute('tabindex', '0');
        button.setAttribute('role', 'button');
        
        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            (button as HTMLElement).click();
          }
        };
        
        button.addEventListener('keydown', handleKeyDown);
      });
    };

    // Add screen reader announcements
    const addScreenReaderSupport = () => {
      // Create live region for announcements
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      liveRegion.id = 'live-region';
      document.body.appendChild(liveRegion);

      // Function to announce messages
      window.announceToScreenReader = (message: string) => {
        liveRegion.textContent = message;
        setTimeout(() => {
          liveRegion.textContent = '';
        }, 1000);
      };
    };

    // Add high contrast mode support
    const addHighContrastSupport = () => {
      const style = document.createElement('style');
      style.textContent = `
        @media (prefers-contrast: high) {
          .bg-white\/5 {
            background-color: rgba(255, 255, 255, 0.1) !important;
          }
          .bg-white\/10 {
            background-color: rgba(255, 255, 255, 0.2) !important;
          }
          .border-white\/10 {
            border-color: rgba(255, 255, 255, 0.3) !important;
          }
          .text-gray-300 {
            color: #ffffff !important;
          }
          .text-gray-400 {
            color: #e5e7eb !important;
          }
        }
      `;
      document.head.appendChild(style);
    };

    // Add reduced motion support
    const addReducedMotionSupport = () => {
      const style = document.createElement('style');
      style.textContent = `
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `;
      document.head.appendChild(style);
    };

    // Initialize all accessibility enhancements
    addSkipLink();
    addLandmarks();
    addFocusManagement();
    addKeyboardNavigation();
    addScreenReaderSupport();
    addHighContrastSupport();
    addReducedMotionSupport();

    // Cleanup function
    return () => {
      const skipLink = document.querySelector('a[href="#main-content"]');
      if (skipLink) {
        skipLink.remove();
      }
      
      const liveRegion = document.getElementById('live-region');
      if (liveRegion) {
        liveRegion.remove();
      }
    };
  }, []);

  return null;
};

export default AccessibilityEnhancer;
