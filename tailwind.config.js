/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Semantic surface (mapped to shadcn primitives)
        background: '#FFFFFF', // canvas
        foreground: '#001E2B', // ink
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#001E2B',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#001E2B',
        },
        primary: {
          DEFAULT: '#00ED64', // brand-green
          foreground: '#001E2B', // on-primary
        },
        'primary-pressed': '#00A35C',
        secondary: {
          DEFAULT: '#F9FBFA',
          foreground: '#001E2B',
        },
        accent: {
          DEFAULT: '#E3FCF7', // brand-green-soft
          foreground: '#00684A', // brand-green-dark
        },
        destructive: {
          DEFAULT: '#DB3030',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#F9FBFA', // surface
          foreground: '#5C6C75', // steel
        },
        border: '#E8EDEB', // hairline
        input: '#C1C7C6', // hairline-strong
        ring: '#00684A', // brand-green-dark

        // Brand & accent (DESIGN.md tokens)
        brand: {
          green: {
            DEFAULT: '#00ED64',
            dark: '#00684A',
            mid: '#00A35C',
            soft: '#E3FCF7',
          },
          teal: {
            deep: '#001E2B',
            DEFAULT: '#023430',
            mid: '#112733',
          },
        },
        category: {
          purple: '#5E0C9E',
          orange: '#E0662A',
          pink: '#E8618C',
          blue: '#016BF8',
        },

        // Surface
        canvas: {
          DEFAULT: '#FFFFFF',
          dark: '#001E2B',
        },
        surface: {
          DEFAULT: '#F9FBFA',
          soft: '#E8EDEB',
          feature: '#E3FCF7',
        },
        hairline: {
          DEFAULT: '#E8EDEB',
          soft: '#F1F5F4',
          strong: '#C1C7C6',
          dark: '#1C2D38',
        },

        // Text
        ink: {
          DEFAULT: '#001E2B',
          charcoal: '#112733',
          slate: '#3D4F58',
          steel: '#5C6C75',
          stone: '#889397',
        },
        'on-dark': '#FFFFFF',
        'on-dark-muted': '#C1C7C6',

        // Semantic
        warning: {
          DEFAULT: '#944F01',
          bg: '#FEF7DB',
        },
        success: '#00684A',
      },
      fontFamily: {
        sans: [
          'Euclid Circular A',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: ['Source Code Pro', 'SF Mono', 'Menlo', 'Consolas', 'monospace'],
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        full: '9999px',
      },
      boxShadow: {
        sm: 'rgba(0, 30, 43, 0.04) 0px 1px 2px 0px',
        DEFAULT: 'rgba(0, 30, 43, 0.08) 0px 4px 12px 0px',
        md: 'rgba(0, 30, 43, 0.12) 0px 12px 24px -4px',
        lg: 'rgba(0, 30, 43, 0.16) 0px 16px 48px -8px',
      },
      spacing: {
        xxs: '4px',
        xs: '8px',
        sm: '12px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '40px',
        section: '64px',
        'section-lg': '96px',
        hero: '120px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
