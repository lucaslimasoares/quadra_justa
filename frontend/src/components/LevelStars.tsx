import { Star } from 'lucide-react'

export function LevelStars({ level, compact = false }: { level: number; compact?: boolean }) {
  return (
    <span
      className={`level-stars ${compact ? 'compact' : ''}`}
      role="img"
      aria-label={`Nível ${level} de 10`}
      title={`Nível ${level}/10`}
    >
      {Array.from({ length: 10 }, (_, index) => {
        const star = index + 1
        return (
          <span className={`display-star ${level >= star ? 'filled' : ''}`} key={star}>
            <Star fill={level >= star ? 'currentColor' : 'none'} />
            {level === star - 0.5 && (
              <span className="display-half">
                <Star fill="currentColor" />
              </span>
            )}
          </span>
        )
      })}
    </span>
  )
}
