/**
 * 安全地处理 BigInt 转换的工具函数
 * 避免序列化错误
 */

/**
 * 将 BigInt 安全地转换为数字
 */
export function safeBigIntToNumber(value: bigint | undefined | null): number {
  if (value === undefined || value === null) {
    return 0
  }
  
  try {
    return Number(value)
  } catch (error) {
    console.warn('BigInt conversion failed:', error)
    return 0
  }
}

/**
 * 将 BigInt 安全地转换为字符串
 */
export function safeBigIntToString(value: bigint | undefined | null): string {
  if (value === undefined || value === null) {
    return '0'
  }
  
  try {
    return value.toString()
  } catch (error) {
    console.warn('BigInt to string conversion failed:', error)
    return '0'
  }
}

/**
 * 安全地处理合约返回的 BigInt 数组
 */
export function safeBigIntArrayToNumbers(values: (bigint | undefined)[]): number[] {
  return values.map(value => safeBigIntToNumber(value))
}

/**
 * 检查值是否为有效的 BigInt
 */
export function isValidBigInt(value: any): value is bigint {
  return typeof value === 'bigint'
}

/**
 * 安全地序列化包含 BigInt 的对象
 */
export function safeSerializeWithBigInt(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj
  }
  
  if (typeof obj === 'bigint') {
    return Number(obj)
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => safeSerializeWithBigInt(item))
  }
  
  if (typeof obj === 'object') {
    const result: any = {}
    for (const [key, value] of Object.entries(obj)) {
      result[key] = safeSerializeWithBigInt(value)
    }
    return result
  }
  
  return obj
}
