import { useState } from 'react'
import { useAccount } from 'wagmi'
import { cn } from '@/utils'
import {
  LandState,
  CROP_CONFIG,
  type LandInfo,
  type SeedInfo
} from '@/types/game'
import {
  calculateGrowthProgress,
  getLandStateText,
  getLandStateColor,
  getLandWeatherInfo
} from '@/utils/game'
import { formatCountdown } from '@/utils/format'
import { Progress } from '@/components/ui'
import { LandActionModal } from './LandActionModal'
import { WeatherIcon } from './WeatherIcon'

interface LandTileProps {
  landId: number
  landInfo?: LandInfo
  seedInfo?: SeedInfo
  className?: string
}

export function LandTile({ landId, landInfo, seedInfo, className }: LandTileProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { address } = useAccount()

  if (!landInfo) {
    return (
      <div className={cn(
        'land-tile land-tile-idle animate-pulse',
        className
      )}>
        <div className="w-full h-full bg-gray-200 rounded-lg" />
      </div>
    )
  }

  // 添加错误边界保护
  try {

  const weatherInfo = getLandWeatherInfo(landId, landInfo)
  const progress = calculateGrowthProgress(landInfo, seedInfo)
  const isOwner = landInfo.currentFarmer === address
  const stateText = getLandStateText(landInfo.state)
  const stateColor = getLandStateColor(landInfo.state)

  // 计算剩余时间
  const getRemainingTime = () => {
    const now = Math.floor(Date.now() / 1000)

    switch (landInfo.state) {
      case LandState.LockedIdle:
        return Number(landInfo.lockEndTime) - now
      case LandState.Growing:
        // 这里需要基于成长进度和天气影响计算剩余时间
        const required = 3600 // 需要的总成长点
        const current = Number(landInfo.accumulatedGrowth)
        const remaining = required - current
        return Math.max(0, remaining) // 简化计算，实际应该考虑天气影响
      default:
        return 0
    }
  }

  // 调试信息已移除

  // 获取作物信息
  const cropConfig = seedInfo ? CROP_CONFIG[seedInfo.cropType] : null
  const cropEmoji = cropConfig?.emoji || '🌱'

  const remainingTime = getRemainingTime()

  return (
    <>
      <div
        className={cn(
          'land-tile cursor-pointer relative group',
          stateColor,
          landInfo.state === LandState.Ripe && 'animate-glow',
          landInfo.state === LandState.Growing && 'animate-pulse-slow',
          className
        )}
        onClick={() => setIsModalOpen(true)}
      >
        {/* 天气图标 */}
        <div className="absolute top-1 left-1 opacity-60">
          <WeatherIcon
            weatherType={weatherInfo.weatherType}
            size="sm"
          />
        </div>

        {/* 土地ID */}
        <div className="absolute top-1 right-1 text-xs text-gray-400 font-mono">
          #{landId}
        </div>

        {/* 主要内容 */}
        <div className="flex flex-col items-center justify-center h-full space-y-1">
          {/* 作物显示 */}
          {landInfo.state !== LandState.Idle && landInfo.state !== LandState.LockedIdle && (
            <div className="text-lg">{cropEmoji}</div>
          )}

          {/* 状态文本 */}
          <div className="text-xs font-medium text-center px-1">
            {stateText}
          </div>

          {/* 进度条或倒计时 */}
          {landInfo.state === LandState.Growing && (
            <div className="w-full px-1">
              <Progress
                value={progress}
                max={100}
                size="sm"
                color="primary"
                className="h-1"
              />
              <div className="text-xs text-gray-500 mt-0.5">
                {progress.toFixed(1)}%
              </div>
            </div>
          )}

          {landInfo.state === LandState.LockedIdle && (
            <div className="text-xs text-red-600">
              {remainingTime > 0 
                ? `冷却中 ${formatCountdown(Date.now() + remainingTime * 1000)}`
                : '冷却完毕 - 请点击"检查冷却"按钮'
              }
            </div>
          )}

          {/* 所有者指示 */}
          {isOwner && landInfo.state !== LandState.Idle && (
            <div className="absolute bottom-1 left-1 w-2 h-2 bg-green-400 rounded-full" />
          )}

          {/* 可偷菜指示 */}
          {landInfo.state === LandState.Ripe && !isOwner && (
            <div className="absolute bottom-1 right-1 w-2 h-2 bg-red-400 rounded-full animate-ping" />
          )}
        </div>

        {/* Hover 效果 */}
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity rounded-lg pointer-events-none" />
      </div>

      {/* 操作模态框 */}
      <LandActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        landId={landId}
        landInfo={landInfo}
        seedInfo={seedInfo}
        weatherInfo={weatherInfo}
      />
    </>
  )
  } catch (error) {
    console.error(`LandTile ${landId} render error:`, error)
    return (
      <div className={cn(
        'land-tile aspect-square rounded-lg border-2 border-red-300 bg-red-50 flex items-center justify-center',
        className
      )}>
        <div className="text-center">
          <div className="text-red-500 text-xs font-medium">#{landId}</div>
          <div className="text-red-400 text-xs">错误</div>
        </div>
      </div>
    )
  }
}