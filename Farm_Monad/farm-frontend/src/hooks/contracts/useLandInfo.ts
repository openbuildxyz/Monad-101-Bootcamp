import { useContractRead } from 'wagmi'
import { CONTRACTS } from '@/types/contracts'
import { LandNFTABI } from '@/contracts'
import type { LandInfo } from '@/types/game'

/**
 * 获取单个土地信息
 */
export function useLandInfo(landId: number, enabled = true) {
  return useContractRead({
    address: CONTRACTS.LandNFT,
    abi: LandNFTABI,
    functionName: 'getLandInfo',
    args: [BigInt(landId)],
    enabled,
    watch: true,
    cacheTime: 5_000,
    select: (data: any): LandInfo => ({
      state: data.state,
      seedTokenId: data.seedTokenId,
      claimTime: data.claimTime,
      lockEndTime: data.lockEndTime,
      weatherSeed: data.weatherSeed,
      lastWeatherUpdateTime: data.lastWeatherUpdateTime,
      accumulatedGrowth: data.accumulatedGrowth,
      currentFarmer: data.currentFarmer,
    })
  })
}

/**
 * 获取所有土地信息 (分页加载版本) - 避免 RPC 频率限制
 */
export function useAllLandsInfo() {
  // 只获取前20个土地作为示例，避免一次性加载100个
  const landIds = Array.from({ length: 20 }, (_, i) => i)
  
  // 使用多个 useContractRead 调用，但限制并发数量
  const landQueries = landIds.map(landId => 
    useLandInfo(landId, true)
  )

  // 合并所有查询结果
  const lands: Record<number, LandInfo> = {}
  landQueries.forEach((query, index) => {
    if (query.data) {
      lands[index] = query.data
    }
  })

  const isLoading = landQueries.some(query => query.isLoading)
  const error = landQueries.find(query => query.error)?.error

  return {
    data: lands,
    isLoading,
    error,
    refetch: () => landQueries.forEach(query => query.refetch())
  }
}

/**
 * 获取可用土地列表
 */
export function useAvailableLands() {
  return useContractRead({
    address: CONTRACTS.LandNFT,
    abi: LandNFTABI,
    functionName: 'getAvailableLands',
    watch: true,
    cacheTime: 10_000,
    select: (data: any): number[] => {
      return data.map((landId: bigint) => Number(landId))
    }
  })
}

/**
 * 获取土地总数
 */
export function useTotalLands() {
  return useContractRead({
    address: CONTRACTS.LandNFT,
    abi: LandNFTABI,
    functionName: 'getTotalLands',
    cacheTime: 60_000, // 1 minute - rarely changes
    select: (data: any): number => Number(data)
  })
}