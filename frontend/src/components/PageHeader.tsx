import { Shirt } from 'lucide-react'
import { BackButton } from './BackButton'

export function PageHeader({
  eyebrow,
  title,
  onBack,
}: {
  eyebrow: string
  title: string
  onBack: () => void
}) {
  return (
    <header className="page-head">
      <BackButton onClick={onBack} />
      <div>
        <b>{eyebrow}</b>
        <h1>{title}</h1>
      </div>
      <Shirt />
    </header>
  )
}
