/* module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
// This file is used to configure PostCSS, a tool for transforming CSS with JavaScript.
// It specifies that the Tailwind CSS and Autoprefixer plugins should be used.
// Tailwind CSS is a utility-first CSS framework for creating custom designs.
 */

const config = {
  plugins: { "@tailwindcss/postcss":{} },
};

export default config;
