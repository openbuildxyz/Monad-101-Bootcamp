// 格式化工具函数
import { formatEther, formatUnits } from 'viem'

/**
 * 格式化以太币数值
 */
export function formatEth(value: bigint, decimals = 4): string {
  const formatted = formatEther(value)
  return parseFloat(formatted).toFixed(decimals)
}

/**
 * 格式化 KIND 代币数值
 */
export function formatKind(value: bigint, decimals = 2): string {
  const formatted = formatUnits(value, 18)
  return parseFloat(formatted).toFixed(decimals)
}

/**
 * 格式化大数字显示
 */
export function formatLargeNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

/**
 * 格式化地址显示
 */
export function formatAddress(address: string, start = 6, end = 4): string {
  if (!address) return ''
  if (address.length < start + end) return address
  return `${address.slice(0, start)}...${address.slice(-end)}`
}

/**
 * 格式化时间显示
 */
export function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}秒`
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    return `${minutes}分钟`
  } else {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return minutes > 0 ? `${hours}小时${minutes}分钟` : `${hours}小时`
  }
}

/**
 * 格式化剩余时间（倒计时）
 */
export function formatCountdown(targetTime: number): string {
  const now = Date.now()
  const diff = Math.max(0, targetTime - now)

  if (diff === 0) return '已完成'

  const seconds = Math.floor(diff / 1000)
  return formatTime(seconds)
}

/**
 * 格式化日期
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

/**
 * 格式化相对时间
 */
export function formatRelativeTime(timestamp: number): string {
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

/**
 * 格式化百分比
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * 格式化成长进度
 */
export function formatGrowthProgress(accumulated: bigint, required = 3600n): string {
  const progress = Number(accumulated) / Number(required)
  return formatPercentage(Math.min(progress * 100, 100))
}

/**
 * 格式化交易哈希
 */
export function formatTxHash(hash: string): string {
  return formatAddress(hash, 10, 6)
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  const sizes = ['B', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 B'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * 格式化价格显示
 */
export function formatPrice(price: bigint, currency: 'ETH' | 'KIND'): string {
  if (currency === 'ETH') {
    return `${formatEth(price)} ETH`
  } else {
    return `${formatKind(price)} KIND`
  }
}