/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/app/**/*.{ts,tsx}',
        './src/components/**/*.{ts,tsx}',
        './src/lib/**/*.{ts,tsx}',
    ],
    theme: {
        extend: {
            borderColor: {
                border: 'hsl(var(--border))',
            },
            backgroundColor: {
                background: 'hsl(var(--background))',
            },
            textColor: {
                foreground: 'hsl(var(--foreground))',
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
        },
    },
    plugins: [],
};
