/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.js", "./app/**/*.ts", "./app/**/*.jsx", "./app/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        inter: ["var(--font-inter)", "sans-serif"],
        manrope: ["var(--font-manrope)", "sans-serif"],
        jakarta: ["var(--font-plus-jakarta)", "sans-serif"],
        sfPro: ["SF Pro Display", "Arial", "sans-serif"],
      },
      colors: {
        primary: "#1D272F",
        secondary: "#016a70",
        body_text_1: "#919BB3",
        body_text_2: "#7E84A3",
        main_text: "#0b204c",
        form_border: "#E8EAEB",
        error: "#EF4444",
        success: "#22C55E",
        warning: "#EFA241",
        info: "#3B82F6",
        peachLight: '#ffe3d8',
        primary_text: '#595959',
        secondary_text: '#202020',
        bg_gray: '#F5F6FA',
        primary_btn: "#DED943",
        text_blue: "#131523",
        body_text: "#D7DBEC",
      },
      fontSize: {
        h1: ["96px", {
          lineHeight: "98px",
          fontWeight: "175",
        }],
        h2: ["48px", {
          lineHeight: "57.28px",
          fontWeight: "700",
        }],
        h3: ["32px", {
          lineHeight: "38.4px",
          fontWeight: "700",
        }],
        heading2: ["40px", {
          lineHeight: "55.02px",
          fontWeight: "485",
        }],
        heading7: ["18px", {
          lineHeight: "23.4px",
          fontWeight: "600",
        }],
        title_md: ["28px", {
          lineHeight: "32.87px",
          fontWeight: "700",
        }],
        title_sm: ["20px", {
          lineHeight: "26.67px",
          fontWeight: "500",
        }],
        sh: ["20px", {
          lineHeight: "23.4px",
          fontWeight: "400",
        }],
        s: ["14px", {
          lineHeight: "23.4px",
          fontWeight: "400",
        }],
        p1: ["16px", {
          lineHeight: "24px",
          fontWeight: "400",
        }],
      },
      height: {
        'calc-custom': 'calc(100% - 300px)',
      },
      boxShadow: {
        'custom': '0px 0px 16px 0px rgba(0, 0, 0, 0.03)',
        'custom-large': '0px 72px 132px 0px rgba(15, 28, 51, 0.06)',
        'ride': '0px 80px 200px -12px rgba(15, 28, 51, 0.12)',
        'ride_2': '0px 0px 0px 4px rgba(29, 39, 47, 0.20)',
        'ride-massage': '0px 80px 200px -12px rgba(15, 28, 51, 0.12)',
        'cancel': '0px 72px 132px 0px rgba(15, 28, 51, 0.06)',
        'pickup': '0px 80px 200px -12px rgba(15, 28, 51, 0.12)'
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'fade-in-right': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.7s ease-out both',
        'fade-in': 'fade-in 0.7s ease-out both',
        'fade-in-down': 'fade-in-down 0.7s ease-out both',
        'fade-in-left': 'fade-in-left 0.7s ease-out both',
        'fade-in-right': 'fade-in-right 0.7s ease-out both',
        'scale-in': 'scale-in 0.6s ease-out both',
        'float': 'float 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
