import { useEffect, useState, type FormEvent } from "react";
import {
  CalendarDays,
  Check,
  ChevronRight,
  MapPin,
  Minus,
  Pencil,
  Plus,
  Shield,
  UserPlus,
  UsersRound,
  X,
} from "lucide-react";
import {
  createMatch,
  createPlayer,
  generateTeams,
  getMatches,
  getPlayers,
  updatePlayer,
} from "./api";
import {
  Avatar,
  BottomNav,
  Card,
  PageHeader,
  PlayerRow,
  StarPicker,
  TeamCard,
} from "./components";
import { PlayerForm as SportsPlayerForm } from "./PlayerForm";
import { LoginPage, RegisterPage } from "./features/auth/pages";
import {
  getSessionEmail,
  hasSession,
  signIn,
  signOut,
  signUp,
} from "./features/auth/services/authService";
import { CreateMatchPage, MatchesPage } from "./features/matches/pages";
import type {
  CreateMatch,
  CreatePlayer,
  Match,
  Player,
  TeamsResult,
} from "./types";

type Screen =
  | "matches"
  | "create-match"
  | "home"
  | "configure"
  | "result"
  | "players"
  | "register"
  | "edit";
function App() {
  const [authenticated, setAuthenticated] = useState(hasSession);
  const [authScreen, setAuthScreen] = useState<"login" | "register">("login");
  const [screen, setScreen] = useState<Screen>("matches");
  const [matches, setMatches] = useState<Match[]>([]);
  const [match, setMatch] = useState<Match | null>(null);
  const [teams, setTeams] = useState<TeamsResult | null>(null);
  const [teamCount, setTeamCount] = useState(2);
  const [loading, setLoading] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  useEffect(() => {
    if (!authenticated) return;
    getMatches(getSessionEmail())
      .then((items) => {
        setMatches(items);
        if (items[0]) {
          setMatch(items[0]);
          setScreen("home");
        }
      })
      .catch(() => setMatches([]));
  }, [authenticated]);
  useEffect(() => {
    const handleStorage = () => setAuthenticated(hasSession());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);
  const openPlayers = () => {
    getPlayers()
      .then(setPlayers)
      .catch(() => undefined);
    setScreen("players");
  };
  const makeTeams = async () => {
    setLoading(true);
    setGenerateError("");
    try {
    if (!match) return;
    setTeams(await generateTeams(match.id, getSessionEmail(), teamCount));
      setScreen("result");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível gerar os times agora.";
      setGenerateError(message);
      window.alert(message);
    } finally {
      setLoading(false);
    }
  };
  const createNewMatch = async (request: CreateMatch) => {
    const created = await createMatch(request);
    setMatches((current) => [...current, created]);
    setMatch(created);
    setScreen("home");
  };
  const addPlayer = async (player: CreatePlayer) => {
    const created = await createPlayer(player);
    setPlayers((current) => [...current, created]);
    setScreen("players");
  };
  const editPlayer = async (player: CreatePlayer) => {
    if (!editingPlayer) return;
    const updated = await updatePlayer(editingPlayer.id, player);
    setPlayers((current) =>
      current.map((item) => (item.id === updated.id ? updated : item)),
    );
    setScreen("players");
  };
  const openEdit = (player: Player) => {
    setEditingPlayer(player);
    setScreen("edit");
  };
  if (!authenticated)
    return (
      <main className="auth-shell">
        {authScreen === "login" ? (
          <LoginPage
            onLogin={async (email, password) => {
              await signIn(email, password);
              setAuthenticated(true);
              setScreen("matches");
            }}
            onRegister={() => setAuthScreen("register")}
          />
        ) : (
          <RegisterPage
            onRegister={async (name, email, password, position, preferences) => {
              const result = await signUp(name, email, password, position, preferences);
              if (!result.emailConfirmationRequired) {
                setAuthenticated(true);
                setScreen("matches");
              }
              return result;
            }}
            onLogin={() => setAuthScreen("login")}
          />
        )}
      </main>
    );
  const goMatches = () => setScreen("matches");
  const goHome = () => setScreen("home");
  return (
    <main className="app-shell">
      {screen === "matches" && (
        <MatchesPage
          matches={matches}
          onSelect={(selected) => {
            setMatch(selected);
            setScreen("home");
          }}
          onCreate={() => setScreen("create-match")}
          onLogout={async () => {
            await signOut();
            setAuthenticated(false);
            setAuthScreen("login");
          }}
          onHome={goHome}
          onPlayers={openPlayers}
        />
      )}
      {screen === "create-match" && (
        <CreateMatchPage
          email={getSessionEmail()}
          onBack={goMatches}
          onCreated={createNewMatch}
        />
      )}
      {screen === "home" && match && (
        <HomeScreen
          match={match}
          matches={matches}
          onOpen={() => setScreen("configure")}
          onCreate={() => setScreen("create-match")}
          onPlayers={openPlayers}
          onBack={goMatches}
          onHome={goHome}
          onMatches={goMatches}
        />
      )}
      {screen === "configure" && match && (
        <Configure
          match={match}
          teamCount={teamCount}
          setTeamCount={setTeamCount}
          onBack={goHome}
          onGenerate={makeTeams}
          loading={loading}
        />
      )}
      {screen === "result" && teams && (
        <Result teams={teams} onBack={() => setScreen("configure")} />
      )}
      {screen === "players" && (
        <PlayersScreen
          players={players}
          onAdd={() => setScreen("register")}
          onEdit={openEdit}
          onHome={goHome}
          onMatches={goMatches}
        />
      )}
      {screen === "register" && (
        <SportsPlayerForm
          onBack={() => setScreen("players")}
          onSave={addPlayer}
        />
      )}
      {screen === "edit" && editingPlayer && (
        <SportsPlayerForm
          player={editingPlayer}
          onBack={() => setScreen("players")}
          onSave={editPlayer}
        />
      )}
    </main>
  );
}
function HomeScreen({
  match,
  matches,
  onOpen,
  onCreate,
  onPlayers,
  onBack,
  onHome,
  onMatches,
}: {
  match: Match;
  matches: Match[];
  onOpen: () => void;
  onPlayers: () => void;
  onCreate: () => void;
  onBack: () => void;
  onHome: () => void;
  onMatches: () => void;
}) {
  const open = match.maxPlayers - match.confirmedCount;
  const agenda = matches.filter((item) => item.id !== match.id).slice(0, 2);
  const firstName = getSessionEmail().split("@")[0] || "jogador";
  return (
    <div className="phone home-page">
      <header className="home-header">
        <div className="home-avatar">QJ</div>
        <div className="home-greeting">
          <small>Quadra Justa</small>
          <strong>Olá, {firstName}</strong>
        </div>
        <button className="home-alert" aria-label="Notificações"><Shield /></button>
      </header>
      <section className="home-next-match">
        <div className="home-card-top"><span>PRÓXIMA PELADA</span><b>{match.currentRole === "administrator" ? "ADMINISTRADOR" : match.currentRole === "moderator" ? "MODERADOR" : "PARTICIPANTE"}</b></div>
        <h1>{match.title}</h1>
        <p><CalendarDays />{new Date(match.date).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" })} · {new Date(match.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
        <p><MapPin />{match.venue}</p>
        <p><UsersRound />{match.confirmedCount}/{match.maxPlayers} confirmados</p>
        <div className="home-progress"><i style={{ width: `${Math.min(100, (match.confirmedCount / match.maxPlayers) * 100)}%` }} /></div>
        <div className="home-actions">
          <button className="home-confirmed"><Check /> Confirmado</button>
          <button className="home-view" onClick={onOpen}>Ver pelada</button>
        </div>
      </section>
      <div className="home-metrics">
        <Metric value={`${match.confirmedCount}`} label="Confirmados" icon={<UsersRound />} />
        <Metric value={`${open}`} label="Vagas" icon={<TrendingIcon />} />
        <Metric value={match.currentRole === "administrator" || match.currentRole === "moderator" ? "Gestor" : "Jogador"} label="Seu papel" icon={<Shield />} />
      </div>
      <section className="home-agenda">
        <div className="home-section-heading"><div><span>AGENDA</span><h2>Peladas à vista</h2></div><button onClick={onBack}>Ver todas <ChevronRight /></button></div>
        {agenda.length === 0 ? <p className="home-empty">Nenhuma outra pelada cadastrada.</p> : agenda.map((item) => (
          <button className="home-agenda-item" key={item.id} onClick={() => onBack()}>
            <div><strong>{item.title}</strong><small>{new Date(item.date).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" })} · {new Date(item.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</small><small>{item.venue}</small></div><b>{item.confirmedCount}/{item.maxPlayers}<small>CONFIRMADOS</small></b>
          </button>
        ))}
        <button className="home-create" onClick={onCreate}>＋&nbsp; Criar pelada</button>
      </section>
      <p className="home-help">Precisa de ajuda? <strong>Falar com moderadores</strong></p>
      <BottomNav
        active="home"
        onHome={onHome}
        onMatches={onMatches}
        onPlayers={onPlayers}
      />
    </div>
  );
}
function TrendingIcon() {
  return <span className="metric-trending">↗</span>;
}
function Metric({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) {
  return <div className="home-metric"><span>{icon}</span><strong>{value}</strong><small>{label}</small></div>;
}
function Configure({
  match,
  teamCount,
  setTeamCount,
  onBack,
  onGenerate,
  loading,
}: {
  match: Match;
  teamCount: number;
  setTeamCount: (n: number) => void;
  onBack: () => void;
  onGenerate: () => void;
  loading: boolean;
}) {
  return (
    <div className="phone config">
      <PageHeader
        eyebrow="QUADRA JUSTA"
        title="Configurar pelada"
        onBack={onBack}
      />
      <Card>
        <h2>Formato da partida</h2>
        <p>Defina a estrutura antes de gerar as escalações.</p>
        <div className="segmented">
          <button
            className={teamCount === 2 ? "selected" : ""}
            onClick={() => setTeamCount(2)}
          >
            2 times
          </button>
          <button
            className={teamCount === 3 ? "selected" : ""}
            onClick={() => setTeamCount(3)}
          >
            3 times
          </button>
        </div>
        <div className="counter">
          <div>
            <b>Jogadores por time</b>
            <small>{match.confirmedCount} confirmados disponíveis</small>
          </div>
          <button onClick={() => setTeamCount(Math.max(2, teamCount - 1))}>
            <Minus />
          </button>
          <strong>{Math.ceil(match.confirmedCount / teamCount)}</strong>
          <button onClick={() => setTeamCount(Math.min(3, teamCount + 1))}>
            <Plus />
          </button>
        </div>
        <Toggle label="Equilibrar posições e goleiros" />
      </Card>
      <Card>
        <h2>Regras do grupo</h2>
        <p>O gerador vai respeitar estas escolhas.</p>
        <Rule
          title="Goleiros separados"
          detail="Os goleiros ficam em times diferentes."
        />
        <Rule
          title="Duplas fixas"
          detail="Respeita as duplas definidas na partida."
        />
        <div className="priority">Prioridade: Equilíbrio máximo</div>
      </Card>
      <Card>
        <h2>Quem vai jogar</h2>
        <p>Perfis e níveis entram no cálculo de equilíbrio.</p>
        <div className="player-grid">
          {match.players.map((p) => (
            <div key={p.id}>
              <Avatar initials={p.initials} />
              <b>{p.name}</b>
              <small>
                {p.position} · Nível {p.level.toLocaleString("pt-BR")}
              </small>
            </div>
          ))}
        </div>
      </Card>
      <button
        className="primary sticky"
        onClick={onGenerate}
        disabled={loading}
      >
        {loading ? "Gerando times..." : "Gerar times equilibrados"}
      </button>
    </div>
  );
}
function Toggle({ label }: { label: string }) {
  return (
    <div className="toggle-row">
      <b>{label}</b>
      <span className="toggle">
        <i />
      </span>
    </div>
  );
}
function Rule({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rule">
      <span>
        <Check />
      </span>
      <div>
        <b>{title}</b>
        <small>{detail}</small>
      </div>
    </div>
  );
}
function Result({ teams, onBack }: { teams: TeamsResult; onBack: () => void }) {
  return (
    <div className="phone result">
      <PageHeader
        eyebrow="QUADRA JUSTA"
        title="Times equilibrados"
        onBack={onBack}
      />
      <Card className="balance">
        <div className="balance-label">
          Resultado da divisão <b>Muito equilibrado</b>
        </div>
        <h1>
          {teams.balancePercentage}% <small>de equilíbrio</small>
        </h1>
        <div className="progress">
          <i style={{ width: `${teams.balancePercentage}%` }} />
        </div>
        <p>{teams.explanation}</p>
      </Card>
      <div className="team-list">
        {teams.teams.map((team) => (
          <TeamCard key={team.name} team={team} />
        ))}
      </div>
    </div>
  );
}
function PlayersScreen({
  players,
  onAdd,
  onEdit,
  onHome,
  onMatches,
}: {
  players: Player[];
  onAdd: () => void;
  onEdit: (player: Player) => void;
  onHome: () => void;
  onMatches: () => void;
}) {
  return (
    <div className="phone players-page">
      <header className="welcome">
        <div>
          <b>QUADRA JUSTA</b>
          <h2>Jogadores</h2>
        </div>
        <button
          className="round-add"
          onClick={onAdd}
          aria-label="Cadastrar jogador"
        >
          <UserPlus />
        </button>
      </header>
      <Card className="players-intro">
        <span>ELENCO DO GRUPO</span>
        <h1>{players.length} jogadores cadastrados</h1>
        <p>
          Cadastre os perfis para deixar as próximas escalações mais
          equilibradas.
        </p>
        <button className="primary" onClick={onAdd}>
          <UserPlus /> Cadastrar jogador
        </button>
      </Card>
      <div className="section-title">
        <h2>Todos os jogadores</h2>
        <b>{players.length} perfis</b>
      </div>
      <Card>
        {players.map((player) => (
          <div className="editable-player" key={player.id}>
            <PlayerRow player={player} />
            <button
              onClick={() => onEdit(player)}
              aria-label={`Editar ${player.name}`}
            >
              <Pencil />
            </button>
          </div>
        ))}
      </Card>
      <BottomNav active="players" onHome={onHome} onMatches={onMatches} />
    </div>
  );
}
function PlayerForm({
  player,
  onBack,
  onSave,
}: {
  player?: Player;
  onBack: () => void;
  onSave: (player: CreatePlayer) => Promise<void>;
}) {
  const [form, setForm] = useState<CreatePlayer>(() =>
    player
      ? {
          name: player.name,
          position: player.position,
          level: player.level,
          trait: player.trait,
        }
      : { name: "", position: "", level: 5, trait: "" },
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const editing = Boolean(player);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.position)
      return setError("Preencha nome e posição principal.");
    setSaving(true);
    setError("");
    try {
      await onSave(form);
    } catch {
      setError("Não foi possível salvar agora. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };
  const initials = form.name
    ? form.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((item) => item[0])
        .join("")
        .toUpperCase()
    : "JJ";
  return (
    <div className="phone register-page">
      <header className="register-head">
        <button
          className="icon-button"
          onClick={onBack}
          aria-label="Cancelar cadastro"
        >
          <X />
        </button>
        <div>
          <b>{editing ? "EDITAR JOGADOR" : "NOVO JOGADOR"}</b>
          <h1>{editing ? "Editar perfil" : "Cadastro de jogador"}</h1>
        </div>
      </header>
      <Card>
        <div className="profile-placeholder">
          <Avatar initials={initials} />
          <div>
            <h2>Perfil do jogador</h2>
            <p>Esses dados serão usados para formar os times.</p>
          </div>
        </div>
        <form onSubmit={submit}>
          <label>
            Nome completo
            <input
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
              placeholder="Ex.: Gabriel Santos"
              autoFocus
            />
          </label>
          <label>
            Posição principal
            <select
              value={form.position}
              onChange={(event) =>
                setForm({ ...form, position: event.target.value })
              }
            >
              <option value="">Selecione uma posição</option>
              <option>Goleiro</option>
              <option>Fixo</option>
              <option>Ala</option>
              <option>Pivô</option>
            </select>
          </label>
          <label>
            Nível de jogo <span>{form.level.toLocaleString("pt-BR")}/10</span>
            <StarPicker
              level={form.level}
              onChange={(level) => setForm({ ...form, level })}
            />
          </label>
          <div className="level-hint">
            <small>Iniciante</small>
            <small>Intermediário</small>
            <small>Avançado</small>
          </div>
          <label>
            Principal característica <em>opcional</em>
            <input
              value={form.trait}
              onChange={(event) =>
                setForm({ ...form, trait: event.target.value })
              }
              placeholder="Ex.: passe e velocidade"
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="primary save-player" disabled={saving}>
            {saving ? "Salvando..." : "Salvar jogador"}
          </button>
        </form>
      </Card>
    </div>
  );
}
function HomeScreen({ match, onOpen, onPlayers, onBack, onHome, onMatches }: { match: Match; onOpen: () => void; onPlayers: () => void; onBack: () => void; onHome: () => void; onMatches: () => void }) { const open = match.maxPlayers - match.confirmedCount; return <div className="phone"><header className="welcome"><div><b>Turma Arena 8</b><h2>{match.title}</h2></div><button className="round-add back-matches" onClick={onBack}>Peladas</button></header><Card className="next-match"><span className="date-pill">{new Date(match.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span><b>PRÓXIMA PELADA · {match.privacy === 'private' ? 'PRIVADA' : 'PÚBLICA'}</b><h1>{match.title}</h1><p>{new Date(match.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} · {match.venue}</p><div className="role-badge">Seu papel: {match.currentRole ?? 'participant'}</div><div className="stats"><Metric value={`${match.confirmedCount}/${match.maxPlayers}`} label="confirmados"/><Metric value="2" label="pendentes"/><Metric value="3" label="em espera"/></div><div className="progress"><i style={{ width: `${match.confirmedCount / match.maxPlayers * 100}%` }} /></div><div className="progress-label">Faltam {open} vagas <b>{Math.round(match.confirmedCount / match.maxPlayers * 100)}%</b></div>{match.permissions?.canGenerateTeams !== false && <button className="primary" onClick={onOpen}>Abrir pelada</button>}</Card><div className="section-title"><h2>Confirmados</h2><b onClick={onPlayers}>Ver todos</b></div><Card>{match.players.slice(0, 4).map(p => <PlayerRow player={p} key={p.id} />)}</Card><Card className="waiting"><b><i /> 3 jogadores na lista de espera</b><p>Quando uma vaga abrir, João será o primeiro a receber o convite.</p></Card><BottomNav active="home" onHome={onHome} onMatches={onMatches} onPlayers={onPlayers} /></div> }
function Metric({ value, label }: { value: string; label: string }) { return <div className="metric"><strong>{value}</strong><small>{label}</small></div> }
function Configure({ match, teamCount, setTeamCount, onBack, onGenerate, loading }: { match: Match; teamCount: number; setTeamCount: (n: number) => void; onBack: () => void; onGenerate: () => void; loading: boolean }) { return <div className="phone config"><PageHeader eyebrow="QUINTA NO ARENA 8" title="Configurar pelada" onBack={onBack}/><Card><h2>Formato da partida</h2><p>Defina a estrutura antes de gerar as escalações.</p><div className="segmented"><button className={teamCount === 2 ? 'selected' : ''} onClick={() => setTeamCount(2)}>2 times</button><button className={teamCount === 3 ? 'selected' : ''} onClick={() => setTeamCount(3)}>3 times</button></div><div className="counter"><div><b>Jogadores por time</b><small>{match.confirmedCount} confirmados disponíveis</small></div><button onClick={() => setTeamCount(Math.max(2, teamCount - 1))}><Minus /></button><strong>{Math.ceil(match.confirmedCount / teamCount)}</strong><button onClick={() => setTeamCount(Math.min(3, teamCount + 1))}><Plus /></button></div><Toggle label="Equilibrar posições e goleiros" /></Card><Card><h2>Regras do grupo</h2><p>O gerador vai respeitar estas escolhas.</p><Rule title="Goleiros separados" detail="Rafael e Pedro ficam em times diferentes."/><Rule title="Caio e Neto juntos" detail="Dupla fixa para esta partida."/><div className="priority">Prioridade: Equilíbrio máximo</div></Card><Card><h2>Quem vai jogar</h2><p>Perfis e níveis entram no cálculo de equilíbrio.</p><div className="player-grid">{match.players.map(p => <div key={p.id}><Avatar initials={p.initials}/><b>{p.name}</b><small>{p.position} · Nível {p.level.toLocaleString('pt-BR')}</small></div>)}</div></Card><button className="primary sticky" onClick={onGenerate} disabled={loading}>{loading ? 'Gerando times...' : 'Gerar times equilibrados'}</button></div> }
function Toggle({ label }: { label: string }) { return <div className="toggle-row"><b>{label}</b><span className="toggle"><i /></span></div> }
function Rule({ title, detail }: { title: string; detail: string }) { return <div className="rule"><span><Check /></span><div><b>{title}</b><small>{detail}</small></div></div> }
function Result({ teams, onBack }: { teams: TeamsResult; onBack: () => void }) { return <div className="phone result"><PageHeader eyebrow="QUINTA NO ARENA 8" title="Times equilibrados" onBack={onBack}/><Card className="balance"><div className="balance-label">Resultado da divisão <b>Muito equilibrado</b></div><h1>{teams.balancePercentage}% <small>de equilíbrio</small></h1><div className="progress"><i style={{ width: `${teams.balancePercentage}%` }}/></div><p>{teams.explanation}</p></Card><div className="team-list">{teams.teams.map(team => <TeamCard key={team.name} team={team}/>)}</div></div> }
function PlayersScreen({ players, onAdd, onEdit, onHome, onMatches }: { players: Player[]; onAdd: () => void; onEdit: (player: Player) => void; onHome: () => void; onMatches: () => void }) { return <div className="phone players-page"><header className="welcome"><div><b>TURMA ARENA 8</b><h2>Jogadores</h2></div><button className="round-add" onClick={onAdd} aria-label="Cadastrar jogador"><UserPlus /></button></header><Card className="players-intro"><span>ELENCO DO GRUPO</span><h1>{players.length} jogadores cadastrados</h1><p>Cadastre os perfis para deixar as próximas escalações mais equilibradas.</p><button className="primary" onClick={onAdd}><UserPlus /> Cadastrar jogador</button></Card><div className="section-title"><h2>Todos os jogadores</h2><b>{players.length} perfis</b></div><Card>{players.map(player => <div className="editable-player" key={player.id}><PlayerRow player={player} /><button onClick={() => onEdit(player)} aria-label={`Editar ${player.name}`}><Pencil /></button></div>)}</Card><BottomNav active="players" onHome={onHome} onMatches={onMatches} /></div> }
function PlayerForm({ player, onBack, onSave }: { player?: Player; onBack: () => void; onSave: (player: CreatePlayer) => Promise<void> }) { const [form, setForm] = useState<CreatePlayer>(() => player ? { name: player.name, position: player.position, level: player.level, trait: player.trait } : { name: '', position: '', level: 5, trait: '' }); const [error, setError] = useState(''); const [saving, setSaving] = useState(false); const editing = Boolean(player); const submit = async (event: FormEvent) => { event.preventDefault(); if (!form.name.trim() || !form.position) return setError('Preencha nome e posição principal.'); setSaving(true); setError(''); try { await onSave(form) } catch { setError('Não foi possível salvar agora. Tente novamente.') } finally { setSaving(false) } }; const initials = form.name ? form.name.split(' ').filter(Boolean).slice(0, 2).map(item => item[0]).join('').toUpperCase() : 'JJ'; return <div className="phone register-page"><header className="register-head"><button className="icon-button" onClick={onBack} aria-label="Cancelar cadastro"><X /></button><div><b>{editing ? 'EDITAR JOGADOR' : 'NOVO JOGADOR'}</b><h1>{editing ? 'Editar perfil' : 'Cadastro de jogador'}</h1></div></header><Card><div className="profile-placeholder"><Avatar initials={initials} /><div><h2>Perfil do jogador</h2><p>Esses dados serão usados para formar os times.</p></div></div><form onSubmit={submit}><label>Nome completo<input value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} placeholder="Ex.: Gabriel Santos" autoFocus /></label><label>Posição principal<select value={form.position} onChange={event => setForm({ ...form, position: event.target.value })}><option value="">Selecione uma posição</option><option>Goleiro</option><option>Fixo</option><option>Ala</option><option>Pivô</option></select></label><label>Nível de jogo <span>{form.level.toLocaleString('pt-BR')}/10</span><StarPicker level={form.level} onChange={level => setForm({ ...form, level })}/></label><div className="level-hint"><small>Iniciante</small><small>Intermediário</small><small>Avançado</small></div><label>Principal característica <em>opcional</em><input value={form.trait} onChange={event => setForm({ ...form, trait: event.target.value })} placeholder="Ex.: passe e velocidade" /></label>{error && <p className="form-error">{error}</p>}<button className="primary save-player" disabled={saving}>{saving ? 'Salvando...' : 'Salvar jogador'}</button></form></Card></div> }
export default App
