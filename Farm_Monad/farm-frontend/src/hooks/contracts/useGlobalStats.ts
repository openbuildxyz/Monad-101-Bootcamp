import { useContractRead } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { CONTRACTS, ContractGlobalStats } from '@/types/contracts'
import { FarmGameABI } from '@/contracts'

/**
 * 获取全局统计数据的Hook - 使用合约数据
 */
export function useRealGlobalStats() {
  const { data: globalStatsData, isLoading, error, refetch } = useContractRead({
    address: CONTRACTS.FarmGame,
    abi: FarmGameABI,
    functionName: 'getGlobalStats',
    enabled: true,
  })

  // 格式化全局统计数据
  const formattedStats = useQuery({
    queryKey: ['formattedGlobalStats', globalStatsData],
    queryFn: () => {
      if (!globalStatsData) {
        return {
          totalPlayers: 0,
          totalHarvests: 0,
          totalSteals: 0,
          totalHelps: 0,
          totalEvents: 0,
          // 计算属性
          averageHarvestPerPlayer: 0,
          averageHelpPerPlayer: 0,
          stealRate: 0,
          helpRate: 0
        }
      }

      const stats = globalStatsData as ContractGlobalStats
      const totalPlayers = Number(stats.totalPlayers)
      const totalHarvests = Number(stats.totalHarvests)
      const totalSteals = Number(stats.totalSteals)
      const totalHelps = Number(stats.totalHelps)
      const totalEvents = Number(stats.totalEvents)

      return {
        totalPlayers,
        totalHarvests,
        totalSteals,
        totalHelps,
        totalEvents,
        // 计算属性
        averageHarvestPerPlayer: totalPlayers > 0 ? Math.round(totalHarvests / totalPlayers) : 0,
        averageHelpPerPlayer: totalPlayers > 0 ? Math.round(totalHelps / totalPlayers) : 0,
        stealRate: totalHarvests > 0 ? Math.round((totalSteals / totalHarvests) * 100) : 0,
        helpRate: totalHelps > 0 ? Math.round((totalHelps / (totalHarvests + totalSteals)) * 100) : 0
      }
    },
    enabled: !!globalStatsData,
  })

  return {
    stats: formattedStats.data || {
      totalPlayers: 0,
      totalHarvests: 0,
      totalSteals: 0,
      totalHelps: 0,
      totalEvents: 0,
      averageHarvestPerPlayer: 0,
      averageHelpPerPlayer: 0,
      stealRate: 0,
      helpRate: 0
    },
    isLoading: isLoading || formattedStats.isLoading,
    error: error || formattedStats.error,
    refetch
  }
}

/**
 * 获取总玩家数的Hook
 */
export function useTotalPlayers() {
  const { data: totalPlayers, isLoading, error } = useContractRead({
    address: CONTRACTS.FarmGame,
    abi: FarmGameABI,
    functionName: 'getTotalPlayers',
    enabled: true,
  })

  return {
    count: totalPlayers ? Number(totalPlayers) : 0,
    isLoading,
    error
  }
}

/**
 * 获取所有玩家地址的Hook
 */
export function useAllPlayers() {
  const { data: allPlayers, isLoading, error } = useContractRead({
    address: CONTRACTS.FarmGame,
    abi: FarmGameABI,
    functionName: 'getAllPlayers',
    enabled: true,
  })

  return {
    players: allPlayers ? (allPlayers as string[]) : [],
    count: allPlayers ? allPlayers.length : 0,
    isLoading,
    error
  }
}

/**
 * 检查玩家是否已注册的Hook
 */
export function useIsPlayerRegistered(playerAddress?: `0x${string}`) {
  const { data: isRegistered, isLoading, error } = useContractRead({
    address: CONTRACTS.FarmGame,
    abi: FarmGameABI,
    functionName: 'isPlayerRegistered',
    args: playerAddress ? [playerAddress] : undefined,
    enabled: !!playerAddress,
  })

  return {
    isRegistered: !!isRegistered,
    isLoading,
    error
  }
}

/**
 * 综合统计数据Hook - 组合多个统计源
 */
export function useComprehensiveStats() {
  const globalStats = useRealGlobalStats()
  const totalPlayers = useTotalPlayers()
  const allPlayers = useAllPlayers()

  // 定期刷新统计数据
  const { data: refreshData } = useQuery({
    queryKey: ['statsRefresh'],
    queryFn: async () => {
      // 每2分钟刷新一次统计数据
      globalStats.refetch()
      return Date.now()
    },
    refetchInterval: 120000, // 2分钟
  })

  return {
    // 全局统计
    globalStats: globalStats.stats,
    globalStatsLoading: globalStats.isLoading,
    globalStatsError: globalStats.error,

    // 玩家统计
    totalPlayersCount: Math.max(totalPlayers.count, allPlayers.count),
    registeredPlayers: allPlayers.players,
    playersLoading: totalPlayers.isLoading || allPlayers.isLoading,
    playersError: totalPlayers.error || allPlayers.error,

    // 整体状态
    isLoading: globalStats.isLoading || totalPlayers.isLoading || allPlayers.isLoading,
    hasError: globalStats.error || totalPlayers.error || allPlayers.error,
    lastRefresh: refreshData,

    // 刷新函数
    refetch: () => {
      globalStats.refetch()
    },

    // 计算属性
    gameActivity: {
      isActive: globalStats.stats.totalEvents > 0,
      activityLevel: getActivityLevel(globalStats.stats),
      growthRate: calculateGrowthRate(globalStats.stats),
      communityHealth: calculateCommunityHealth(globalStats.stats)
    }
  }
}

/**
 * 获取游戏活跃度等级
 */
function getActivityLevel(stats: any): 'low' | 'medium' | 'high' {
  const { totalEvents, totalPlayers } = stats

  if (totalPlayers === 0) return 'low'

  const eventsPerPlayer = totalEvents / totalPlayers

  if (eventsPerPlayer < 5) return 'low'
  if (eventsPerPlayer < 20) return 'medium'
  return 'high'
}

/**
 * 计算增长率
 */
function calculateGrowthRate(stats: any): number {
  // 这里可以基于历史数据计算增长率
  // 暂时基于当前活跃度返回模拟值
  const { totalPlayers, totalEvents } = stats

  if (totalPlayers === 0) return 0
  return Math.min(Math.round((totalEvents / totalPlayers) * 2), 100)
}

/**
 * 计算社区健康度
 */
function calculateCommunityHealth(stats: any): number {
  const { totalHelps, totalHarvests, totalSteals } = stats

  if (totalHarvests === 0) return 0

  // 基于帮助率和偷菜率计算健康度
  const helpRate = (totalHelps / (totalHarvests + totalSteals)) * 100
  const stealRate = (totalSteals / totalHarvests) * 100

  // 帮助率高、偷菜率低 = 健康度高
  const healthScore = Math.max(0, helpRate - (stealRate * 0.5))
  return Math.min(Math.round(healthScore), 100)
}