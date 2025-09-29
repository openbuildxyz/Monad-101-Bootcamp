import { useAccount } from 'wagmi'
import { useContractRead } from 'wagmi'
import { CONTRACTS } from '@/types/contracts'
import { FarmGameABI } from '@/contracts'

/**
 * 调试排行榜Hook - 用于排查问题
 */
export function useLeaderboardDebug() {
  const { isConnected, address } = useAccount()

  // 测试基本合约连接
  const { data: totalPlayers, isLoading: playersLoading, error: playersError } = useContractRead({
    address: CONTRACTS.FarmGame,
    abi: FarmGameABI,
    functionName: 'getTotalPlayers',
    enabled: isConnected,
  })

  // 测试排行榜函数调用
  const { data: harvestLeaderboard, isLoading: harvestLoading, error: harvestError } = useContractRead({
    address: CONTRACTS.FarmGame,
    abi: FarmGameABI,
    functionName: 'getHarvestLeaderboard',
    args: [BigInt(10)],
    enabled: isConnected,
  })

  const { data: kindnessLeaderboard, isLoading: kindnessLoading, error: kindnessError } = useContractRead({
    address: CONTRACTS.FarmGame,
    abi: FarmGameABI,
    functionName: 'getKindnessLeaderboard',
    args: [BigInt(10)],
    enabled: isConnected,
  })

  return {
    // 连接状态
    isConnected,
    address,
    
    // 基本合约连接测试
    totalPlayers,
    playersLoading,
    playersError,
    
    // 排行榜数据
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
    }
  }
}
