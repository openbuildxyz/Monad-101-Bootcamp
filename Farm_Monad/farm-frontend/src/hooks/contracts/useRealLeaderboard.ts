import { useAccount } from 'wagmi'
import { useContractRead } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { CONTRACTS } from '@/types/contracts'
import { FarmGameABI } from '@/contracts'
import { formatAddress, formatKind } from '@/utils/format'

/**
 * 真实的收获排行榜Hook - 使用合约数据
 */
export function useRealHarvestLeaderboard(limit = 20) {
  const { data: leaderboardData, isLoading, error, refetch } = useContractRead({
    address: CONTRACTS.FarmGame,
    abi: FarmGameABI,
    functionName: 'getHarvestLeaderboard',
    args: [BigInt(limit)],
    enabled: true,
  })

  // 格式化排行榜数据
  const formattedLeaderboard = useQuery({
    queryKey: ['formattedHarvestLeaderboard', leaderboardData],
    queryFn: () => {
      if (!leaderboardData || !Array.isArray(leaderboardData)) {
        return []
      }

      return leaderboardData.map((entry: any, index: number) => ({
        rank: Number(entry.rank) || (index + 1),
        address: entry.player as `0x${string}`,
        player: entry.player as `0x${string}`,
        harvestCount: Number(entry.harvestCount),
        stealCount: Number(entry.stealCount),
        helpCount: Number(entry.helpCount),
        kindBalance: entry.kindBalance ? Number(entry.kindBalance) : 0,
        totalScore: Number(entry.totalScore),
        // UI辅助属性
        displayAddress: formatAddress(entry.player),
        displayKindBalance: entry.kindBalance ? formatKind(entry.kindBalance, 2) : '0.00',
        cropsHarvested: Number(entry.harvestCount), // 兼容旧接口
        cropsStolen: Number(entry.stealCount), // 兼容旧接口
        helpProvided: Number(entry.helpCount), // 兼容旧接口
        score: Number(entry.totalScore) // 兼容旧接口
      }))
    },
    enabled: !!leaderboardData,
  })

  return {
    data: formattedLeaderboard.data || [],
    isLoading: isLoading || formattedLeaderboard.isLoading,
    error: error || formattedLeaderboard.error,
    refetch,
    isEmpty: (formattedLeaderboard.data?.length || 0) === 0
  }
}

/**
 * 真实的善良值排行榜Hook - 使用合约数据
 */
export function useRealKindnessLeaderboard(limit = 20) {
  const { data: leaderboardData, isLoading, error, refetch } = useContractRead({
    address: CONTRACTS.FarmGame,
    abi: FarmGameABI,
    functionName: 'getKindnessLeaderboard',
    args: [BigInt(limit)],
    enabled: true,
  })

  // 格式化排行榜数据
  const formattedLeaderboard = useQuery({
    queryKey: ['formattedKindnessLeaderboard', leaderboardData],
    queryFn: () => {
      if (!leaderboardData || !Array.isArray(leaderboardData)) {
        return []
      }

      return leaderboardData.map((entry: any, index: number) => ({
        rank: Number(entry.rank) || (index + 1),
        address: entry.player as `0x${string}`,
        player: entry.player as `0x${string}`,
        harvestCount: Number(entry.harvestCount),
        stealCount: Number(entry.stealCount),
        helpCount: Number(entry.helpCount),
        kindBalance: entry.kindBalance ? Number(entry.kindBalance) : 0,
        totalScore: Number(entry.totalScore),
        // UI辅助属性
        displayAddress: formatAddress(entry.player),
        displayKindBalance: entry.kindBalance ? formatKind(entry.kindBalance, 2) : '0.00',
        cropsHarvested: Number(entry.harvestCount), // 兼容旧接口
        cropsStolen: Number(entry.stealCount), // 兼容旧接口
        helpProvided: Number(entry.helpCount), // 兼容旧接口
        score: Number(entry.kindBalance) // 善良值排行榜以KIND余额为分数
      }))
    },
    enabled: !!leaderboardData,
  })

  return {
    data: formattedLeaderboard.data || [],
    isLoading: isLoading || formattedLeaderboard.isLoading,
    error: error || formattedLeaderboard.error,
    refetch,
    isEmpty: (formattedLeaderboard.data?.length || 0) === 0
  }
}

/**
 * 获取玩家排名的Hook
 */
export function usePlayerRank() {
  const { address } = useAccount()

  const { data: playerRank, isLoading, error } = useContractRead({
    address: CONTRACTS.FarmGame,
    abi: FarmGameABI,
    functionName: 'getPlayerRank',
    args: address ? [address] : undefined,
    enabled: !!address,
  })

  return {
    harvestRank: playerRank ? Number(playerRank[0]) : 0,
    kindnessRank: playerRank ? Number(playerRank[1]) : 0,
    isLoading,
    error,
    hasRank: playerRank ? (Number(playerRank[0]) > 0 || Number(playerRank[1]) > 0) : false
  }
}

/**
 * 组合排行榜Hook - 提供完整的排行榜数据
 */
export function useCompleteLeaderboard() {
  const harvestLeaderboard = useRealHarvestLeaderboard()
  const kindnessLeaderboard = useRealKindnessLeaderboard()
  const playerRank = usePlayerRank()

  // 定期刷新排行榜数据
  const { data: refreshData } = useQuery({
    queryKey: ['leaderboardRefresh'],
    queryFn: async () => {
      // 每分钟刷新一次排行榜
      harvestLeaderboard.refetch()
      kindnessLeaderboard.refetch()
      return Date.now()
    },
    refetchInterval: 60000, // 1分钟
  })

  return {
    // 收获排行榜
    harvestLeaderboard: harvestLeaderboard.data,
    harvestLoading: harvestLeaderboard.isLoading,
    harvestError: harvestLeaderboard.error,

    // 善良值排行榜
    kindnessLeaderboard: kindnessLeaderboard.data,
    kindnessLoading: kindnessLeaderboard.isLoading,
    kindnessError: kindnessLeaderboard.error,

    // 玩家排名
    playerHarvestRank: playerRank.harvestRank,
    playerKindnessRank: playerRank.kindnessRank,
    playerRankLoading: playerRank.isLoading,

    // 整体状态
    isLoading: harvestLeaderboard.isLoading || kindnessLeaderboard.isLoading || playerRank.isLoading,
    hasError: harvestLeaderboard.error || kindnessLeaderboard.error || playerRank.error,
    isEmpty: harvestLeaderboard.isEmpty && kindnessLeaderboard.isEmpty,
    lastRefresh: refreshData,

    // 刷新函数
    refetch: () => {
      harvestLeaderboard.refetch()
      kindnessLeaderboard.refetch()
    }
  }
}

/**
 * 获取排行榜统计信息
 */
export function useLeaderboardStats() {
  const harvestLeaderboard = useRealHarvestLeaderboard(100) // 获取更多数据用于统计
  const kindnessLeaderboard = useRealKindnessLeaderboard(100)

  return useQuery({
    queryKey: ['leaderboardStats', harvestLeaderboard.data, kindnessLeaderboard.data],
    queryFn: () => {
      const harvestData = harvestLeaderboard.data || []
      const kindnessData = kindnessLeaderboard.data || []

      // 计算统计数据
      const totalActiveFarmers = Math.max(harvestData.length, kindnessData.length)
      const totalCropsHarvested = harvestData.reduce((sum, entry) => sum + entry.harvestCount, 0)
      const totalCropsStolen = harvestData.reduce((sum, entry) => sum + entry.stealCount, 0)
      const totalHelpProvided = kindnessData.reduce((sum, entry) => sum + entry.helpCount, 0)
      const totalKindDistributed = kindnessData.reduce((sum, entry) => sum + entry.kindBalance, 0)

      return {
        activeFarmers: totalActiveFarmers,
        totalCropsHarvested,
        totalCropsStolen,
        totalHelpProvided,
        totalKindDistributed,
        averageHarvestPerPlayer: totalActiveFarmers > 0 ? Math.round(totalCropsHarvested / totalActiveFarmers) : 0,
        averageHelpPerPlayer: totalActiveFarmers > 0 ? Math.round(totalHelpProvided / totalActiveFarmers) : 0,
        topHarvester: harvestData[0] || null,
        topHelper: kindnessData[0] || null
      }
    },
    enabled: !!harvestLeaderboard.data && !!kindnessLeaderboard.data,
  })
}