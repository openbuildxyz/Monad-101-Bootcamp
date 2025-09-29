import { useAccount } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { formatAddress } from '@/utils/format'

/**
 * 简化的排行榜Hook - 使用模拟数据避免合约调用问题
 */
export function useSimpleLeaderboard() {
  const { isConnected, address } = useAccount()

  // 模拟收获排行榜数据
  const harvestLeaderboard = useQuery({
    queryKey: ['simpleHarvestLeaderboard'],
    queryFn: () => {
      // 模拟数据
      const mockData = [
        {
          rank: 1,
          address: '0x1234567890123456789012345678901234567890' as `0x${string}`,
          harvestCount: 45,
          stealCount: 12,
          helpCount: 8,
          totalScore: 57
        },
        {
          rank: 2,
          address: '0x2345678901234567890123456789012345678901' as `0x${string}`,
          harvestCount: 38,
          stealCount: 9,
          helpCount: 15,
          totalScore: 47
        },
        {
          rank: 3,
          address: '0x3456789012345678901234567890123456789012' as `0x${string}`,
          harvestCount: 32,
          stealCount: 6,
          helpCount: 22,
          totalScore: 38
        },
        {
          rank: 4,
          address: '0x4567890123456789012345678901234567890123' as `0x${string}`,
          harvestCount: 28,
          stealCount: 4,
          helpCount: 18,
          totalScore: 32
        },
        {
          rank: 5,
          address: '0x5678901234567890123456789012345678901234' as `0x${string}`,
          harvestCount: 25,
          stealCount: 7,
          helpCount: 12,
          totalScore: 32
        }
      ]

      // 如果当前用户有地址，添加用户数据
      if (address) {
        const userData = {
          rank: 6,
          address,
          harvestCount: 15,
          stealCount: 3,
          helpCount: 5,
          totalScore: 18
        }
        mockData.push(userData)
      }

      return mockData.map(entry => ({
        ...entry,
        displayAddress: formatAddress(entry.address),
        cropsHarvested: entry.harvestCount,
        cropsStolen: entry.stealCount,
        helpProvided: entry.helpCount,
        score: entry.totalScore
      }))
    },
    enabled: isConnected,
    staleTime: 1000 * 60 * 5, // 5分钟
  })

  // 模拟善良值排行榜数据
  const kindnessLeaderboard = useQuery({
    queryKey: ['simpleKindnessLeaderboard'],
    queryFn: () => {
      // 模拟数据
      const mockData = [
        {
          rank: 1,
          address: '0x2345678901234567890123456789012345678901' as `0x${string}`,
          harvestCount: 38,
          stealCount: 9,
          helpCount: 15,
          kindBalance: 1250,
          totalScore: 1250
        },
        {
          rank: 2,
          address: '0x3456789012345678901234567890123456789012' as `0x${string}`,
          harvestCount: 32,
          stealCount: 6,
          helpCount: 22,
          kindBalance: 980,
          totalScore: 980
        },
        {
          rank: 3,
          address: '0x4567890123456789012345678901234567890123' as `0x${string}`,
          harvestCount: 28,
          stealCount: 4,
          helpCount: 18,
          kindBalance: 750,
          totalScore: 750
        },
        {
          rank: 4,
          address: '0x5678901234567890123456789012345678901234' as `0x${string}`,
          harvestCount: 25,
          stealCount: 7,
          helpCount: 12,
          kindBalance: 520,
          totalScore: 520
        },
        {
          rank: 5,
          address: '0x1234567890123456789012345678901234567890' as `0x${string}`,
          harvestCount: 45,
          stealCount: 12,
          helpCount: 8,
          kindBalance: 480,
          totalScore: 480
        }
      ]

      // 如果当前用户有地址，添加用户数据
      if (address) {
        const userData = {
          rank: 6,
          address,
          harvestCount: 15,
          stealCount: 3,
          helpCount: 5,
          kindBalance: 120,
          totalScore: 120
        }
        mockData.push(userData)
      }

      return mockData.map(entry => ({
        ...entry,
        displayAddress: formatAddress(entry.address),
        displayKindBalance: entry.kindBalance.toFixed(2),
        cropsHarvested: entry.harvestCount,
        cropsStolen: entry.stealCount,
        helpProvided: entry.helpCount,
        score: entry.kindBalance
      }))
    },
    enabled: isConnected,
    staleTime: 1000 * 60 * 5, // 5分钟
  })

  return {
    harvestLeaderboard: harvestLeaderboard.data || [],
    harvestLoading: harvestLeaderboard.isLoading,
    harvestError: harvestLeaderboard.error,

    kindnessLeaderboard: kindnessLeaderboard.data || [],
    kindnessLoading: kindnessLeaderboard.isLoading,
    kindnessError: kindnessLeaderboard.error,

    isLoading: harvestLeaderboard.isLoading || kindnessLeaderboard.isLoading,
    hasError: harvestLeaderboard.error || kindnessLeaderboard.error,
    isEmpty: (harvestLeaderboard.data?.length || 0) === 0 && (kindnessLeaderboard.data?.length || 0) === 0,

    refetch: () => {
      harvestLeaderboard.refetch()
      kindnessLeaderboard.refetch()
    }
  }
}

/**
 * 简化的排行榜统计Hook
 */
export function useSimpleLeaderboardStats() {
  const { harvestLeaderboard, kindnessLeaderboard } = useSimpleLeaderboard()

  return useQuery({
    queryKey: ['simpleLeaderboardStats', harvestLeaderboard, kindnessLeaderboard],
    queryFn: () => {
      const harvestData = harvestLeaderboard || []
      const kindnessData = kindnessLeaderboard || []

      return {
        activeFarmers: Math.max(harvestData.length, kindnessData.length),
        totalCropsHarvested: harvestData.reduce((sum, entry) => sum + entry.harvestCount, 0),
        totalCropsStolen: harvestData.reduce((sum, entry) => sum + entry.stealCount, 0),
        totalHelpProvided: kindnessData.reduce((sum, entry) => sum + entry.helpCount, 0),
        totalKindDistributed: kindnessData.reduce((sum, entry) => sum + entry.kindBalance, 0),
        averageHarvestPerPlayer: harvestData.length > 0 ? Math.round(harvestData.reduce((sum, entry) => sum + entry.harvestCount, 0) / harvestData.length) : 0,
        averageHelpPerPlayer: kindnessData.length > 0 ? Math.round(kindnessData.reduce((sum, entry) => sum + entry.helpCount, 0) / kindnessData.length) : 0,
        topHarvester: harvestData[0] || null,
        topHelper: kindnessData[0] || null
      }
    },
    enabled: harvestLeaderboard.length > 0 || kindnessLeaderboard.length > 0,
  })
}
