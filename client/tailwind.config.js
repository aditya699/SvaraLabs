/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FAF7F2",
        brown: {
          DEFAULT: "#2D2016",
          muted: "#8B7355",
          accent: "#3D2415",
          hover: "#5A3A25",
        },
        gold: "#C4956A",
        card: "#FFFFFF",
        border: "#E8E0D4",
      },
      fontFamily: {
        serif: ['"Instrument Serif"', "Georgia", "serif"],
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(45, 32, 22, 0.06), 0 1px 2px -1px rgba(45, 32, 22, 0.06)",
        "card-hover":
          "0 10px 25px -5px rgba(45, 32, 22, 0.08), 0 8px 10px -6px rgba(45, 32, 22, 0.04)",
        nav: "0 2px 16px 0 rgba(45, 32, 22, 0.06)",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-delayed": "float 8s ease-in-out 2s infinite",
        "float-slow": "float 10s ease-in-out 4s infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
      },
    },
  },
  plugins: [],
};
