/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Material 3 Design colors - Using CSS variables for theme switching
        primary: 'var(--color-primary)',
        onprimary: 'var(--color-on-primary)',
        primarycontainer: 'var(--color-primary-container)',
        onprimarycontainer: 'var(--color-on-primary-container)',
        secondary: 'var(--color-secondary)',
        onsecondary: 'var(--color-on-secondary)',
        secondarycontainer: 'var(--color-secondary-container)',
        onsecondarycontainer: 'var(--color-on-secondary-container)',
        tertiary: 'var(--color-tertiary)',
        ontertiary: 'var(--color-on-tertiary)',
        tertiarycontainer: 'var(--color-tertiary-container)',
        ontertiarycontainer: 'var(--color-on-tertiary-container)',
        surface: 'var(--color-surface)',
        onsurface: 'var(--color-on-surface)',
        surfacevariant: 'var(--color-surface-variant)',
        onsurfacevariant: 'var(--color-on-surface-variant)',
        outline: 'var(--color-outline)',
        outlinevariant: 'var(--color-outline-variant)',
      },
    },
  },
  plugins: [],
}
