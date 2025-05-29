import tailwindCssAnimate from "tailwindcss-animate";

// - change primary to bg-primary
// - write doc
// - write eslint config not to use --text-primary...

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
      colors: {
        background: {
          DEFAULT: "var(--background)",
          primary: "var(--primary-background)",
          secondary: "var(--secondary-background)",
        },
        foreground: {
          DEFAULT: "var(--foreground)",
          primary: "var(--primary-foreground)",
          secondary: "var(--secondary-foreground)",
          tertiary: "var(--tertiary-foreground)",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "var(--primary-background)",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "var(--secondary-background)",
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
        success: {
          DEFAULT: "var(--success)",
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
          hard: "var(--color-lc-hard)",
          medium: "var(--color-lc-medium)",
          easy: "var(--color-lc-easy)",
          bg: "var(--color-lc-bg)",
          nav: "var(--color-lc-nav)",
        },
        codebuddy: {
          pink: "var(--color-pink)",
          red: "var(--color-red)",
          green: "var(--color-green)",
          blue: "var(--color-blue)",
          orange: "var(--color-orange)",
        },
        message: {
          success: "var(--message-success)",
          danger: "var(--message-danger)",
        },
      },
    },
  },
  plugins: [tailwindCssAnimate],
};
