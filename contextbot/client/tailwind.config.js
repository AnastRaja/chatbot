/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#059669', // emerald-600
                secondary: '#047857', // emerald-700
                dark: '#111827', // gray-900
            }
        },
    },
    plugins: [],
}
