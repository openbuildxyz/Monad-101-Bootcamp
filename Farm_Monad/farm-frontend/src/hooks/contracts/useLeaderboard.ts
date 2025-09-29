import { useQuery } from '@tanstack/react-query'
import { useContractRead } from 'wagmi'
import { CONTRACTS } from '@/types/contracts'
import { FarmGameABI } from '@/contracts'

// 排行榜条目接口
export interface LeaderboardEntry {
  rank: number
  address: string
  cropsHarvested: number
  cropsStolen: number
  helpProvided: number
  kindBalance: string
  score: number
}

// 简化的玩家地址获取 - 使用预定义的测试地址
export function useAllPlayerAddresses() {
  return useQuery({
    queryKey: ['allPlayerAddresses'],
    queryFn: async () => {
      console.log('使用预定义的测试地址列表')
      
      // 返回一些测试地址，您可以根据实际情况修改这些地址
      const testAddresses = [
        '0x13BA139880896d9DbaFD96Bf79233fCBF564C2C9',
        '0x45e1913258cb5dFC3EE683beCCFEBb0E3102374f', 
        '0xd857e1E4E3c042B1cF0996E89A54C686bA87f8E2'
      ]
      
      console.log('返回的测试地址:', testAddresses)
      return testAddresses
    },
    refetchInterval: 60000, // 1分钟刷新一次
  })
}

// 获取指定玩家的统计数据
export function usePlayerStats(address: string) {
  const { data: playerStats, isLoading, error } = useContractRead({
    address: CONTRACTS.FarmGame,
    abi: FarmGameABI,
    functionName: 'getPlayerStats',
    args: [address as `0x${string}`],
    enabled: !!address,
  })

  return {
    address,
    stats: playerStats ? {
      totalCropsHarvested: Number(playerStats.totalCropsHarvested),
      totalCropsStolen: Number(playerStats.totalCropsStolen),
      totalHelpProvided: Number(playerStats.totalHelpProvided),
    } : null,
    isLoading,
    error
  }
}

// 简化的排行榜数据构建 - 使用测试数据
export function useLeaderboardData() {
  const { data: allPlayerAddresses, isLoading: addressesLoading } = useAllPlayerAddresses()

  return useQuery({
    queryKey: ['leaderboardData', allPlayerAddresses],
    queryFn: async () => {
      console.log('获取到的玩家地址:', allPlayerAddresses)
      
      if (!allPlayerAddresses || allPlayerAddresses.length === 0) {
        return {
          cropLeaderboard: [] as LeaderboardEntry[],
          kindnessLeaderboard: [] as LeaderboardEntry[],
          stats: {
            activeFarmers: 0,
            totalCropsHarvested: 0,
            totalHelpProvided: 0
          }
        }
      }

      // 为每个测试地址生成模拟数据
      const playerStats = allPlayerAddresses.map((address, index) => {
        const baseScore = (index + 1) * 10
        return {
          address,
          totalCropsHarvested: baseScore + Math.floor(Math.random() * 20),
          totalCropsStolen: Math.floor(Math.random() * 10),
          totalHelpProvided: Math.floor(Math.random() * 15),
          kindBalance: BigInt((baseScore + Math.floor(Math.random() * 50)) * 10**18)
        }
      })
      
      console.log('生成的玩家统计数据:', playerStats)
      
      // 计算总统计
      const totalCropsHarvested = playerStats.reduce((sum, player) => sum + player.totalCropsHarvested, 0)
      const totalHelpProvided = playerStats.reduce((sum, player) => sum + player.totalHelpProvided, 0)
      
      // 构建收获排行榜（按收获数 + 偷菜数排序）
      const cropLeaderboard = playerStats
        .map((player) => ({
          rank: 0, // 稍后设置
          address: player.address,
          cropsHarvested: player.totalCropsHarvested,
          cropsStolen: player.totalCropsStolen,
          helpProvided: player.totalHelpProvided,
          kindBalance: player.kindBalance.toString(),
          score: player.totalCropsHarvested + player.totalCropsStolen
        }))
        .sort((a, b) => b.score - a.score) // 按分数降序排序
        .map((entry, index) => ({
          ...entry,
          rank: index + 1
        }))

      // 构建善良值排行榜（按KIND余额排序）
      const kindnessLeaderboard = playerStats
        .map((player) => ({
          rank: 0, // 稍后设置
          address: player.address,
          cropsHarvested: player.totalCropsHarvested,
          cropsStolen: player.totalCropsStolen,
          helpProvided: player.totalHelpProvided,
          kindBalance: player.kindBalance.toString(),
          score: Number(player.kindBalance / BigInt(10**18)) // 转换为KIND数量
        }))
        .sort((a, b) => b.score - a.score) // 按KIND余额降序排序
        .map((entry, index) => ({
          ...entry,
          rank: index + 1
        }))

      console.log('构建的排行榜数据:', {
        cropLeaderboard,
        kindnessLeaderboard,
        stats: {
          activeFarmers: allPlayerAddresses.length,
          totalCropsHarvested,
          totalHelpProvided
        }
      })
      
      return {
        cropLeaderboard,
        kindnessLeaderboard,
        stats: {
          activeFarmers: allPlayerAddresses.length,
          totalCropsHarvested,
          totalHelpProvided
        }
      }
    },
    enabled: !addressesLoading && !!allPlayerAddresses,
    refetchInterval: 30000, // 30秒刷新一次
  })
}

// 获取全局统计数据（基于所有玩家数据）
export function useGlobalStats() {
  const { data: allPlayerAddresses, isLoading: addressesLoading } = useAllPlayerAddresses()

  return useQuery({
    queryKey: ['globalStats', allPlayerAddresses],
    queryFn: async () => {
      // 基于所有玩家地址计算统计
      return {
        activeFarmers: allPlayerAddresses?.length || 0,
        totalCropsHarvested: 0, // 需要获取所有玩家的收获数据
        totalHelpProvided: 0   // 需要获取所有玩家的帮助数据
      }
    },
    enabled: !addressesLoading,
    refetchInterval: 60000, // 1分钟刷新一次
  })
}

// 获取收获排行榜
export function useCropLeaderboard() {
  const { data: leaderboardData, isLoading, error } = useLeaderboardData()
  
  return {
    data: leaderboardData?.cropLeaderboard || [],
    isLoading,
    error
  }
}

// 获取善良值排行榜
export function useKindnessLeaderboard() {
  const { data: leaderboardData, isLoading, error } = useLeaderboardData()
  
  return {
    data: leaderboardData?.kindnessLeaderboard || [],
    isLoading,
    error
  }
}

// 获取排行榜统计
export function useLeaderboardStats() {
  const { data: globalStats, isLoading, error } = useGlobalStats()
  
  return {
    data: globalStats,
    isLoading,
    error
  }
}

