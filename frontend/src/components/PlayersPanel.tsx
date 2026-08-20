import { Pencil, UserPlus, X } from 'lucide-react'
import type { Player } from '../types'
import { Card } from './Card'
import { PlayerRow } from './PlayerRow'

type Props = { players: Player[]; open: boolean; onClose: () => void; onAdd: () => void; onEdit: (player: Player) => void };
export function PlayersPanel({ players, open, onClose, onAdd, onEdit }: Props) { if (!open) return null; return <div className="players-drawer"><div className="drawer-backdrop" onClick={onClose}/><aside className="drawer-content"><header><div><small>ELENCO DO GRUPO</small><h1>Jogadores</h1></div><button className="icon-button" onClick={onClose}><X /></button></header><button className="primary drawer-add" onClick={onAdd}><UserPlus /> Cadastrar jogador</button><Card>{players.map(player => <div className="editable-player" key={player.id}><PlayerRow player={player}/><button onClick={() => onEdit(player)} aria-label={`Editar ${player.name}`}><Pencil /></button></div>)}</Card></aside></div>; }
