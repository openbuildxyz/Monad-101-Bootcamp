import { useState, useEffect, useCallback, useMemo } from 'react'
import { useContractRead } from 'wagmi'
import { CONTRACTS } from '@/types/contracts'
import { LandNFTABI } from '@/contracts'
import type { LandInfo } from '@/types/game'

/**
 * 分批加载土地信息的 Hook - 更稳定的实现
 * 使用更小的批次和更好的错误处理
 */
export function useLandInfoBatched() {
  const [lands, setLands] = useState<Record<number, LandInfo>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [lastUpdate, setLastUpdate] = useState(Date.now())
  const [currentBatch, setCurrentBatch] = useState(0)
  const [retryCount, setRetryCount] = useState(0)
  
  // 分批加载：每批10个土地，总共10批
  const BATCH_SIZE = 10
  const TOTAL_LANDS = 100
  const TOTAL_BATCHES = Math.ceil(TOTAL_LANDS / BATCH_SIZE)
  const MAX_RETRIES = 3
  
  // 当前批次的土地ID
  const currentBatchLandIds = useMemo(() => {
    const start = currentBatch * BATCH_SIZE
    const end = Math.min(start + BATCH_SIZE, TOTAL_LANDS)
    return Array.from({ length: end - start }, (_, i) => start + i)
  }, [currentBatch])
  
  // 使用多个 useContractRead 调用
  const landQueries = currentBatchLandIds.map(landId => 
    useContractRead({
      address: CONTRACTS.LandNFT,
      abi: LandNFTABI,
      functionName: 'getLandInfo',
      args: [BigInt(landId)],
      enabled: true,
      watch: false,
      cacheTime: 10 * 60 * 1000, // 10分钟缓存
      staleTime: 2 * 60 * 1000, // 2分钟过期
    })
  )

  // 处理查询结果
  useEffect(() => {
    const newLands: Record<number, LandInfo> = { ...lands }
    let hasError = false
    let allLoading = true
    let completedCount = 0
    let errorCount = 0
    
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
        errorCount++
        hasError = true
        allLoading = false
        console.error(`Land ${landId} query failed:`, query.error)
      } else if (query.isLoading) {
        // 至少有一个在加载
      }
    })
    
    setLands(newLands)
    setIsLoading(allLoading)
    
    // 如果错误数量超过一半，认为批次失败
    if (hasError && errorCount > currentBatchLandIds.length / 2) {
      setError(new Error(`批次 ${currentBatch + 1} 加载失败 (${errorCount}/${currentBatchLandIds.length} 个土地)`))
    } else {
      setError(null)
    }
    
    setLastUpdate(Date.now())
    
    // 如果当前批次完成且还有更多批次，自动加载下一批
    if (!allLoading && !hasError && completedCount === currentBatchLandIds.length) {
      if (currentBatch < TOTAL_BATCHES - 1) {
        setTimeout(() => {
          setCurrentBatch(prev => prev + 1)
        }, 1000) // 延迟1秒加载下一批
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
    setLastUpdate(Date.now())
    setError(null)
    setRetryCount(0)
    console.log('Refreshing land data...')
  }, [])

  // 重试当前批次
  const retryCurrentBatch = useCallback(() => {
    if (retryCount < MAX_RETRIES) {
      setRetryCount(prev => prev + 1)
      setError(null)
      console.log(`Retrying batch ${currentBatch + 1}, attempt ${retryCount + 1}`)
    }
  }, [retryCount, currentBatch, MAX_RETRIES])

  // 检查是否所有批次都已完成
  const isFullyLoaded = Object.keys(lands).length === TOTAL_LANDS

  return {
    data: lands,
    isLoading: isLoading || !isFullyLoaded,
    error,
    progress,
    lastUpdate,
    refetch,
    retryCurrentBatch,
    currentBatch: currentBatch + 1,
    totalBatches: TOTAL_BATCHES,
    retryCount,
    maxRetries: MAX_RETRIES,
    canRetry: retryCount < MAX_RETRIES
  }
}
