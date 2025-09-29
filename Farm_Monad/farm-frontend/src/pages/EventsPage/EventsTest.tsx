import { useAccount } from 'wagmi'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { WalletConnection } from '@/components/web3/WalletConnection'
import { useGameEvents, usePlayerEvents, useTotalEventCount } from '@/hooks/contracts'

export function EventsTest() {
  const { isConnected, address } = useAccount()
  
  // 测试基本事件数据
  const gameEvents = useGameEvents(10)
  const playerEvents = usePlayerEvents(10)
  const totalCount = useTotalEventCount()

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">事件测试</h1>
          <p className="text-gray-600 mb-6">连接钱包测试事件数据</p>
          <WalletConnection />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">事件数据测试</h1>
        <p className="text-gray-600">测试事件合约调用是否正常工作</p>
      </div>

      {/* 连接状态 */}
      <Card>
        <CardHeader>
          <CardTitle>连接状态</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>钱包地址: {address}</div>
            <div>连接状态: {isConnected ? '✅ 已连接' : '❌ 未连接'}</div>
          </div>
        </CardContent>
      </Card>

      {/* 全服事件测试 */}
      <Card>
        <CardHeader>
          <CardTitle>全服事件测试 (getRecentEvents)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>加载状态: {gameEvents.isLoading ? '⏳ 加载中' : '✅ 完成'}</div>
            <div>事件数量: {gameEvents.events?.length || 0}</div>
            <div>错误信息: {gameEvents.error ? `❌ ${gameEvents.error.message}` : '✅ 无错误'}</div>
            <div>原始数据: {JSON.stringify(gameEvents.events, null, 2)}</div>
          </div>
        </CardContent>
      </Card>

      {/* 个人事件测试 */}
      <Card>
        <CardHeader>
          <CardTitle>个人事件测试 (getPlayerEvents)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>加载状态: {playerEvents.isLoading ? '⏳ 加载中' : '✅ 完成'}</div>
            <div>事件数量: {playerEvents.events?.length || 0}</div>
            <div>错误信息: {playerEvents.error ? `❌ ${playerEvents.error.message}` : '✅ 无错误'}</div>
            <div>原始数据: {JSON.stringify(playerEvents.events, null, 2)}</div>
          </div>
        </CardContent>
      </Card>

      {/* 总事件数测试 */}
      <Card>
        <CardHeader>
          <CardTitle>总事件数测试 (getTotalEventCount)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>加载状态: {totalCount.isLoading ? '⏳ 加载中' : '✅ 完成'}</div>
            <div>总事件数: {totalCount.count}</div>
            <div>错误信息: {totalCount.error ? `❌ ${totalCount.error.message}` : '✅ 无错误'}</div>
          </div>
        </CardContent>
      </Card>

      {/* 刷新按钮 */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => {
            gameEvents.refetch()
            playerEvents.refetch()
          }}
          disabled={gameEvents.isLoading || playerEvents.isLoading || totalCount.isLoading}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors"
        >
          刷新数据
        </button>
      </div>
    </div>
  )
}
