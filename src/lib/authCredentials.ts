import type { AuthRole } from '../context/AuthContext'

type LoginCredential = {
  identifier: string
  password: string
  passwordCaseInsensitive?: boolean
}

const CLIENT_LOGINS: LoginCredential[] = [
  { identifier: 'mattlewis06@gmail.com', password: '1' },
  { identifier: 'SMB', password: 'blad', passwordCaseInsensitive: true },
]

const ADMIN_LOGINS: LoginCredential[] = [
  { identifier: 'mattlewis06@gmail.com', password: '1' },
]

function matchesCredential(
  identifier: string,
  password: string,
  cred: LoginCredential,
): boolean {
  const idMatch = identifier.trim().toLowerCase() === cred.identifier.toLowerCase()
  if (!idMatch) return false
  if (cred.passwordCaseInsensitive) {
    return password.toLowerCase() === cred.password.toLowerCase()
  }
  return password === cred.password
}

export function validateLogin(identifier: string, password: string, role: AuthRole): boolean {
  const logins = role === 'admin' ? ADMIN_LOGINS : CLIENT_LOGINS
  return logins.some((cred) => matchesCredential(identifier, password, cred))
}
