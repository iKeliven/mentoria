/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        blue: '#0F3468',
        orange: '#EF9735',
        grey: '#696969',
        'light-grey': '#BABABA',
        'dark-white': '#e3e4e8',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        'poppins-bold': ['Poppins-Bold', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
