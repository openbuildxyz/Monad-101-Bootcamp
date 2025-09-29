import { useAccount } from 'wagmi'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { WalletConnection } from '@/components/web3/WalletConnection'
import { useCompleteLeaderboardFixed, useLeaderboardStatsFixed } from '@/hooks/contracts/useRealLeaderboardFixed'

export function LeaderboardTest() {
  const { isConnected, address } = useAccount()
  const leaderboardData = useCompleteLeaderboardFixed()
  const statsData = useLeaderboardStatsFixed()

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">排行榜测试</h1>
          <p className="text-gray-600 mb-6">连接钱包测试真实合约数据</p>
          <WalletConnection />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">真实合约数据测试</h1>
        <p className="text-gray-600">测试排行榜合约调用是否正常工作</p>
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

      {/* 收获排行榜测试 */}
      <Card>
        <CardHeader>
          <CardTitle>收获排行榜测试</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>加载状态: {leaderboardData.harvestLoading ? '⏳ 加载中' : '✅ 完成'}</div>
            <div>数据长度: {leaderboardData.harvestLeaderboard?.length || 0}</div>
            <div>错误信息: {leaderboardData.harvestError ? `❌ ${leaderboardData.harvestError.message}` : '✅ 无错误'}</div>
            <div>原始数据: {JSON.stringify(leaderboardData.harvestLeaderboard, null, 2)}</div>
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
            <div>加载状态: {leaderboardData.kindnessLoading ? '⏳ 加载中' : '✅ 完成'}</div>
            <div>数据长度: {leaderboardData.kindnessLeaderboard?.length || 0}</div>
            <div>错误信息: {leaderboardData.kindnessError ? `❌ ${leaderboardData.kindnessError.message}` : '✅ 无错误'}</div>
            <div>原始数据: {JSON.stringify(leaderboardData.kindnessLeaderboard, null, 2)}</div>
          </div>
        </CardContent>
      </Card>

      {/* 统计数据测试 */}
      <Card>
        <CardHeader>
          <CardTitle>统计数据测试</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>加载状态: {statsData.isLoading ? '⏳ 加载中' : '✅ 完成'}</div>
            <div>活跃农民: {statsData.data?.activeFarmers || 0}</div>
            <div>总收获数: {statsData.data?.totalCropsHarvested || 0}</div>
            <div>总帮助次数: {statsData.data?.totalHelpProvided || 0}</div>
            <div>错误信息: {statsData.error ? `❌ ${statsData.error.message}` : '✅ 无错误'}</div>
          </div>
        </CardContent>
      </Card>

      {/* 刷新按钮 */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={leaderboardData.refetch}
          disabled={leaderboardData.isLoading}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors"
        >
          {leaderboardData.isLoading ? '刷新中...' : '🔄 刷新数据'}
        </button>
      </div>
    </div>
  )
}
