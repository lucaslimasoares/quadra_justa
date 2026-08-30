import { useState, type FormEvent, type ReactNode } from "react";
import { AuthBrand } from "./components/AuthBrand";
import { AuthField } from "./components/AuthField";
import type { SignUpResult, SportPreference } from "./services/authService";

const sportOptions: Record<string, string[]> = {
  Futebol: ["Goleiro", "Zagueiro", "Lateral", "Meia", "Atacante"],
  Futsal: ["Goleiro", "Fixo", "Ala", "Pivô"],
  "Voleibol de quadra": ["Levantador", "Ponteiro", "Oposto", "Central", "Líbero"],
  "Vôlei de areia": ["Defesa", "Ataque", "Universal"],
};

type LoginProps = {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: () => void;
};
type RegisterProps = {
  onRegister: (
    name: string,
    email: string,
    password: string,
    position: string,
    preferences: SportPreference[],
  ) => Promise<SignUpResult>;
  onLogin: () => void;
};

export function LoginPage({ onLogin, onRegister }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email || password.length < 6)
      return setError(
        "Informe um e-mail e uma senha com pelo menos 6 caracteres.",
      );
    try {
      await onLogin(email, password);
    } catch (reason) {
      if (import.meta.env.DEV) console.error("Falha no login Supabase:", reason);
      const code = reason && typeof reason === "object" && "code" in reason
        ? String(reason.code)
        : "";
      const message = reason instanceof Error ? reason.message.toLowerCase() : "";
      if (code === "email_not_confirmed" || message.includes("email not confirmed"))
        setError("Confirme seu e-mail antes de entrar.");
      else if (code === "over_request_rate_limit" || message.includes("rate limit"))
        setError("Muitas tentativas. Aguarde alguns minutos e tente novamente.");
      else
        setError(reason instanceof Error && reason.message ? reason.message : "E-mail ou senha inválidos.");
    }
  };
  return (
    <AuthFrame
      eyebrow="QUADRA JUSTA"
      title="Entrar na sua turma"
      description="Use seu e-mail para confirmar presença e acompanhar as escalações."
    >
      <form onSubmit={submit}>
        <AuthField
          label="E-mail"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="voce@email.com"
          type="email"
          autoComplete="email"
          required
        />
        <AuthField
          label="Senha"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          password
          autoComplete="current-password"
          required
        />
        <div className="auth-helper">
          <span>Esqueceu a senha?</span>
          <button
            type="button"
            onClick={() =>
              setError(
                "Entre em contato com o administrador da turma para recuperar o acesso.",
              )
            }
          >
            Recuperar acesso
          </button>
        </div>
        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}
        <button className="auth-primary" type="submit">
          Entrar
        </button>
        <button
          className="auth-secondary"
          type="button"
          onClick={() =>
            setError(
              "O convite da turma será disponibilizado pelo administrador.",
            )
          }
        >
          Entrar com convite da turma
        </button>
      </form>
      <AuthFooter>
        Ainda não tem conta?{" "}
        <button onClick={onRegister}>Criar cadastro</button>
      </AuthFooter>
    </AuthFrame>
  );
}

export function RegisterPage({ onRegister, onLogin }: RegisterProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [preferences, setPreferences] = useState<SportPreference[]>([]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const toggleSport = (sport: string) =>
    setPreferences((current) =>
      current.some((item) => item.sport === sport)
        ? current.filter((item) => item.sport !== sport)
        : [...current, { sport, position: "" }],
    );
  const setSportPosition = (sport: string, position: string) =>
    setPreferences((current) =>
      current.map((item) =>
        item.sport === sport ? { ...item, position } : item,
      ),
    );
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name || !email || password.length < 6 || password !== confirm)
      return setError(
        password !== confirm
          ? "As senhas precisam ser iguais."
          : "Preencha os campos com uma senha de pelo menos 6 caracteres.",
      );
    if (!preferences.length)
      return setError("Selecione ao menos um esporte de preferência.");
    if (preferences.some((item) => !item.position))
      return setError("Escolha uma posição ou função para cada esporte.");
    setSaving(true);
    setError("");
    try {
      const result = await onRegister(name, email, password, preferences[0].position, preferences);
      if (result.emailConfirmationRequired)
        setMessage("Conta criada. Confirme o e-mail enviado pelo Supabase para entrar.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível criar a conta.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <AuthFrame
      eyebrow="NOVA CONTA"
      title="Criar cadastro"
      description="Seu perfil entra no cálculo de equilíbrio dos times."
    >
      <form onSubmit={submit}>
        <AuthField
          label="Nome ou apelido"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={'Ex.: Rafael "Muralha"'}
          autoComplete="name"
          required
        />
        <AuthField
          label="E-mail"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="voce@email.com"
          type="email"
          autoComplete="email"
          required
        />
        <label className="auth-field">
          <span>Esportes de preferência</span>
          <small>Selecione um ou mais esportes.</small>
          <div className="position-grid">
            {Object.keys(sportOptions).map((sport) => (
              <button
                type="button"
                className={preferences.some((item) => item.sport === sport) ? "selected" : ""}
                onClick={() => toggleSport(sport)}
                key={sport}
              >
                {sport}
              </button>
            ))}
          </div>
        </label>
        {preferences.map((preference) => (
          <label className="auth-field" key={preference.sport}>
            <span>{preference.sport}</span>
            <select value={preference.position} onChange={(event) => setSportPosition(preference.sport, event.target.value)} required>
              <option value="">Selecione sua posição ou função</option>
              {sportOptions[preference.sport].map((positionOption) => (
                <option key={positionOption}>{positionOption}</option>
              ))}
            </select>
          </label>
        ))}
        <AuthField
          label="Senha"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          password
          autoComplete="new-password"
          required
        />
        <small className="password-hint">Mínimo de 6 caracteres.</small>
        <AuthField
          label="Confirmar senha"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          placeholder="••••••••"
          password
          autoComplete="new-password"
          required
        />
        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}
        {message && <p className="auth-note" role="status">{message}</p>}
        <div className="auth-note">
          Ao criar a conta você entra na fila da{" "}
          <strong>Quadra Justa</strong> e recebe convite quando abrir vaga.
        </div>
        <button className="auth-primary" type="submit" disabled={saving}>
          {saving ? "Criando conta..." : "Criar conta"}
        </button>
      </form>
      <AuthFooter>
        Já joga com a gente? <button onClick={onLogin}>Entrar</button>
      </AuthFooter>
    </AuthFrame>
  );
}

function AuthFrame({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="auth-page">
      <AuthBrand />
      <section className="auth-card">
        <p className="auth-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="auth-description">{description}</p>
        {children}
      </section>
    </div>
  );
}
function AuthFooter({ children }: { children: ReactNode }) {
  return <div className="auth-footer">{children}</div>;
}
