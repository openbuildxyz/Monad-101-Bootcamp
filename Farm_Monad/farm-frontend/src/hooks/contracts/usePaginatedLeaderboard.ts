import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useContractRead } from 'wagmi'
import { CONTRACTS } from '@/types/contracts'
import { FarmGameABI } from '@/contracts'
import { formatAddress, formatKind } from '@/utils/format'

/**
 * 分页排行榜Hook - 每页20条数据
 */
export function usePaginatedLeaderboard() {
  const { isConnected, address } = useAccount()
  const [currentPage, setCurrentPage] = useState(1)
  const entriesPerPage = 20

  // 获取收获排行榜数据
  const { 
    data: harvestData, 
    isLoading: harvestLoading, 
    error: harvestError,
    refetch: refetchHarvest
  } = useContractRead({
    address: CONTRACTS.FarmGame,
    abi: FarmGameABI,
    functionName: 'getHarvestLeaderboard',
    args: [BigInt(100)], // 获取更多数据以支持分页
    enabled: isConnected,
  })

  // 获取善良值排行榜数据
  const { 
    data: kindnessData, 
    isLoading: kindnessLoading, 
    error: kindnessError,
    refetch: refetchKindness
  } = useContractRead({
    address: CONTRACTS.FarmGame,
    abi: FarmGameABI,
    functionName: 'getKindnessLeaderboard',
    args: [BigInt(100)], // 获取更多数据以支持分页
    enabled: isConnected,
  })

  // 获取统计数据 - 使用多个单独的合约调用
  const { 
    data: totalPlayers, 
    isLoading: playersLoading, 
    error: playersError
  } = useContractRead({
    address: CONTRACTS.FarmGame,
    abi: FarmGameABI,
    functionName: 'getTotalPlayers',
    enabled: isConnected,
  })

  const { 
    data: totalHarvests, 
    isLoading: harvestsLoading, 
    error: harvestsError
  } = useContractRead({
    address: CONTRACTS.FarmGame,
    abi: FarmGameABI,
    functionName: 'totalEvents',
    enabled: isConnected,
  })

  const { 
    data: totalHelpCount, 
    isLoading: helpLoading, 
    error: helpError
  } = useContractRead({
    address: CONTRACTS.FarmGame,
    abi: FarmGameABI,
    functionName: 'totalEvents',
    enabled: isConnected,
  })

  // 计算分页信息
  const harvestEntries = harvestData || []
  const kindnessEntries = kindnessData || []
  
  // 收获排行榜分页
  const harvestTotalPages = Math.ceil(harvestEntries.length / entriesPerPage)
  const harvestStartIndex = (currentPage - 1) * entriesPerPage
  const harvestEndIndex = Math.min(harvestStartIndex + entriesPerPage, harvestEntries.length)
  const currentHarvestEntries = harvestEntries.slice(harvestStartIndex, harvestEndIndex)
  
  // 善良值排行榜分页
  const kindnessTotalPages = Math.ceil(kindnessEntries.length / entriesPerPage)
  const kindnessStartIndex = (currentPage - 1) * entriesPerPage
  const kindnessEndIndex = Math.min(kindnessStartIndex + entriesPerPage, kindnessEntries.length)
  const currentKindnessEntries = kindnessEntries.slice(kindnessStartIndex, kindnessEndIndex)

  // 格式化收获排行榜数据
  const formattedHarvestLeaderboard = currentHarvestEntries.map((entry: any, index: number) => ({
    rank: harvestStartIndex + index + 1,
    player: entry.player as `0x${string}`,
    harvestCount: Number(entry.harvestCount),
    stealCount: Number(entry.stealCount),
    totalScore: Number(entry.harvestCount) + Number(entry.stealCount),
    displayAddress: formatAddress(entry.player),
    isCurrentPlayer: address?.toLowerCase() === entry.player.toLowerCase()
  }))

  // 格式化善良值排行榜数据
  const formattedKindnessLeaderboard = currentKindnessEntries.map((entry: any, index: number) => ({
    rank: kindnessStartIndex + index + 1,
    player: entry.player as `0x${string}`,
    kindBalance: entry.kindBalance,
    displayKindBalance: entry.kindBalance ? formatKind(entry.kindBalance, 2) : '0.00',
    displayAddress: formatAddress(entry.player),
    isCurrentPlayer: address?.toLowerCase() === entry.player.toLowerCase()
  }))

  // 分页控制函数
  const goToPage = (page: number) => {
    if (page >= 1 && page <= Math.max(harvestTotalPages, kindnessTotalPages)) {
      setCurrentPage(page)
    }
  }

  const goToNextPage = () => {
    const maxPages = Math.max(harvestTotalPages, kindnessTotalPages)
    if (currentPage < maxPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToFirstPage = () => {
    setCurrentPage(1)
  }

  const goToLastPage = () => {
    const maxPages = Math.max(harvestTotalPages, kindnessTotalPages)
    setCurrentPage(maxPages)
  }

  // 调试信息
  console.log('排行榜分页调试信息:', {
    currentPage,
    entriesPerPage,
    harvestEntriesLength: harvestEntries.length,
    kindnessEntriesLength: kindnessEntries.length,
    harvestTotalPages,
    kindnessTotalPages,
    harvestStartIndex,
    harvestEndIndex,
    kindnessStartIndex,
    kindnessEndIndex,
    currentHarvestEntriesLength: currentHarvestEntries.length,
    currentKindnessEntriesLength: currentKindnessEntries.length
  })

  return {
    // 收获排行榜数据
    harvestLeaderboard: formattedHarvestLeaderboard,
    harvestTotalPages,
    harvestTotalEntries: harvestEntries.length,
    harvestHasNextPage: currentPage < harvestTotalPages,
    harvestHasPrevPage: currentPage > 1,

    // 善良值排行榜数据
    kindnessLeaderboard: formattedKindnessLeaderboard,
    kindnessTotalPages,
    kindnessTotalEntries: kindnessEntries.length,
    kindnessHasNextPage: currentPage < kindnessTotalPages,
    kindnessHasPrevPage: currentPage > 1,

    // 统计数据
    stats: {
      totalPlayers: totalPlayers ? Number(totalPlayers) : 0,
      totalHarvests: totalHarvests ? Number(totalHarvests) : 0,
      totalHelpCount: totalHelpCount ? Number(totalHelpCount) : 0
    },

    // 加载状态
    isLoading: harvestLoading || kindnessLoading || playersLoading || harvestsLoading || helpLoading,
    hasError: harvestError || kindnessError || playersError || harvestsError || helpError,

    // 分页控制
    currentPage,
    goToPage,
    goToNextPage,
    goToPrevPage,
    goToFirstPage,
    goToLastPage,

    // 刷新函数
    refetch: () => {
      refetchHarvest()
      refetchKindness()
    }
  }
}
