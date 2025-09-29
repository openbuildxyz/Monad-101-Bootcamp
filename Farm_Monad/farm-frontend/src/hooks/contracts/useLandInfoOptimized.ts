import { useState, useEffect, useCallback, useMemo } from 'react'
import { useContractRead } from 'wagmi'
import { CONTRACTS } from '@/types/contracts'
import { LandNFTABI } from '@/contracts'
import type { LandInfo } from '@/types/game'

/**
 * 优化的土地信息获取 Hook - 分批加载100块土地，避免RPC限制
 */
export function useLandInfoOptimized() {
  const [lands, setLands] = useState<Record<number, LandInfo>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [lastUpdate, setLastUpdate] = useState(Date.now())
  // const [refreshKey, setRefreshKey] = useState(0)
  const [currentBatch, setCurrentBatch] = useState(0)
  
  // 分批加载：每批20个土地，总共5批
  const BATCH_SIZE = 20
  const TOTAL_LANDS = 100
  const TOTAL_BATCHES = Math.ceil(TOTAL_LANDS / BATCH_SIZE)
  
  // 当前批次的土地ID
  const currentBatchLandIds = useMemo(() => {
    const start = currentBatch * BATCH_SIZE
    const end = Math.min(start + BATCH_SIZE, TOTAL_LANDS)
    return Array.from({ length: end - start }, (_, i) => start + i)
  }, [currentBatch])
  
  // 使用多个 useContractRead 调用，但限制并发数量
  const landQueries = currentBatchLandIds.map(landId => 
    useContractRead({
      address: CONTRACTS.LandNFT,
      abi: LandNFTABI,
      functionName: 'getLandInfo',
      args: [BigInt(landId)],
      enabled: true,
      watch: false, // 禁用实时监听，减少请求
      cacheTime: 5 * 60 * 1000, // 5分钟缓存
      staleTime: 30 * 1000, // 30秒过期
      // retry: 3, // 重试3次
      // retryDelay: 1000, // 重试延迟1秒
    })
  )

  // 处理查询结果
  useEffect(() => {
    const newLands: Record<number, LandInfo> = { ...lands }
    let hasError = false
    let allLoading = true
    let completedCount = 0
    
    landQueries.forEach((query, index) => {
      const landId = currentBatchLandIds[index]
      
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
    setError(hasError ? new Error(`批次 ${currentBatch + 1} 中部分土地查询失败`) : null)
    setLastUpdate(Date.now())
    
    // 如果当前批次完成且还有更多批次，自动加载下一批
    if (!allLoading && !hasError && completedCount === currentBatchLandIds.length) {
      if (currentBatch < TOTAL_BATCHES - 1) {
        setTimeout(() => {
          setCurrentBatch(prev => prev + 1)
        }, 500) // 延迟500ms加载下一批，避免RPC限制
      }
    }
  }, [landQueries, currentBatch, currentBatchLandIds, lands])

  // 计算加载进度
  const progress = useMemo(() => {
    const totalLoaded = Object.keys(lands).length
    return totalLoaded / TOTAL_LANDS
  }, [lands])

  const refetch = useCallback(() => {
    // 重置到第一批并清空现有数据
    setCurrentBatch(0)
    setLands({})
    // setRefreshKey(prev => prev + 1)
    setLastUpdate(Date.now())
    setError(null)
    console.log('Refreshing land data...')
  }, [])

  // 检查是否所有批次都已完成
  const isFullyLoaded = Object.keys(lands).length === TOTAL_LANDS

  return {
    data: lands,
    isLoading: isLoading || !isFullyLoaded,
    error,
    progress,
    lastUpdate,
    refetch,
    currentBatch: currentBatch + 1,
    totalBatches: TOTAL_BATCHES
  }
}
