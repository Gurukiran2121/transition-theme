// useThemeTransition.ts
import { useEffect, useRef, useState, useCallback } from 'react'
import { flushSync } from 'react-dom'

// Check if code is running in browser environment
const isBrowser = typeof window !== 'undefined'

/**
 * Animation types for theme transitions
 */
export enum ThemeAnimationType {
  CIRCLE = 'circle',         // Simple expanding circle
  BLUR_CIRCLE = 'blur-circle', // Blurred edge expanding circle
  FADE = 'fade',             // Simple crossfade between themes
  SLIDE = 'slide',           // Slide animation
  NONE = 'none'              // No animation
};

/**
 * Direction options for slide animation
 */
export enum SlideDirection {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right'
}

/**
 * Configuration options for useThemeTransition hook
 */
export interface ThemeTransitionOptions {
  /** Duration of the transition animation in milliseconds */
  duration?: number;
  /** CSS easing function for the animation */
  easing?: string;
  /** CSS pseudo-element selector */
  pseudoElement?: string;
  /** CSS class name to apply to document for dark mode */
  themeClassName?: string;
  /** Animation type to use for transitions */
  animationType?: ThemeAnimationType;
  /** Blur amount for BLUR_CIRCLE animation type */
  blurAmount?: number;
  /** ID for the generated style element */
  styleId?: string;
  /** Optional external control of dark mode state */
  isDarkMode?: boolean;
  /** Callback when dark mode state changes */
  onDarkModeChange?: (isDark: boolean) => void;
  /** Storage key for persisting theme preference */
  storageKey?: string;
  /** Respect user's system preference for dark/light mode */
  respectSystemPreference?: boolean;
  /** Direction for slide animation */
  slideDirection?: SlideDirection;
}

/**
 * Return type for useThemeTransition hook
 */
export interface ThemeTransitionResult {
  /** Ref to attach to the toggle button element */
  ref: React.MutableRefObject<HTMLDivElement | null>;
  /** Function to toggle between light and dark themes */
  toggleTheme: () => Promise<void>;
  /** Function to explicitly set the theme */
  setTheme: (isDark: boolean) => Promise<void>;
  /** Current dark mode state */
  isDarkMode: boolean;
  /** Whether the animation is currently running */
  isTransitioning: boolean;
}

/**
 * Hook for adding smooth theme transitions with various animation effects
 */
export const useThemeTransition = (options?: ThemeTransitionOptions): ThemeTransitionResult => {
  const {
    duration = 750,
    easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
    // pseudoElement = '::view-transition-new(root)',
    themeClassName = 'dark',
    animationType = ThemeAnimationType.CIRCLE,
    blurAmount = 2,
    styleId = 'theme-transition-style',
    isDarkMode: externalDarkMode,
    onDarkModeChange,
    storageKey = 'theme',
    respectSystemPreference = true,
    slideDirection = SlideDirection.RIGHT,
  } = options || {}

  // Inject CSS for view transitions API
  useEffect(() => {
    if (isBrowser) {
      const baseStyleId = 'theme-transition-base-style'
      if (!document.getElementById(baseStyleId)) {
        const style = document.createElement('style')
        style.id = baseStyleId
        style.textContent = `
          ::view-transition-old(root),
          ::view-transition-new(root) {
            animation: none;
            mix-blend-mode: normal;
          }
        `
        document.head.appendChild(style)
      }
    }
  }, [])

  // Get initial theme preference from storage or system preference
  const getInitialTheme = (): boolean => {
    if (!isBrowser) return false
    
    const storedTheme = localStorage.getItem(storageKey)
    
    if (storedTheme === 'dark') return true
    if (storedTheme === 'light') return false
    
    // If no stored preference and we respect system preference
    if (respectSystemPreference) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    
    return false
  }

  const [internalDarkMode, setInternalDarkMode] = useState<boolean>(getInitialTheme)
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false)
  
  // Use external state if provided, otherwise use internal state
  const isDarkMode = externalDarkMode !== undefined ? externalDarkMode : internalDarkMode
  
  // Create ref for the button element
  const ref = useRef<HTMLDivElement>(null)

  // Create a blurred circle SVG mask for the blur animation
  const createBlurCircleMask = (blur: number) => {
    return `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="-50 -50 100 100"><defs><filter id="blur"><feGaussianBlur stdDeviation="${blur}"/></filter></defs><circle cx="0" cy="0" r="25" fill="white" filter="url(%23blur)"/></svg>')`
  }

  // Apply current theme to DOM and storage
  useEffect(() => {
    if (!isBrowser) return
    
    if (isDarkMode) {
      document.documentElement.classList.add(themeClassName)
      localStorage.setItem(storageKey, 'dark')
    } else {
      document.documentElement.classList.remove(themeClassName)
      localStorage.setItem(storageKey, 'light')
    }
  }, [isDarkMode, themeClassName, storageKey])

  // Listen for system preference changes if enabled
  useEffect(() => {
    if (!isBrowser || !respectSystemPreference) return
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if there's no manual user preference stored
      if (!localStorage.getItem(storageKey)) {
        updateDarkMode(e.matches)
      }
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [respectSystemPreference, storageKey])

  // Helper to update dark mode state
  const updateDarkMode = useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    const newValue = typeof value === 'function' ? value(isDarkMode) : value
    
    if (onDarkModeChange) {
      onDarkModeChange(newValue)
    } else {
      setInternalDarkMode(newValue)
    }
  }, [isDarkMode, onDarkModeChange])

  // Apply fade transition styles
  const applyFadeTransition = () => {
    const styleElement = document.createElement('style')
    styleElement.id = styleId
    styleElement.textContent = `
      ::view-transition-group(root) {
        animation-duration: ${duration}ms;
        animation-timing-function: ${easing};
      }
      
      ::view-transition-new(root) {
        animation: fadeIn ${duration}ms ${easing};
      }
      
      ::view-transition-old(root) {
        animation: fadeOut ${duration}ms ${easing};
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    `
    document.head.appendChild(styleElement)
  }

  // Apply slide transition styles
  const applySlideTransition = () => {
    let fromX = '0%', fromY = '0%';
    
    switch (slideDirection) {
      case SlideDirection.UP:
        fromY = '100%'
        break
      case SlideDirection.DOWN:
        fromY = '-100%'
        break
      case SlideDirection.LEFT:
        fromX = '100%'
        break
      case SlideDirection.RIGHT:
        fromX = '-100%'
        break
    }
    
    const styleElement = document.createElement('style')
    styleElement.id = styleId
    styleElement.textContent = `
      ::view-transition-group(root) {
        animation-duration: ${duration}ms;
        animation-timing-function: ${easing};
      }
      
      ::view-transition-new(root) {
        animation: slideIn ${duration}ms ${easing};
      }
      
      ::view-transition-old(root) {
        animation: fadeOut ${duration}ms ${easing};
      }
      
      @keyframes slideIn {
        from {
          transform: translate(${fromX}, ${fromY});
          opacity: 0;
        }
        to {
          transform: translate(0%, 0%);
          opacity: 1;
        }
      }
      
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    `
    document.head.appendChild(styleElement)
  }

  // Apply blur circle transition styles
  const applyBlurCircleTransition = (x: number, y: number) => {
    const viewportSize = Math.max(window.innerWidth, window.innerHeight)
    const scaleFactor = 5.5;

    const styleElement = document.createElement('style')
    styleElement.id = styleId
    styleElement.textContent = `
      ::view-transition-group(root) {
        animation-duration: ${duration}ms;
        animation-timing-function: ${easing};
      }
      
      ::view-transition-new(root) {
        mask: ${createBlurCircleMask(blurAmount)} 0 0 / 100% 100% no-repeat;
        mask-position: ${x}px ${y}px;
        animation: maskScale ${duration}ms ${easing};
        transform-origin: ${x}px ${y}px;
      }
      
      ::view-transition-old(root) {
        animation: fadeOut ${duration}ms ${easing};
        transform-origin: ${x}px ${y}px;
        z-index: -1;
      }
      
      @keyframes maskScale {
        0% {
          mask-size: 0px;
          mask-position: ${x}px ${y}px;
        }
        100% {
          mask-size: ${viewportSize * scaleFactor}px;
          mask-position: ${x - (viewportSize * scaleFactor) / 2}px ${y - (viewportSize * scaleFactor) / 2}px;
        }
      }
      
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    `
    document.head.appendChild(styleElement)
  }

  // Set theme with animation
  const setTheme = async (isDark: boolean): Promise<void> => {
    if (!isBrowser) {
      updateDarkMode(isDark)
      return
    }

    // Skip animation if browser doesn't support View Transitions API
    // or if reduced motion is preferred
    if (
      !(document as any).startViewTransition ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      animationType === ThemeAnimationType.NONE
    ) {
      updateDarkMode(isDark)
      return
    }
    
    // Get coordinates for animations that need a reference point
    let x = window.innerWidth / 2
    let y = window.innerHeight / 2
    
    if (ref.current) {
      const { top, left, width, height } = ref.current.getBoundingClientRect()
      x = left + width / 2
      y = top + height / 2
    }
    
    // Remove existing transition styles
    const existingStyle = document.getElementById(styleId)
    if (existingStyle) {
      existingStyle.remove()
    }
    
    // Apply animation-specific styles
    switch (animationType) {
      case ThemeAnimationType.FADE:
        applyFadeTransition()
        break
      case ThemeAnimationType.SLIDE:
        applySlideTransition()
        break
      case ThemeAnimationType.BLUR_CIRCLE:
        applyBlurCircleTransition(x, y)
        break
    }
    
    setIsTransitioning(true)
    
    // Start the view transition
    const transition = (document as any).startViewTransition(() => {
      flushSync(() => {
        updateDarkMode(isDark)
      })
    }).ready
    
    // For circle animation, apply clip-path animation to the pseudoElement
    if (animationType === ThemeAnimationType.CIRCLE) {
      const maxRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );
    
      const styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.textContent = `
        ::view-transition-new(root) {
          animation: expandCircle ${duration}ms ${easing} forwards;
        }
        
        @keyframes expandCircle {
          from {
            clip-path: circle(0px at ${x}px ${y}px);
          }
          to {
            clip-path: circle(${maxRadius}px at ${x}px ${y}px);
          }
        }
      `;
      document.head.appendChild(styleElement);
    }
    
    
    await transition.ready
    
    // Clean up style element after animation completes
    setTimeout(() => {
      const styleElement = document.getElementById(styleId)
      if (styleElement) {
        styleElement.remove()
      }
      setIsTransitioning(false)
    }, duration)
  }
  
  // Toggle the current theme
  const toggleTheme = async (): Promise<void> => {
    if (isTransitioning) return
    return setTheme(!isDarkMode)
  }

  return {
    ref,
    toggleTheme,
    setTheme,
    isDarkMode,
    isTransitioning
  }
}

// // Export a simpler version with default options for easier usage
// export const useSimpleThemeTransition = (): ThemeTransitionResult => {
//   return useThemeTransition()
// }
