/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#09090b", // zinc-950
                foreground: "#fafafa", // zinc-50
                primary: "#6366f1", // indigo-500
                secondary: "#a855f7", // purple-500
                accent: "#ec4899", // pink-500
                muted: "#71717a", // zinc-500
                card: "rgba(24, 24, 27, 0.6)", // zinc-900 with opacity for glass
            },
            fontFamily: {
                sans: ['Outfit', 'Inter', 'sans-serif'],
            },
            backgroundImage: {
                'hero-gradient': 'linear-gradient(to bottom right, #1e1b4b, #312e81, #4c1d95)', // dark indigo to purple
                'glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                }
            }
        },
    },
    plugins: [],
}
