/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // This tells Tailwind to scan all JS/JSX files in src
    "./public/index.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Define custom font families if needed, or override defaults
        // 'sans': ['Inter', 'sans-serif'], // Example if you wanted Inter as default sans
        'serif': ['Merriweather', 'serif'], // Matches your Merriweather import
        'display': ['Playfair Display', 'serif'], // Matches your Playfair Display import
      },
      colors: {
        // Define custom colors if you want to use specific hex values
        // that aren't part of Tailwind's default palette
        // 'custom-amber': '#c08b45',
      },
    },
  },
  plugins: [],
}
