import type { Player } from '../types'
import { Avatar } from './Avatar'

export function PlayerRow({ player, score = false }: { player: Player; score?: boolean }) {
  return (
    <div className="player-row">
      <Avatar initials={player.initials} />
      <div>
        <strong>{player.name}</strong>
        <small>
          {player.position} · {player.trait}
        </small>
      </div>
      {score ? (
        <span className="rating">{player.level}</span>
      ) : (
        <span className="level">Nível {player.level.toLocaleString('pt-BR')}</span>
      )}
    </div>
  )
}
