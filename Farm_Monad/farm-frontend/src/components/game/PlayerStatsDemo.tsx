import { usePlayerStats, usePlayerAchievements } from '@/hooks/contracts/usePlayerStats'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { TrophyIcon, HeartIcon, ClockIcon } from '@heroicons/react/24/outline'

/**
 * 玩家统计演示组件
 * 用于展示真实数据绑定的效果
 */
export function PlayerStatsDemo() {
  const {
    totalCropsHarvested,
    totalCropsStolen,
    totalHelpProvided,
    harvestRank,
    kindnessRank,
    remainingHelpToday,
    totalScore,
    isLoading
  } = usePlayerStats()

  const { data: achievementsData } = usePlayerAchievements()

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">加载统计数据中...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* 基本统计 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrophyIcon className="w-5 h-5" />
            <span>游戏统计</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Number(totalCropsHarvested)}
              </div>
              <div className="text-sm text-gray-600">总收获</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {Number(totalCropsStolen)}
              </div>
              <div className="text-sm text-gray-600">偷菜次数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Number(totalHelpProvided)}
              </div>
              <div className="text-sm text-gray-600">帮助次数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {totalScore}
              </div>
              <div className="text-sm text-gray-600">总分数</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 排名信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <HeartIcon className="w-5 h-5" />
            <span>排名信息</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-lg font-semibold text-yellow-700">
                {harvestRank && harvestRank > 0 ? `#${harvestRank}` : '未排名'}
              </div>
              <div className="text-sm text-yellow-600">收获排名</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-lg font-semibold text-blue-700">
                {kindnessRank && kindnessRank > 0 ? `#${kindnessRank}` : '未排名'}
              </div>
              <div className="text-sm text-blue-600">善良排名</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 今日帮助 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ClockIcon className="w-5 h-5" />
            <span>今日帮助</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {remainingHelpToday}/15
            </div>
            <div className="text-sm text-gray-600">剩余帮助次数</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(remainingHelpToday / 15) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 成就进度 */}
      {achievementsData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>🏆</span>
              <span>成就进度</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-primary-600">
                {achievementsData.unlockedCount}/{achievementsData.totalCount}
              </div>
              <div className="text-sm text-gray-600">已解锁成就</div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(achievementsData.unlockedCount / achievementsData.totalCount) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
