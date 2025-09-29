import { cn } from '@/utils'
import type { BaseProps } from '@/types'

interface CardProps extends BaseProps {
  hover?: boolean
  padding?: boolean
}

function Card({
  children,
  className,
  hover = false,
  padding = true,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-200 shadow-sm',
        hover && 'transition-all duration-200 hover:shadow-lg hover:shadow-primary-100 hover:-translate-y-1',
        padding && 'p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps extends BaseProps {}

function CardHeader({ children, className, ...props }: CardHeaderProps) {
  return (
    <div
      className={cn('flex items-center justify-between pb-4 border-b border-gray-200', className)}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardTitleProps extends BaseProps {}

function CardTitle({ children, className, ...props }: CardTitleProps) {
  return (
    <h3
      className={cn('text-lg font-semibold text-gray-900', className)}
      {...props}
    >
      {children}
    </h3>
  )
}

interface CardContentProps extends BaseProps {}

function CardContent({ children, className, ...props }: CardContentProps) {
  return (
    <div className={cn('pt-4', className)} {...props}>
      {children}
    </div>
  )
}

interface CardFooterProps extends BaseProps {}

function CardFooter({ children, className, ...props }: CardFooterProps) {
  return (
    <div
      className={cn('flex items-center justify-end pt-4 mt-4 border-t border-gray-200 space-x-2', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { Card, CardHeader, CardTitle, CardContent, CardFooter }