import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'

describe('ConfirmDialog', () => {
  it('renderiza título e descrição', () => {
    render(
      <ConfirmDialog
        open={true}
        title="Excluir item"
        description="Tem certeza?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.getByText('Excluir item')).toBeInTheDocument()
    expect(screen.getByText('Tem certeza?')).toBeInTheDocument()
  })

  it('chama onConfirm ao clicar em Excluir', () => {
  const onConfirm = vi.fn()
  render(
    <ConfirmDialog
      open={true}
      title="Excluir"
      description="Confirmar?"
      onConfirm={onConfirm}
      onCancel={vi.fn()}
    />
  )
  fireEvent.click(screen.getByRole('button', { name: 'Excluir' }))
  expect(onConfirm).toHaveBeenCalledOnce()
})

  it('chama onCancel ao clicar em Cancelar', () => {
    const onCancel = vi.fn()
    render(
      <ConfirmDialog
        open={true}
        title="Excluir"
        description="Confirmar?"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    )
    fireEvent.click(screen.getByText('Cancelar'))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('desabilita botões quando loading=true', () => {
    render(
      <ConfirmDialog
        open={true}
        title="Excluir"
        description="Confirmar?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        loading={true}
      />
    )
    expect(screen.getByText('Excluindo...')).toBeDisabled()
    expect(screen.getByText('Cancelar')).toBeDisabled()
  })

  it('não renderiza quando open=false', () => {
    render(
      <ConfirmDialog
        open={false}
        title="Excluir"
        description="Confirmar?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.queryByText('Excluir')).not.toBeInTheDocument()
  })
})