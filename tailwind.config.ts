import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    /* ═══════════════════════════════════════════════════════════════════════════
       ALDENAIR DESIGN SYSTEM 2026
       Premium Perfume Brand - Quiet Luxury Aesthetic
       ═══════════════════════════════════════════════════════════════════════════ */
    
    container: {
      center: true,
      padding: {
        DEFAULT: "1.5rem",
        sm: "2rem",
        lg: "3rem",
        xl: "5rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1440px",
      },
    },
    
    /* ─────────────────────────────────────────────────────────────────────────────
       TYPOGRAPHY
       ───────────────────────────────────────────────────────────────────────────── */
    fontFamily: {
      sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      display: ["Playfair Display", "Georgia", "Times New Roman", "serif"],
      mono: ["JetBrains Mono", "Fira Code", "monospace"],
    },
    
    fontSize: {
      // Body Scale
      "2xs": ["0.625rem", { lineHeight: "1rem" }],      // 10px
      xs: ["0.75rem", { lineHeight: "1rem" }],          // 12px
      sm: ["0.875rem", { lineHeight: "1.25rem" }],      // 14px
      base: ["1rem", { lineHeight: "1.625rem" }],       // 16px
      lg: ["1.125rem", { lineHeight: "1.75rem" }],      // 18px
      xl: ["1.25rem", { lineHeight: "1.875rem" }],      // 20px
      
      // Heading Scale
      "2xl": ["1.5rem", { lineHeight: "2rem", letterSpacing: "-0.01em" }],           // 24px
      "3xl": ["1.875rem", { lineHeight: "2.25rem", letterSpacing: "-0.015em" }],     // 30px
      "4xl": ["2.25rem", { lineHeight: "2.5rem", letterSpacing: "-0.02em" }],        // 36px
      "5xl": ["3rem", { lineHeight: "3.25rem", letterSpacing: "-0.02em" }],          // 48px
      "6xl": ["3.75rem", { lineHeight: "4rem", letterSpacing: "-0.025em" }],         // 60px
      "7xl": ["4.5rem", { lineHeight: "4.75rem", letterSpacing: "-0.025em" }],       // 72px
      "8xl": ["6rem", { lineHeight: "6.25rem", letterSpacing: "-0.03em" }],          // 96px
      "9xl": ["8rem", { lineHeight: "8.25rem", letterSpacing: "-0.03em" }],          // 128px
    },
    
    letterSpacing: {
      tighter: "-0.03em",
      tight: "-0.02em",
      normal: "0em",
      wide: "0.025em",
      wider: "0.05em",
      widest: "0.15em",
    },
    
    extend: {
      /* ─────────────────────────────────────────────────────────────────────────────
         SPACING (8pt Grid System)
         ───────────────────────────────────────────────────────────────────────────── */
      spacing: {
        "4.5": "1.125rem",   // 18px
        "13": "3.25rem",     // 52px
        "15": "3.75rem",     // 60px
        "18": "4.5rem",      // 72px
        "22": "5.5rem",      // 88px
        "26": "6.5rem",      // 104px
        "30": "7.5rem",      // 120px
        "34": "8.5rem",      // 136px
        "38": "9.5rem",      // 152px
        "42": "10.5rem",     // 168px
        "50": "12.5rem",     // 200px
        "58": "14.5rem",     // 232px
        "66": "16.5rem",     // 264px
        "74": "18.5rem",     // 296px
        "82": "20.5rem",     // 328px
        "90": "22.5rem",     // 360px
      },
      
      /* ─────────────────────────────────────────────────────────────────────────────
         COLORS
         ───────────────────────────────────────────────────────────────────────────── */
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        
        // Brand Colors
        brand: {
          gold: "hsl(var(--brand-gold))",
          "gold-light": "hsl(var(--brand-gold-light))",
          sand: "hsl(var(--brand-sand))",
          charcoal: "hsl(var(--brand-charcoal))",
          cream: "hsl(var(--brand-cream))",
          black: "hsl(var(--brand-black))",
          white: "hsl(var(--brand-white))",
        },
        
        // Sidebar
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      
      /* ─────────────────────────────────────────────────────────────────────────────
         BORDER RADIUS (Sharp, Premium - 0px)
         ───────────────────────────────────────────────────────────────────────────── */
      borderRadius: {
        none: "0px",
        sm: "0px",
        DEFAULT: "0px",
        md: "0px",
        lg: "0px",
        xl: "0px",
        "2xl": "0px",
        "3xl": "0px",
        full: "9999px",
      },
      
      /* ─────────────────────────────────────────────────────────────────────────────
         BOX SHADOW
         ───────────────────────────────────────────────────────────────────────────── */
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow-md)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        accent: "var(--shadow-accent)",
        none: "none",
      },
      
      /* ─────────────────────────────────────────────────────────────────────────────
         TRANSITIONS
         ───────────────────────────────────────────────────────────────────────────── */
      transitionDuration: {
        "0": "0ms",
        "150": "150ms",
        "200": "200ms",
        "300": "300ms",
        "400": "400ms",
        "500": "500ms",
        "700": "700ms",
        "1000": "1000ms",
      },
      
      transitionTimingFunction: {
        "ease-smooth": "cubic-bezier(0.16, 1, 0.3, 1)",
        "ease-premium": "cubic-bezier(0.4, 0, 0.2, 1)",
        "ease-out-expo": "cubic-bezier(0.19, 1, 0.22, 1)",
      },
      
      /* ─────────────────────────────────────────────────────────────────────────────
         ANIMATIONS
         ───────────────────────────────────────────────────────────────────────────── */
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-down": {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "fade-up": "fade-up 0.6s ease-out forwards",
        "fade-down": "fade-down 0.6s ease-out forwards",
        "slide-in-left": "slide-in-left 0.5s ease-out forwards",
        "slide-in-right": "slide-in-right 0.5s ease-out forwards",
        "scale-in": "scale-in 0.4s ease-out forwards",
        "spin-slow": "spin-slow 3s linear infinite",
        shimmer: "shimmer 2s linear infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      
      /* ─────────────────────────────────────────────────────────────────────────────
         ASPECT RATIO
         ───────────────────────────────────────────────────────────────────────────── */
      aspectRatio: {
        product: "3 / 4",
        hero: "16 / 9",
        card: "4 / 5",
        square: "1 / 1",
        portrait: "2 / 3",
        landscape: "3 / 2",
      },
      
      /* ─────────────────────────────────────────────────────────────────────────────
         Z-INDEX
         ───────────────────────────────────────────────────────────────────────────── */
      zIndex: {
        "60": "60",
        "70": "70",
        "80": "80",
        "90": "90",
        "100": "100",
      },
      
      /* ─────────────────────────────────────────────────────────────────────────────
         GRID
         ───────────────────────────────────────────────────────────────────────────── */
      gridTemplateColumns: {
        "13": "repeat(13, minmax(0, 1fr))",
        "14": "repeat(14, minmax(0, 1fr))",
        "15": "repeat(15, minmax(0, 1fr))",
        "16": "repeat(16, minmax(0, 1fr))",
        // Auto-fill patterns
        "auto-fit-sm": "repeat(auto-fit, minmax(200px, 1fr))",
        "auto-fit-md": "repeat(auto-fit, minmax(280px, 1fr))",
        "auto-fit-lg": "repeat(auto-fit, minmax(320px, 1fr))",
      },
      
      /* ─────────────────────────────────────────────────────────────────────────────
         SCREEN BREAKPOINTS
         ───────────────────────────────────────────────────────────────────────────── */
      screens: {
        "xs": "475px",
        "3xl": "1920px",
      },
      
      /* ─────────────────────────────────────────────────────────────────────────────
         MAX WIDTH
         ───────────────────────────────────────────────────────────────────────────── */
      maxWidth: {
        "8xl": "88rem",
        "9xl": "96rem",
        "10xl": "104rem",
      },
      
      /* ─────────────────────────────────────────────────────────────────────────────
         BACKDROP BLUR
         ───────────────────────────────────────────────────────────────────────────── */
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
