import { describe, it, expect, beforeEach } from 'vitest'
import {
  sanitizeText,
  stripHtml,
  sanitizeField,
  validateConnectionName,
  validateContactName,
  validatePhone,
  validateMessageContent,
  validateScheduledAt,
  checkRateLimit,
} from '@/lib/security'

describe('sanitizeText', () => {
  it('escapa caracteres HTML perigosos', () => {
    expect(sanitizeText('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
    )
  })

  it('escapa aspas simples', () => {
    expect(sanitizeText("O'Brien")).toBe('O&#x27;Brien')
  })

  it('não altera texto limpo', () => {
    expect(sanitizeText('João Silva')).toBe('João Silva')
  })
})

describe('stripHtml', () => {
  it('remove tags HTML', () => {
    expect(stripHtml('<b>negrito</b>')).toBe('negrito')
  })

  it('remove múltiplas tags', () => {
    expect(stripHtml('<p><strong>texto</strong></p>')).toBe('texto')
  })

  it('não altera texto sem tags', () => {
    expect(stripHtml('texto simples')).toBe('texto simples')
  })
})

describe('sanitizeField', () => {
  it('remove HTML e escapa caracteres especiais', () => {
    expect(sanitizeField('<b>João</b>')).toBe('João')
  })

  it('faz trim do texto', () => {
    expect(sanitizeField('  João  ')).toBe('João')
  })
})

describe('validateConnectionName', () => {
  it('aceita nome válido', () => {
    expect(validateConnectionName('Minha Conexão').valid).toBe(true)
  })

  it('rejeita nome vazio', () => {
    expect(validateConnectionName('').valid).toBe(false)
  })

  it('rejeita nome muito longo', () => {
    expect(validateConnectionName('a'.repeat(81)).valid).toBe(false)
  })
})

describe('validateContactName', () => {
  it('aceita nome válido', () => {
    expect(validateContactName('Maria Silva').valid).toBe(true)
  })

  it('rejeita nome vazio', () => {
    expect(validateContactName('').valid).toBe(false)
  })

  it('rejeita nome acima de 100 caracteres', () => {
    expect(validateContactName('a'.repeat(101)).valid).toBe(false)
  })
})

describe('validatePhone', () => {
  it('aceita telefone válido', () => {
    expect(validatePhone('+55 11 99999-0001').valid).toBe(true)
  })

  it('rejeita telefone vazio', () => {
    expect(validatePhone('').valid).toBe(false)
  })

  it('rejeita telefone com letras', () => {
    expect(validatePhone('abc123').valid).toBe(false)
  })

  it('rejeita telefone muito longo', () => {
    expect(validatePhone('1'.repeat(31)).valid).toBe(false)
  })
})

describe('validateMessageContent', () => {
  it('aceita mensagem válida', () => {
    expect(validateMessageContent('Olá, tudo bem?').valid).toBe(true)
  })

  it('rejeita mensagem vazia', () => {
    expect(validateMessageContent('').valid).toBe(false)
  })

  it('rejeita mensagem acima de 1000 caracteres', () => {
    expect(validateMessageContent('a'.repeat(1001)).valid).toBe(false)
  })
})

describe('validateScheduledAt', () => {
  it('aceita data futura ao criar', () => {
    const future = new Date(Date.now() + 60_000)
    expect(validateScheduledAt(future, false).valid).toBe(true)
  })

  it('rejeita data passada ao criar', () => {
    const past = new Date(Date.now() - 60_000)
    expect(validateScheduledAt(past, false).valid).toBe(false)
  })

  it('aceita data passada ao editar', () => {
    const past = new Date(Date.now() - 60_000)
    expect(validateScheduledAt(past, true).valid).toBe(true)
  })

  it('rejeita data nula', () => {
    expect(validateScheduledAt(null, false).valid).toBe(false)
  })
})

describe('checkRateLimit', () => {
  beforeEach(() => {
    // Usa chave única por teste para não vazar estado
  })

  it('permite chamadas dentro do limite', () => {
    expect(checkRateLimit('test-allow', 3, 10_000)).toBe(true)
    expect(checkRateLimit('test-allow', 3, 10_000)).toBe(true)
    expect(checkRateLimit('test-allow', 3, 10_000)).toBe(true)
  })

  it('bloqueia ao exceder o limite', () => {
    checkRateLimit('test-block', 2, 10_000)
    checkRateLimit('test-block', 2, 10_000)
    expect(checkRateLimit('test-block', 2, 10_000)).toBe(false)
  })
})