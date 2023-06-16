module.exports = {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  presets: [require("@digitalservice4germany/style-dictionary/tailwind")],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "BundesSansWeb",
          "Calibri",
          "Verdana",
          "Arial",
          "Helvetica",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@digitalservice4germany/angie"),
  ],
};
