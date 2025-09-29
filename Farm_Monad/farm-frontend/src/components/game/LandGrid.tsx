import { useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useLandInfoRealTime } from '@/hooks/contracts/useLandInfoRealTime'
import { useCheckAndUpdateIdleStatus } from '@/hooks/contracts/useLandCooldown'
import { useSeedInfo } from '@/hooks/contracts/useSeedNFT'
import { LandTile } from './LandTile'
import { PaginationControls } from './PaginationControls'
import { ErrorBoundary } from '@/components/ui'
import { cn } from '@/utils'

interface LandGridProps {
  className?: string
}

export function LandGrid({ className }: LandGridProps) {
  const { 
    data: landsInfo, 
    isLoading, 
    error, 
    progress, 
    refetch, 
    retryCurrentPage,
    lastUpdate,
    currentPage,
    totalPages,
    pageSize,
    currentPageLandIds,
    goToPage,
    goToPreviousPage,
    goToNextPage,
    retryCount,
    maxRetries,
    canRetry,
    hasPreviousPage,
    hasNextPage
  } = useLandInfoRealTime()

  // 冷却状态检查Hook
  const { write: checkCooldown, isLoading: isCheckingCooldown } = useCheckAndUpdateIdleStatus()

  // 防抖状态
  const [lastCooldownCheck, setLastCooldownCheck] = useState(0)

  // 处理冷却检查成功后的数据刷新 - 改进版本
  const handleCooldownCheck = () => {
    const now = Date.now()
    // 防抖：3秒内只能点击一次（减少等待时间）
    if (now - lastCooldownCheck < 3000) {
      toast.error('请等待3秒后再试')
      return
    }
    
    setLastCooldownCheck(now)
    
    if (checkCooldown) {
      console.log('开始检查冷却状态...')
      checkCooldown()
      // 延迟刷新数据，等待合约状态更新
      setTimeout(() => {
        console.log('刷新数据以获取最新状态...')
        refetch()
      }, 2000) // 减少延迟时间到2秒
    } else {
      refetch()
    }
  }

  // 使用当前页的土地ID
  const landIds = useMemo(() => {
    return currentPageLandIds
  }, [currentPageLandIds])

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-lg font-medium mb-2">
            加载农场数据失败
          </div>
          <p className="text-gray-600 text-sm mb-2">
            {error.message}
          </p>
          {retryCount > 0 && (
            <p className="text-gray-500 text-xs mb-4">
              重试次数: {retryCount}/{maxRetries}
            </p>
          )}
          <div className="space-x-2">
            {canRetry && (
              <button 
                onClick={retryCurrentPage} 
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                重试当前页
              </button>
            )}
            <button 
              onClick={refetch} 
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              重新加载
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              刷新页面
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* 进度条 */}
        <div className="bg-gray-200 rounded-full h-3">
          <div 
            className="bg-primary-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        
        {/* 加载状态文本 */}
        <div className="text-center space-y-1">
          <div className="text-sm text-gray-600">
            正在加载农场数据... {Math.round(progress * 100)}%
          </div>
          <div className="text-xs text-gray-500">
            第 {currentPage} 页 - 已加载 {Object.keys(landsInfo).length}/{pageSize} 块土地
          </div>
        </div>
        
        {/* 土地网格 */}
        <div className={cn('land-grid', className)}>
          {landIds.map((landId) => {
            const landInfo = landsInfo[landId]
            return (
              <div
                key={landId}
                className={cn(
                  "aspect-square rounded-lg",
                  landInfo 
                    ? "bg-gray-100 border border-gray-200" 
                    : "bg-gray-200 animate-pulse"
                )}
              >
                {landInfo && (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                    #{landId}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('LandGrid Error:', error, errorInfo)
      }}
    >
      <div className="space-y-4">
        {/* 刷新按钮和状态信息 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="text-sm text-gray-600 space-y-1">
          <div>最后更新: {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : '未知'}</div>
          <div className="text-xs text-gray-500">
            第 {currentPage} 页，共 {totalPages} 页 - 已加载 {Object.keys(landsInfo).length}/{pageSize} 块土地
          </div>
        </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={refetch}
              disabled={isLoading}
              className="px-3 py-1 text-sm bg-primary-500 text-white rounded hover:bg-primary-600 disabled:opacity-50 transition-colors"
            >
              {isLoading ? '刷新中...' : '刷新数据'}
            </button>
            <button
              onClick={handleCooldownCheck}
              disabled={isLoading || isCheckingCooldown}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
              title="检查冷却状态"
            >
              {isCheckingCooldown ? '检查中...' : '检查冷却'}
            </button>
          </div>
        </div>
        
        {/* 土地网格 */}
        <div className={cn('land-grid', className)}>
          {landIds.map((landId) => {
            const landInfo = landsInfo[landId]
            return (
              <ErrorBoundary
                key={landId}
                fallback={
                  <div className="aspect-square bg-red-100 border border-red-200 rounded-lg flex items-center justify-center">
                    <span className="text-red-500 text-xs">#{landId} 错误</span>
                  </div>
                }
              >
                <LandTileWithSeedInfo
                  landId={landId}
                  landInfo={landInfo}
                />
              </ErrorBoundary>
            )
          })}
        </div>

        {/* 分页控制 */}
        <div className="mt-6">
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPreviousPage={goToPreviousPage}
            onNextPage={goToNextPage}
            onGoToPage={goToPage}
            hasPreviousPage={hasPreviousPage}
            hasNextPage={hasNextPage}
            isLoading={isLoading}
            className="justify-center"
          />
        </div>
      </div>
    </ErrorBoundary>
  )
}

// 带种子信息的土地组件
function LandTileWithSeedInfo({ landId, landInfo }: { landId: number, landInfo?: any }) {
  // 只有当土地有种子时才获取种子信息
  const seedTokenId = landInfo?.seedTokenId
  const { data: seedInfo } = useSeedInfo(seedTokenId ? Number(seedTokenId) : 0)
  
  return (
    <LandTile
      landId={landId}
      landInfo={landInfo}
      seedInfo={seedInfo}
    />
  )
}