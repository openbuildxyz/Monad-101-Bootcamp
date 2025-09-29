import { WeatherType, WEATHER_CONFIG } from '@/types/game'
import { cn } from '@/utils'

interface WeatherIconProps {
  weatherType: WeatherType
  size?: 'xs' | 'sm' | 'md' | 'lg'
  showTooltip?: boolean
  className?: string
}

export function WeatherIcon({
  weatherType,
  size = 'md',
  showTooltip = true,
  className
}: WeatherIconProps) {
  const config = WEATHER_CONFIG[weatherType]

  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center',
        sizeClasses[size],
        showTooltip && 'cursor-help',
        className
      )}
      title={showTooltip ? `${config.name}: ${config.description}` : undefined}
    >
      <span
        className="drop-shadow-sm"
        style={{ color: config.color }}
      >
        {config.emoji}
      </span>
    </div>
  )
}