export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): {
  valid: boolean
  message?: string
} {
  if (password.length < 8) {
    return {
      valid: false,
      message: 'Password must be at least 8 characters long',
    }
  }
  return { valid: true }
}

export function validateUsername(username: string): {
  valid: boolean
  message?: string
} {
  const usernameRegex = /^[a-zA-Z0-9_](?:[a-zA-Z0-9_.]*[a-zA-Z0-9_])?$/
  if (!username || username.length < 3 || username.length > 50) {
    return {
      valid: false,
      message: 'Username must be 3-50 characters long',
    }
  }
  if (!usernameRegex.test(username)) {
    return {
      valid: false,
      message:
        'Username can only contain letters, numbers, underscores, and dots (cannot start/end with a dot)',
    }
  }
  if (username.includes('..')) {
    return {
      valid: false,
      message: 'Username cannot contain consecutive dots',
    }
  }
  return { valid: true }
}
