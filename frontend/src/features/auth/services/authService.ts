import { supabase } from '../../../utils/supabase'

const SESSION_KEY = 'quadra-justa-supabase-session'
const LEGACY_SESSION_KEY = 'quadra-justa-session'

// Remove the prototype-only local credentials/session. Authentication is now
// exclusively backed by Supabase Auth.
localStorage.removeItem(LEGACY_SESSION_KEY)
localStorage.removeItem('quadra-justa-user')

export type SportPreference = { sport: string; position: string }
export type SignUpResult = { emailConfirmationRequired: boolean }

export function hasSession() { return Boolean(localStorage.getItem(SESSION_KEY)) }
export function getSessionEmail() { return localStorage.getItem(SESSION_KEY) ?? '' }

export async function signOut() {
  localStorage.removeItem(SESSION_KEY)
  localStorage.removeItem(LEGACY_SESSION_KEY)
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function signUp(
  name: string,
  email: string,
  password: string,
  position: string,
  preferences: SportPreference[] = [],
): Promise<SignUpResult> {
  const normalizedEmail = email.trim().toLowerCase()
  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data: { name: name.trim(), position, preferences },
    },
  })
  if (error) throw error

  if (data.session) localStorage.setItem(SESSION_KEY, normalizedEmail)
  return { emailConfirmationRequired: !data.session }
}

export async function signIn(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  })
  // Breakpoint: inspecione aqui a resposta do Supabase (data.user, session e error).
  debugger
  if (error) throw error
  localStorage.setItem(SESSION_KEY, normalizedEmail)
}
