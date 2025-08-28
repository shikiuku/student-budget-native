import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			'sans': ['"M PLUS Rounded 1c"', 'var(--font-m-plus-rounded)', 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Yu Gothic UI', 'Meiryo', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
  			'rounded': ['"M PLUS Rounded 1c"', 'var(--font-m-plus-rounded)', 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Yu Gothic UI', 'Meiryo', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
  		},
  		colors: {
  			// 落ち着いた雰囲気のカラーパレット（低彩度・高明度）
  			zaim: {
  				blue: {
  					50: '#f8fafc',
  					100: '#f1f5f9',
  					200: '#e2e8f0',
  					300: '#cbd5e1',
  					400: '#94a3b8',
  					500: '#64748b',
  					600: '#475569',
  					700: '#334155',
  					800: '#1e293b',
  					900: '#0f172a',
  				},
  				green: {
  					50: '#f0f9f0',
  					100: '#e0f2e0',
  					200: '#c6e6c6',
  					300: '#a3d3a3',
  					400: '#7db87d',
  					500: '#5a9c5a',
  					600: '#4a8a4a',
  					700: '#3d7c3d',
  					800: '#2f6b2f',
  					900: '#1f4d1f',
  				},
  				yellow: {
  					50: '#fcfcf0',
  					100: '#f9f9e0',
  					200: '#f4f4c6',
  					300: '#ebeba3',
  					400: '#dddd7d',
  					500: '#cccc5a',
  					600: '#b8b84a',
  					700: '#a3a33d',
  					800: '#8e8e2f',
  					900: '#6b6b1f',
  				},
  				red: {
  					50: '#fcf0f0',
  					100: '#f9e0e0',
  					200: '#f4c6c6',
  					300: '#eba3a3',
  					400: '#dd7d7d',
  					500: '#cc5a5a',
  					600: '#b84a4a',
  					700: '#a33d3d',
  					800: '#8e2f2f',
  					900: '#6b1f1f',
  				},
  			},
  			// カテゴリー別カラーパレット（React Native版と統一）
  			category: {
  				food: {
  					DEFAULT: '#FF6B35',
  					light: '#FFE5DC',
  					dark: '#CC5429',
  				},
  				transport: {
  					DEFAULT: '#4ECDC4',
  					light: '#E0F9F7',
  					dark: '#3BA49D',
  				},
  				entertainment: {
  					DEFAULT: '#FFD23F',
  					light: '#FFF8DC',
  					dark: '#CCA832',
  				},
  				supplies: {
  					DEFAULT: '#6A994E',
  					light: '#E8F1E4',
  					dark: '#55773E',
  				},
  				clothing: {
  					DEFAULT: '#BC4749',
  					light: '#F2DEDE',
  					dark: '#96393A',
  				},
  				other: {
  					DEFAULT: '#6B7280',
  					light: '#E5E7EB',
  					dark: '#4B5563',
  				},
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [
    require("tailwindcss-animate"),
    function({ addUtilities }: any) {
      const newUtilities = {
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#ffffff',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#f8f9fa',
            borderRadius: '3px',
            border: '1px solid #e9ecef',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#f1f3f4',
          },
        },
      }
      addUtilities(newUtilities, ['responsive', 'hover'])
    }
  ],
};
export default config;