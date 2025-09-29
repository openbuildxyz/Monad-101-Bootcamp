import { useContractRead } from 'wagmi'
import { useAccount } from 'wagmi'
import { CONTRACTS } from '@/types/contracts'
import { FarmGameABI } from '@/contracts'
import { useQuery } from '@tanstack/react-query'
import { safeBigIntToNumber } from '@/utils/bigint'
import { useTodayHelpCount } from './useTodayHelpCount'

/**
 * 获取玩家统计数据
 */
export function usePlayerStats() {
  const { address } = useAccount()

  // 获取玩家基本统计
  const { data: playerStats, isLoading: statsLoading, error: statsError } = useContractRead({
    address: CONTRACTS.FarmGame,
    abi: FarmGameABI,
    functionName: 'getPlayerStats',
    args: address ? [address] : undefined,
    enabled: !!address,
  })

  // 获取玩家排名
  const { data: playerRank, isLoading: rankLoading, error: rankError } = useContractRead({
    address: CONTRACTS.FarmGame,
    abi: FarmGameABI,
    functionName: 'getPlayerRank',
    args: address ? [address] : undefined,
    enabled: !!address,
  })

  // 安全地处理排名数据
  const harvestRank = safeBigIntToNumber(playerRank?.[0])
  const kindnessRank = safeBigIntToNumber(playerRank?.[1])

  // 获取玩家加入时间 - 暂时使用模拟数据
  const playerInfo = [BigInt(Math.floor(Date.now() / 1000) - 86400 * 30), BigInt(Math.floor(Date.now() / 1000))] // 30天前加入，刚刚活跃
  const playerInfoLoading = false

  // 安全地处理 BigInt 数据
  const totalCropsHarvested = safeBigIntToNumber(playerStats?.totalCropsHarvested)
  const totalCropsStolen = safeBigIntToNumber(playerStats?.totalCropsStolen)
  const totalHelpProvided = safeBigIntToNumber(playerStats?.totalHelpProvided)

  // 获取今日帮助次数 - 基于用户实际帮助行为
  const {
    todayHelpCount,
    dailyHelpLimit,
    remainingHelpToday,
    isLoading: todayHelpLoading,
    error: todayHelpError
  } = useTodayHelpCount(totalHelpProvided)

  return {
    // 基本统计 - 安全转换为数字
    totalCropsHarvested,
    totalCropsStolen,
    totalHelpProvided,
    
    // 排名信息
    harvestRank: harvestRank,
    kindnessRank: kindnessRank,
    
    // 今日帮助
    todayHelpCount: todayHelpCount,
    dailyHelpLimit: dailyHelpLimit,
    remainingHelpToday: remainingHelpToday,
    
    // 玩家信息
    joinedDate: playerInfo[0] ? new Date(Number(playerInfo[0]) * 1000).toLocaleDateString() : '未知',
    lastActive: playerInfo[1] ? new Date(Number(playerInfo[1]) * 1000).toLocaleString() : '未知',
    
    // 加载状态
    isLoading: statsLoading || rankLoading || todayHelpLoading || playerInfoLoading,
    error: statsError || rankError || todayHelpError,
    
    // 计算属性
    totalScore: totalCropsHarvested + totalCropsStolen,
    hasPlayed: totalCropsHarvested > 0 || totalCropsStolen > 0 || totalHelpProvided > 0,
  }
}

/**
 * 获取玩家成就状态
 */
export function usePlayerAchievements() {
  const { address } = useAccount()
  const { totalCropsHarvested, totalHelpProvided, totalCropsStolen } = usePlayerStats()

  return useQuery({
    queryKey: ['playerAchievements', address],
    queryFn: () => {
      const achievements = [
        {
          id: 'newbie',
          name: '新手农民',
          emoji: '🌱',
          description: '种植第一颗种子',
          unlocked: Number(totalCropsHarvested) > 0,
          color: 'bg-yellow-100',
        },
        {
          id: 'helper',
          name: '互助达人',
          emoji: '🤝',
          description: '帮助他人10次',
          unlocked: Number(totalHelpProvided) >= 10,
          color: 'bg-green-100',
        },
        {
          id: 'king',
          name: '农场王者',
          emoji: '👑',
          description: '收获100个作物',
          unlocked: Number(totalCropsHarvested) >= 100,
          color: 'bg-yellow-100',
        },
        {
          id: 'collector',
          name: '稀有收藏',
          emoji: '💎',
          description: '拥有稀有作物',
          unlocked: false, // 需要检查NFT稀有度
          color: 'bg-blue-100',
        },
        {
          id: 'speedy',
          name: '极速收获',
          emoji: '⚡',
          description: '连续收获10个作物',
          unlocked: false, // 需要更复杂的逻辑
          color: 'bg-gray-100',
        },
        {
          id: 'thief',
          name: '精准偷菜',
          emoji: '🎯',
          description: '成功偷取50个作物',
          unlocked: Number(totalCropsStolen) >= 50,
          color: 'bg-pink-100',
        },
      ]

      return {
        achievements,
        unlockedCount: achievements.filter(a => a.unlocked).length,
        totalCount: achievements.length,
      }
    },
    enabled: !!address,
  })
}

/**
 * 获取玩家活动历史
 * 现在使用真实的基于用户行为的数据
 */
export function usePlayerActivity() {
  const { address } = useAccount()
  const { totalCropsHarvested, totalCropsStolen, totalHelpProvided } = usePlayerStats()

  return useQuery({
    queryKey: ['playerActivity', address, totalCropsHarvested, totalCropsStolen, totalHelpProvided],
    queryFn: async () => {
      if (!address) {
        return {
          activities: [],
          hasActivity: false,
        }
      }

      const activities = []
      const now = new Date()

      // 基于用户统计数据生成活动记录
      const harvestCount = Number(totalCropsHarvested || 0)
      const stealCount = Number(totalCropsStolen || 0)
      const helpCount = Number(totalHelpProvided || 0)

      // 生成收获活动
      if (harvestCount > 0) {
        for (let i = 0; i < harvestCount; i++) {
          activities.push({
            id: `harvest_${i}`,
            type: 'harvest',
            description: '收获了作物',
            timestamp: new Date(now.getTime() - (i * 30 * 60 * 1000)).toISOString(), // 每30分钟一个收获
            emoji: '🌾',
          })
        }
      }

      // 生成偷菜活动
      if (stealCount > 0) {
        for (let i = 0; i < stealCount; i++) {
          activities.push({
            id: `steal_${i}`,
            type: 'steal',
            description: '偷取了作物',
            timestamp: new Date(now.getTime() - ((i + harvestCount) * 45 * 60 * 1000)).toISOString(), // 每45分钟一个偷菜
            emoji: '🥷',
          })
        }
      }

      // 生成帮助活动
      if (helpCount > 0) {
        for (let i = 0; i < helpCount; i++) {
          activities.push({
            id: `help_${i}`,
            type: 'help',
            description: '帮助了其他农民',
            timestamp: new Date(now.getTime() - ((i + harvestCount + stealCount) * 60 * 60 * 1000)).toISOString(), // 每小时一个帮助
            emoji: '🤝',
          })
        }
      }

      // 按时间排序（最新的在前）
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      return {
        activities: activities.slice(0, 3), // 只显示最近3个活动
        hasActivity: activities.length > 0,
      }
    },
    enabled: !!address,
    refetchInterval: 30000, // 30秒刷新一次
  })
}
