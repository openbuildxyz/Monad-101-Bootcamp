import { useAccount } from 'wagmi'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { WalletConnection } from '@/components/web3/WalletConnection'
import { useContractTest } from '@/hooks/contracts/useContractTest'

export function ContractTestSimple() {
  const { isConnected } = useAccount()
  const testData = useContractTest()

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">合约连接测试</h1>
          <p className="text-gray-600 mb-6">连接钱包测试合约连接</p>
          <WalletConnection />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">合约连接测试</h1>
        <p className="text-gray-600">测试基本合约调用是否正常工作</p>
      </div>

      {/* 连接状态 */}
      <Card>
        <CardHeader>
          <CardTitle>连接状态</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>钱包地址: {testData.address}</div>
            <div>合约地址: {testData.debugInfo.contractAddress}</div>
            <div>连接状态: {testData.isConnected ? '✅ 已连接' : '❌ 未连接'}</div>
          </div>
        </CardContent>
      </Card>

      {/* 基本合约调用测试 */}
      <Card>
        <CardHeader>
          <CardTitle>基本合约调用测试</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="font-medium">总玩家数 (totalPlayers)</div>
              <div>状态: {testData.playersLoading ? '⏳ 加载中' : '✅ 完成'}</div>
              <div>数据: {testData.totalPlayers?.toString() || '无数据'}</div>
              <div>错误: {testData.playersError ? `❌ ${testData.playersError.message}` : '✅ 无错误'}</div>
            </div>

            <div>
              <div className="font-medium">玩家统计 (playerStats)</div>
              <div>状态: {testData.statsLoading ? '⏳ 加载中' : '✅ 完成'}</div>
              <div>数据: {testData.playerStats ? JSON.stringify(testData.playerStats, null, 2) : '无数据'}</div>
              <div>错误: {testData.statsError ? `❌ ${testData.statsError.message}` : '✅ 无错误'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 排行榜函数测试 */}
      <Card>
        <CardHeader>
          <CardTitle>排行榜函数测试</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="font-medium">收获排行榜 (getHarvestLeaderboard)</div>
              <div>状态: {testData.harvestLoading ? '⏳ 加载中' : '✅ 完成'}</div>
              <div>数据长度: {testData.debugInfo.harvestDataLength}</div>
              <div>原始数据: {JSON.stringify(testData.harvestLeaderboard, null, 2)}</div>
              <div>错误: {testData.harvestError ? `❌ ${testData.harvestError.message}` : '✅ 无错误'}</div>
            </div>

            <div>
              <div className="font-medium">善良值排行榜 (getKindnessLeaderboard)</div>
              <div>状态: {testData.kindnessLoading ? '⏳ 加载中' : '✅ 完成'}</div>
              <div>数据长度: {testData.debugInfo.kindnessDataLength}</div>
              <div>原始数据: {JSON.stringify(testData.kindnessLeaderboard, null, 2)}</div>
              <div>错误: {testData.kindnessError ? `❌ ${testData.kindnessError.message}` : '✅ 无错误'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 调试信息 */}
      <Card>
        <CardHeader>
          <CardTitle>调试信息</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
            {JSON.stringify(testData.debugInfo, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
