/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        pop: {
          "0%": { scale: "0" },
          "50%": { scale: "1.2" },
          "100%": { scale: "1" },
        },
      },
      animation: {
        pop: "pop 0.3s ease-in-out",
      },
    },
  },
  plugins: [],
};
