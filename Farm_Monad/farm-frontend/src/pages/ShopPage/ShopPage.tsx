import { useAccount } from 'wagmi'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { SeedCard } from '@/components/game/SeedCard'
import { WalletConnection } from '@/components/web3/WalletConnection'
import { useAvailableSeedsForNative, useAvailableSeedsForKind } from '@/hooks/contracts/useShop'
import { CropType } from '@/types/game'
import { ShoppingBagIcon, SparklesIcon } from '@heroicons/react/24/outline'

export function ShopPage() {
  const { isConnected } = useAccount()
  const { data: nativeSeeds } = useAvailableSeedsForNative()
  const { data: kindSeeds } = useAvailableSeedsForKind()

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
            <ShoppingBagIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            农场商店
          </h1>
          <p className="text-gray-600 mb-6 max-w-md">
            连接您的钱包开始购买种子。选择不同类型的种子，使用MON或KIND代币进行购买。
          </p>
          <WalletConnection />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">农场商店</h1>
        <p className="text-gray-600">
          购买种子开始您的农场之旅
        </p>
      </div>

      {/* 购买提示 */}
      <Card>
        <CardContent>
          <div className="bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <SparklesIcon className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-green-800">
                  购买说明
                </h3>
                <div className="mt-1 text-sm text-green-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>普通种子可使用MON代币购买</li>
                    <li>稀有种子需要KIND代币购买</li>
                    <li>KIND代币通过帮助他人获得</li>
                    <li>购买后在农场页面种植</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 普通种子 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>🌱</span>
            <span>普通种子</span>
            <span className="text-sm font-normal text-gray-500">(使用 MON 代币购买)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {nativeSeeds?.map((cropType) => (
              <SeedCard key={cropType} cropType={cropType} />
            )) || [CropType.Wheat, CropType.Corn, CropType.Pumpkin].map((cropType) => (
              <SeedCard key={cropType} cropType={cropType} />
            ))}
          </div>

          {nativeSeeds?.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              暂无可购买的普通种子
            </div>
          )}
        </CardContent>
      </Card>

      {/* 稀有种子 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>✨</span>
            <span>稀有种子</span>
            <span className="text-sm font-normal text-primary-600">(使用 KIND 代币购买)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {kindSeeds?.map((cropType) => (
              <SeedCard key={cropType} cropType={cropType} />
            )) || [CropType.Strawberry, CropType.Grape, CropType.Watermelon].map((cropType) => (
              <SeedCard key={cropType} cropType={cropType} />
            ))}
          </div>

          {kindSeeds?.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-2">暂无可购买的稀有种子</div>
              <p className="text-sm text-gray-400">
                通过帮助其他农民获得 KIND 代币来购买稀有种子
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 如何获得 KIND 代币 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary-600">如何获得 KIND 代币？</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="font-semibold mb-2">帮助他人</h3>
              <p className="text-sm text-gray-600">
                为其他农民的作物使用道具，每次获得1个KIND代币奖励
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">⏰</span>
              </div>
              <h3 className="font-semibold mb-2">每日限制</h3>
              <p className="text-sm text-gray-600">
                每天最多可以帮助他人15次，合理安排帮助时间
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="font-semibold mb-2">积累奖励</h3>
              <p className="text-sm text-gray-600">
                积累KIND代币购买稀有种子，获得更高的收益和排名
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}