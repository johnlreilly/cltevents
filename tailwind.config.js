/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Material 3 Design colors - Dark Theme (Blue)
        primary: '#A8C7FA',
        onprimary: '#003258',
        primarycontainer: '#004A77',
        onprimarycontainer: '#D3E4FD',
        secondary: '#CCC2DC',
        onsecondary: '#332D41',
        secondarycontainer: '#4A4458',
        onsecondarycontainer: '#E8DEF8',
        tertiary: '#EFB8C8',
        ontertiary: '#492532',
        tertiarycontainer: '#633B48',
        ontertiarycontainer: '#FFD8E4',
        surface: '#1C1B1F',
        onsurface: '#E6E1E5',
        surfacevariant: '#49454F',
        onsurfacevariant: '#CAC4D0',
        outline: '#938F99',
        outlinevariant: '#49454F',
      },
    },
  },
  plugins: [],
}
