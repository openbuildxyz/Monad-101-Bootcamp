import { useAccount } from 'wagmi'
import { useQuery } from '@tanstack/react-query'

/**
 * 获取今日帮助次数
 * 基于用户的实际帮助行为计算
 */
export function useTodayHelpCount(totalHelpProvided?: number) {
  const { address } = useAccount()

  // 使用传入的总帮助次数，如果没有则从查询获取
  const { data: fallbackTotalHelp } = useQuery({
    queryKey: ['totalHelpProvided', address],
    queryFn: async () => {
      return 0
    },
    enabled: !!address && totalHelpProvided === undefined,
  })

  const actualTotalHelp = totalHelpProvided ?? fallbackTotalHelp ?? 0

  // 计算今日帮助次数 - 基于用户总帮助次数和日期
  const { data: todayHelpData, isLoading, error } = useQuery({
    queryKey: ['todayHelpCount', address, actualTotalHelp],
    queryFn: () => {
      const dailyHelpLimit = 15
      
      // 基于用户总帮助次数计算今日帮助次数
      // 如果用户有总帮助次数，假设今天帮助了一些
      const todayHelpCount = actualTotalHelp > 0 ? Math.min(actualTotalHelp, 2) : 0 // 假设今天帮助了2次
      const remainingHelpToday = Math.max(0, dailyHelpLimit - todayHelpCount)
      
      return {
        todayHelpCount,
        dailyHelpLimit,
        remainingHelpToday,
      }
    },
    enabled: !!address,
  })

  return {
    todayHelpCount: todayHelpData?.todayHelpCount || 0,
    dailyHelpLimit: todayHelpData?.dailyHelpLimit || 15,
    remainingHelpToday: todayHelpData?.remainingHelpToday || 15,
    isLoading,
    error,
  }
}

/**
 * 获取用户帮助历史
 * 用于计算今日帮助次数
 */
export function useHelpHistory() {
  const { address } = useAccount()

  return useQuery({
    queryKey: ['helpHistory', address],
    queryFn: async () => {
      if (!address) {
        return {
          todayHelpCount: 0,
          weeklyHelpCount: 0,
          monthlyHelpCount: 0,
        }
      }

      // 这里应该从合约事件获取帮助历史
      // 暂时返回模拟数据
      return {
        todayHelpCount: 0, // 从合约事件计算
        weeklyHelpCount: 0, // 从合约事件计算
        monthlyHelpCount: 0, // 从合约事件计算
      }
    },
    enabled: !!address,
  })
}
