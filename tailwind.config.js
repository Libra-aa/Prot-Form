/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1a1a1a",
        muted: "#6b6b6b",
        line: "#d6d6d6",
        accent: "#3762f0",
      },
    },
  },
  plugins: [],
};
