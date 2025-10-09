/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Material 3 Design colors
        primary: '#6750A4',
        onprimary: '#FFFFFF',
        primarycontainer: '#EADDFF',
        onprimarycontainer: '#21005D',
        secondary: '#625B71',
        onsecondary: '#FFFFFF',
        secondarycontainer: '#E8DEF8',
        onsecondarycontainer: '#1D192B',
        tertiary: '#7D5260',
        ontertiary: '#FFFFFF',
        tertiarycontainer: '#FFD8E4',
        ontertiarycontainer: '#31111D',
        surface: '#FEF7FF',
        onsurface: '#1D1B20',
        surfacevariant: '#E7E0EC',
        onsurfacevariant: '#49454F',
        outline: '#79747E',
        outlinevariant: '#CAC4D0',
      },
    },
  },
  plugins: [],
}
