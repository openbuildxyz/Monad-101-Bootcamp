import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { WalletConnection } from '@/components/web3/WalletConnection'
import {
  ChartBarIcon,
  TrophyIcon,
  HeartIcon,
  ArrowTrendingUpIcon,
  CubeIcon
} from '@heroicons/react/24/outline'
import { usePaginatedLeaderboard } from '@/hooks/contracts'

type StatTab = 'overview' | 'rankings'

export function StatsPageSimple() {
  const [activeTab, setActiveTab] = useState<StatTab>('overview')
  const { isConnected } = useAccount()

  // 获取统计数据
  const {
    harvestLeaderboard,
    kindnessLeaderboard,
    stats,
    isLoading,
    hasError,
    refetch
  } = usePaginatedLeaderboard()

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">游戏统计</h1>
          <p className="text-gray-600 mb-6">连接钱包查看游戏统计数据</p>
          <WalletConnection />
        </div>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">游戏统计</h1>
          <p className="text-gray-600">加载统计数据时遇到问题</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-4">错误信息</h2>
          <div className="space-y-2 text-sm">
            <div>
              <strong>网络错误:</strong>
              <pre className="mt-1 bg-red-100 p-2 rounded text-xs overflow-auto">
                网络错误，请稍后重试
              </pre>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              重试
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">游戏统计</h1>
        <p className="text-gray-600">查看农场游戏的详细统计数据</p>
      </div>

      {/* 标签页导航 */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors ${
            activeTab === 'overview'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ChartBarIcon className="w-5 h-5" />
          <span>总览</span>
        </button>
        <button
          onClick={() => setActiveTab('rankings')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors ${
            activeTab === 'rankings'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <TrophyIcon className="w-5 h-5" />
          <span>排行榜</span>
        </button>
      </div>

      {/* 刷新按钮 */}
      <div className="text-center">
        <button
          onClick={() => refetch()}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <ArrowTrendingUpIcon className="w-4 h-4" />
          <span>刷新数据</span>
        </button>
      </div>

      {/* 总览标签页 */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 核心统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="text-center">
              <CardContent>
                <div className="text-2xl mb-2">👥</div>
                <div className="text-2xl font-bold text-gray-900">
                  {isLoading ? '...' : stats?.totalPlayers || 0}
                </div>
                <div className="text-sm text-gray-600">活跃农民</div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent>
                <div className="text-2xl mb-2">🌾</div>
                <div className="text-2xl font-bold text-gray-900">
                  {isLoading ? '...' : stats?.totalHarvests || 0}
                </div>
                <div className="text-sm text-gray-600">总收获数</div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent>
                <div className="text-2xl mb-2">💖</div>
                <div className="text-2xl font-bold text-gray-900">
                  {isLoading ? '...' : stats?.totalHelpCount || 0}
                </div>
                <div className="text-sm text-gray-600">总帮助次数</div>
              </CardContent>
            </Card>
          </div>

          {/* 游戏活动统计 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CubeIcon className="w-5 h-5" />
                <span>游戏活动统计</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-green-700 mb-3">收获活动</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>总收获数:</span>
                      <span className="font-medium">{stats?.totalHarvests || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>活跃农民:</span>
                      <span className="font-medium">{stats?.totalPlayers || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>平均收获:</span>
                      <span className="font-medium">
                        {stats?.totalPlayers > 0 
                          ? (stats.totalHarvests / stats.totalPlayers).toFixed(1)
                          : '0'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-primary-700 mb-3">互助活动</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>总帮助次数:</span>
                      <span className="font-medium">{stats?.totalHelpCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>活跃农民:</span>
                      <span className="font-medium">{stats?.totalPlayers || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>平均帮助:</span>
                      <span className="font-medium">
                        {stats?.totalPlayers > 0 
                          ? (stats.totalHelpCount / stats.totalPlayers).toFixed(1)
                          : '0'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 排行榜标签页 */}
      {activeTab === 'rankings' && (
        <div className="space-y-6">
          {/* 收获排行榜 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrophyIcon className="w-5 h-5" />
                <span>收获排行榜</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">加载中...</p>
                </div>
              ) : harvestLeaderboard.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                  <p>📝 暂无收获数据</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {harvestLeaderboard.slice(0, 10).map((entry) => (
                    <div
                      key={entry.rank}
                      className="flex items-center justify-between p-3 rounded-lg border bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary-600">
                            {entry.rank}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-sm">
                            {entry.displayAddress}
                          </div>
                          <div className="text-xs text-gray-600">
                            收获: {entry.harvestCount} | 偷菜: {entry.stealCount}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {entry.totalScore}
                        </div>
                        <div className="text-xs text-gray-600">总分</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 善良值排行榜 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <HeartIcon className="w-5 h-5 text-primary-600" />
                <span>善良值排行榜</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">加载中...</p>
                </div>
              ) : kindnessLeaderboard.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                  <p>📝 暂无善良值数据</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {kindnessLeaderboard.slice(0, 10).map((entry) => (
                    <div
                      key={entry.rank}
                      className="flex items-center justify-between p-3 rounded-lg border bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary-600">
                            {entry.rank}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-sm">
                            {entry.displayAddress}
                          </div>
                          <div className="text-xs text-gray-600">
                            善良值: {entry.displayKindBalance}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary-600">
                          {entry.displayKindBalance}
                        </div>
                        <div className="text-xs text-primary-600">KIND</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
