import type { TeamsResult } from '../types'
import { Card } from './Card'
import { TeamCard } from './TeamCard'

export function BalancePanel({ teams }: { teams: TeamsResult | null }) { if (!teams) return <Card className="empty-balance"><h2>Times equilibrados</h2><p>Gere as escalações para conferir a distribuição de força entre os times.</p></Card>; return <><Card className="balance dashboard-balance"><div className="section-row"><span>Resultado da divisão</span><b>Muito equilibrado</b></div><h1>{teams.balancePercentage}% <small>de equilíbrio</small></h1><div className="progress"><i style={{ width: `${teams.balancePercentage}%` }} /></div><p>{teams.explanation}</p></Card><div className="dashboard-team-list">{teams.teams.map(team => <TeamCard key={team.name} team={team} />)}</div></>; }
