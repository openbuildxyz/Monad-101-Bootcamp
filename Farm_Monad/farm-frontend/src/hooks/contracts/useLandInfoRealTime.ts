import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useContractRead } from 'wagmi'
import { CONTRACTS } from '@/types/contracts'
import { LandNFTABI } from '@/contracts'
import type { LandInfo } from '@/types/game'

/**
 * 实时土地信息获取 Hook - 支持快速更新
 */
export function useLandInfoRealTime() {
  const [lands, setLands] = useState<Record<number, LandInfo>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [lastUpdate, setLastUpdate] = useState(Date.now())
  const [currentPage, setCurrentPage] = useState(1)
  const [retryCount, setRetryCount] = useState(0)
  
  // 使用 ref 来避免无限循环
  const landsRef = useRef<Record<number, LandInfo>>({})
  const lastUpdateRef = useRef(Date.now())
  
  // 分页配置
  const PAGE_SIZE = 20
  const TOTAL_LANDS = 100
  const TOTAL_PAGES = Math.ceil(TOTAL_LANDS / PAGE_SIZE)
  const MAX_RETRIES = 3
  
  // 当前页的土地ID
  const currentPageLandIds = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    const end = Math.min(start + PAGE_SIZE, TOTAL_LANDS)
    return Array.from({ length: end - start }, (_, i) => start + i)
  }, [currentPage])
  
  // 使用多个 useContractRead 调用加载当前页 - 启用实时监听
  const landQueries = currentPageLandIds.map(landId => 
    useContractRead({
      address: CONTRACTS.LandNFT,
      abi: LandNFTABI,
      functionName: 'getLandInfo',
      args: [BigInt(landId)],
      enabled: true,
      watch: true, // 启用实时监听
      cacheTime: 30 * 1000, // 30秒缓存
      staleTime: 10 * 1000, // 10秒过期
    })
  )

  // 处理查询结果
  useEffect(() => {
    const newLands: Record<number, LandInfo> = { ...landsRef.current }
    let hasError = false
    let allLoading = true
    let completedCount = 0
    
    landQueries.forEach((query, index) => {
      const landId = currentPageLandIds[index]
      
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
        console.error(`Land ${landId} query error:`, query.error)
      }
    })
    
    // 更新状态
    if (completedCount > 0 || hasError) {
      setLands(newLands)
      landsRef.current = newLands
      setLastUpdate(Date.now())
      lastUpdateRef.current = Date.now()
    }
    
    setIsLoading(allLoading && completedCount === 0)
    setError(hasError ? new Error('Some land queries failed') : null)
  }, [landQueries, currentPageLandIds])

  // 定期检查冷却状态
  useEffect(() => {
    const interval = setInterval(() => {
      // 检查是否有土地在冷却中且冷却时间已到
      const now = Math.floor(Date.now() / 1000)
      const hasExpiredCooldowns = Object.values(landsRef.current).some(land => 
        land.state === 4 && Number(land.lockEndTime) <= now
      )
      
      if (hasExpiredCooldowns) {
        console.log('检测到冷却时间已到的土地，触发刷新')
        // 触发所有查询的重新获取
        landQueries.forEach(query => {
          if (query.refetch) {
            query.refetch()
          }
        })
      }
    }, 5000) // 每5秒检查一次

    return () => clearInterval(interval)
  }, [landQueries])

  // 手动刷新当前页
  const retryCurrentPage = useCallback(() => {
    if (retryCount < MAX_RETRIES) {
      setRetryCount(prev => prev + 1)
      landQueries.forEach(query => {
        if (query.refetch) {
          query.refetch()
        }
      })
    }
  }, [landQueries, retryCount])

  // 完全刷新
  const refetch = useCallback(() => {
    setRetryCount(0)
    setLands({})
    landsRef.current = {}
    setLastUpdate(Date.now())
    lastUpdateRef.current = Date.now()
    
    // 触发所有查询的重新获取
    landQueries.forEach(query => {
      if (query.refetch) {
        query.refetch()
      }
    })
  }, [landQueries])

  // 分页控制
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= TOTAL_PAGES) {
      setCurrentPage(page)
      setRetryCount(0)
    }
  }, [])

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
      setRetryCount(0)
    }
  }, [currentPage])

  const goToNextPage = useCallback(() => {
    if (currentPage < TOTAL_PAGES) {
      setCurrentPage(prev => prev + 1)
      setRetryCount(0)
    }
  }, [currentPage, TOTAL_PAGES])

  // 计算进度
  const progress = useMemo(() => {
    const totalLoaded = Object.keys(landsRef.current).length
    return totalLoaded / TOTAL_LANDS
  }, [lands])

  // 当前页的土地信息
  const currentPageLands = useMemo(() => {
    return currentPageLandIds.map(landId => ({
      landId,
      ...landsRef.current[landId]
    })).filter(land => land.state !== undefined)
  }, [currentPageLandIds, lands])

  return {
    data: lands,
    currentPageLands,
    isLoading,
    error,
    progress,
    refetch,
    retryCurrentPage,
    lastUpdate,
    currentPage,
    totalPages: TOTAL_PAGES,
    pageSize: PAGE_SIZE,
    currentPageLandIds,
    goToPage,
    goToPreviousPage,
    goToNextPage,
    hasNextPage: currentPage < TOTAL_PAGES,
    hasPreviousPage: currentPage > 1,
    totalLands: TOTAL_LANDS,
    loadedLands: Object.keys(landsRef.current).length,
    retryCount,
    maxRetries: MAX_RETRIES,
    canRetry: retryCount < MAX_RETRIES
  }
}
