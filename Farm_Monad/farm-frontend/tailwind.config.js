/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 主色调 - 自然绿色系
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e', // 生机绿
          600: '#16a34a', // 深绿
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // 状态色彩
        land: {
          idle: '#6b7280',     // 空闲灰
          growing: '#22c55e',  // 成长绿
          ripe: '#f59e0b',     // 成熟金
          locked: '#ef4444',   // 冷却红
          stealing: '#dc2626', // 偷菜红
        },
        // 稀有度色彩
        rarity: {
          common: '#6b7280',    // 普通灰
          rare: '#3b82f6',      // 稀有蓝
          legendary: '#a855f7', // 传说紫
        },
        // 天气色彩
        weather: {
          sunny: '#fbbf24',     // 晴天黄
          rainy: '#3b82f6',     // 雨天蓝
          storm: '#7c3aed',     // 暴风紫
          cloudy: '#6b7280',    // 阴天灰
        }
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'grow': 'grow 0.3s ease-in-out',
        'shake': 'shake 0.5s ease-in-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        grow: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.05)' }
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' }
        },
        glow: {
          '0%': {
            boxShadow: '0 0 5px rgba(34, 197, 94, 0.2), 0 0 10px rgba(34, 197, 94, 0.2), 0 0 15px rgba(34, 197, 94, 0.2)',
          },
          '100%': {
            boxShadow: '0 0 10px rgba(34, 197, 94, 0.4), 0 0 20px rgba(34, 197, 94, 0.4), 0 0 30px rgba(34, 197, 94, 0.4)',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'farm-pattern': "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%2322c55e\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
      },
      boxShadow: {
        'inner-lg': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.1)',
        'glow-sm': '0 0 10px rgba(34, 197, 94, 0.3)',
        'glow-md': '0 0 20px rgba(34, 197, 94, 0.4)',
        'glow-lg': '0 0 30px rgba(34, 197, 94, 0.5)',
      }
    },
  },
  plugins: [],
}