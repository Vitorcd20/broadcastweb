import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyState } from '@/components/shared/empty-state'
import InfoIcon from '@mui/icons-material/Info'

describe('EmptyState', () => {
  it('renderiza título e descrição', () => {
    render(
      <EmptyState
        icon={<InfoIcon />}
        title="Nenhum item"
        description="Adicione o primeiro item"
      />
    )
    expect(screen.getByText('Nenhum item')).toBeInTheDocument()
    expect(screen.getByText('Adicione o primeiro item')).toBeInTheDocument()
  })

  it('renderiza action quando fornecido', () => {
    render(
      <EmptyState
        icon={<InfoIcon />}
        title="Vazio"
        description="Sem dados"
        action={<button>Adicionar</button>}
      />
    )
    expect(screen.getByText('Adicionar')).toBeInTheDocument()
  })

  it('não renderiza action quando não fornecido', () => {
    render(
      <EmptyState icon={<InfoIcon />} title="Vazio" description="Sem dados" />
    )
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})