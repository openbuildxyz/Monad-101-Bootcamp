import { useAccount } from 'wagmi'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { WalletConnection } from '@/components/web3/WalletConnection'
import { useNativeBalance, useKindBalance } from '@/hooks/web3'
import { formatAddress, formatEth, formatKind } from '@/utils/format'
import { CROP_CONFIG, CropType } from '@/types/game'
import { useUserSeeds } from '@/hooks/contracts'
import { usePlayerStats, usePlayerAchievements, usePlayerActivity } from '@/hooks/contracts/usePlayerStats'
import { ErrorBoundary } from '@/components/ui'
import {
  UserIcon,
  WalletIcon,
  TrophyIcon,
  HeartIcon,
  PhotoIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

// 获取用户拥有的作物NFT（从合约获取）
const useOwnedCrops = () => {
  try {
    const { userSeeds, isLoading } = useUserSeeds()
    
    // 只显示成熟的种子（已收获的作物）
    const maturedCrops = userSeeds?.filter(seed => 
      seed.seedInfo.growthStage === 2 && seed.seedInfo.maturedAt > 0
    ) || []
    
    return {
      ownedCrops: maturedCrops.map(seed => ({
        tokenId: seed.tokenId,
        cropType: seed.seedInfo.cropType,
        rarity: seed.seedInfo.rarity,
        maturedAt: seed.seedInfo.maturedAt
      })),
      isLoading
    }
  } catch (error) {
    console.error('useOwnedCrops error:', error)
    return {
      ownedCrops: [],
      isLoading: false
    }
  }
}

export function ProfilePage() {
  const { isConnected, address } = useAccount()
  
  // 添加错误边界保护
  try {
    const { data: nativeBalance } = useNativeBalance(address)
    const { data: kindBalance } = useKindBalance(address)
    
    // 获取真实用户统计数据
    const {
      totalCropsHarvested,
      totalCropsStolen,
      totalHelpProvided,
      harvestRank,
      kindnessRank,
      remainingHelpToday,
      joinedDate,
      lastActive,
      totalScore
    } = usePlayerStats()
    
    // 获取成就数据
    const { data: achievementsData, isLoading: achievementsLoading } = usePlayerAchievements()
    
    // 获取活动历史
    const { data: activityData, isLoading: activityLoading } = usePlayerActivity()
    
    // 获取用户数据
    const { ownedCrops, isLoading: cropsLoading } = useOwnedCrops()
    const { userSeeds, error: seedsError } = useUserSeeds()
    
    // 如果有错误，显示错误信息
    if (seedsError) {
      console.error('ProfilePage seeds error:', seedsError)
    }
    
    // 安全地处理userSeeds
    const safeUserSeeds = userSeeds || []

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center">
            <UserIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            个人中心
          </h1>
          <p className="text-gray-600 mb-6 max-w-md">
            连接您的钱包查看个人统计数据、NFT收藏和游戏历史。
          </p>
          <WalletConnection />
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('ProfilePage Error:', error, errorInfo)
      }}
    >
      <div className="space-y-6">
      {/* 用户信息卡片 */}
      <Card>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {address?.slice(2, 4).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">农场主</h2>
              <p className="text-gray-600 font-mono text-sm">{formatAddress(address!, 10, 6)}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span>加入时间: {joinedDate}</span>
                <span>•</span>
                <span>最后活跃: {lastActive}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 text-green-600 mb-1">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span className="text-sm font-medium">在线</span>
              </div>
              <button className="text-sm text-gray-500 hover:text-gray-700">
                编辑资料
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 钱包余额和统计 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent>
            <div className="flex items-center">
              <WalletIcon className="w-8 h-8 text-gray-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">MON 余额</p>
                <p className="text-2xl font-bold">
                  {nativeBalance ? formatEth(nativeBalance.value, 4) : '0.0000'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center">
              <HeartIcon className="w-8 h-8 text-primary-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-primary-600">KIND 余额</p>
                <p className="text-2xl font-bold text-primary-700">
                  {kindBalance ? formatKind(kindBalance, 2) : '0.00'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center">
              <TrophyIcon className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">总收获</p>
                <p className="text-2xl font-bold">{totalCropsHarvested}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center">
              <HeartIcon className="w-8 h-8 text-red-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">帮助次数</p>
                <p className="text-2xl font-bold">{totalHelpProvided}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 游戏统计详情 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 收获统计 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrophyIcon className="w-5 h-5" />
              <span>收获统计</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">总收获数</span>
                <span className="font-semibold">{totalCropsHarvested}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">偷菜次数</span>
                <span className="font-semibold">{totalCropsStolen}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">总分数</span>
                <span className="font-semibold text-green-600">
                  {totalScore}
                </span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between">
                  <span className="text-gray-600">收获排名</span>
                  <span className="font-semibold text-yellow-600">
                    {harvestRank && harvestRank > 0 ? harvestRank : '-'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 互助统计 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <HeartIcon className="w-5 h-5 text-primary-600" />
              <span>互助统计</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">总帮助次数</span>
                <span className="font-semibold">{totalHelpProvided}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">今日剩余</span>
                <span className="font-semibold text-primary-600">
                  {remainingHelpToday}/15
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">获得KIND</span>
                <span className="font-semibold text-primary-600">
                  {kindBalance ? formatKind(kindBalance, 0) : '0'} KIND
                </span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between">
                  <span className="text-gray-600">善良排名</span>
                  <span className="font-semibold text-primary-600">
                    {kindnessRank && kindnessRank > 0 ? kindnessRank : '-'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 成就徽章 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>🏆</span>
              <span>成就徽章</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {achievementsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">加载成就中...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">成就进度</span>
                  <span className="font-semibold text-primary-600">
                    {achievementsData?.unlockedCount || 0}/{achievementsData?.totalCount || 6}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {achievementsData?.achievements.map((achievement) => (
                    <div 
                      key={achievement.id}
                      className={`text-center ${!achievement.unlocked ? 'opacity-50' : ''}`}
                    >
                      <div className={`w-12 h-12 ${achievement.color} rounded-full flex items-center justify-center mb-2 ${
                        achievement.unlocked ? 'ring-2 ring-green-400' : ''
                      }`}>
                        <span className="text-xl">{achievement.emoji}</span>
                      </div>
                      <p className="text-xs text-gray-600">{achievement.name}</p>
                      {achievement.unlocked && (
                        <div className="mt-1">
                          <span className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">
                            ✓
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 我的种子 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>🌱</span>
            <span>我的种子</span>
            <span className="text-sm font-normal text-gray-500">
              ({safeUserSeeds.filter(seed => seed.seedInfo.growthStage === 0 || seed.seedInfo.growthStage === 1).length} 个)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cropsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">加载中...</p>
            </div>
          ) : (
            <>
              {safeUserSeeds.filter(seed => seed.seedInfo.growthStage === 0 || seed.seedInfo.growthStage === 1).length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {safeUserSeeds
                    .filter(seed => seed.seedInfo.growthStage === 0 || seed.seedInfo.growthStage === 1) // 显示种子状态和成长中的NFT
                    .map((seed) => {
                      const config = CROP_CONFIG[seed.seedInfo.cropType as CropType]
                      return (
                        <div
                          key={seed.tokenId}
                          className={`relative p-4 border rounded-lg text-center hover:shadow-md transition-shadow ${
                            seed.seedInfo.rarity === 1 ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                          }`}
                        >
                          <div className="text-3xl mb-2">{config.emoji}</div>
                          <h4 className="font-medium text-sm">{config.name}</h4>
                          <p className="text-xs text-gray-500 mt-1">#{seed.tokenId}</p>
                          {seed.seedInfo.rarity === 1 && (
                            <div className="absolute top-2 right-2">
                              <span className="text-xs bg-blue-500 text-white px-1 py-0.5 rounded">
                                稀有
                              </span>
                            </div>
                          )}
                          <div className="mt-2">
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              {seed.seedInfo.growthStage === 0 ? '种子' : '成长中'}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <span className="text-4xl mb-4 block">🌱</span>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">暂无种子</h3>
                  <p className="text-gray-600">
                    前往商店购买种子开始种植
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* NFT 收藏 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PhotoIcon className="w-5 h-5" />
            <span>收获的作物</span>
            <span className="text-sm font-normal text-gray-500">
              ({ownedCrops.length} 个)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cropsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">加载中...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {ownedCrops.map((crop) => {
                  const config = CROP_CONFIG[crop.cropType as CropType]
                  return (
                    <div
                      key={crop.tokenId}
                      className={`relative p-4 border rounded-lg text-center hover:shadow-md transition-shadow ${
                        crop.rarity === 1 ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="text-3xl mb-2">{config.emoji}</div>
                      <h4 className="font-medium text-sm">{config.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">#{crop.tokenId}</p>
                      {crop.rarity === 1 && (
                        <div className="absolute top-2 right-2">
                          <span className="text-xs bg-blue-500 text-white px-1 py-0.5 rounded">
                            稀有
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {ownedCrops.length === 0 && (
                <div className="text-center py-12">
                  <PhotoIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">暂无收获</h3>
                  <p className="text-gray-600">
                    种植种子并等待成熟后收获作物
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* 最近活动 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ClockIcon className="w-5 h-5" />
            <span>最近活动</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activityLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">加载活动中...</p>
            </div>
          ) : activityData?.hasActivity ? (
            <div className="space-y-3">
              {activityData.activities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl">{activity.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ClockIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无活动记录</h3>
              <p className="text-gray-600">
                开始游戏后，您的活动记录将显示在这里
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </ErrorBoundary>
  )
  } catch (error) {
    console.error('ProfilePage render error:', error)
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="text-red-500 text-lg font-medium mb-2">
            个人页面加载失败
          </div>
          <p className="text-gray-600 text-sm mb-4">
            {error instanceof Error ? error.message : '未知错误'}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            刷新页面
          </button>
        </div>
      </div>
    )
  }
}