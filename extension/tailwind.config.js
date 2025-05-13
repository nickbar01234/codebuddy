import tailwindCssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}"],

  theme: {
    extend: {
      animation: {
        ripple: "ripple var(--duration,2s) ease calc(var(--i, 0)*.2s) infinite",
      },
      keyframes: {
        ripple: {
          "0%, 100%": {
            transform: "translate(-50%, -50%) scale(1)",
          },
          "50%": {
            transform: "translate(-50%, -50%) scale(0.9)",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      textColor: {
        DEFAULT: "var(--text-primary)", // #1A1A1AFF & #F5F5F5FF
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)", // #0000008C & #FFFFFF99
        tertiary: "var(--text-tertiary)", // #00000057 & #FFFFFF66
        other: "var(--color-text-other)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
        leetcode: {
          hard: "var(--difficulty-hard)",
          medium: "var(--difficulty-medium)",
          easy: "var(--difficulty-easy)",
          bg: "var(--color-tabset-background)", // #FFFFFFFF & #282828FF
          nav: "var(--color-tabset-tabbar-background)", // #00000005 & #303030FF
        },
        codebuddy: {
          pink: "var(--color-pink)",
          red: "var(--color-red)",
          green: "var(--color-green)",
          blue: "var(--color-blue)",
          orange: "var(--brand-orange)", // #FFA116FF & #FFA116FF
        },
        message: {
          success: "var(--message-success)", // #01B328FF & #28C244FF
          danger: "var(--message-danger)", // #F63636FF & #F8615CFF
        },
      },
    },
  },
  plugins: [tailwindCssAnimate],
};
