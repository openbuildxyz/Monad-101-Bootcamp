import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui'
import { cn } from '@/utils'

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  onPreviousPage: () => void
  onNextPage: () => void
  onGoToPage: (page: number) => void
  hasPreviousPage: boolean
  hasNextPage: boolean
  isLoading?: boolean
  className?: string
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPreviousPage,
  onNextPage,
  onGoToPage,
  hasPreviousPage,
  hasNextPage,
  isLoading = false,
  className
}: PaginationControlsProps) {
  // 生成页码数组
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      // 如果总页数少于等于5页，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // 复杂的分页逻辑
      if (currentPage <= 3) {
        // 当前页在前3页
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        // 当前页在后3页
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // 当前页在中间
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className={cn('flex items-center justify-between', className)}>
      {/* 上一页按钮 */}
      <Button
        variant="secondary"
        size="sm"
        onClick={onPreviousPage}
        disabled={!hasPreviousPage || isLoading}
        className="flex items-center space-x-1"
      >
        <ChevronLeftIcon className="w-4 h-4" />
        <span>上一页</span>
      </Button>

      {/* 页码信息 */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">
          第 {currentPage} 页，共 {totalPages} 页
        </span>
      </div>

      {/* 页码按钮 */}
      <div className="flex items-center space-x-1">
        {pageNumbers.map((page, index) => (
          <div key={index}>
            {page === '...' ? (
              <span className="px-2 py-1 text-gray-500">...</span>
            ) : (
              <Button
                variant={page === currentPage ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => onGoToPage(page as number)}
                disabled={isLoading}
                className={cn(
                  'min-w-[32px] h-8',
                  page === currentPage && 'bg-primary-500 text-white'
                )}
              >
                {page}
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* 下一页按钮 */}
      <Button
        variant="secondary"
        size="sm"
        onClick={onNextPage}
        disabled={!hasNextPage || isLoading}
        className="flex items-center space-x-1"
      >
        <span>下一页</span>
        <ChevronRightIcon className="w-4 h-4" />
      </Button>
    </div>
  )
}
