import type { Team } from '../types'
import { Card } from './Card'
import { PlayerRow } from './PlayerRow'

export function TeamCard({ team }: { team: Team }) {
  return (
    <Card className={`team-card ${team.color}`}>
      <header>
        <h3>{team.name}</h3>
        <small>
          Média {team.averageLevel.toFixed(1)} ·{' '}
          {team.color === 'blue' ? 'Defesa sólida' : 'Criação forte'}
        </small>
      </header>
      <div className="captain">Capitão: {team.players[0]?.name.split(' ')[0]}</div>
      {team.players.map((p) => (
        <PlayerRow key={p.id} player={p} score />
      ))}
    </Card>
  )
}
