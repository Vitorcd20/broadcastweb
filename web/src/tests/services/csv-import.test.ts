import { describe, it, expect } from 'vitest'
import { parseCsv } from '@/services/csv-import.service'

describe('parseCsv', () => {
  it('parseia CSV válido com colunas nome e telefone', () => {
    const csv = `nome,telefone\nJoão Silva,+55 11 99999-0001\nMaria Souza,+55 11 99999-0002`
    const result = parseCsv(csv)
    expect(result).toHaveLength(2)
    expect(result[0].name).toBe('João Silva')
    expect(result[0].phone).toBe('+55 11 99999-0001')
  })

  it('aceita colunas em inglês (name, phone)', () => {
    const csv = `name,phone\nJohn Doe,+1 555 0001`
    const result = parseCsv(csv)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('John Doe')
  })

  it('ignora linhas com dados inválidos', () => {
    const csv = `nome,telefone\nJoão Silva,+55 11 99999-0001\n,\nInválido,abc`
    const result = parseCsv(csv)
    expect(result).toHaveLength(1)
  })

  it('lança erro se colunas obrigatórias estão ausentes', () => {
    const csv = `titulo,valor\nfoo,bar`
    expect(() => parseCsv(csv)).toThrow()
  })

  it('retorna array vazio para CSV sem linhas de dados', () => {
    const csv = `nome,telefone`
    const result = parseCsv(csv)
    expect(result).toHaveLength(0)
  })

  it('remove aspas dos valores', () => {
    const csv = `nome,telefone\n"João Silva","+55 11 99999-0001"`
    const result = parseCsv(csv)
    expect(result[0].name).toBe('João Silva')
  })
})