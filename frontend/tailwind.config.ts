import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        shield: {
          50: "#eef4ff",
          100: "#d9e6ff",
          500: "#3b6fd9",
          600: "#2a56b8",
          700: "#1f4394",
          900: "#142952",
        },
      },
    },
  },
  plugins: [],
};
export default config;
