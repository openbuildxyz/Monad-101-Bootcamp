import { useAccount } from 'wagmi'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { WalletConnection } from '@/components/web3/WalletConnection'
import { usePaginatedEvents } from '@/hooks/contracts/usePaginatedEvents'

export function PaginationTest() {
  const { isConnected } = useAccount()
  
  const {
    allEvents,
    totalEventCount,
    currentPage,
    totalPages,
    isLoading,
    hasError,
    goToPage,
    goToNextPage,
    goToPrevPage
  } = usePaginatedEvents()

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">分页测试</h1>
          <p className="text-gray-600 mb-6">连接钱包测试分页功能</p>
          <WalletConnection />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">分页功能测试</h1>
        <p className="text-gray-600">验证每页显示不同的事件数据</p>
      </div>

      {/* 分页信息 */}
      <Card>
        <CardHeader>
          <CardTitle>分页信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">{currentPage}</div>
              <div className="text-sm text-gray-600">当前页</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">{totalPages}</div>
              <div className="text-sm text-gray-600">总页数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">{totalEventCount}</div>
              <div className="text-sm text-gray-600">总事件数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">{allEvents.length}</div>
              <div className="text-sm text-gray-600">当前页事件数</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 分页控制 */}
      <Card>
        <CardHeader>
          <CardTitle>分页控制</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => goToPage(1)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              第1页
            </button>
            <button
              onClick={goToPrevPage}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              上一页
            </button>
            <span className="px-4 py-2 bg-primary-500 text-white rounded">
              第{currentPage}页
            </span>
            <button
              onClick={goToNextPage}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              下一页
            </button>
            <button
              onClick={() => goToPage(totalPages)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              第{totalPages}页
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 当前页事件列表 */}
      <Card>
        <CardHeader>
          <CardTitle>第{currentPage}页事件 (共{allEvents.length}个)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">加载中...</p>
            </div>
          ) : hasError ? (
            <div className="text-center py-8 text-red-600">
              <p>❌ 加载失败</p>
            </div>
          ) : allEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <p>📝 暂无事件</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allEvents.map((event, index) => (
                <div key={event.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{event.emoji}</span>
                      <div>
                        <div className="font-medium">{event.description}</div>
                        <div className="text-sm text-gray-600">
                          玩家: {event.displayAddress} | 时间: {event.displayTime}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      事件 #{index + 1}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 事件ID对比 */}
      {allEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>事件ID对比 (验证分页)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                当前页事件ID: {allEvents.map(e => e.id).join(', ')}
              </div>
              <div className="text-sm text-gray-600">
                事件数量: {allEvents.length}
              </div>
              <div className="text-sm text-gray-600">
                时间范围: {allEvents.length > 0 ? 
                  `${new Date(allEvents[allEvents.length-1].timestamp * 1000).toLocaleString()} - ${new Date(allEvents[0].timestamp * 1000).toLocaleString()}` 
                  : '无数据'}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
