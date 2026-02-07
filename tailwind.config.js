/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./*.{js,ts,jsx,tsx}",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}"
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: '#FF2E2E',
                secondary: '#6B6B6B',
                dark: '#0B0B0E',
                'dark-soft': '#16161a', // Keeping soft dark for contrast
                'dark-card': '#1f1f23'
            },
            fontFamily: {
                sans: ['Oswald', 'sans-serif'], // Default for "other sections" (Druk Condensed alt)
                wide: ['Syncopate', 'sans-serif'], // Hero (Druk Wide alt)
                mono: ['JetBrains Mono', 'monospace']
            }
        }
    },
    plugins: [],
}
