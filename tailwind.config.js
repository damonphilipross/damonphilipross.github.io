/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./Components/**/*.{js,ts,jsx,tsx}",
    "./Container/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
    keyframes: {
      colorChange: {
        "0%": {
          filter: "hue-rotate(0deg)",
        },
        "50%": {
          filter: "hue-rotate(100deg)",
        },
        "100%": {
          filter: "hue-rotate(0deg)",
        },
        colorChangeSm: {
          "0%": {
            filter: "hue-rotate(0deg)",
          },
          "50%": {
            filter: "hue-rotate(20deg)",
          },
          "100%": {
            filter: "hue-rotate(0deg)",
          },
        },
      },
    },
    animation: {
      "backg-animation": "colorChange 6s linear infinite",
      "backg-sm-animation": "colorChange 6s linear infinite",
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
