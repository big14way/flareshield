/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Flare brand colors with cyberpunk twist
        flare: {
          coral: '#E62058',
          pink: '#FF3366',
          dark: '#0A0A0F',
          darker: '#050508',
        },
        cyber: {
          pink: '#FF2D92',
          blue: '#00D4FF',
          purple: '#8B5CF6',
          green: '#00FF88',
          yellow: '#FFE600',
          orange: '#FF6B35',
        },
        glass: {
          light: 'rgba(255, 255, 255, 0.05)',
          medium: 'rgba(255, 255, 255, 0.1)',
          heavy: 'rgba(255, 255, 255, 0.15)',
        }
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        body: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'cyber-grid': `
          linear-gradient(rgba(255, 45, 146, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 45, 146, 0.03) 1px, transparent 1px)
        `,
        'glow-pink': 'radial-gradient(ellipse at center, rgba(255, 45, 146, 0.15) 0%, transparent 70%)',
        'glow-blue': 'radial-gradient(ellipse at center, rgba(0, 212, 255, 0.15) 0%, transparent 70%)',
      },
      backgroundSize: {
        'grid': '50px 50px',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'scan': 'scan 2s linear infinite',
        'gradient': 'gradient 8s ease infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(255, 45, 146, 0.4)' },
          '100%': { boxShadow: '0 0 40px rgba(255, 45, 146, 0.8)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      boxShadow: {
        'neon-pink': '0 0 5px theme(colors.cyber.pink), 0 0 20px theme(colors.cyber.pink)',
        'neon-blue': '0 0 5px theme(colors.cyber.blue), 0 0 20px theme(colors.cyber.blue)',
        'neon-green': '0 0 5px theme(colors.cyber.green), 0 0 20px theme(colors.cyber.green)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.37)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
