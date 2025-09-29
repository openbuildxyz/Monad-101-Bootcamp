import { cn } from '@/utils'
import type { BaseProps } from '@/types'

interface LoadingSpinnerProps extends BaseProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'gray' | 'white'
}

function LoadingSpinner({
  size = 'md',
  color = 'primary',
  className,
  ...props
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  }

  const colorClasses = {
    primary: 'border-primary-500',
    gray: 'border-gray-500',
    white: 'border-white',
  }

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-gray-200',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      {...props}
    >
      <div className="sr-only">Loading...</div>
    </div>
  )
}

interface LoadingDotsProps extends BaseProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'gray'
}

function LoadingDots({
  size = 'md',
  color = 'primary',
  className,
  ...props
}: LoadingDotsProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  }

  const colorClasses = {
    primary: 'bg-primary-500',
    gray: 'bg-gray-500',
  }

  return (
    <div className={cn('flex space-x-1', className)} {...props}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'rounded-full animate-pulse',
            sizeClasses[size],
            colorClasses[color]
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.8s',
          }}
        />
      ))}
    </div>
  )
}

interface LoadingOverlayProps extends BaseProps {
  isLoading: boolean
  text?: string
  backdrop?: boolean
}

function LoadingOverlay({
  isLoading,
  text = '加载中...',
  backdrop = true,
  children,
  className,
  ...props
}: LoadingOverlayProps) {
  if (!isLoading) return <>{children}</>

  return (
    <div className={cn('relative', className)} {...props}>
      {children}
      <div
        className={cn(
          'absolute inset-0 flex flex-col items-center justify-center z-50',
          backdrop && 'bg-white bg-opacity-80'
        )}
      >
        <LoadingSpinner size="lg" />
        {text && (
          <p className="mt-2 text-sm text-gray-600 font-medium">{text}</p>
        )}
      </div>
    </div>
  )
}

interface SkeletonProps extends BaseProps {
  width?: string | number
  height?: string | number
  rounded?: boolean
  count?: number
}

function Skeleton({
  width,
  height = '1rem',
  rounded = false,
  count = 1,
  className,
  ...props
}: SkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={cn(
        'bg-gray-200 animate-pulse',
        rounded ? 'rounded-full' : 'rounded',
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
      {...props}
    />
  ))

  return count === 1 ? items[0] : <div className="space-y-2">{items}</div>
}

interface LoadingCardProps extends BaseProps {}

function LoadingCard({ className, ...props }: LoadingCardProps) {
  return (
    <div
      className={cn(
        'bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-pulse',
        className
      )}
      {...props}
    >
      <div className="flex items-center space-x-4">
        <Skeleton width={48} height={48} rounded />
        <div className="flex-1 space-y-2">
          <Skeleton height={20} width="60%" />
          <Skeleton height={16} width="40%" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton height={16} width="100%" />
        <Skeleton height={16} width="80%" />
        <Skeleton height={16} width="90%" />
      </div>
    </div>
  )
}

export {
  LoadingSpinner,
  LoadingDots,
  LoadingOverlay,
  Skeleton,
  LoadingCard
}