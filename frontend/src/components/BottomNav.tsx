import { CalendarDays, Home, UsersRound, UserRound } from 'lucide-react'

export function BottomNav({
  active = 'home',
  onHome,
  onPlayers,
}: {
  active?: 'home' | 'players'
  onHome?: () => void
  onPlayers?: () => void
}) {
  return (
    <nav className="bottom-nav">
      <button className={active === 'home' ? 'active' : ''} onClick={onHome}>
        <Home />
        Início
      </button>
      <button>
        <CalendarDays />
        Peladas
      </button>
      <button className={active === 'players' ? 'active' : ''} onClick={onPlayers}>
        <UsersRound />
        Jogadores
      </button>
      <button>
        <UserRound />
        Perfil
      </button>
    </nav>
  )
}
