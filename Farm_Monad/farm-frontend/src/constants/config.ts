// 应用配置常量
import { CONTRACTS, MONAD_TESTNET } from '@/types/contracts'

// 环境配置
export const APP_CONFIG = {
  name: 'Farm 3.0',
  description: 'Blockchain Farming Game on Monad',
  version: '1.0.0',
  isDevelopment: false, // 生产环境
  isProduction: true,   // 生产环境
} as const

// 网络配置
export const NETWORK_CONFIG = {
  chain: MONAD_TESTNET,
  contracts: CONTRACTS,
  blockExplorer: 'https://testnet-explorer.monad.xyz',
  rpcUrl: 'https://testnet-rpc.monad.xyz',
} as const

// UI 配置
export const UI_CONFIG = {
  // 主题配置
  theme: {
    defaultMode: 'light' as const,
    colors: {
      primary: '#22c55e',
      secondary: '#16a34a',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
  },

  // 动画配置
  animation: {
    duration: {
      fast: 200,
      normal: 300,
      slow: 500,
    },
    easing: {
      default: 'ease-in-out',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },

  // 布局配置
  layout: {
    maxWidth: '1440px',
    sidebarWidth: '280px',
    headerHeight: '64px',
    footerHeight: '48px',
  },

  // 分页配置
  pagination: {
    defaultPageSize: 20,
    pageSizes: [10, 20, 50, 100],
  },

  // 通知配置
  notification: {
    position: 'top-right' as const,
    duration: 4000,
    maxVisible: 3,
  },
} as const

// 游戏配置
export const GAME_CONFIG = {
  // 土地配置
  land: {
    total: 100,
    gridSize: 10,
    cooldownTime: 300, // 5 minutes
  },

  // 作物配置
  crops: {
    maxBoostersPerCrop: 10,
    baseGrowthRequirement: 3600, // 需要3600点成长值
  },

  // 道具配置
  boosters: {
    watering: {
      timeReduction: 120, // 2 minutes
      name: '浇水',
      emoji: '💧',
    },
    fertilizing: {
      percentageReduction: 5, // 5%
      name: '施肥',
      emoji: '🌱',
    },
  },

  // 天气配置
  weather: {
    segmentDuration: 900, // 15 minutes
    effects: {
      sunny: { multiplier: 1.2, emoji: '☀️' },
      rainy: { multiplier: 1.2, emoji: '🌧️' },
      storm: { multiplier: 0, emoji: '⛈️' },
      cloudy: { multiplier: 0.9, emoji: '☁️' },
    },
  },

  // 帮助系统
  help: {
    dailyLimit: 15,
    kindReward: '1000000000000000000', // 1 KIND
  },

  // 更新间隔
  updateIntervals: {
    landStatus: 30000, // 30 seconds
    userBalance: 10000, // 10 seconds
    leaderboard: 60000, // 1 minute
    events: 5000, // 5 seconds
  },
} as const

// API 配置
export const API_CONFIG = {
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000,
  endpoints: {
    metadata: '/api/metadata',
    stats: '/api/stats',
    leaderboard: '/api/leaderboard',
  },
} as const

// 本地存储键名
export const STORAGE_KEYS = {
  theme: 'farm_theme',
  language: 'farm_language',
  notifications: 'farm_notifications',
  userPreferences: 'farm_user_preferences',
  gameState: 'farm_game_state',
  walletConnection: 'farm_wallet_connection',
} as const

// 错误消息
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: '请先连接钱包',
  NETWORK_ERROR: '网络连接错误',
  TRANSACTION_FAILED: '交易失败',
  INSUFFICIENT_BALANCE: '余额不足',
  CONTRACT_ERROR: '合约调用错误',
  UNKNOWN_ERROR: '未知错误',
  TIMEOUT_ERROR: '请求超时',
  PERMISSION_DENIED: '权限不足',
} as const

// 成功消息
export const SUCCESS_MESSAGES = {
  WALLET_CONNECTED: '钱包连接成功',
  TRANSACTION_SUCCESS: '交易成功',
  SEED_PURCHASED: '种子购买成功',
  CROP_PLANTED: '种子种植成功',
  CROP_HARVESTED: '作物收获成功',
  HELP_PROVIDED: '帮助他人成功',
  BOOSTER_APPLIED: '道具使用成功',
} as const

// 特性开关
export const FEATURE_FLAGS = {
  enableAnalytics: false,
  enableNotifications: true,
  enableDebugMode: APP_CONFIG.isDevelopment,
  enableExperimentalFeatures: false,
  enableOfflineMode: false,
} as const

// 外部链接
export const EXTERNAL_LINKS = {
  monadWebsite: 'https://monad.xyz',
  monadExplorer: 'https://testnet-explorer.monad.xyz',
  documentation: 'https://docs.farm3.xyz',
  github: 'https://github.com/farm3-xyz',
  twitter: 'https://twitter.com/farm3xyz',
  discord: 'https://discord.gg/farm3xyz',
} as const

// 资源路径
export const ASSET_PATHS = {
  images: '/images',
  icons: '/icons',
  sounds: '/sounds',
  fonts: '/fonts',
  logos: {
    main: '/images/farm-logo.svg',
    favicon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
} as const