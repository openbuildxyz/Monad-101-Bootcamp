import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { WalletConnection } from '@/components/web3/WalletConnection'
import { formatAddress } from '@/utils/format'
import { ClockIcon, UsersIcon } from '@heroicons/react/24/outline'
import { usePaginatedEvents } from '@/hooks/contracts/usePaginatedEvents'

type EventFilter = 'all' | 'purchase' | 'plant' | 'harvest' | 'steal' | 'help' | 'boost'
type EventTab = 'global' | 'personal'

const EVENT_FILTERS: { value: EventFilter; label: string; emoji: string }[] = [
  { value: 'all', label: '全部事件', emoji: '📝' },
  { value: 'purchase', label: '购买种子', emoji: '🛒' },
  { value: 'plant', label: '种植作物', emoji: '🌱' },
  { value: 'harvest', label: '收获作物', emoji: '🌾' },
  { value: 'steal', label: '偷菜行为', emoji: '🥷' },
  { value: 'help', label: '互助帮忙', emoji: '🤝' },
  { value: 'boost', label: '使用道具', emoji: '⚡' },
]

export function EventsPage() {
  const [activeTab, setActiveTab] = useState<EventTab>('global')
  const [selectedFilter, setSelectedFilter] = useState<EventFilter>('all')
  const { isConnected, address } = useAccount()

  // 获取事件数据
  const {
    allEvents,
    playerEvents,
    totalEventCount,
    isLoading,
    hasError,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    personalTotalPages,
    personalHasNextPage,
    personalHasPrevPage,
    personalEventsCount,
    goToPage,
    goToNextPage,
    goToPrevPage,
    goToFirstPage,
    goToLastPage,
    refetch
  } = usePaginatedEvents()

  // 调试信息
  console.log('EventsPage Debug:', {
    isConnected,
    address,
    allEvents,
    playerEvents,
    totalEventCount,
    isLoading,
    hasError
  })

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
            <ClockIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            事件记录
          </h1>
          <p className="text-gray-600 mb-6 max-w-md">
            连接您的钱包查看实时游戏事件流，了解农场社区的最新动态。
          </p>
          <WalletConnection />
        </div>
      </div>
    )
  }

  // 如果有错误，显示错误页面
  if (hasError) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">事件记录</h1>
          <p className="text-gray-600">加载事件数据时遇到问题</p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-4">错误信息</h2>
          <div className="text-sm text-red-600">
            无法加载事件数据，请检查网络连接或稍后重试。
          </div>
          <div className="mt-4">
            <button
              onClick={refetch}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              重试
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 过滤事件
  const filteredEvents = (activeTab === 'global' ? allEvents : playerEvents).filter(event =>
    selectedFilter === 'all' || event.eventType === selectedFilter
  )

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">游戏事件记录</h1>
        <p className="text-gray-600">
          实时查看农场社区的所有游戏活动
        </p>
      </div>

      {/* 事件统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center">
          <CardContent>
            <div className="text-2xl mb-2">📊</div>
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? '...' : totalEventCount}
            </div>
            <div className="text-sm text-gray-600">全服总事件</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent>
            <div className="text-2xl mb-2">👤</div>
            <div className="text-2xl font-bold text-primary-600">
              {isLoading ? '...' : playerEvents.length}
            </div>
            <div className="text-sm text-gray-600">我的事件数</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent>
            <div className="text-2xl mb-2">🔄</div>
            <div className="text-2xl font-bold text-green-600">
              {new Date().toLocaleTimeString()}
            </div>
            <div className="text-sm text-gray-600">最后更新</div>
          </CardContent>
        </Card>
      </div>

      {/* 标签页和过滤器 */}
      <Card>
        <CardContent>
          <div className="flex flex-col space-y-4">
            {/* 标签切换 */}
            <div className="flex justify-center">
              <div className="bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'global'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => setActiveTab('global')}
                >
                  <div className="flex items-center space-x-2">
                    <UsersIcon className="w-4 h-4" />
                    <span>全服事件流</span>
                  </div>
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'personal'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => setActiveTab('personal')}
                >
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="w-4 h-4" />
                    <span>个人历史</span>
                  </div>
                </button>
              </div>
            </div>

            {/* 事件类型过滤器 */}
            <div className="flex flex-wrap justify-center gap-2">
              {EVENT_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedFilter === filter.value
                      ? 'bg-primary-100 text-primary-700 border border-primary-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => setSelectedFilter(filter.value)}
                >
                  <span className="mr-1">{filter.emoji}</span>
                  {filter.label}
                </button>
              ))}
            </div>

            {/* 刷新按钮 */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={refetch}
                disabled={isLoading}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors text-sm"
              >
                {isLoading ? '刷新中...' : '🔄 刷新事件'}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 事件列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-5 h-5" />
              <span>
                {activeTab === 'global' ? '全服事件流' : '个人事件历史'}
                {selectedFilter !== 'all' && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    - {EVENT_FILTERS.find(f => f.value === selectedFilter)?.label}
                  </span>
                )}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {filteredEvents.length} 条事件
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">加载事件数据中...</p>
            </div>
          ) : hasError ? (
            <div className="text-center py-12">
              <div className="text-red-500 text-lg font-medium mb-2">
                加载事件失败
              </div>
              <p className="text-gray-600 text-sm mb-4">
                网络错误，请稍后重试
              </p>
              <button
                onClick={refetch}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                重试
              </button>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <ClockIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeTab === 'global' ? '暂无全服事件' : '暂无个人事件'}
              </h3>
              <p className="text-gray-600">
                {activeTab === 'global'
                  ? '等待其他玩家的游戏活动...'
                  : '开始游戏后，您的活动记录将显示在这里'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEvents.map((event) => {
                const isCurrentPlayer = event.player.toLowerCase() === address?.toLowerCase()

                return (
                  <div
                    key={event.id}
                    className={`p-4 rounded-lg border ${event.color} ${
                      isCurrentPlayer ? 'ring-2 ring-primary-200' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">{event.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-gray-900">
                            {event.description}
                          </p>
                          <span className="text-xs text-gray-500">
                            {event.relativeTime}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-600">
                          <span className="flex items-center space-x-1">
                            <span>玩家:</span>
                            <span className={`font-mono ${isCurrentPlayer ? 'text-primary-600 font-semibold' : ''}`}>
                              {isCurrentPlayer ? '我' : formatAddress(event.player)}
                            </span>
                          </span>
                          {event.landId > 0 && (
                            <span>土地: #{event.landId}</span>
                          )}
                          {event.seedTokenId > 0 && (
                            <span>种子: #{event.seedTokenId}</span>
                          )}
                          <span className="text-gray-400">
                            {event.displayTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* 分页控件 - 根据当前标签页使用不同的分页信息 */}
          {filteredEvents.length > 0 && (
            (activeTab === 'global' && totalPages > 1) || 
            (activeTab === 'personal' && personalTotalPages > 1)
          ) && (
            <div className="mt-6">
              <div className="flex items-center justify-between">
                {/* 分页信息 */}
                <div className="text-sm text-gray-600">
                  第 {currentPage} 页，共 {activeTab === 'global' ? totalPages : personalTotalPages} 页
                  <span className="ml-2">
                    ({activeTab === 'global' ? totalEventCount : personalEventsCount} 个事件)
                  </span>
                </div>

                {/* 分页按钮 */}
                <div className="flex items-center space-x-2">
                  {/* 第一页 */}
                  <button
                    type="button"
                    onClick={goToFirstPage}
                    disabled={activeTab === 'global' ? !hasPrevPage : !personalHasPrevPage}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    首页
                  </button>

                  {/* 上一页 */}
                  <button
                    type="button"
                    onClick={goToPrevPage}
                    disabled={activeTab === 'global' ? !hasPrevPage : !personalHasPrevPage}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    上一页
                  </button>

                  {/* 页码 */}
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, activeTab === 'global' ? totalPages : personalTotalPages) }, (_, i) => {
                      const currentTotalPages = activeTab === 'global' ? totalPages : personalTotalPages
                      const pageNum = Math.max(1, Math.min(currentTotalPages - 4, currentPage - 2)) + i
                      if (pageNum > currentTotalPages) return null
                      
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => goToPage(pageNum)}
                          className={`px-3 py-1 text-sm rounded ${
                            pageNum === currentPage
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>

                  {/* 下一页 */}
                  <button
                    type="button"
                    onClick={goToNextPage}
                    disabled={activeTab === 'global' ? !hasNextPage : !personalHasNextPage}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    下一页
                  </button>

                  {/* 最后一页 */}
                  <button
                    type="button"
                    onClick={goToLastPage}
                    disabled={activeTab === 'global' ? !hasNextPage : !personalHasNextPage}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    末页
                  </button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}