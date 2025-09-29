import { useAccount } from 'wagmi'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { WalletConnection } from '@/components/web3/WalletConnection'
import { usePaginatedEvents } from '@/hooks/contracts/usePaginatedEvents'

export function PaginationLogicTest() {
  const { isConnected } = useAccount()
  
  const {
    allEvents,
    playerEvents,
    totalEventCount,
    totalPages
  } = usePaginatedEvents()

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">分页逻辑测试</h1>
          <p className="text-gray-600 mb-6">连接钱包测试分页逻辑</p>
          <WalletConnection />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">分页逻辑验证</h1>
        <p className="text-gray-600">验证分页逻辑是否正确</p>
      </div>

      {/* 分页逻辑说明 */}
      <Card>
        <CardHeader>
          <CardTitle>分页逻辑说明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">正确的分页逻辑：</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 如果数据 ≤ 20条 → 只显示1页，不显示分页控件</li>
                <li>• 如果数据 &gt; 20条 → 显示分页，每页20条</li>
                <li>• 全服事件40条 → 2页，每页20条</li>
                <li>• 个人事件5条 → 1页，不显示分页</li>
              </ul>
            </div>
            
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-2">错误的逻辑（已修复）：</h3>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• 个人事件只有5条，却显示2页 ❌</li>
                <li>• 基于合约总事件数计算分页 ❌</li>
                <li>• 没有考虑实际显示的数据量 ❌</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 全服事件分页状态 */}
      <Card>
        <CardHeader>
          <CardTitle>全服事件分页状态</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">{allEvents.length}</div>
              <div className="text-sm text-gray-600">当前页事件数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">{totalPages}</div>
              <div className="text-sm text-gray-600">总页数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">{totalEventCount}</div>
              <div className="text-sm text-gray-600">合约总事件数</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${allEvents.length > 20 ? 'text-red-600' : 'text-green-600'}`}>
                {allEvents.length > 20 ? '需要分页' : '无需分页'}
              </div>
              <div className="text-sm text-gray-600">分页状态</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 个人事件分页状态 */}
      <Card>
        <CardHeader>
          <CardTitle>个人事件分页状态</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">{playerEvents.length}</div>
              <div className="text-sm text-gray-600">个人事件数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {Math.ceil(playerEvents.length / 20)}
              </div>
              <div className="text-sm text-gray-600">应显示页数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {playerEvents.length > 20 ? '是' : '否'}
              </div>
              <div className="text-sm text-gray-600">需要分页</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${playerEvents.length > 20 ? 'text-red-600' : 'text-green-600'}`}>
                {playerEvents.length > 20 ? '显示分页' : '不显示分页'}
              </div>
              <div className="text-sm text-gray-600">分页控件</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 分页逻辑验证 */}
      <Card>
        <CardHeader>
          <CardTitle>分页逻辑验证</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">全服事件验证：</h4>
              <div className="text-sm space-y-1">
                <div>当前页事件数: {allEvents.length}</div>
                <div>总页数: {totalPages}</div>
                <div>是否需要分页: {allEvents.length > 20 ? '是' : '否'}</div>
                <div className={`font-semibold ${allEvents.length > 20 && totalPages > 1 ? 'text-green-600' : allEvents.length <= 20 && totalPages === 1 ? 'text-green-600' : 'text-red-600'}`}>
                  验证结果: {allEvents.length > 20 && totalPages > 1 ? '✅ 正确' : allEvents.length <= 20 && totalPages === 1 ? '✅ 正确' : '❌ 错误'}
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">个人事件验证：</h4>
              <div className="text-sm space-y-1">
                <div>个人事件数: {playerEvents.length}</div>
                <div>应显示页数: {Math.ceil(playerEvents.length / 20)}</div>
                <div>是否需要分页: {playerEvents.length > 20 ? '是' : '否'}</div>
                <div className={`font-semibold ${playerEvents.length <= 20 ? 'text-green-600' : 'text-orange-600'}`}>
                  验证结果: {playerEvents.length <= 20 ? '✅ 个人事件≤20条，不应显示分页' : '⚠️ 个人事件>20条，需要分页'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
