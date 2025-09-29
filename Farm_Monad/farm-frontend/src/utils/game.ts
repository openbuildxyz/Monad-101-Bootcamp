// 游戏逻辑工具函数
import {
  CropType,
  LandState,
  WeatherType,
  BoosterType,
  CROP_CONFIG,
  WEATHER_CONFIG,
  GAME_CONSTANTS,
  type LandInfo,
  type SeedInfo,
  type WeatherInfo
} from '@/types'

/**
 * 获取作物配置信息
 */
export function getCropConfig(cropType: CropType) {
  return CROP_CONFIG[cropType]
}

/**
 * 获取天气配置信息
 */
export function getWeatherConfig(weatherType: WeatherType) {
  return WEATHER_CONFIG[weatherType]
}

/**
 * 计算土地成长进度百分比
 */
export function calculateGrowthProgress(landInfo: LandInfo, seedInfo?: SeedInfo): number {
  if (!seedInfo || landInfo.state !== LandState.Growing) return 0

  const required = 3600n // 需要3600成长点才成熟
  const current = landInfo.accumulatedGrowth

  return Math.min(Number(current) / Number(required), 1) * 100
}

/**
 * 计算剩余成长时间（考虑天气影响）
 */
export function calculateRemainingGrowthTime(
  landInfo: LandInfo,
  seedInfo?: SeedInfo
): number {
  if (!seedInfo || landInfo.state !== LandState.Growing) return 0

  const required = 3600n
  const current = landInfo.accumulatedGrowth
  const remaining = Number(required - current)

  if (remaining <= 0) return 0

  // 获取当前天气影响
  const weather = simulateWeatherForTime(
    Number(landInfo.weatherSeed),
    Math.floor(Date.now() / 1000)
  )
  const multiplier = WEATHER_CONFIG[weather].effectMultiplier

  if (multiplier === 0) {
    // 暴风雨天气，需要等待5分钟后才能继续成长
    return remaining + 300
  }

  // 根据天气影响调整剩余时间
  return Math.ceil(remaining / multiplier)
}

/**
 * 模拟指定时间的天气
 */
export function simulateWeatherForTime(weatherSeed: number, timestamp: number): WeatherType {
  const segmentIndex = Math.floor(timestamp / GAME_CONSTANTS.WEATHER_SEGMENT_DURATION)
  
  // 修复天气计算逻辑：使用更稳定的哈希算法
  // 将weatherSeed转换为较小的数字，然后与segmentIndex结合
  const seedHash = Math.abs(weatherSeed) % 1000000 // 将大数字缩小到6位数
  const combined = (seedHash + segmentIndex) % 4
  
  console.log('Weather calculation details:', {
    weatherSeed,
    seedHash,
    segmentIndex,
    combined,
    weatherType: combined
  })
  
  return combined as WeatherType
}

/**
 * 获取土地当前天气信息
 */
export function getLandWeatherInfo(landId: number, landInfo: LandInfo): WeatherInfo {
  const weatherSeed = Number(landInfo.weatherSeed)
  const currentTime = Math.floor(Date.now() / 1000)
  
  const currentWeather = simulateWeatherForTime(weatherSeed, currentTime)
  
  // 调试信息
  console.log(`Land ${landId} weather calculation:`, {
    weatherSeed,
    currentTime,
    segmentIndex: Math.floor(currentTime / GAME_CONSTANTS.WEATHER_SEGMENT_DURATION),
    weatherType: currentWeather,
    weatherName: WEATHER_CONFIG[currentWeather]?.name
  })

  const config = WEATHER_CONFIG[currentWeather]

  return {
    landId,
    weatherType: currentWeather,
    effectMultiplier: config.effectMultiplier,
    iconEmoji: config.emoji,
    description: config.description
  }
}

/**
 * 检查土地是否可以执行指定操作
 */
export function canPerformAction(
  landInfo: LandInfo,
  action: 'plant' | 'harvest' | 'steal' | 'boost' | 'help',
  userAddress?: `0x${string}`
): { canPerform: boolean; reason?: string } {
  const now = Math.floor(Date.now() / 1000)

  switch (action) {
    case 'plant':
      if (landInfo.state !== LandState.Idle) {
        return { canPerform: false, reason: '土地当前不可用于种植' }
      }
      if (Number(landInfo.lockEndTime) > now) {
        return { canPerform: false, reason: '土地正在冷却中' }
      }
      return { canPerform: true }

    case 'harvest':
      if (landInfo.state !== LandState.Ripe) {
        return { canPerform: false, reason: '作物尚未成熟' }
      }
      if (landInfo.currentFarmer !== userAddress) {
        return { canPerform: false, reason: '只能收获自己的作物' }
      }
      return { canPerform: true }

    case 'steal':
      if (landInfo.state !== LandState.Ripe) {
        return { canPerform: false, reason: '作物尚未成熟' }
      }
      if (landInfo.currentFarmer === userAddress) {
        return { canPerform: false, reason: '不能偷取自己的作物' }
      }
      return { canPerform: true }

    case 'boost':
    case 'help':
      if (landInfo.state !== LandState.Growing) {
        return { canPerform: false, reason: '只能对成长中的作物使用道具' }
      }
      return { canPerform: true }

    default:
      return { canPerform: false, reason: '未知操作' }
  }
}

/**
 * 获取土地状态显示文本
 */
export function getLandStateText(state: LandState): string {
  switch (state) {
    case LandState.Idle:
      return '空闲'
    case LandState.Growing:
      return '成长中'
    case LandState.Ripe:
      return '成熟'
    case LandState.Stealing:
      return '偷菜中'
    case LandState.LockedIdle:
      return '冷却中'
    default:
      return '未知'
  }
}

/**
 * 获取土地状态颜色
 */
export function getLandStateColor(state: LandState): string {
  switch (state) {
    case LandState.Idle:
      return 'text-gray-500 border-gray-300'
    case LandState.Growing:
      return 'text-green-500 border-green-300'
    case LandState.Ripe:
      return 'text-yellow-500 border-yellow-300'
    case LandState.Stealing:
      return 'text-red-500 border-red-300'
    case LandState.LockedIdle:
      return 'text-red-500 border-red-300'
    default:
      return 'text-gray-500 border-gray-300'
  }
}

/**
 * 获取稀有度颜色
 */
export function getRarityColor(rarity: number): string {
  switch (rarity) {
    case 0: // Common
      return 'text-gray-600'
    case 1: // Rare
      return 'text-blue-600'
    case 2: // Legendary
      return 'text-purple-600'
    default:
      return 'text-gray-600'
  }
}

/**
 * 计算道具价格
 */
export function calculateBoosterPrice(
  boosterType: BoosterType,
  payWithKind: boolean
): bigint {
  // 这里应该从合约读取真实价格，暂时使用模拟数据
  const basePrices = {
    [BoosterType.Watering]: {
      native: BigInt('100000000000000'), // 0.0001 ETH
      kind: BigInt('1000000000000000000') // 1 KIND
    },
    [BoosterType.Fertilizing]: {
      native: BigInt('200000000000000'), // 0.0002 ETH
      kind: BigInt('2000000000000000000') // 2 KIND
    }
  }

  return payWithKind
    ? basePrices[boosterType].kind
    : basePrices[boosterType].native
}

/**
 * 检查是否是稀有作物
 */
export function isRareCrop(cropType: CropType): boolean {
  return [CropType.Strawberry, CropType.Grape, CropType.Watermelon].includes(cropType)
}

/**
 * 获取作物得分（用于排行榜）
 */
export function getCropScore(cropType: CropType): number {
  if (isRareCrop(cropType)) {
    return 2 // 稀有作物2分
  }
  return 1 // 普通作物1分
}

/**
 * 计算成长加速效果
 */
export function calculateBoostEffect(
  boosterType: BoosterType,
  currentProgress: bigint
): bigint {
  switch (boosterType) {
    case BoosterType.Watering:
      // 浇水减少2分钟 = 120秒成长点
      return currentProgress + BigInt(GAME_CONSTANTS.WATERING_TIME_REDUCTION)

    case BoosterType.Fertilizing:
      // 施肥减少5%的剩余时间
      const required = 3600n
      const remaining = required - currentProgress
      const reduction = remaining * BigInt(GAME_CONSTANTS.FERTILIZING_PERCENTAGE_REDUCTION) / 100n
      return currentProgress + reduction

    default:
      return currentProgress
  }
}

/**
 * 生成随机天气种子
 */
export function generateWeatherSeed(): number {
  return Math.floor(Math.random() * 1000000)
}

/**
 * 检查是否可以使用道具
 */
export function canUseBooster(
  seedInfo: SeedInfo,
  boosterType: BoosterType
): { canUse: boolean; reason?: string } {
  if (seedInfo.boostersApplied >= GAME_CONSTANTS.MAX_BOOSTERS_PER_CROP) {
    return {
      canUse: false,
      reason: `每个作物最多只能使用${GAME_CONSTANTS.MAX_BOOSTERS_PER_CROP}个道具`
    }
  }

  // 可以根据道具类型添加更多检查逻辑
  // 例如：某些道具可能有特殊限制
  if (boosterType === BoosterType.Fertilizing && seedInfo.boostersApplied >= 5) {
    return {
      canUse: false,
      reason: '施肥道具使用次数已达上限'
    }
  }

  return { canUse: true }
}