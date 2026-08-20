import { useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { Avatar, Card, StarPicker } from './components'
import type { CreatePlayer, Player, Sport } from './types'

const sports: Sport[] = ['Futebol', 'Futsal', 'Voleibol de quadra', 'Vôlei de areia']

export function PlayerForm({ player, onBack, onSave }: { player?: Player; onBack: () => void; onSave: (player: CreatePlayer) => Promise<void> }) {
  const [form, setForm] = useState<CreatePlayer>(() => player ? { name: player.name, position: player.position, level: player.level, trait: player.trait, sports: player.sports ?? [] } : { name: '', position: '', level: 5, trait: '', sports: [] })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const editing = Boolean(player)
  const toggleSport = (sport: Sport) => setForm(current => ({ ...current, sports: current.sports?.includes(sport) ? current.sports.filter(item => item !== sport) : [...(current.sports ?? []), sport] }))
  const submit = async (event: FormEvent) => { event.preventDefault(); if (!form.name.trim() || !form.position) return setError('Preencha nome e posição principal.'); if (!form.sports?.length) return setError('Selecione ao menos uma modalidade.'); setSaving(true); setError(''); try { await onSave(form) } catch { setError('Não foi possível salvar agora. Tente novamente.') } finally { setSaving(false) } }
  const initials = form.name ? form.name.split(' ').filter(Boolean).slice(0, 2).map(item => item[0]).join('').toUpperCase() : 'JJ'
  return <div className="phone register-page"><header className="register-head"><button className="icon-button" onClick={onBack} aria-label="Cancelar cadastro"><X /></button><div><b>{editing ? 'EDITAR JOGADOR' : 'NOVO JOGADOR'}</b><h1>{editing ? 'Editar perfil' : 'Cadastro de jogador'}</h1></div></header><Card><div className="profile-placeholder"><Avatar initials={initials} /><div><h2>Perfil do jogador</h2><p>Esses dados serão usados para formar os times.</p></div></div><form onSubmit={submit}><label>Nome completo<input value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} placeholder="Ex.: Gabriel Santos" autoFocus /></label><label>Posição principal<select value={form.position} onChange={event => setForm({ ...form, position: event.target.value })}><option value="">Selecione uma posição</option><option>Goleiro</option><option>Fixo</option><option>Ala</option><option>Pivô</option></select></label><label>Modalidades <em>Selecione uma ou mais</em><div className="sport-grid">{sports.map(sport => <button type="button" className={form.sports?.includes(sport) ? 'selected' : ''} onClick={() => toggleSport(sport)} key={sport}>{sport}</button>)}</div></label><label>Nível de jogo <span>{form.level.toLocaleString('pt-BR')}/10</span><StarPicker level={form.level} onChange={level => setForm({ ...form, level })}/><em>Toque nas estrelas para definir o nível.</em></label><label>Característica em quadra <input value={form.trait} onChange={event => setForm({ ...form, trait: event.target.value })} placeholder="Ex.: Velocidade e passe" /></label>{error && <p className="form-error">{error}</p>}<button className="primary save-player" disabled={saving}>{saving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Cadastrar jogador'}</button></form></Card></div>
}
