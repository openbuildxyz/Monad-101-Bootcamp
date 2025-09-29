import { useAccount } from 'wagmi'
import { useContractRead } from 'wagmi'
import { CONTRACTS } from '@/types/contracts'
import { FarmGameABI } from '@/contracts'

/**
 * 简单的合约连接测试Hook
 */
export function useContractTest() {
  const { isConnected, address } = useAccount()

  // 测试获取玩家数量
  const { data: totalPlayers, isLoading: playersLoading, error: playersError } = useContractRead({
    address: CONTRACTS.FarmGame,
    abi: FarmGameABI,
    functionName: 'getTotalPlayers',
    enabled: isConnected,
  })

  // 测试获取玩家统计
  const { data: playerStats, isLoading: statsLoading, error: statsError } = useContractRead({
    address: CONTRACTS.FarmGame,
    abi: FarmGameABI,
    functionName: 'playerStats',
    args: address ? [address] : undefined,
    enabled: isConnected && !!address,
  })

  // 测试排行榜函数 - 限制为1个结果
  const { data: harvestLeaderboard, isLoading: harvestLoading, error: harvestError } = useContractRead({
    address: CONTRACTS.FarmGame,
    abi: FarmGameABI,
    functionName: 'getHarvestLeaderboard',
    args: [BigInt(1)],
    enabled: isConnected,
  })

  const { data: kindnessLeaderboard, isLoading: kindnessLoading, error: kindnessError } = useContractRead({
    address: CONTRACTS.FarmGame,
    abi: FarmGameABI,
    functionName: 'getKindnessLeaderboard',
    args: [BigInt(1)],
    enabled: isConnected,
  })

  return {
    // 连接状态
    isConnected,
    address,
    
    
    totalPlayers,
    playersLoading,
    playersError,
    
    // 玩家统计
    playerStats,
    statsLoading,
    statsError,
    
    // 排行榜测试
    harvestLeaderboard,
    harvestLoading,
    harvestError,
    
    kindnessLeaderboard,
    kindnessLoading,
    kindnessError,
    
    // 调试信息
    debugInfo: {
      contractAddress: CONTRACTS.FarmGame,
      hasHarvestData: !!harvestLeaderboard,
      hasKindnessData: !!kindnessLeaderboard,
      harvestDataLength: Array.isArray(harvestLeaderboard) ? harvestLeaderboard.length : 0,
      kindnessDataLength: Array.isArray(kindnessLeaderboard) ? kindnessLeaderboard.length : 0,
      totalPlayersValue: totalPlayers?.toString(),
    }
  }
}
