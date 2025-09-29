import { useState } from 'react'
import { useAccount } from 'wagmi'
import { toast } from 'react-hot-toast'
import {
  Modal,
  ModalBody,
  ModalFooter,
  Button,
  Progress
} from '@/components/ui'
import {
  LandState,
  BoosterType,
  CROP_CONFIG,
  type LandInfo,
  type SeedInfo,
  type WeatherInfo
} from '@/types/game'
import {
  calculateGrowthProgress,
  getLandStateText
} from '@/utils/game'

// 获取作物表情符号
const getCropEmoji = (cropType: number) => {
  const emojis = ['🌾', '🌽', '🎃', '🍓', '🍇', '🍉']
  return emojis[cropType] || '🌱'
}

// 获取作物名称
const getCropName = (cropType: number) => {
  const names = ['小麦', '玉米', '南瓜', '草莓', '葡萄', '西瓜']
  return names[cropType] || '未知作物'
}

// 获取成长阶段文本
const getGrowthStageText = (growthStage: number) => {
  const stages = ['种子', '发芽', '成长', '成熟']
  return stages[growthStage] || '未知'
}
import { formatAddress } from '@/utils/format'
import { WeatherIcon } from './WeatherIcon'
import {
  useHarvestCrop,
  useStealCrop,
  useApplyBooster,
  useHelpOther,
  useAdvanceGrowth,
  useClaimLand
} from '@/hooks/contracts'
import { useUserSeeds } from '@/hooks/contracts/useSeedNFT'

interface LandActionModalProps {
  isOpen: boolean
  onClose: () => void
  landId: number
  landInfo: LandInfo
  seedInfo?: SeedInfo
  weatherInfo: WeatherInfo
}

export function LandActionModal({
  isOpen,
  onClose,
  landId,
  landInfo,
  seedInfo,
  weatherInfo
}: LandActionModalProps) {
  const [selectedBooster, setSelectedBooster] = useState<BoosterType | null>(null)
  const [payWithKind, setPayWithKind] = useState(false)
  const [selectedSeedId, setSelectedSeedId] = useState<number | null>(null)
  const [showSeedSelection, setShowSeedSelection] = useState(false)
  const { address } = useAccount()

  const harvestMutation = useHarvestCrop(landId)
  const stealMutation = useStealCrop(landId)
  const boosterMutation = useApplyBooster(landId, selectedBooster !== null && selectedBooster !== undefined ? selectedBooster : undefined, payWithKind)
  const helpMutation = useHelpOther(
    landId, 
    selectedBooster !== null && selectedBooster !== undefined ? selectedBooster : undefined, 
    payWithKind
  )
  const advanceMutation = useAdvanceGrowth(landId)
  const claimMutation = useClaimLand(landId, selectedSeedId || undefined)
  const { userSeeds, isLoading: seedsLoading } = useUserSeeds()

  const isOwner = landInfo.currentFarmer === address
  const progress = calculateGrowthProgress(landInfo, seedInfo)
  const cropConfig = seedInfo ? CROP_CONFIG[seedInfo.cropType] : null

  const handleHarvest = async () => {
    try {
      console.log('Harvest button clicked', {
        landId,
        writeAvailable: !!harvestMutation.write,
        isLoading: harvestMutation.isLoading,
        error: harvestMutation.error
      })
      
      if (!harvestMutation.write) {
        console.error('Harvest write function not available')
        toast.error('收获功能暂时不可用，请稍后重试')
        return
      }
      
      if (harvestMutation.isLoading) {
        console.log('Harvest already in progress')
        return
      }
      
      await harvestMutation.write()
      onClose()
    } catch (error) {
      console.error('Harvest failed:', error)
      toast.error(`收获失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  const handleSteal = async () => {
    console.log('偷菜按钮被点击')
    console.log('stealMutation:', stealMutation)
    console.log('stealMutation.write:', stealMutation.write)
    console.log('stealMutation.isLoading:', stealMutation.isLoading)
    console.log('stealMutation.error:', stealMutation.error)
    
    try {
      if (stealMutation.write) {
        console.log('开始执行偷菜交易...')
        await stealMutation.write()
        onClose()
      } else {
        console.error('stealMutation.write 不可用')
        toast.error('偷菜功能暂时不可用，请检查钱包连接')
      }
    } catch (error) {
      console.error('Steal failed:', error)
      toast.error(`偷菜失败: ${error}`)
    }
  }

  const handleBooster = async () => {
    if (!selectedBooster) return

    try {
      if (boosterMutation.write) {
        await boosterMutation.write()
        onClose()
      }
    } catch (error) {
      console.error('Booster failed:', error)
    }
  }

  const handleHelp = async () => {
    console.log('=== handleHelp 开始执行 ===')
    console.log('selectedBooster:', selectedBooster)
    console.log('payWithKind:', payWithKind)
    console.log('landId:', landId)
    console.log('helpMutation:', {
      write: !!helpMutation.write,
      isLoading: helpMutation.isLoading,
      error: helpMutation.error,
      isError: helpMutation.isError,
      isSuccess: helpMutation.isSuccess
    })
    
    if (selectedBooster === null || selectedBooster === undefined) {
      console.log('❌ 没有选择道具，退出')
      return
    }

    console.log('✅ 道具已选择，继续执行')

    try {
      if (helpMutation.write) {
        console.log('🚀 开始调用 helpMutation.write()')
        await helpMutation.write()
        console.log('✅ helpMutation.write() 执行成功')
        onClose()
      } else {
        console.log('❌ helpMutation.write 不可用')
        console.log('helpMutation 详细状态:', helpMutation)
      }
    } catch (error) {
      console.error('❌ Help failed:', error)
    }
    
    console.log('=== handleHelp 执行完毕 ===')
  }

  const handleAdvanceGrowth = async () => {
    console.log('=== handleAdvanceGrowth 开始执行 ===')
    console.log('landId:', landId)
    console.log('landInfo:', landInfo)
    console.log('seedInfo:', seedInfo)
    console.log('advanceMutation:', {
      write: !!advanceMutation.write,
      isLoading: advanceMutation.isLoading,
      error: advanceMutation.error
    })
    
    try {
      if (advanceMutation.write) {
        console.log('🚀 开始调用 advanceMutation.write()')
        await advanceMutation.write()
        console.log('✅ advanceMutation.write() 执行成功')
        
        // 等待一段时间让合约状态更新
        setTimeout(() => {
          console.log('⏰ 等待合约状态更新...')
          console.log('💡 提示：如果成长没有推进，可能是因为时间间隔不够')
          console.log('💡 合约需要15分钟的时间间隔才能推进成长')
        }, 2000)
        
        onClose()
      } else {
        console.log('❌ advanceMutation.write 不可用')
        console.error('Advance growth write function not available:', advanceMutation.error)
      }
    } catch (error) {
      console.error('❌ Advance growth failed:', error)
    }
    
    console.log('=== handleAdvanceGrowth 执行完毕 ===')
  }

  const handlePlant = async () => {
    if (!selectedSeedId) {
      console.log('No seed selected')
      return
    }

    console.log('Planting seed:', {
      landId,
      selectedSeedId,
      claimMutation: claimMutation,
      write: claimMutation.write,
      isLoading: claimMutation.isLoading,
      error: claimMutation.error
    })

    try {
      if (claimMutation.write) {
        console.log('Calling claimMutation.write()')
        await claimMutation.write()
        console.log('Plant successful')
        onClose()
      } else {
        console.log('claimMutation.write is not available')
      }
    } catch (error) {
      console.error('Plant failed:', error)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" title={`土地 #${landId}`}>
      <ModalBody>
        <div className="space-y-4">
          {/* 基本信息 */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">基本信息</h3>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                landInfo.state === LandState.Idle ? 'bg-gray-100 text-gray-700' :
                landInfo.state === LandState.Growing ? 'bg-green-100 text-green-700' :
                landInfo.state === LandState.Ripe ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {getLandStateText(landInfo.state)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">当前农民:</span>
                <div className="font-mono text-xs mt-1">
                  {landInfo.currentFarmer === '0x0000000000000000000000000000000000000000'
                    ? '无'
                    : formatAddress(landInfo.currentFarmer)}
                </div>
              </div>
              <div>
                <span className="text-gray-600">是否我的:</span>
                <div className={`font-medium mt-1 ${isOwner ? 'text-green-600' : 'text-gray-500'}`}>
                  {isOwner ? '是' : '否'}
                </div>
              </div>
            </div>
          </div>

          {/* 天气信息 */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <WeatherIcon weatherType={weatherInfo.weatherType} size="md" showTooltip={false} />
              <span className="font-medium">{weatherInfo.description}</span>
            </div>
            <p className="text-sm text-gray-600">
              影响倍率: {(weatherInfo.effectMultiplier * 100).toFixed(0)}%
            </p>
          </div>

          {/* 作物信息 */}
          {cropConfig && seedInfo && (
            <div className="bg-green-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{cropConfig.emoji}</span>
                <div>
                  <h4 className="font-medium">{cropConfig.name}</h4>
                  <p className="text-sm text-gray-600">
                    使用道具: {seedInfo.boostersApplied}/10
                  </p>
                </div>
              </div>

              {landInfo.state === LandState.Growing && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>成长进度</span>
                    <span>{progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={progress} max={100} color="success" />
                </div>
              )}
            </div>
          )}

          {/* 道具选择 */}
          {(landInfo.state === LandState.Growing) && (
            <div className="space-y-3">
              <h4 className="font-medium">选择道具</h4>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className={`p-3 border rounded-lg text-left transition-colors ${
                    selectedBooster === BoosterType.Watering
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedBooster(BoosterType.Watering)}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span>💧</span>
                    <span className="font-medium">浇水</span>
                  </div>
                  <p className="text-xs text-gray-600">减少2分钟成长时间</p>
                </button>

                <button
                  type="button"
                  className={`p-3 border rounded-lg text-left transition-colors ${
                    selectedBooster === BoosterType.Fertilizing
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedBooster(BoosterType.Fertilizing)}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span>🌱</span>
                    <span className="font-medium">施肥</span>
                  </div>
                  <p className="text-xs text-gray-600">减少5%剩余时间</p>
                </button>
              </div>

              {selectedBooster !== null && (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">支付方式:</span>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={!payWithKind}
                      onChange={() => setPayWithKind(false)}
                    />
                    <span className="text-sm">MON代币</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={payWithKind}
                      onChange={() => setPayWithKind(true)}
                    />
                    <span className="text-sm">KIND代币</span>
                  </label>
                </div>
              )}
            </div>
          )}

          {/* 作物信息显示 */}
          {landInfo.state === LandState.Growing && seedInfo && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-sm font-medium text-green-800 mb-3">🌱 作物信息</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">作物类型:</span>
                  <div className="font-medium text-green-700">
                    {getCropEmoji(seedInfo.cropType)} {getCropName(seedInfo.cropType)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">稀有度:</span>
                  <div className="font-medium">
                    <span className={seedInfo.rarity === 1 ? 'text-purple-600' : 'text-gray-600'}>
                      {seedInfo.rarity === 1 ? '⭐ 稀有' : '🌾 普通'}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">成长阶段:</span>
                  <div className="font-medium text-green-700">
                    {getGrowthStageText(seedInfo.growthStage)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">道具使用:</span>
                  <div className="font-medium text-blue-600">
                    {seedInfo.boostersApplied}/10 次
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600">成长时间:</span>
                  <div className="font-medium text-green-700">
                    {Number(seedInfo.baseGrowthTime) / 60} 分钟
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ModalBody>

      <ModalFooter>
        {landInfo.state === LandState.Idle && (
          <div className="space-y-3">
            {!showSeedSelection ? (
              <Button 
                variant="primary" 
                onClick={() => setShowSeedSelection(true)}
              >
                选择种子种植
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  请选择要种植的种子：
                </div>
                
                {seedsLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-2">加载种子中...</p>
                  </div>
                ) : userSeeds && userSeeds.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {userSeeds.map((seed: any) => (
                      <button
                        key={seed.tokenId}
                        type="button"
                        className={`p-3 border rounded-lg text-left transition-colors ${
                          selectedSeedId === seed.tokenId
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedSeedId(seed.tokenId)}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-lg">
                            {CROP_CONFIG[seed.seedInfo?.cropType as keyof typeof CROP_CONFIG]?.emoji || '🌱'}
                          </span>
                          <span className="font-medium text-sm">
                            {CROP_CONFIG[seed.seedInfo?.cropType as keyof typeof CROP_CONFIG]?.name || '未知作物'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">
                          ID: #{seed.tokenId}
                        </p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-600 mb-2">您还没有种子</p>
                    <p className="text-xs text-gray-500">请先前往商店购买种子</p>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <Button 
                    variant="secondary" 
                    onClick={() => setShowSeedSelection(false)}
                  >
                    取消
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={handlePlant}
                    disabled={!selectedSeedId || !userSeeds || userSeeds.length === 0}
                    loading={claimMutation.isLoading}
                  >
                    确认种植
                  </Button>
                  
                  {/* 调试信息 */}
                  <div className="text-xs text-gray-500 mt-2">
                    <div>Land ID: {landId}</div>
                    <div>Selected Seed: {selectedSeedId}</div>
                    <div>Write Available: {claimMutation.write ? 'Yes' : 'No'}</div>
                    <div>Loading: {claimMutation.isLoading ? 'Yes' : 'No'}</div>
                    <div>Error: {claimMutation.error?.message || 'None'}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {landInfo.state === LandState.Growing && (
          <div className="space-y-3">
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                onClick={handleAdvanceGrowth}
                loading={advanceMutation.isLoading}
                disabled={!advanceMutation.write}
              >
                更新成长
              </Button>

            {isOwner && selectedBooster !== null && (
              <Button
                variant="primary"
                onClick={handleBooster}
                loading={boosterMutation.isLoading}
              >
                使用道具
              </Button>
            )}

            {!isOwner && selectedBooster !== null && (
              <Button
                variant="success"
                onClick={handleHelp}
                loading={helpMutation.isLoading}
              >
                帮助 (+1 KIND)
              </Button>
            )}
            </div>
            
            {/* 调试信息 */}
            <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
              <div>Land ID: {landId}</div>
              <div>Write Available: {advanceMutation.write ? 'Yes' : 'No'}</div>
              <div>Loading: {advanceMutation.isLoading ? 'Yes' : 'No'}</div>
              <div>Error: {advanceMutation.error?.message || 'None'}</div>
            </div>
          </div>
        )}

        {landInfo.state === LandState.Ripe && isOwner && (
          <div className="space-y-2">
            <Button
              variant="success"
              onClick={handleHarvest}
              loading={harvestMutation.isLoading}
              disabled={!harvestMutation.write}
            >
              收获作物
            </Button>
            
            {/* 调试信息 */}
            <div className="text-xs text-gray-500">
              <div>Land ID: {landId}</div>
              <div>Land State: {landInfo.state}</div>
              <div>Is Owner: {isOwner ? 'Yes' : 'No'}</div>
              <div>Write Available: {harvestMutation.write ? 'Yes' : 'No'}</div>
              <div>Loading: {harvestMutation.isLoading ? 'Yes' : 'No'}</div>
              <div>Error: {harvestMutation.error?.message || 'None'}</div>
            </div>
          </div>
        )}

        {landInfo.state === LandState.Ripe && !isOwner && (
          <div className="space-y-2">
            <Button
              variant="warning"
              onClick={handleSteal}
              loading={stealMutation.isLoading}
              disabled={!stealMutation.write}
            >
              偷菜
            </Button>
            
            {/* 调试信息 */}
            <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
              <div>Land ID: {landId}</div>
              <div>Write Available: {stealMutation.write ? 'Yes' : 'No'}</div>
              <div>Loading: {stealMutation.isLoading ? 'Yes' : 'No'}</div>
              <div>Error: {stealMutation.error?.message || 'None'}</div>
              <div>Address: {address}</div>
              <div>Owner: {landInfo.currentFarmer}</div>
            </div>
          </div>
        )}

        {landInfo.state === LandState.LockedIdle && (
          <Button variant="ghost" disabled>
            冷却中...
          </Button>
        )}
      </ModalFooter>
    </Modal>
  )
}