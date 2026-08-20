import { Star } from 'lucide-react'

export function StarPicker({
  level,
  onChange,
}: {
  level: number
  onChange: (level: number) => void
}) {
  return (
    <div
      className="star-picker"
      role="group"
      aria-label="Nível de jogo, de 1 a 10 em intervalos de meio ponto"
    >
      {Array.from({ length: 10 }, (_, index) => {
        const star = index + 1
        const half = level === star - 0.5
        return (
          <span className={`picker-star ${level >= star ? 'filled' : ''}`} key={star}>
            <Star fill={level >= star ? 'currentColor' : 'none'} />
            {half && (
              <span className="half-star">
                <Star fill="currentColor" />
              </span>
            )}
            <button
              type="button"
              className="star-half left"
              onClick={() => onChange(star - 0.5)}
              aria-label={`${star - 0.5} estrelas`}
            />
            <button
              type="button"
              className="star-half right"
              onClick={() => onChange(star)}
              aria-label={`${star} estrelas`}
            />
          </span>
        )
      })}
    </div>
  )
}
