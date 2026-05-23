/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  safelist: [
    {
      pattern: /^(bg|border|text|ring)-(yellow|blue|green|red|purple|pink|orange|slate|emerald|indigo|teal|rose)-(50|100|200|300|400|500|600|700|800|900)(\/[0-9]{2})?$/,
      variants: ['dark'],
    },
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
