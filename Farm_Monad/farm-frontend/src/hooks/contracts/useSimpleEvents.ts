import { useAccount } from 'wagmi'
import { useContractRead } from 'wagmi'
import { CONTRACTS } from '@/types/contracts'
import { FarmGameABI } from '@/contracts'
import { formatAddress } from '@/utils/format'

/**
 * 简化的事件Hook - 直接使用合约数据
 */
export function useSimpleEvents() {
  const { isConnected, address } = useAccount()

  // 获取全服事件
  const { 
    data: allEventsData, 
    isLoading: allEventsLoading, 
    error: allEventsError,
    refetch: refetchAllEvents
  } = useContractRead({
    address: CONTRACTS.FarmGame,
    abi: FarmGameABI,
    functionName: 'getRecentEvents',
    args: [BigInt(50)],
    enabled: isConnected,
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

  // 获取总事件数
  const { 
    data: totalEventCount, 
    isLoading: totalCountLoading, 
    error: totalCountError
  } = useContractRead({
    address: CONTRACTS.FarmGame,
    abi: FarmGameABI,
    functionName: 'totalEvents',
    enabled: isConnected,
  })

  // 格式化全服事件数据
  const allEvents = allEventsData ? allEventsData.map((event: any, index: number) => ({
    id: `event_${index}`,
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

  return {
    // 全服事件
    allEvents,
    allEventsLoading,
    allEventsError,

    // 个人事件
    playerEvents,
    playerEventsLoading,
    playerEventsError,

    // 总事件数
    totalEventCount: totalEventCount ? Number(totalEventCount) : 0,
    totalCountLoading,
    totalCountError,

    // 整体状态
    isLoading: allEventsLoading || playerEventsLoading || totalCountLoading,
    hasError: allEventsError || playerEventsError || totalCountError,

    // 刷新函数
    refetch: () => {
      refetchAllEvents()
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
