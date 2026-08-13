/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: "#FAF6ED",
        cream: "#F3ECDC",
        olive: {
          DEFAULT: "#2F3B26",
          light: "#4A5A3A",
          dark: "#1D2517",
        },
        sage: "#8A9678",
        gold: {
          DEFAULT: "#C6A15B",
          light: "#E4C989",
          dark: "#9C7A3C",
        },
        charcoal: "#211F1A",
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #E4C989 0%, #C6A15B 45%, #9C7A3C 100%)",
      },
      boxShadow: {
        card: "0 10px 30px -12px rgba(47,59,38,0.18)",
        gold: "0 8px 24px -8px rgba(198,161,91,0.45)",
      },
      borderRadius: {
        arch: "9999px 9999px 0 0",
      },
    },
  },
  plugins: [],
};
