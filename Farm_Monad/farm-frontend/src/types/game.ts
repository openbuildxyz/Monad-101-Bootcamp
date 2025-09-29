// 游戏核心类型定义

export enum CropType {
  Wheat = 0,      // 小麦 - 60分钟
  Corn = 1,       // 玉米 - 90分钟
  Pumpkin = 2,    // 南瓜 - 120分钟
  Strawberry = 3, // 草莓 - 75分钟 (稀有)
  Grape = 4,      // 葡萄 - 100分钟 (稀有)
  Watermelon = 5  // 西瓜 - 110分钟 (稀有)
}

export enum LandState {
  Idle = 0,       // 空闲
  Growing = 1,    // 成长中
  Ripe = 2,       // 成熟
  Stealing = 3,   // 偷菜中
  LockedIdle = 4  // 冷却中
}

export enum GrowthStage {
  Seed = 0,       // 种子
  Growing = 1,    // 成长中
  Mature = 2      // 成熟
}

export enum Rarity {
  Common = 0,     // 普通
  Rare = 1        // 稀有
}

export enum BoosterType {
  Watering = 0,    // 浇水
  Fertilizing = 1  // 施肥
}

export enum WeatherType {
  Sunny = 0,      // ☀️ 晴天 +20%
  Rainy = 1,      // 🌧️ 雨天 +20%
  Storm = 2,      // ⛈️ 暴风雨 暂停5分钟
  Cloudy = 3      // ☁️ 阴天 -10%
}

// 土地信息接口
export interface LandInfo {
  state: LandState
  seedTokenId: bigint
  claimTime: bigint
  lockEndTime: bigint
  weatherSeed: bigint
  lastWeatherUpdateTime: bigint
  accumulatedGrowth: bigint
  currentFarmer: `0x${string}`
}

// 种子信息接口
export interface SeedInfo {
  cropType: CropType
  rarity: Rarity
  growthStage: GrowthStage
  growthStartTime: bigint
  baseGrowthTime: bigint
  maturedAt: bigint
  boostersApplied: number
}

// 玩家统计接口
export interface PlayerStats {
  totalCropsHarvested: bigint
  totalCropsStolen: bigint
  totalHelpProvided: bigint
}

// 种子价格接口
export interface SeedPrice {
  nativePrice: bigint
  kindPrice: bigint
  availableForNative: boolean
  availableForKind: boolean
}

// 道具价格接口
export interface BoosterPrice {
  nativePrice: bigint
  kindPrice: bigint
  availableForNative: boolean
  availableForKind: boolean
}

// 天气信息接口
export interface WeatherInfo {
  landId: number
  weatherType: WeatherType
  effectMultiplier: number
  iconEmoji: string
  description: string
}

// 排行榜条目接口
export interface LeaderboardEntry {
  address: `0x${string}`
  score: number
  rank: number
  kindBalance?: bigint
  cropsHarvested?: number
  cropsStolen?: number
  helpProvided?: number
}

// 游戏操作接口
export interface GameAction {
  type: 'plant' | 'harvest' | 'steal' | 'boost' | 'help'
  landId?: number
  cropType?: CropType
  boosterType?: BoosterType
  payWithKind?: boolean
}

// NFT 元数据接口
export interface NFTMetadata {
  tokenId: bigint
  name: string
  description: string
  image: string
  attributes: Array<{
    trait_type: string
    value: string | number
  }>
}

// 交易状态接口
export interface TransactionStatus {
  hash?: `0x${string}`
  status: 'idle' | 'pending' | 'success' | 'error'
  error?: string
}

// 游戏配置常量
export const GAME_CONSTANTS = {
  DAILY_HELP_LIMIT: 15,
  MAX_BOOSTERS_PER_CROP: 10,
  WATERING_TIME_REDUCTION: 120, // 2 minutes in seconds
  FERTILIZING_PERCENTAGE_REDUCTION: 5,
  WEATHER_SEGMENT_DURATION: 900, // 15 minutes in seconds
  LAND_COOLDOWN: 300, // 5 minutes in seconds
  TOTAL_LANDS: 100,
  GRID_SIZE: 10,
} as const

// 作物配置
export const CROP_CONFIG = {
  [CropType.Wheat]: {
    name: '小麦',
    emoji: '🌾',
    baseGrowthTime: 3600, // 60 minutes
    rarity: Rarity.Common,
    nativePrice: BigInt('1000000000000000'), // 0.001 ETH
  },
  [CropType.Corn]: {
    name: '玉米',
    emoji: '🌽',
    baseGrowthTime: 5400, // 90 minutes
    rarity: Rarity.Common,
    nativePrice: BigInt('1500000000000000'), // 0.0015 ETH
  },
  [CropType.Pumpkin]: {
    name: '南瓜',
    emoji: '🎃',
    baseGrowthTime: 7200, // 120 minutes
    rarity: Rarity.Common,
    nativePrice: BigInt('2000000000000000'), // 0.002 ETH
  },
  [CropType.Strawberry]: {
    name: '草莓',
    emoji: '🍓',
    baseGrowthTime: 4500, // 75 minutes
    rarity: Rarity.Rare,
    kindPrice: BigInt('10000000000000000000'), // 10 KIND
  },
  [CropType.Grape]: {
    name: '葡萄',
    emoji: '🍇',
    baseGrowthTime: 6000, // 100 minutes
    rarity: Rarity.Rare,
    kindPrice: BigInt('15000000000000000000'), // 15 KIND
  },
  [CropType.Watermelon]: {
    name: '西瓜',
    emoji: '🍉',
    baseGrowthTime: 6600, // 110 minutes
    rarity: Rarity.Rare,
    kindPrice: BigInt('20000000000000000000'), // 20 KIND
  },
} as const

// 天气配置
export const WEATHER_CONFIG = {
  [WeatherType.Sunny]: {
    name: '晴天',
    emoji: '☀️',
    effectMultiplier: 1.2,
    description: '阳光充足，作物成长速度 +20%',
    color: '#fbbf24'
  },
  [WeatherType.Rainy]: {
    name: '雨天',
    emoji: '🌧️',
    effectMultiplier: 1.2,
    description: '雨水滋润，作物成长速度 +20%',
    color: '#3b82f6'
  },
  [WeatherType.Storm]: {
    name: '暴风雨',
    emoji: '⛈️',
    effectMultiplier: 0,
    description: '恶劣天气，作物暂停成长 5 分钟',
    color: '#7c3aed'
  },
  [WeatherType.Cloudy]: {
    name: '阴天',
    emoji: '☁️',
    effectMultiplier: 0.9,
    description: '光照不足，作物成长速度 -10%',
    color: '#6b7280'
  },
} as const