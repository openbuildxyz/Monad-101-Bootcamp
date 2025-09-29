import { useAccount } from 'wagmi'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { WalletConnection } from '@/components/web3/WalletConnection'
import { useLeaderboardDebug } from '@/hooks/contracts/useLeaderboardDebug'

export function LeaderboardDebug() {
  const { isConnected } = useAccount()
  const debugData = useLeaderboardDebug()

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">排行榜调试</h1>
          <p className="text-gray-600 mb-6">连接钱包查看调试信息</p>
          <WalletConnection />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">排行榜调试信息</h1>
        <p className="text-gray-600">检查合约连接和排行榜数据</p>
      </div>

      {/* 连接状态 */}
      <Card>
        <CardHeader>
          <CardTitle>连接状态</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>钱包地址: {debugData.address}</div>
            <div>合约地址: {debugData.debugInfo.contractAddress}</div>
            <div>连接状态: {debugData.isConnected ? '✅ 已连接' : '❌ 未连接'}</div>
          </div>
        </CardContent>
      </Card>

      {/* 基本合约连接测试 */}
      <Card>
        <CardHeader>
          <CardTitle>基本合约连接测试</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>总玩家数: {debugData.playersLoading ? '加载中...' : debugData.totalPlayers?.toString() || '无数据'}</div>
            <div>加载状态: {debugData.playersLoading ? '⏳ 加载中' : '✅ 完成'}</div>
            <div>错误信息: {debugData.playersError ? `❌ ${debugData.playersError.message}` : '✅ 无错误'}</div>
          </div>
        </CardContent>
      </Card>

      {/* 收获排行榜测试 */}
      <Card>
        <CardHeader>
          <CardTitle>收获排行榜测试</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>数据状态: {debugData.harvestLoading ? '⏳ 加载中' : '✅ 完成'}</div>
            <div>数据长度: {debugData.debugInfo.harvestDataLength}</div>
            <div>错误信息: {debugData.harvestError ? `❌ ${debugData.harvestError.message}` : '✅ 无错误'}</div>
            <div>原始数据: {JSON.stringify(debugData.harvestLeaderboard, null, 2)}</div>
          </div>
        </CardContent>
      </Card>

      {/* 善良值排行榜测试 */}
      <Card>
        <CardHeader>
          <CardTitle>善良值排行榜测试</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>数据状态: {debugData.kindnessLoading ? '⏳ 加载中' : '✅ 完成'}</div>
            <div>数据长度: {debugData.debugInfo.kindnessDataLength}</div>
            <div>错误信息: {debugData.kindnessError ? `❌ ${debugData.kindnessError.message}` : '✅ 无错误'}</div>
            <div>原始数据: {JSON.stringify(debugData.kindnessLeaderboard, null, 2)}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
