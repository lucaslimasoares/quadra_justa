import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  CalendarPlus,
  LockKeyhole,
  Globe2,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { BottomNav, Card } from "../../components";
import type { CreateMatch, Match } from "../../types";

type AddressInputProps = {
  value: string;
  onChange: (value: string) => void;
  onLocation?: (location: { latitude: number; longitude: number }) => void;
};

/** Google Places autocomplete with a plain input fallback when no API key is configured. */
function AddressInput({ value, onChange, onLocation }: AddressInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey || !inputRef.current) return;
    const initialize = () => {
      const google = (window as Window & { google?: any }).google;
      if (!google?.maps?.places || !inputRef.current || autocompleteRef.current) return;
      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
        fields: ["formatted_address", "geometry", "name"],
        types: ["establishment", "geocode"],
      });
      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current?.getPlace();
        if (place?.formatted_address) onChange(place.formatted_address);
        const location = place?.geometry?.location;
        if (location && onLocation) onLocation({ latitude: location.lat(), longitude: location.lng() });
      });
    };
    const existing = document.querySelector<HTMLScriptElement>("script[data-google-maps]");
    if (existing) {
      existing.addEventListener("load", initialize);
      initialize();
      return () => existing.removeEventListener("load", initialize);
    }
    const script = document.createElement("script");
    script.dataset.googleMaps = "true";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", initialize);
    document.head.appendChild(script);
    return () => script.removeEventListener("load", initialize);
  }, [apiKey, onChange]);

  return (
    <input
      ref={inputRef}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Pesquise uma quadra ou endereço"
      autoComplete="off"
    />
  );
}

export function MatchesPage({
  matches,
  onSelect,
  onCreate,
  onLogout,
  onHome,
  onPlayers,
}: {
  matches: Match[];
  onSelect: (match: Match) => void;
  onCreate: () => void;
  onLogout: () => void;
  onHome: () => void;
  onPlayers: () => void;
}) {
  const [tab, setTab] = useState<"mine" | "public">("mine");
  const visibleMatches =
    tab === "mine"
      ? matches
      : matches.filter((match) => match.privacy === "public");
  return (
    <div className="phone matches-page">
      <header className="welcome">
        <div>
          <b>QUADRA JUSTA</b>
          <h2>Suas turmas de jogo</h2>
        </div>
        <div className="header-actions">
          <button
            className="round-add"
            onClick={onCreate}
            aria-label="Cadastrar pelada"
          >
            <CalendarPlus />
          </button>
          <button
            className="logout-button"
            onClick={onLogout}
            aria-label="Sair"
          >
            <LogOut />
          </button>
        </div>
      </header>
      <div className="matches-intro">
        <span>PELADAS</span>
        <h1>Suas turmas de jogo</h1>
        <p>
          Veja as peladas em que você joga e as turmas públicas abertas para
          entrar.
        </p>
        <div className="match-tabs">
          <button
            className={tab === "mine" ? "active" : ""}
            onClick={() => setTab("mine")}
          >
            Minhas
          </button>
          <button
            className={tab === "public" ? "active" : ""}
            onClick={() => setTab("public")}
          >
            Públicas
          </button>
        </div>
      </div>
      <div className="section-title">
        <h2>{tab === "mine" ? "Minhas peladas" : "Peladas públicas"}</h2>
        <b>{visibleMatches.length} encontradas</b>
      </div>
      {visibleMatches.length === 0 ? (
        <Card>
          <p>Nenhuma pelada encontrada ainda.</p>
        </Card>
      ) : (
        <div className="match-list">
          {visibleMatches.map((match) => (
            <button
              className="match-item"
              key={match.id}
              onClick={() => onSelect(match)}
            >
              <span className="match-date">
                {new Date(match.date).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                })}
              </span>
              <span className="match-content">
                <strong>{match.title}</strong>
                <small>
                  {new Date(match.date).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  · {match.venue}
                </small>
                <em>
                  {match.privacy === "private" ? (
                    <>
                      <LockKeyhole /> Privada
                    </>
                  ) : (
                    <>
                      <Globe2 /> Pública
                    </>
                  )}
                </em>
              </span>
              <ChevronRight />
            </button>
          ))}
        </div>
      )}
      <button className="primary matches-create" onClick={onCreate}>
        Criar pelada
      </button>
      <BottomNav
        active="matches"
        onHome={onHome}
        onMatches={() => setTab("mine")}
        onPlayers={onPlayers}
      />
    </div>
  );
}

export function CreateMatchPage({
  email,
  onBack,
  onCreated,
}: {
  email: string;
  onBack: () => void;
  onCreated: (match: CreateMatch) => Promise<void>;
}) {
  const [form, setForm] = useState<CreateMatch>({
    title: "",
    date: "",
    venue: "",
    maxPlayers: 16,
    privacy: "private",
    creatorEmail: email,
    invitedEmails: [],
    administratorEmails: [],
    moderatorEmails: [],
    matchRules: [],
    drawRules: [],
    notes: "",
  });
  const [invite, setInvite] = useState("");
  const [administratorInvite, setAdministratorInvite] = useState("");
  const [rule, setRule] = useState("");
  const [drawRule, setDrawRule] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const update = (patch: Partial<CreateMatch>) =>
    setForm((current) => ({ ...current, ...patch }));
  const addInvite = () => {
    const value = invite.trim().toLowerCase();
    if (value && value.includes("@") && !form.invitedEmails.includes(value))
      update({ invitedEmails: [...form.invitedEmails, value] });
    setInvite("");
  };
  const addAdministrator = () => {
    const value = administratorInvite.trim().toLowerCase();
    if (value && value.includes("@") && !form.administratorEmails?.includes(value))
      update({ administratorEmails: [...(form.administratorEmails ?? []), value] });
    setAdministratorInvite("");
  };
  const addRule = (kind: "matchRules" | "drawRules") => {
    const value = (kind === "matchRules" ? rule : drawRule).trim();
    if (!value || form[kind].includes(value)) return;
    update({ [kind]: [...form[kind], value] });
    kind === "matchRules" ? setRule("") : setDrawRule("");
  };
  const removeRule = (kind: "matchRules" | "drawRules", value: string) =>
    update({ [kind]: form[kind].filter((item) => item !== value) });
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (
      !form.title ||
      !form.venue ||
      form.invitedEmails.some((item) => !item.includes("@"))
    )
      return setError("Preencha os dados da pelada e revise os convidados.");
    setSaving(true);
    try {
      await onCreated(form);
    } catch {
      setError("Não foi possível criar a pelada agora.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="phone create-match-page">
      <header className="welcome">
        <div>
          <b>QUADRA JUSTA</b>
          <h2>Nova pelada</h2>
        </div>
      </header>
      <Card className="create-match-card">
        <p className="create-eyebrow">NOVA PELADA</p>
        <h1>Criar pelada</h1>
        <p>
          Defina os detalhes do jogo e quem vai moderar a lista de presença.
        </p>
        <form onSubmit={submit}>
          <label>
            Nome da pelada
            <input
              value={form.title}
              onChange={(event) => update({ title: event.target.value })}
            />
          </label>
          <div className="form-columns">
            <label>
              Data
              <input
                type="datetime-local"
                value={form.date}
                onChange={(event) => update({ date: event.target.value })}
              />
            </label>
            <label>
              Vagas
              <input
                type="number"
                min="2"
                max="100"
                value={form.maxPlayers}
                onChange={(event) =>
                  update({ maxPlayers: Number(event.target.value) })
                }
              />
            </label>
          </div>
          <label>
            Local
            <AddressInput
              value={form.venue}
              onChange={(venue) => { update({ venue }); setLocation(null); }}
              onLocation={setLocation}
            />
            <small className="field-help">
              Selecione um endereço sugerido pelo Google Maps.
            </small>
            {location && (
              <div className="location-map">
                <iframe
                  title="Mapa do local da pelada"
                  src={`https://www.openstreetmap.org/export/embed.html?layer=mapnik&marker=${location.latitude}%2C${location.longitude}&zoom=16`}
                  loading="lazy"
                />
                <a href={`https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}#map=16/${location.latitude}/${location.longitude}`} target="_blank" rel="noreferrer">
                  Abrir no mapa
                </a>
              </div>
            )}
          </label>
          <fieldset>
            <legend>Privacidade</legend>
            <div className="privacy-options">
              <button
                type="button"
                className={form.privacy === "private" ? "selected" : ""}
                onClick={() => update({ privacy: "private" })}
              >
                <LockKeyhole />
                Privada<small>Apenas convidados</small>
              </button>
              <button
                type="button"
                className={form.privacy === "public" ? "selected" : ""}
                onClick={() => update({ privacy: "public" })}
              >
                <Globe2 />
                Pública<small>Qualquer pessoa pode entrar</small>
              </button>
            </div>
          </fieldset>
          <label>
            Administradores da pelada
            <small className="field-help">
              Convide outros usuários para administrar esta pelada junto com você.
            </small>
            <div className="invite-row">
              <input
                value={administratorInvite}
                onChange={(event) => setAdministratorInvite(event.target.value)}
                placeholder="admin@email.com"
                type="email"
              />
              <button type="button" onClick={addAdministrator}>
                Adicionar
              </button>
            </div>
            <div className="invite-list">
              {(form.administratorEmails ?? []).map((item) => (
                <span key={item}>
                  {item}
                  <button
                    type="button"
                    onClick={() =>
                      update({
                        administratorEmails: (form.administratorEmails ?? []).filter(
                          (administrator) => administrator !== item,
                        ),
                      })
                    }
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </label>
          {form.privacy === "private" && (
            <label>
              Convidados
              <small className="field-help">
                Adicione os e-mails autorizados a visualizar a pelada.
              </small>
              <div className="invite-row">
                <input
                  value={invite}
                  onChange={(event) => setInvite(event.target.value)}
                  placeholder="convidado@email.com"
                  type="email"
                />
                <button type="button" onClick={addInvite}>
                  Adicionar
                </button>
              </div>
              <div className="invite-list">
                {form.invitedEmails.map((item) => (
                  <span key={item}>
                    {item}
                    <button
                      type="button"
                      onClick={() =>
                        update({
                          invitedEmails: form.invitedEmails.filter(
                            (email) => email !== item,
                          ),
                        })
                      }
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </label>
          )}
          <RuleEditor
            title="Regras da pelada"
            value={rule}
            onChange={setRule}
            rules={form.matchRules}
            onAdd={() => addRule("matchRules")}
            onRemove={(value) => removeRule("matchRules", value)}
            placeholder="Ex.: cada time joga 2 partidas"
          />
          <RuleEditor
            title="Regras do sorteio"
            value={drawRule}
            onChange={setDrawRule}
            rules={form.drawRules}
            onAdd={() => addRule("drawRules")}
            onRemove={(value) => removeRule("drawRules", value)}
            placeholder="Ex.: separar goleiros e equilibrar níveis"
          />
          <label>
            Observações
            <textarea
              value={form.notes}
              onChange={(event) => update({ notes: event.target.value })}
              placeholder="Ex.: levar colete claro e escuro, rateio de R$ 20."
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="primary" disabled={saving}>
            {saving ? "Criando pelada..." : "Criar pelada"}
          </button>
        </form>
      </Card>
      <button className="auth-footer create-back" onClick={onBack}>
        Quer voltar? <strong>Ir para as peladas</strong>
      </button>
    </div>
  );
}

function RuleEditor({
  title,
  value,
  onChange,
  rules,
  onAdd,
  onRemove,
  placeholder,
}: {
  title: string;
  value: string;
  onChange: (value: string) => void;
  rules: string[];
  onAdd: () => void;
  onRemove: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="rule-editor">
      {title}
      <small className="field-help">Adicione uma regra por vez.</small>
      <div className="invite-row">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
        <button type="button" onClick={onAdd}>
          Adicionar
        </button>
      </div>
      <div className="invite-list">
        {rules.map((item) => (
          <span key={item}>
            {item}
            <button type="button" onClick={() => onRemove(item)}>
              ×
            </button>
          </span>
        ))}
      </div>
    </label>
  );
}
