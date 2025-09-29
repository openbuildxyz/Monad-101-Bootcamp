// 应用全局类型定义
import { ReactNode } from 'react'
import { Address } from 'viem'
import { LandInfo, SeedInfo, PlayerStats, WeatherInfo, LeaderboardEntry } from './game'

// 用户状态接口
export interface User {
  address: Address | undefined
  isConnected: boolean
  monadBalance: bigint
  kindBalance: bigint
  chainId: number | undefined
}

// 全局应用状态
export interface AppState {
  // 用户信息
  user: User

  // 农场数据
  farm: {
    lands: Record<number, LandInfo>
    userOwnedLands: number[]
    totalLands: number
    weather: Record<number, WeatherInfo>
  }

  // 个人数据
  personal: {
    ownedSeeds: Record<string, SeedInfo>
    stats: PlayerStats | null
    remainingDailyHelps: number
    purchaseHistory: PurchaseRecord[]
  }

  // 排行榜数据
  leaderboard: {
    cropRanking: LeaderboardEntry[]
    kindnessRanking: LeaderboardEntry[]
    lastUpdated: number
  }

  // UI 状态
  ui: {
    selectedLandId: number | null
    activeModal: ModalType | null
    notifications: Notification[]
    loading: Record<string, boolean>
  }
}

// 模态框类型
export type ModalType =
  | 'connect-wallet'
  | 'land-details'
  | 'seed-selection'
  | 'purchase-confirmation'
  | 'transaction-status'
  | 'help-others'
  | 'profile-settings'

// 通知类型
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: number
  autoClose?: boolean
}

// 购买记录
export interface PurchaseRecord {
  id: string
  timestamp: number
  cropType: number
  tokenId: bigint
  price: bigint
  paymentMethod: 'native' | 'kind'
  transactionHash: `0x${string}`
}

// 页面路由类型
export type PageRoute =
  | '/'           // 农场主页
  | '/shop'       // 商店
  | '/leaderboard' // 排行榜
  | '/profile'    // 个人页面

// 组件 Props 基础类型
export interface BaseProps {
  children?: ReactNode
  className?: string
}

// 按钮变体类型
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'ghost'

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

// 加载状态枚举
export enum LoadingState {
  Idle = 'idle',
  Loading = 'loading',
  Success = 'success',
  Error = 'error'
}

// API 响应包装类型
export interface ApiResponse<T> {
  data?: T
  error?: string
  loading: boolean
  refetch?: () => void
}

// 分页接口
export interface Pagination {
  page: number
  pageSize: number
  total: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

// 过滤器类型
export interface Filter {
  cropType?: number[]
  rarity?: number[]
  state?: number[]
  owner?: Address
}

// 排序类型
export interface Sort {
  field: string
  direction: 'asc' | 'desc'
}

// 统计数据类型
export interface Statistics {
  totalLands: number
  activeFarmers: number
  totalHarvests: number
  totalKindDistributed: bigint
  averageGrowthTime: number
  topCrop: {
    type: number
    count: number
  }
}

// 游戏事件日志
export interface GameEventLog {
  id: string
  type: 'land_claimed' | 'crop_harvested' | 'crop_stolen' | 'help_provided' | 'seed_purchased'
  player: Address
  landId?: number
  cropType?: number
  timestamp: number
  blockNumber: bigint
  transactionHash: `0x${string}`
  data?: Record<string, unknown>
}

// 主题配置
export interface Theme {
  colors: {
    primary: string
    secondary: string
    success: string
    warning: string
    error: string
    info: string
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }
  borderRadius: {
    sm: string
    md: string
    lg: string
  }
}

// 环境配置类型
export interface Config {
  isDevelopment: boolean
  apiUrl: string
  contractAddresses: typeof import('./contracts').CONTRACTS
  network: typeof import('./contracts').MONAD_TESTNET
  features: {
    enableNotifications: boolean
    enableAnalytics: boolean
    enableDebugMode: boolean
  }
}