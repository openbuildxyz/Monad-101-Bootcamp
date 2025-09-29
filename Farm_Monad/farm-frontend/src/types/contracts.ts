// 合约相关类型定义
import { Address } from 'viem'

// 合约地址配置 - 最新测试部署地址 (2025-09-29)
export const CONTRACTS = {
  FarmGame: "0xF2865b5E17A2F8D777E25Bc3ab6F4fEd06651966" as Address,
  SeedNFT: "0x40f21aF2a179395240E420294E1fC7d5cd82D2c5" as Address,
  LandNFT: "0x7CD168C9D36690f355281Ed7fe42c6a86d5D3af8" as Address,
  KindnessToken: "0x7310445E157bAf6588C373E067518af671DD00f3" as Address,
  Shop: "0xAfd9617bfa6Ed797314200B98B606F5b22E24f07" as Address
} as const

// Monad 测试网配置
export const MONAD_TESTNET = {
  id: 10143 as const,
  name: 'Monad Testnet',
  network: 'monad-testnet',
  nativeCurrency: {
    name: 'Monad',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.monad.xyz'],
    },
    public: {
      http: ['https://testnet-rpc.monad.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Monad Explorer',
      url: 'https://testnet-explorer.monad.xyz',
    },
  },
  testnet: true,
} as const

// 合约事件类型
export interface ContractEvent {
  blockNumber: bigint
  blockHash: `0x${string}`
  transactionHash: `0x${string}`
  address: Address
  topics: `0x${string}`[]
  data: `0x${string}`
}

// FarmGame 合约事件
export interface LandClaimedEvent extends ContractEvent {
  args: {
    player: Address
    landId: bigint
    tokenId: bigint
  }
}

export interface CropHarvestedEvent extends ContractEvent {
  args: {
    player: Address
    landId: bigint
    seedTokenId: bigint
  }
}

export interface CropStolenEvent extends ContractEvent {
  args: {
    thief: Address
    victim: Address
    landId: bigint
    seedTokenId: bigint
  }
}

export interface HelpProvidedEvent extends ContractEvent {
  args: {
    helper: Address
    helped: Address
    landId: bigint
    boosterType: number
  }
}

export interface SeedPurchasedEvent extends ContractEvent {
  args: {
    buyer: Address
    cropType: number
    tokenId: bigint
    paidWithKind: boolean
    price: bigint
  }
}

export interface WeatherUpdatedEvent extends ContractEvent {
  args: {
    landId: bigint
    weatherSeed: bigint
  }
}

// 新增：游戏事件记录事件
export interface GameEventRecordedEvent extends ContractEvent {
  args: {
    player: Address
    eventType: string
    timestamp: bigint
    eventIndex: bigint
  }
}

// 合约交互参数类型
export interface ClaimLandParams {
  landId: number
  tokenId: bigint
}

export interface BuySeedParams {
  cropType: number
  payWithKind?: boolean
  value?: bigint
}

export interface ApplyBoosterParams {
  landId: number
  boosterType: number
  payWithKind: boolean
  value?: bigint
}

export interface HelpOtherParams {
  landId: number
  boosterType: number
  payWithKind: boolean
  value?: bigint
}

// 合约读取函数返回类型
export interface ContractLandInfo {
  state: number
  seedTokenId: bigint
  claimTime: bigint
  lockEndTime: bigint
  weatherSeed: bigint
  lastWeatherUpdateTime: bigint
  accumulatedGrowth: bigint
  currentFarmer: Address
}

export interface ContractSeedInfo {
  cropType: number
  rarity: number
  growthStage: number
  growthStartTime: bigint
  baseGrowthTime: bigint
  maturedAt: bigint
  boostersApplied: number
}

export interface ContractPlayerStats {
  totalCropsHarvested: bigint
  totalCropsStolen: bigint
  totalHelpProvided: bigint
}

export interface ContractSeedPrice {
  nativePrice: bigint
  kindPrice: bigint
  availableForNative: boolean
  availableForKind: boolean
}

export interface ContractBoosterPrice {
  nativePrice: bigint
  kindPrice: bigint
  availableForNative: boolean
  availableForKind: boolean
}

// 新增：游戏事件接口
export interface ContractGameEvent {
  player: Address
  timestamp: bigint
  eventType: string
  landId: bigint
  seedTokenId: bigint
  value: bigint
  description: string
}

// 新增：排行榜条目接口
export interface ContractLeaderboardEntry {
  player: Address
  harvestCount: bigint
  stealCount: bigint
  helpCount: bigint
  kindBalance: bigint
  totalScore: bigint
  rank: bigint
}

// 新增：全局统计接口
export interface ContractGlobalStats {
  totalPlayers: bigint
  totalHarvests: bigint
  totalSteals: bigint
  totalHelps: bigint
  totalEvents: bigint
}

// 新增：玩家排名接口
export interface ContractPlayerRank {
  harvestRank: bigint
  kindnessRank: bigint
}

// Gas 估算配置
export const GAS_LIMITS = {
  claimLand: 200000n,
  harvestCrop: 150000n,
  stealCrop: 150000n,
  buySeedWithNative: 100000n,
  buySeedWithKind: 120000n,
  applyBooster: 100000n,
  helpOther: 120000n,
  checkAndAdvanceGrowth: 80000n,
} as const

// 错误消息映射
export const CONTRACT_ERRORS = {
  'Insufficient balance': '余额不足',
  'Land not available': '土地不可用',
  'Seed not owned': '种子不属于您',
  'Land not ripe': '作物未成熟',
  'Daily help limit reached': '每日帮助次数已达上限',
  'Booster limit reached': '道具使用次数已达上限',
  'Invalid crop type': '无效的作物类型',
  'Transaction reverted': '交易被拒绝',
} as const