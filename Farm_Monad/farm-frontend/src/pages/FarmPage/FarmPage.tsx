import { useAccount } from 'wagmi'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui'
import { LandGrid } from '@/components/game'
import { WalletConnection } from '@/components/web3/WalletConnection'
import { useTotalLands, useAvailableLands } from '@/hooks/contracts'
import { InformationCircleIcon } from '@heroicons/react/24/outline'

export function FarmPage() {
  const { isConnected } = useAccount()
  const { data: totalLands } = useTotalLands()
  const { data: availableLands } = useAvailableLands()
  const navigate = useNavigate()

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
            <span className="text-3xl">🌾</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            欢迎来到 Farm 3.0
          </h1>
          <p className="text-gray-600 mb-6 max-w-md">
            连接您的钱包开始您的区块链农场之旅。种植、收获、交易NFT作物，在Monad网络上体验去中心化农场游戏。
          </p>
          <WalletConnection />
        </div>

        {/* 游戏特色 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mt-8">
          <Card className="text-center p-4">
            <div className="text-2xl mb-2">🌱</div>
            <h3 className="font-semibold mb-1">NFT种子系统</h3>
            <p className="text-sm text-gray-600">
              购买、种植和收获NFT作物，每个都是独一无二的数字资产
            </p>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl mb-2">🤝</div>
            <h3 className="font-semibold mb-1">互助机制</h3>
            <p className="text-sm text-gray-600">
              帮助其他农民获得KIND代币奖励，建立友善的农场社区
            </p>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl mb-2">🏆</div>
            <h3 className="font-semibold mb-1">排行榜竞争</h3>
            <p className="text-sm text-gray-600">
              与其他玩家竞争收获数量和善良值，登上农场排行榜
            </p>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和统计 */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">我的农场</h1>
          <p className="text-gray-600">
            管理您的土地，种植和收获NFT作物
          </p>
        </div>

        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <div className="bg-white rounded-lg border border-gray-200 px-4 py-2">
            <div className="text-sm text-gray-600">总土地</div>
            <div className="text-lg font-semibold">{totalLands || 100}</div>
          </div>
          <div className="bg-green-50 rounded-lg border border-green-200 px-4 py-2">
            <div className="text-sm text-green-600">可用土地</div>
            <div className="text-lg font-semibold text-green-700">
              {availableLands?.length || 0}
            </div>
          </div>
        </div>
      </div>

      {/* 操作提示 */}
      <Card>
        <CardContent>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex">
              <InformationCircleIcon className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">
                  游戏指南
                </h3>
                <div className="mt-1 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>点击空闲土地开始种植</li>
                    <li>使用道具加速作物成长</li>
                    <li>帮助他人获得KIND代币奖励</li>
                    <li>收获成熟作物或偷取他人作物</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 农场网格 */}
      <Card>
        <CardHeader>
          <CardTitle>农场网格 (10x10)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <LandGrid className="max-w-4xl" />
          </div>
        </CardContent>
      </Card>

      {/* 快速操作面板 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent>
            <div className="text-2xl mb-2">🛒</div>
            <h3 className="font-semibold mb-2">购买种子</h3>
            <p className="text-sm text-gray-600 mb-4">
              去商店购买不同类型的种子
            </p>
            <Button 
              variant="primary" 
              size="sm" 
              className="w-full"
              onClick={() => navigate('/shop')}
            >
              前往商店
            </Button>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent>
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-semibold mb-2">查看排行榜</h3>
            <p className="text-sm text-gray-600 mb-4">
              查看收获数量和善良值排名
            </p>
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-full"
              onClick={() => navigate('/leaderboard')}
            >
              查看排行榜
            </Button>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent>
            <div className="text-2xl mb-2">👤</div>
            <h3 className="font-semibold mb-2">个人中心</h3>
            <p className="text-sm text-gray-600 mb-4">
              查看NFT收藏和统计数据
            </p>
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-full"
              onClick={() => navigate('/profile')}
            >
              个人中心
            </Button>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent>
            <div className="text-2xl mb-2">❓</div>
            <h3 className="font-semibold mb-2">游戏帮助</h3>
            <p className="text-sm text-gray-600 mb-4">
              学习游戏规则和策略
            </p>
            <Button variant="ghost" size="sm" className="w-full">
              查看帮助
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}