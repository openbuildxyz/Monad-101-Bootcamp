// 通用辅助工具函数
import { clsx, type ClassValue } from 'clsx'

/**
 * 类名合并工具（结合 clsx）
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

/**
 * 延迟执行函数
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return function debounced(...args: Parameters<T>) {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => func(...args), wait)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let lastFunc: ReturnType<typeof setTimeout> | null = null
  let lastRan: number | null = null

  return function throttled(...args: Parameters<T>) {
    if (lastRan === null) {
      func(...args)
      lastRan = Date.now()
    } else {
      if (lastFunc) clearTimeout(lastFunc)
      lastFunc = setTimeout(() => {
        if (Date.now() - (lastRan as number) >= limit) {
          func(...args)
          lastRan = Date.now()
        }
      }, limit - (Date.now() - lastRan))
    }
  }
}

/**
 * 生成唯一ID
 */
export function generateId(prefix = ''): string {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substr(2, 9)
  return prefix ? `${prefix}_${timestamp}_${randomStr}` : `${timestamp}_${randomStr}`
}

/**
 * 深拷贝对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T

  const clonedObj = {} as T
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clonedObj[key] = deepClone(obj[key])
    }
  }
  return clonedObj
}

/**
 * 检查对象是否为空
 */
export function isEmpty(obj: unknown): boolean {
  if (obj == null) return true
  if (typeof obj === 'boolean') return false
  if (typeof obj === 'number') return false
  if (typeof obj === 'string') return obj.length === 0
  if (Array.isArray(obj)) return obj.length === 0
  if (typeof obj === 'object') return Object.keys(obj).length === 0
  return false
}

/**
 * 安全的 JSON 解析
 */
export function safeJsonParse<T>(str: string, defaultValue: T): T {
  try {
    const parsed = JSON.parse(str)
    return parsed !== null ? parsed : defaultValue
  } catch {
    return defaultValue
  }
}

/**
 * 安全的 JSON 字符串化
 */
export function safeJsonStringify(obj: unknown): string {
  try {
    return JSON.stringify(obj)
  } catch {
    return '{}'
  }
}

/**
 * 从数组中移除重复元素
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array))
}

/**
 * 数组分块
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

/**
 * 随机选择数组元素
 */
export function sample<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * 洗牌算法
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * 限制数值范围
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * 检查是否是有效的以太坊地址
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

/**
 * 检查是否是移动设备
 */
export function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

/**
 * 复制文本到剪贴板
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // 回退方案
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      textArea.setSelectionRange(0, 99999)
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      return successful
    }
  } catch {
    return false
  }
}

/**
 * 下载文件
 */
export function downloadFile(content: string, filename: string, contentType = 'text/plain') {
  const blob = new Blob([content], { type: contentType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 获取文件扩展名
 */
export function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.')
  return lastDotIndex !== -1 ? filename.slice(lastDotIndex + 1).toLowerCase() : ''
}

/**
 * 生成颜色（基于字符串哈希）
 */
export function generateColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }

  const hue = hash % 360
  return `hsl(${hue}, 70%, 50%)`
}

/**
 * 计算百分比变化
 */
export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue > 0 ? 100 : 0
  return ((newValue - oldValue) / oldValue) * 100
}

/**
 * 格式化数字输入（移除非数字字符）
 */
export function formatNumberInput(value: string): string {
  return value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
}

/**
 * 检查字符串是否为有效数字
 */
export function isValidNumber(str: string): boolean {
  return !isNaN(Number(str)) && !isNaN(parseFloat(str))
}

/**
 * 获取对象属性的安全访问器
 */
export function get<T>(obj: unknown, path: string, defaultValue?: T): T {
  const keys = path.split('.')
  let result: unknown = obj

  for (const key of keys) {
    if (result == null || typeof result !== 'object') {
      return defaultValue as T
    }
    result = (result as Record<string, unknown>)[key]
  }

  return result as T
}

/**
 * 设置对象属性
 */
export function set(obj: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split('.')
  const lastKey = keys.pop()

  if (!lastKey) return

  let current = obj
  for (const key of keys) {
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key] as Record<string, unknown>
  }

  current[lastKey] = value
}

/**
 * 等待条件满足
 */
export function waitUntil(
  condition: () => boolean,
  timeout = 5000,
  interval = 100
): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()

    const check = () => {
      if (condition()) {
        resolve()
      } else if (Date.now() - startTime >= timeout) {
        reject(new Error('Timeout waiting for condition'))
      } else {
        setTimeout(check, interval)
      }
    }

    check()
  })
}