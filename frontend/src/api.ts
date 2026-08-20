import type { CreateMatch, CreatePlayer, Match, Player, TeamsResult } from './types'

const request = async <T,>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`/api${path}`, { headers: { 'Content-Type': 'application/json' }, ...init })
  if (!response.ok) {
    const detail = await response.text()
    if (response.status === 403) throw new Error('Apenas administradores e moderadores podem gerar times.')
    if (response.status === 404) throw new Error('A API atual não encontrou a rota da geração. Reinicie o backend.')
    throw new Error(detail || `Não foi possível carregar os dados (HTTP ${response.status}).`)
  }
  return response.json()
}

export const getUpcomingMatch = () => request<Match>('/matches/upcoming')
export const getMatches = (email: string) => request<Match[]>(`/matches/?email=${encodeURIComponent(email)}`)
export const createMatch = (match: CreateMatch) => request<Match>('/matches/', { method: 'POST', body: JSON.stringify(match) })
export const generateTeams = (matchId: string, email: string, teamCount: number) => request<TeamsResult>(`/matches/${matchId}/teams?email=${encodeURIComponent(email)}`, { method: 'POST', body: JSON.stringify({ teamCount, separateGoalkeepers: true, keepCaioAndNetoTogether: true }) })
export const getPlayers = () => request<Player[]>('/players/')
export const createPlayer = (player: CreatePlayer) => request<Player>('/players/', { method: 'POST', body: JSON.stringify(player) })
export const updatePlayer = (id: string, player: CreatePlayer) => request<Player>(`/players/${id}`, { method: 'PUT', body: JSON.stringify(player) })