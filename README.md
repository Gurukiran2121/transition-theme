# React Theme Transition

A React hook for smooth theme transitions with various animation effects using the View Transitions API.

## Features

- 🎨 **Multiple Animation Types**: Circle, Blur Circle, Fade, Slide, or None
- 🌓 **System Preference Support**: Automatically respects user's system color scheme
- 🔄 **Smooth Transitions**: Uses the View Transitions API for seamless theme changes
- 🎛️ **Customizable**: Control duration, easing, direction, and more
- ♿ **Accessibility**: Respects reduced motion preferences
- 📱 **Fallback Support**: Gracefully falls back in unsupported browsers
- 📦 **Lightweight**: No external dependencies
- 🔍 **TypeScript Support**: Full type definitions included

## Installation

```bash
npm install react-theme-transition
# or
yarn add react-theme-transition
# or
pnpm add react-theme-transition
```

## Browser Compatibility

The animation requires the View Transitions API, which is currently supported in:
- Chrome 111+
- Edge 111+
- Safari 16.4+
- Opera 97+

In unsupported browsers, the theme will still change but without animation.

## Basic Usage

```jsx
import { useThemeTransition, ThemeAnimationType } from 'react-theme-transition';

function ThemeToggle() {
  const { ref, toggleTheme, isDarkMode } = useThemeTransition({
    animationType: ThemeAnimationType.CIRCLE,
    duration: 750,
    respectSystemPreference: true
  });

  return (
    <button ref={ref} onClick={toggleTheme}>
      {isDarkMode ? '🌙' : '☀️'}
    </button>
  );
}
```

## Animation Types

### Circle

A circular reveal animation that expands from the toggle button.

```jsx
import { useThemeTransition, ThemeAnimationType } from 'react-theme-transition';

const { ref, toggleTheme } = useThemeTransition({
  animationType: ThemeAnimationType.CIRCLE,
  duration: 750
});
```

### Blur Circle

A blurred circular reveal animation for a softer transition.

```jsx
import { useThemeTransition, ThemeAnimationType } from 'react-theme-transition';

const { ref, toggleTheme } = useThemeTransition({
  animationType: ThemeAnimationType.BLUR_CIRCLE,
  duration: 750,
  blurAmount: 2 // Controls the blur intensity
});
```

### Fade

A simple crossfade between themes.

```jsx
import { useThemeTransition, ThemeAnimationType } from 'react-theme-transition';

const { toggleTheme } = useThemeTransition({
  animationType: ThemeAnimationType.FADE,
  duration: 500
});
```

### Slide

A slide animation with configurable direction.

```jsx
import { useThemeTransition, ThemeAnimationType, SlideDirection } from 'react-theme-transition';

const { toggleTheme } = useThemeTransition({
  animationType: ThemeAnimationType.SLIDE,
  duration: 500,
  slideDirection: SlideDirection.RIGHT
});
```

## API Reference

### `useThemeTransition(options?)`

The main hook that provides theme transition functionality.

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `duration` | `number` | `750` | Duration of the transition animation in milliseconds |
| `easing` | `string` | `'cubic-bezier(0.4, 0, 0.2, 1)'` | CSS easing function for the animation |
| `themeClassName` | `string` | `'dark'` | CSS class name to apply to document for dark mode |
| `animationType` | `ThemeAnimationType` | `ThemeAnimationType.CIRCLE` | Animation type to use for transitions |
| `blurAmount` | `number` | `2` | Blur amount for BLUR_CIRCLE animation type |
| `isDarkMode` | `boolean` | `undefined` | Optional external control of dark mode state |
| `onDarkModeChange` | `(isDark: boolean) => void` | `undefined` | Callback when dark mode state changes |
| `storageKey` | `string` | `'theme'` | Storage key for persisting theme preference |
| `respectSystemPreference` | `boolean` | `true` | Respect user's system preference for dark/light mode |
| `slideDirection` | `SlideDirection` | `SlideDirection.RIGHT` | Direction for slide animation |

#### Return Value

| Property | Type | Description |
|----------|------|-------------|
| `ref` | `React.RefObject<HTMLElement>` | Ref to attach to the toggle button element |
| `toggleTheme` | `() => Promise<void>` | Function to toggle between light and dark themes |
| `setTheme` | `(isDark: boolean) => Promise<void>` | Function to explicitly set the theme |
| `isDarkMode` | `boolean` | Current dark mode state |
| `isTransitioning` | `boolean` | Whether the animation is currently running |

### Enums

#### `ThemeAnimationType`

```typescript
enum ThemeAnimationType {
  CIRCLE = 'circle',         // Simple expanding circle
  BLUR_CIRCLE = 'blur-circle', // Blurred edge expanding circle
  FADE = 'fade',             // Simple crossfade between themes
  SLIDE = 'slide',           // Slide animation
  NONE = 'none'              // No animation
}
```

#### `SlideDirection`

```typescript
enum SlideDirection {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right'
}
```

## Advanced Usage

### External State Control

You can control the dark mode state externally:

```jsx
import { useState } from 'react';
import { useThemeTransition } from 'react-theme-transition';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  
  const { ref, toggleTheme } = useThemeTransition({
    isDarkMode: darkMode,
    onDarkModeChange: setDarkMode
  });
  
  return (
    <div>
      <button ref={ref} onClick={toggleTheme}>Toggle Theme</button>
      <div>Current theme: {darkMode ? 'Dark' : 'Light'}</div>
    </div>
  );
}
```

### CSS Integration

The hook adds a CSS class (default: `dark`) to the `documentElement` when in dark mode. You can use this to style your application:

```css
:root {
  --background: white;
  --text: black;
}

.dark {
  --background: #121212;
  --text: white;
}

body {
  background-color: var(--background);
  color: var(--text);
}
```

## License

MIT
