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
                    DEFAULT: '#8E2DE2',
                    dark: '#4A00E0',
                    light: '#a855f7',
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
                background: {
                    dark: '#191022',
                    light: '#f7f6f8',
                },
            },
            backgroundImage: {
                'gradient-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                'gradient-purple': 'linear-gradient(135deg, #4A00E0 0%, #8E2DE2 100%)',
                'gradient-dark': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                'gradient-pink': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                'gradient-animated': 'linear-gradient(-45deg, #4A00E0, #8E2DE2, #191022, #4A00E0)',
                'gradient-radial': 'radial-gradient(circle, var(--tw-gradient-stops))',
            },
            fontFamily: {
                sans: ['var(--font-inter-tight)', 'Inter', 'system-ui', 'sans-serif'],
                display: ['var(--font-inter-tight)', 'Manrope', 'sans-serif'],
                inter: ['var(--font-inter)', 'sans-serif'],
            },
            animation: {
                'gradient': 'gradient 15s ease infinite',
            },
            keyframes: {
                gradient: {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
            },
        },
    },
    plugins: [],
    darkMode: 'class',
}
