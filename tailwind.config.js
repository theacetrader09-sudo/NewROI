/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Your existing dark theme colors
                primary: {
                    DEFAULT: '#121212',
                    dark: '#0a0a0a',
                    light: '#1e1e1e',
                },
                secondary: {
                    DEFAULT: '#1a1a2e',
                    light: '#252541',
                },
                accent: {
                    blue: '#667eea',
                    purple: '#764ba2',
                    green: '#10b981',
                    gold: '#f59e0b',
                    red: '#ef4444',
                },
                glass: {
                    border: 'rgba(255, 255, 255, 0.1)',
                    bg: 'rgba(255, 255, 255, 0.05)',
                },
            },
            backgroundImage: {
                'gradient-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                'gradient-dark': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                'gradient-pink': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
    darkMode: 'class', // Enable dark mode with class strategy
}
