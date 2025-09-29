import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useContractRead } from 'wagmi'
import { CONTRACTS } from '@/types/contracts'
import { LandNFTABI } from '@/contracts'
import type { LandInfo } from '@/types/game'

/**
 * 分页加载土地信息的 Hook
 * 支持分页显示所有100块土地，避免一次性加载导致的崩溃
 */
export function useLandInfoPaginated() {
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
  
  // 使用多个 useContractRead 调用加载当前页
  const landQueries = currentPageLandIds.map(landId => 
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

  // 定期检查冷却状态 - 改进版本
  useEffect(() => {
    const interval = setInterval(() => {
      // 检查是否有土地在冷却中且冷却时间已到
      const now = Math.floor(Date.now() / 1000)
      const hasExpiredCooldowns = Object.values(lands).some(land => 
        land.state === 4 && Number(land.lockEndTime) <= now
      )
      
      if (hasExpiredCooldowns) {
        console.log('检测到冷却到期的土地，触发数据刷新')
        setLastUpdate(Date.now())
        // 可以在这里添加自动调用合约检查的逻辑
      }
    }, 10000) // 改为每10秒检查一次，提高响应速度

    return () => clearInterval(interval)
  }, [lands, lastUpdate])

  // 检查冷却状态并刷新数据的函数 - 改进版本
  const checkCooldownAndRefresh = useCallback(() => {
    const now = Math.floor(Date.now() / 1000)
    const expiredLands = Object.entries(lands).filter(([_, land]) => 
      land.state === 4 && Number(land.lockEndTime) <= now
    )
    
    if (expiredLands.length > 0) {
      console.log(`发现 ${expiredLands.length} 块土地冷却到期:`, expiredLands.map(([id, _]) => id))
      setLastUpdate(Date.now())
    }
  }, [lands, setLastUpdate])

  // 处理查询结果
  useEffect(() => {
    const newLands: Record<number, LandInfo> = { ...landsRef.current }
    let hasError = false
    let allLoading = true
    let completedCount = 0
    let errorCount = 0
    
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
        errorCount++
        hasError = true
        allLoading = false
        console.error(`Land ${landId} query failed:`, query.error)
      } else if (query.isLoading) {
        // 至少有一个在加载
      }
    })
    
    // 只有当数据真正改变时才更新状态
    const hasChanges = Object.keys(newLands).some(landId => {
      const oldLand = landsRef.current[Number(landId)]
      const newLand = newLands[Number(landId)]
      return !oldLand || 
        oldLand.state !== newLand.state ||
        oldLand.seedTokenId !== newLand.seedTokenId ||
        oldLand.claimTime !== newLand.claimTime ||
        oldLand.lockEndTime !== newLand.lockEndTime ||
        oldLand.weatherSeed !== newLand.weatherSeed ||
        oldLand.lastWeatherUpdateTime !== newLand.lastWeatherUpdateTime ||
        oldLand.accumulatedGrowth !== newLand.accumulatedGrowth ||
        oldLand.currentFarmer !== newLand.currentFarmer
    })
    
    if (hasChanges) {
      landsRef.current = newLands
      setLands(newLands)
    }
    
    setIsLoading(allLoading)
    
    // 如果错误数量超过一半，认为页面加载失败
    if (hasError && errorCount > currentPageLandIds.length / 2) {
      setError(new Error(`第 ${currentPage} 页加载失败 (${errorCount}/${currentPageLandIds.length} 个土地)`))
    } else {
      setError(null)
    }
    
    const now = Date.now()
    if (now - lastUpdateRef.current > 1000) { // 至少1秒间隔
      lastUpdateRef.current = now
      setLastUpdate(now)
    }
  }, [landQueries, currentPageLandIds])

  // 计算当前页的加载进度
  const progress = useMemo(() => {
    const currentPageLoaded = currentPageLandIds.filter(id => lands[id]).length
    return currentPageLoaded / currentPageLandIds.length
  }, [currentPageLandIds, lands])

  // 刷新当前页
  const refetch = useCallback(() => {
    setLastUpdate(Date.now())
    setError(null)
    setRetryCount(0)
    console.log(`Refreshing page ${currentPage}...`)
  }, [currentPage])

  // 重试当前页
  const retryCurrentPage = useCallback(() => {
    if (retryCount < MAX_RETRIES) {
      setRetryCount(prev => prev + 1)
      setError(null)
      console.log(`Retrying page ${currentPage}, attempt ${retryCount + 1}`)
    }
  }, [retryCount, currentPage, MAX_RETRIES])

  // 切换到指定页
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= TOTAL_PAGES) {
      setCurrentPage(page)
      setError(null)
      setRetryCount(0)
      console.log(`Switching to page ${page}`)
    }
  }, [TOTAL_PAGES])

  // 上一页
  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      goToPage(currentPage - 1)
    }
  }, [currentPage, goToPage])

  // 下一页
  const goToNextPage = useCallback(() => {
    if (currentPage < TOTAL_PAGES) {
      goToPage(currentPage + 1)
    }
  }, [currentPage, TOTAL_PAGES, goToPage])

  // 获取当前页的土地信息
  const currentPageLands = useMemo(() => {
    const result: Record<number, LandInfo> = {}
    currentPageLandIds.forEach(landId => {
      if (lands[landId]) {
        result[landId] = lands[landId]
      }
    })
    return result
  }, [currentPageLandIds, lands])

  return {
    // 数据
    data: currentPageLands,
    allLands: lands,
    isLoading,
    error,
    progress,
    lastUpdate,
    
    // 分页信息
    currentPage,
    totalPages: TOTAL_PAGES,
    pageSize: PAGE_SIZE,
    totalLands: TOTAL_LANDS,
    currentPageLandIds,
    
    // 操作函数
    refetch,
    retryCurrentPage,
    goToPage,
    goToPreviousPage,
    goToNextPage,
    
    // 重试信息
    retryCount,
    maxRetries: MAX_RETRIES,
    canRetry: retryCount < MAX_RETRIES,
    
    // 分页状态
    hasPreviousPage: currentPage > 1,
    hasNextPage: currentPage < TOTAL_PAGES,
    
    // 冷却检查
    checkCooldownAndRefresh,
  }
}
