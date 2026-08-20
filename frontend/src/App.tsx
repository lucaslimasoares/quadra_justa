import { useEffect, useState } from 'react'
import {
  createPlayer,
  generateTeams,
  getPlayers,
  getUpcomingMatch,
  updatePlayer,
} from './api/matchApi'
import { BalancePanel } from './components/BalancePanel'
import { MatchConfigPanel, SelectedPlayers } from './components/MatchConfigPanel'
import { MatchOverviewPanel } from './components/MatchOverviewPanel'
import { PlayerForm } from './components/PlayerForm'
import { PlayersPanel } from './components/PlayersPanel'
import './dashboard.css'
import type { CreatePlayer, Match, Player, TeamsResult } from './types'

const fallback: Match = { id: 'demo', title: 'Quinta no Arena 8', date: '2026-08-20T20:00:00-03:00', venue: 'Quadra 2 · Futebol society', maxPlayers: 12, confirmedCount: 12, players: [{ id: '1', name: 'Rafael “Muralha”', initials: 'RM', position: 'Goleiro', level: 7, trait: 'Reflexo e marcação' }, { id: '2', name: 'Diego', initials: 'DG', position: 'Fixo', level: 6, trait: 'Posicionamento' }, { id: '3', name: 'Lucas “Biel”', initials: 'LB', position: 'Ala', level: 6, trait: 'Velocidade e passe' }, { id: '4', name: 'André', initials: 'AN', position: 'Ala', level: 5, trait: 'Em observação' }] };

function App() {
  const [match, setMatch] = useState<Match>(fallback); const [players, setPlayers] = useState<Player[]>(fallback.players); const [teams, setTeams] = useState<TeamsResult | null>(null); const [teamCount, setTeamCount] = useState(2); const [loading, setLoading] = useState(false); const [playersOpen, setPlayersOpen] = useState(false); const [formOpen, setFormOpen] = useState(false); const [formPlayer, setFormPlayer] = useState<Player | undefined>();
  useEffect(() => { getUpcomingMatch().then(setMatch).catch(() => undefined); getPlayers().then(setPlayers).catch(() => undefined); }, []);
  const openPlayers = () => { getPlayers().then(setPlayers).catch(() => undefined); setPlayersOpen(true); };
  const makeTeams = async () => { setLoading(true); try { setTeams(await generateTeams(teamCount)); } finally { setLoading(false); } };
  const savePlayer = async (data: CreatePlayer) => { if (formPlayer) { const updated = await updatePlayer(formPlayer.id, data); setPlayers(current => current.map(player => player.id === updated.id ? updated : player)); } else { const created = await createPlayer(data); setPlayers(current => [...current, created]); } setFormOpen(false); setFormPlayer(undefined); };
  const closeForm = () => { setFormOpen(false); setFormPlayer(undefined); };
  return <main className="dashboard-shell"><MatchOverviewPanel match={match} players={players} onPlayers={openPlayers}/><section className="dashboard-panel center-dashboard"><div className="panel-heading"><span>Configurar pelada</span><span className="meta-badge">Edição avançada</span></div><MatchConfigPanel match={match} teamCount={teamCount} onTeamCount={setTeamCount} onGenerate={makeTeams} onAddPlayer={() => { setFormPlayer(undefined); setFormOpen(true); }} loading={loading}/><SelectedPlayers players={match.players}/></section><aside className="dashboard-panel results-dashboard"><div className="panel-heading"><span>Times equilibrados</span><span className="meta-badge">Resultado</span></div><BalancePanel teams={teams}/></aside><PlayersPanel players={players} open={playersOpen} onClose={() => setPlayersOpen(false)} onAdd={() => { setFormPlayer(undefined); setFormOpen(true); }} onEdit={player => { setFormPlayer(player); setFormOpen(true); }}/>{formOpen && <PlayerForm player={formPlayer} onClose={closeForm} onSave={savePlayer}/>}</main>;
}
export default App;
