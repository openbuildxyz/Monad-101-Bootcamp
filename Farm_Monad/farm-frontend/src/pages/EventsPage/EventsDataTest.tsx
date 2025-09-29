import { useAccount } from 'wagmi'
import { useContractRead } from 'wagmi'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { WalletConnection } from '@/components/web3/WalletConnection'
import { CONTRACTS } from '@/types/contracts'
import { FarmGameABI } from '@/contracts'

export function EventsDataTest() {
  const { isConnected } = useAccount()

  // 获取总事件数
  const { data: totalEvents, isLoading: totalLoading, error: totalError } = useContractRead({
    address: CONTRACTS.FarmGame,
    abi: FarmGameABI,
    functionName: 'totalEvents',
    enabled: isConnected,
  })

  // 获取最近20个事件
  const { data: recent20, isLoading: recent20Loading, error: recent20Error } = useContractRead({
    address: CONTRACTS.FarmGame,
    abi: FarmGameABI,
    functionName: 'getRecentEvents',
    args: [BigInt(20)],
    enabled: isConnected,
  })

  // 获取最近50个事件
  const { data: recent50, isLoading: recent50Loading, error: recent50Error } = useContractRead({
    address: CONTRACTS.FarmGame,
    abi: FarmGameABI,
    functionName: 'getRecentEvents',
    args: [BigInt(50)],
    enabled: isConnected,
  })

  // 获取最近100个事件
  const { data: recent100, isLoading: recent100Loading, error: recent100Error } = useContractRead({
    address: CONTRACTS.FarmGame,
    abi: FarmGameABI,
    functionName: 'getRecentEvents',
    args: [BigInt(100)],
    enabled: isConnected,
  })

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">事件数据完整性测试</h1>
          <p className="text-gray-600 mb-6">连接钱包测试事件数据完整性</p>
          <WalletConnection />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">事件数据完整性测试</h1>
        <p className="text-gray-600">检查事件数据是否真实且完整</p>
      </div>

      {/* 总事件数 */}
      <Card>
        <CardHeader>
          <CardTitle>总事件数统计</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>加载状态: {totalLoading ? '⏳ 加载中' : '✅ 完成'}</div>
            <div>总事件数: {totalEvents?.toString() || '无数据'}</div>
            <div>错误信息: {totalError ? `❌ ${totalError.message}` : '✅ 无错误'}</div>
          </div>
        </CardContent>
      </Card>

      {/* 最近20个事件 */}
      <Card>
        <CardHeader>
          <CardTitle>最近20个事件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>加载状态: {recent20Loading ? '⏳ 加载中' : '✅ 完成'}</div>
            <div>事件数量: {recent20?.length || 0}</div>
            <div>错误信息: {recent20Error ? `❌ ${recent20Error.message}` : '✅ 无错误'}</div>
            <div className="text-sm text-gray-600">
              时间范围: {recent20 && recent20.length > 0 ? 
                `${new Date(Number(recent20[recent20.length-1].timestamp) * 1000).toLocaleString()} - ${new Date(Number(recent20[0].timestamp) * 1000).toLocaleString()}` 
                : '无数据'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 最近50个事件 */}
      <Card>
        <CardHeader>
          <CardTitle>最近50个事件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>加载状态: {recent50Loading ? '⏳ 加载中' : '✅ 完成'}</div>
            <div>事件数量: {recent50?.length || 0}</div>
            <div>错误信息: {recent50Error ? `❌ ${recent50Error.message}` : '✅ 无错误'}</div>
            <div className="text-sm text-gray-600">
              时间范围: {recent50 && recent50.length > 0 ? 
                `${new Date(Number(recent50[recent50.length-1].timestamp) * 1000).toLocaleString()} - ${new Date(Number(recent50[0].timestamp) * 1000).toLocaleString()}` 
                : '无数据'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 最近100个事件 */}
      <Card>
        <CardHeader>
          <CardTitle>最近100个事件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>加载状态: {recent100Loading ? '⏳ 加载中' : '✅ 完成'}</div>
            <div>事件数量: {recent100?.length || 0}</div>
            <div>错误信息: {recent100Error ? `❌ ${recent100Error.message}` : '✅ 无错误'}</div>
            <div className="text-sm text-gray-600">
              时间范围: {recent100 && recent100.length > 0 ? 
                `${new Date(Number(recent100[recent100.length-1].timestamp) * 1000).toLocaleString()} - ${new Date(Number(recent100[0].timestamp) * 1000).toLocaleString()}` 
                : '无数据'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 数据完整性分析 */}
      <Card>
        <CardHeader>
          <CardTitle>数据完整性分析</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <strong>总事件数:</strong> {totalEvents?.toString() || '未知'}
            </div>
            <div>
              <strong>最近20个事件:</strong> {recent20?.length || 0} 个
            </div>
            <div>
              <strong>最近50个事件:</strong> {recent50?.length || 0} 个
            </div>
            <div>
              <strong>最近100个事件:</strong> {recent100?.length || 0} 个
            </div>
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-sm text-yellow-800">
                <strong>注意:</strong> 当前只显示最近的N个事件，不是所有历史事件。
                如果需要查看所有事件，需要增加limit参数或实现分页功能。
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
