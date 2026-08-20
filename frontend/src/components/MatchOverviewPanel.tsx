import { UsersRound } from 'lucide-react'
import type { Match, Player } from '../types'
import { Avatar } from './Avatar'
import { BottomNav } from './BottomNav'
import { Card } from './Card'
import { PlayerRow } from './PlayerRow'

type Props = { match: Match; players: Player[]; onPlayers: () => void };

export function MatchOverviewPanel({ match, players, onPlayers }: Props) {
  const open = match.maxPlayers - match.confirmedCount;
  return <aside className="dashboard-panel overview-panel">
    <div className="panel-heading"><span>Início</span><span className="meta-badge">Turma Arena 8</span></div>
    <Card className="dashboard-match"><div className="match-identity"><Avatar initials="MS" /><div><small>PRÓXIMA PELADA</small><h1>{match.title}</h1><p>20h · {match.venue}</p></div></div><div className="dashboard-stats"><Metric value={`${match.confirmedCount}/${match.maxPlayers}`} label="confirmados"/><Metric value="2" label="pendentes"/><Metric value="3" label="em espera"/></div><div className="progress"><i style={{ width: `${match.confirmedCount / match.maxPlayers * 100}%` }} /></div><p className="vacancies">Faltam {open} vagas</p></Card>
    <Card className="dashboard-players"><div className="section-row"><h2>Confirmados</h2><button onClick={onPlayers}>Ver todos</button></div>{match.players.slice(0, 5).map(player => <PlayerRow key={player.id} player={player} />)}</Card>
    <Card className="waiting dashboard-callout"><b>3 jogadores na lista de espera</b><p>Quando uma vaga abrir, João será o primeiro a receber o convite.</p></Card>
    <button className="manage-players" onClick={onPlayers}><UsersRound /> Gerenciar jogadores</button><BottomNav onPlayers={onPlayers} />
  </aside>;
}
function Metric({ value, label }: { value: string; label: string }) { return <div className="metric"><strong>{value}</strong><small>{label}</small></div>; }
