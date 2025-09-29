import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useContractRead } from 'wagmi'
import { CONTRACTS } from '@/types/contracts'
import { FarmGameABI } from '@/contracts'
import { formatAddress } from '@/utils/format'

/**
 * 分页事件Hook - 每页20个事件
 */
export function usePaginatedEvents() {
  const { isConnected, address } = useAccount()
  const [currentPage, setCurrentPage] = useState(1)
  const eventsPerPage = 20

  // 获取总事件数
  const { 
    data: totalEvents, 
    isLoading: totalLoading, 
    error: totalError
  } = useContractRead({
    address: CONTRACTS.FarmGame,
    abi: FarmGameABI,
    functionName: 'totalEvents',
    enabled: isConnected,
  })

  // 计算总事件数
  const totalEventsCount = totalEvents ? Number(totalEvents) : 0
  
  // 获取所有事件数据（一次性获取所有数据，然后前端分页）
  const { 
    data: allEventsData, 
    isLoading: pageLoading, 
    error: pageError,
    refetch: refetchPage
  } = useContractRead({
    address: CONTRACTS.FarmGame,
    abi: FarmGameABI,
    functionName: 'getRecentEvents',
    args: [BigInt(totalEventsCount)], // 获取所有事件
    enabled: isConnected && totalEventsCount > 0,
  })

  // 获取个人事件
  const { 
    data: playerEventsData, 
    isLoading: playerEventsLoading, 
    error: playerEventsError,
    refetch: refetchPlayerEvents
  } = useContractRead({
    address: CONTRACTS.FarmGame,
    abi: FarmGameABI,
    functionName: 'getPlayerEvents',
    args: address ? [address, BigInt(20)] : undefined,
    enabled: isConnected && !!address,
  })

  // 计算当前页的事件范围
  const startIndex = (currentPage - 1) * eventsPerPage
  const endIndex = Math.min(startIndex + eventsPerPage, allEventsData?.length || 0)
  
  // 从获取的所有事件中截取当前页的数据
  const currentPageEvents = allEventsData ? allEventsData.slice(startIndex, endIndex) : []
  
  // 格式化当前页事件数据
  const pageEvents = currentPageEvents.map((event: any, index: number) => ({
    id: `event_${startIndex + index}`,
    player: event.player as `0x${string}`,
    timestamp: Number(event.timestamp),
    eventType: event.eventType as string,
    landId: Number(event.landId),
    seedTokenId: Number(event.seedTokenId),
    value: Number(event.value),
    description: event.description as string,
    // UI辅助属性
    displayAddress: formatAddress(event.player),
    displayTime: new Date(Number(event.timestamp) * 1000).toLocaleString(),
    relativeTime: getRelativeTime(Number(event.timestamp) * 1000),
    emoji: getEventEmoji(event.eventType),
    color: getEventColor(event.eventType)
  }))

  // 格式化个人事件数据
  const playerEvents = playerEventsData ? playerEventsData.map((event: any, index: number) => ({
    id: `player_event_${index}`,
    player: event.player as `0x${string}`,
    timestamp: Number(event.timestamp),
    eventType: event.eventType as string,
    landId: Number(event.landId),
    seedTokenId: Number(event.seedTokenId),
    value: Number(event.value),
    description: event.description as string,
    // UI辅助属性
    displayAddress: formatAddress(event.player),
    displayTime: new Date(Number(event.timestamp) * 1000).toLocaleString(),
    relativeTime: getRelativeTime(Number(event.timestamp) * 1000),
    emoji: getEventEmoji(event.eventType),
    color: getEventColor(event.eventType)
  })) : []

  // 计算分页信息 - 分别处理全服事件和个人事件
  const actualEventsCount = allEventsData ? allEventsData.length : 0
  const playerEventsCount = playerEventsData ? playerEventsData.length : 0
  
  // 全服事件分页信息
  const globalTotalPages = Math.ceil(actualEventsCount / eventsPerPage)
  const globalHasNextPage = currentPage < globalTotalPages
  const globalHasPrevPage = currentPage > 1
  
  // 个人事件分页信息
  const personalTotalPages = Math.ceil(playerEventsCount / eventsPerPage)
  const personalHasNextPage = currentPage < personalTotalPages
  const personalHasPrevPage = currentPage > 1

  // 调试信息
  console.log('分页调试信息:', {
    currentPage,
    globalTotalPages,
    personalTotalPages,
    totalEventsCount,
    actualEventsCount,
    playerEventsCount,
    eventsPerPage,
    startIndex,
    endIndex,
    allEventsDataLength: allEventsData?.length || 0,
    currentPageEventsLength: currentPageEvents.length,
    pageEventsLength: pageEvents.length,
    globalNeedPagination: actualEventsCount > eventsPerPage,
    personalNeedPagination: playerEventsCount > eventsPerPage
  })

  // 分页控制函数
  const goToPage = (page: number) => {
    if (page >= 1 && page <= globalTotalPages) {
      setCurrentPage(page)
    }
  }

  const goToNextPage = () => {
    if (globalHasNextPage) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPrevPage = () => {
    if (globalHasPrevPage) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToFirstPage = () => {
    setCurrentPage(1)
  }

  const goToLastPage = () => {
    setCurrentPage(globalTotalPages)
  }

  return {
    // 事件数据
    allEvents: pageEvents,
    playerEvents,
    totalEventCount: totalEventsCount,

    // 加载状态
    isLoading: pageLoading || playerEventsLoading || totalLoading,
    hasError: pageError || playerEventsError || totalError,

    // 全服事件分页信息
    currentPage,
    totalPages: globalTotalPages,
    eventsPerPage,
    hasNextPage: globalHasNextPage,
    hasPrevPage: globalHasPrevPage,

    // 个人事件分页信息
    personalTotalPages,
    personalHasNextPage,
    personalHasPrevPage,
    personalEventsCount: playerEventsCount,

    // 分页控制
    goToPage,
    goToNextPage,
    goToPrevPage,
    goToFirstPage,
    goToLastPage,

    // 刷新函数
    refetch: () => {
      refetchPage()
      refetchPlayerEvents()
    }
  }
}

// 辅助函数：获取事件相对时间
function getRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp

  if (diff < 60000) { // 1分钟内
    return '刚刚'
  } else if (diff < 3600000) { // 1小时内
    const minutes = Math.floor(diff / 60000)
    return `${minutes}分钟前`
  } else if (diff < 86400000) { // 1天内
    const hours = Math.floor(diff / 3600000)
    return `${hours}小时前`
  } else {
    const days = Math.floor(diff / 86400000)
    return `${days}天前`
  }
}

// 辅助函数：获取事件表情
function getEventEmoji(eventType: string): string {
  switch (eventType) {
    case 'purchase': return '🛒'
    case 'plant': return '🌱'
    case 'harvest': return '🌾'
    case 'steal': return '🥷'
    case 'help': return '🤝'
    case 'boost': return '⚡'
    default: return '📝'
  }
}

// 辅助函数：获取事件颜色
function getEventColor(eventType: string): string {
  switch (eventType) {
    case 'purchase': return 'text-blue-600'
    case 'plant': return 'text-green-600'
    case 'harvest': return 'text-yellow-600'
    case 'steal': return 'text-red-600'
    case 'help': return 'text-purple-600'
    case 'boost': return 'text-orange-600'
    default: return 'text-gray-600'
  }
}
