/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
        colors:{
          'light-bg': {
              1: '#D6CEC6',  // Slightly darker than your current 1
              2: '#E0D8D1',  // Between current 1 and new 1
              3: '#E8E2DB',  // Your original 1
              4: '#EFE9E3',  // Between 1 and 2
              5: '#F5F1ED',  // Your original 2
              6: '#F6F4F1',  // Between 2 and 3
              7: '#F8F7FC',  // Your original 3
              8: '#FBFAFD',  // Even lighter
              9: '#FDFDFE',  // Near white
            },
          'text-color':'#4A4A4A',
          'main-color':'#8B5A7C',
          'comp-color': '#2C2B2A'      }
    }
  },
  plugins: [],
}


