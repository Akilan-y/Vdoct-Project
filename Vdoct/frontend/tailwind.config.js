/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb', // Deep blue
        accent: '#14b8a6',  // Vibrant teal
        blush: '#fb7185',   // Warm coral
        background: '#f8fafc', // Soft off-white
        surface: '#ffffff',
        text: '#1e293b',    // Dark slate
        success: '#22c55e', // Lively green
        error: '#ef4444',   // Strong red
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'Arial', 'sans-serif'],
      },
      gridTemplateColumns:{
        'auto':'repeat(auto-fill, minmax(200px, 1fr))'
      },
    },
  },
  plugins: [],
}