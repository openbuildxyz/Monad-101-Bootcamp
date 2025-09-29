import { useAccount } from 'wagmi'
import { useContractRead } from 'wagmi'
import { CONTRACTS } from '@/types/contracts'
import { FarmGameABI } from '@/contracts'
import { formatAddress, formatKind } from '@/utils/format'

/**
 * 简化的真实排行榜Hook - 直接使用合约数据，避免复杂查询
 */
export function useSimpleRealLeaderboard() {
  const { isConnected } = useAccount()

  // 收获排行榜
  const { 
    data: harvestData, 
    isLoading: harvestLoading, 
    error: harvestError,
    refetch: refetchHarvest
  } = useContractRead({
    address: CONTRACTS.FarmGame,
    abi: FarmGameABI,
    functionName: 'getHarvestLeaderboard',
    args: [BigInt(10)],
    enabled: isConnected,
  })

  // 善良值排行榜
  const { 
    data: kindnessData, 
    isLoading: kindnessLoading, 
    error: kindnessError,
    refetch: refetchKindness
  } = useContractRead({
    address: CONTRACTS.FarmGame,
    abi: FarmGameABI,
    functionName: 'getKindnessLeaderboard',
    args: [BigInt(10)],
    enabled: isConnected,
  })

  // 格式化收获排行榜数据
  const harvestLeaderboard = harvestData ? harvestData.map((entry: any, index: number) => ({
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
    cropsHarvested: Number(entry.harvestCount),
    cropsStolen: Number(entry.stealCount),
    helpProvided: Number(entry.helpCount),
    score: Number(entry.totalScore)
  })) : []

  // 格式化善良值排行榜数据
  const kindnessLeaderboard = kindnessData ? kindnessData.map((entry: any, index: number) => ({
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
    cropsHarvested: Number(entry.harvestCount),
    cropsStolen: Number(entry.stealCount),
    helpProvided: Number(entry.helpCount),
    score: Number(entry.kindBalance)
  })) : []

  return {
    // 收获排行榜
    harvestLeaderboard,
    harvestLoading,
    harvestError,

    // 善良值排行榜
    kindnessLeaderboard,
    kindnessLoading,
    kindnessError,

    // 整体状态
    isLoading: harvestLoading || kindnessLoading,
    hasError: harvestError || kindnessError,
    isEmpty: harvestLeaderboard.length === 0 && kindnessLeaderboard.length === 0,

    // 刷新函数
    refetch: () => {
      refetchHarvest()
      refetchKindness()
    }
  }
}

/**
 * 简化的排行榜统计Hook
 */
export function useSimpleRealLeaderboardStats() {
  const { harvestLeaderboard, kindnessLeaderboard } = useSimpleRealLeaderboard()

  const totalActiveFarmers = Math.max(harvestLeaderboard.length, kindnessLeaderboard.length)
  const totalCropsHarvested = harvestLeaderboard.reduce((sum, entry) => sum + entry.harvestCount, 0)
  const totalCropsStolen = harvestLeaderboard.reduce((sum, entry) => sum + entry.stealCount, 0)
  const totalHelpProvided = kindnessLeaderboard.reduce((sum, entry) => sum + entry.helpCount, 0)

  return {
    activeFarmers: totalActiveFarmers,
    totalCropsHarvested,
    totalCropsStolen,
    totalHelpProvided,
    averageHarvestPerPlayer: totalActiveFarmers > 0 ? Math.round(totalCropsHarvested / totalActiveFarmers) : 0,
    averageHelpPerPlayer: totalActiveFarmers > 0 ? Math.round(totalHelpProvided / totalActiveFarmers) : 0,
    topHarvester: harvestLeaderboard[0] || null,
    topHelper: kindnessLeaderboard[0] || null
  }
}
