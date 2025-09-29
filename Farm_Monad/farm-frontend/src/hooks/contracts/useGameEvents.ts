import { useAccount } from 'wagmi'
import { useContractRead } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { CONTRACTS } from '@/types/contracts'
import { FarmGameABI } from '@/contracts'

/**
 * 获取游戏事件数据的Hook
 */
export function useGameEvents(limit = 20) {
  const { data: recentEvents, isLoading, error, refetch } = useContractRead({
    address: CONTRACTS.FarmGame,
    abi: FarmGameABI,
    functionName: 'getRecentEvents',
    args: [BigInt(limit)],
    enabled: true,
  })

  // 处理和格式化事件数据
  const formattedEvents = useQuery({
    queryKey: ['formattedGameEvents', recentEvents],
    queryFn: () => {
      if (!recentEvents || !Array.isArray(recentEvents)) {
        return []
      }

      return recentEvents.map((event: any, index: number) => ({
        id: `event_${index}`,
        player: event.player as `0x${string}`,
        timestamp: Number(event.timestamp),
        eventType: event.eventType as string,
        landId: Number(event.landId),
        seedTokenId: Number(event.seedTokenId),
        value: Number(event.value),
        description: event.description as string,
        // 添加一些UI辅助属性
        displayTime: new Date(Number(event.timestamp) * 1000).toLocaleString(),
        relativeTime: getRelativeTime(Number(event.timestamp) * 1000),
        emoji: getEventEmoji(event.eventType),
        color: getEventColor(event.eventType)
      }))
    },
    enabled: !!recentEvents,
  })

  return {
    events: formattedEvents.data || [],
    isLoading: isLoading || formattedEvents.isLoading,
    error: error || formattedEvents.error,
    refetch,
    totalEvents: recentEvents?.length || 0
  }
}

/**
 * 获取玩家个人事件数据的Hook
 */
export function usePlayerEvents(limit = 10) {
  const { address } = useAccount()

  const { data: playerEvents, isLoading, error, refetch } = useContractRead({
    address: CONTRACTS.FarmGame,
    abi: FarmGameABI,
    functionName: 'getPlayerEvents',
    args: address ? [address, BigInt(limit)] : undefined,
    enabled: !!address,
  })

  // 处理和格式化玩家事件数据
  const formattedEvents = useQuery({
    queryKey: ['formattedPlayerEvents', address, playerEvents],
    queryFn: () => {
      if (!playerEvents || !Array.isArray(playerEvents)) {
        return []
      }

      return playerEvents.map((event: any, index: number) => ({
        id: `player_event_${index}`,
        player: event.player as `0x${string}`,
        timestamp: Number(event.timestamp),
        eventType: event.eventType as string,
        landId: Number(event.landId),
        seedTokenId: Number(event.seedTokenId),
        value: Number(event.value),
        description: event.description as string,
        // 添加一些UI辅助属性
        displayTime: new Date(Number(event.timestamp) * 1000).toLocaleString(),
        relativeTime: getRelativeTime(Number(event.timestamp) * 1000),
        emoji: getEventEmoji(event.eventType),
        color: getEventColor(event.eventType)
      }))
    },
    enabled: !!playerEvents && !!address,
  })

  return {
    events: formattedEvents.data || [],
    isLoading: isLoading || formattedEvents.isLoading,
    error: error || formattedEvents.error,
    refetch,
    totalEvents: playerEvents?.length || 0,
    hasEvents: (formattedEvents.data?.length || 0) > 0
  }
}

/**
 * 获取玩家事件总数的Hook
 */
export function usePlayerEventCount() {
  const { address } = useAccount()

  const { data: eventCount, isLoading, error } = useContractRead({
    address: CONTRACTS.FarmGame,
    abi: FarmGameABI,
    functionName: 'getPlayerEventCount',
    args: address ? [address] : undefined,
    enabled: !!address,
  })

  return {
    count: eventCount ? Number(eventCount) : 0,
    isLoading,
    error
  }
}

/**
 * 获取全服总事件数的Hook
 */
export function useTotalEventCount() {
  const { data: totalEvents, isLoading, error } = useContractRead({
    address: CONTRACTS.FarmGame,
    abi: FarmGameABI,
    functionName: 'totalEvents',
    enabled: true,
  })

  return {
    count: totalEvents ? Number(totalEvents) : 0,
    isLoading,
    error
  }
}

/**
 * 实时事件监听Hook (组合多个事件源)
 */
export function useRealTimeEvents() {
  const gameEvents = useGameEvents(50) // 获取更多全服事件
  const playerEvents = usePlayerEvents(20) // 获取个人事件
  const totalCount = useTotalEventCount()

  // 定期刷新数据
  const { data: refreshData } = useQuery({
    queryKey: ['realTimeEventsRefresh'],
    queryFn: async () => {
      // 每30秒刷新一次事件数据
      gameEvents.refetch()
      playerEvents.refetch()
      return Date.now()
    },
    refetchInterval: 30000, // 30秒
  })

  return {
    allEvents: gameEvents.events,
    playerEvents: playerEvents.events,
    totalEventCount: totalCount.count,
    isLoading: gameEvents.isLoading || playerEvents.isLoading,
    error: gameEvents.error || playerEvents.error,
    lastRefresh: refreshData,
    refetch: () => {
      gameEvents.refetch()
      playerEvents.refetch()
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

// 辅助函数：根据事件类型获取emoji
function getEventEmoji(eventType: string): string {
  switch (eventType) {
    case 'purchase':
      return '🛒'
    case 'plant':
      return '🌱'
    case 'harvest':
      return '🌾'
    case 'steal':
      return '🥷'
    case 'help':
      return '🤝'
    case 'boost':
      return '⚡'
    default:
      return '📝'
  }
}

// 辅助函数：根据事件类型获取颜色
function getEventColor(eventType: string): string {
  switch (eventType) {
    case 'purchase':
      return 'bg-blue-50 border-blue-200 text-blue-700'
    case 'plant':
      return 'bg-green-50 border-green-200 text-green-700'
    case 'harvest':
      return 'bg-yellow-50 border-yellow-200 text-yellow-700'
    case 'steal':
      return 'bg-red-50 border-red-200 text-red-700'
    case 'help':
      return 'bg-purple-50 border-purple-200 text-purple-700'
    case 'boost':
      return 'bg-indigo-50 border-indigo-200 text-indigo-700'
    default:
      return 'bg-gray-50 border-gray-200 text-gray-700'
  }
}