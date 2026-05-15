/**
 * Security utilities — sanitization, validation and rate limiting.
 * Protects against XSS, oversized payloads, and abusive writes.
 */

// ---------------------------------------------------------------------------
// XSS Sanitization
// ---------------------------------------------------------------------------

const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
}

/** Escapes HTML special characters to prevent XSS */
export const sanitizeText = (value: string): string =>
  value.replace(/[&<>"'`=/]/g, (char) => HTML_ESCAPE_MAP[char] ?? char)

/** Strips all HTML tags from a string */
export const stripHtml = (value: string): string =>
  value.replace(/<[^>]*>/g, '').trim()

/** Sanitizes and trims a plain-text field */
export const sanitizeField = (value: string): string =>
  sanitizeText(stripHtml(value)).trim()

// ---------------------------------------------------------------------------
// Field Validators
// ---------------------------------------------------------------------------

const LIMITS = {
  NAME_MAX: 100,
  PHONE_MAX: 30,
  CONNECTION_NAME_MAX: 80,
  MESSAGE_MAX: 1000,
} as const

const PHONE_REGEX = /^[\d\s\+\-\(\)]{6,30}$/

export interface ValidationResult {
  valid: boolean
  error?: string
}

export const validateConnectionName = (name: string): ValidationResult => {
  const clean = name.trim()
  if (!clean) return { valid: false, error: 'O nome é obrigatório.' }
  if (clean.length > LIMITS.CONNECTION_NAME_MAX)
    return { valid: false, error: `O nome deve ter no máximo ${LIMITS.CONNECTION_NAME_MAX} caracteres.` }
  return { valid: true }
}

export const validateContactName = (name: string): ValidationResult => {
  const clean = name.trim()
  if (!clean) return { valid: false, error: 'O nome é obrigatório.' }
  if (clean.length > LIMITS.NAME_MAX)
    return { valid: false, error: `O nome deve ter no máximo ${LIMITS.NAME_MAX} caracteres.` }
  return { valid: true }
}

export const validatePhone = (phone: string): ValidationResult => {
  const clean = phone.trim()
  if (!clean) return { valid: false, error: 'O telefone é obrigatório.' }
  if (!PHONE_REGEX.test(clean))
    return { valid: false, error: 'Telefone inválido. Use apenas números, espaços e + - ( ).' }
  if (clean.length > LIMITS.PHONE_MAX)
    return { valid: false, error: `O telefone deve ter no máximo ${LIMITS.PHONE_MAX} caracteres.` }
  return { valid: true }
}

export const validateMessageContent = (content: string): ValidationResult => {
  const clean = content.trim()
  if (!clean) return { valid: false, error: 'A mensagem não pode estar vazia.' }
  if (clean.length > LIMITS.MESSAGE_MAX)
    return { valid: false, error: `A mensagem deve ter no máximo ${LIMITS.MESSAGE_MAX} caracteres.` }
  return { valid: true }
}

export const validateScheduledAt = (date: Date | null, isEditing: boolean): ValidationResult => {
  if (!date) return { valid: false, error: 'Defina a data e hora de agendamento.' }
  if (!isEditing && date <= new Date())
    return { valid: false, error: 'O agendamento deve ser em uma data futura.' }
  return { valid: true }
}

// ---------------------------------------------------------------------------
// Rate Limiter (client-side, per operation key)
// ---------------------------------------------------------------------------

const rateLimitMap = new Map<string, number[]>()

/**
 * Returns true if the operation is allowed.
 * @param key      Unique key for the operation (e.g. "create-contact")
 * @param maxCalls Max number of calls allowed within the window
 * @param windowMs Time window in milliseconds
 */
export const checkRateLimit = (
  key: string,
  maxCalls = 10,
  windowMs = 10_000
): boolean => {
  const now = Date.now()
  const calls = (rateLimitMap.get(key) ?? []).filter((t) => now - t < windowMs)
  if (calls.length >= maxCalls) return false
  rateLimitMap.set(key, [...calls, now])
  return true
}
