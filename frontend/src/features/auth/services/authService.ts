const SESSION_KEY = 'quadra-justa-session'
type StoredUser = { name: string; email: string; password: string; position: string }

export function hasSession() { return Boolean(localStorage.getItem(SESSION_KEY)) }
export function getSessionEmail() { return localStorage.getItem(SESSION_KEY) ?? '' }
export function signOut() { localStorage.removeItem(SESSION_KEY) }
export function signUp(name: string, email: string, password: string, position: string) { localStorage.setItem('quadra-justa-user', JSON.stringify({ name, email, password, position } satisfies StoredUser)); localStorage.setItem(SESSION_KEY, email) }
export function signIn(email: string, password: string) { const saved = localStorage.getItem('quadra-justa-user'); if (saved) { const user = JSON.parse(saved) as StoredUser; if (user.email === email && user.password !== password) throw new Error('Senha inválida') }; localStorage.setItem(SESSION_KEY, email) }