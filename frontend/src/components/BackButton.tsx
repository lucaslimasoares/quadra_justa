import { ChevronLeft } from 'lucide-react'

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="icon-button" onClick={onClick} aria-label="Voltar">
      <ChevronLeft />
    </button>
  )
}
