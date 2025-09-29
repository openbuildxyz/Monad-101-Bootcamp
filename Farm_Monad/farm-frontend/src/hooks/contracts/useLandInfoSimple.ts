import { useState, useEffect, useCallback } from 'react'
import { useContractRead } from 'wagmi'
import { CONTRACTS } from '@/types/contracts'
import { LandNFTABI } from '@/contracts'
import type { LandInfo } from '@/types/game'

/**
 * 简化的土地信息获取 Hook - 稳定版本
 * 只加载前20个土地，避免RPC限制
 */
export function useLandInfoSimple() {
  const [lands, setLands] = useState<Record<number, LandInfo>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [lastUpdate, setLastUpdate] = useState(Date.now())
  
  // 只加载前20个土地，避免RPC限制
  const LAND_COUNT = 20
  const landIds = Array.from({ length: LAND_COUNT }, (_, i) => i)
  
  // 使用单个 useContractRead 调用
  const landQueries = landIds.map(landId => 
    useContractRead({
      address: CONTRACTS.LandNFT,
      abi: LandNFTABI,
      functionName: 'getLandInfo',
      args: [BigInt(landId)],
      enabled: true,
      watch: false,
      cacheTime: 5 * 60 * 1000, // 5分钟缓存
      staleTime: 30 * 1000, // 30秒过期
    })
  )

  // 处理查询结果
  useEffect(() => {
    const newLands: Record<number, LandInfo> = {}
    let hasError = false
    let allLoading = true
    let completedCount = 0
    
    landQueries.forEach((query, index) => {
      const landId = landIds[index]
      
      if (query.data) {
        allLoading = false
        completedCount++
        newLands[landId] = {
          state: query.data.state,
          seedTokenId: query.data.seedTokenId,
          claimTime: query.data.claimTime,
          lockEndTime: query.data.lockEndTime,
          weatherSeed: query.data.weatherSeed,
          lastWeatherUpdateTime: query.data.lastWeatherUpdateTime,
          accumulatedGrowth: query.data.accumulatedGrowth,
          currentFarmer: query.data.currentFarmer,
        }
      } else if (query.error) {
        hasError = true
        allLoading = false
        console.error(`Land ${landId} query failed:`, query.error)
      } else if (query.isLoading) {
        // 至少有一个在加载
      }
    })
    
    setLands(newLands)
    setIsLoading(allLoading)
    
    // 如果错误数量超过一半，认为加载失败
    if (hasError && (landIds.length - completedCount) > landIds.length / 2) {
      setError(new Error(`加载失败 (${landIds.length - completedCount}/${landIds.length} 个土地)`))
    } else {
      setError(null)
    }
    
    setLastUpdate(Date.now())
  }, [landQueries, landIds])

  // 计算加载进度
  const progress = Object.keys(lands).length / LAND_COUNT

  const refetch = useCallback(() => {
    setLands({})
    setLastUpdate(Date.now())
    setError(null)
    console.log('Refreshing land data...')
  }, [])

  return {
    data: lands,
    isLoading,
    error,
    progress,
    lastUpdate,
    refetch,
    currentBatch: 1,
    totalBatches: 1,
    retryCount: 0,
    maxRetries: 0,
    canRetry: false
  }
}
