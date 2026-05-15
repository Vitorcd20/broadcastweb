import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ConnectionsList } from '@/components/connections/connections-list'
import type { Connection } from '@/types'

// Mock dos serviços e hooks
vi.mock('@/hooks/use-connections', () => ({
  useConnections: vi.fn(),
}))

vi.mock('@/services/connections.service', () => ({
  deleteConnection: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/components/connections/connection-form-dialog', () => ({
  ConnectionFormDialog: ({ open }: { open: boolean }) =>
    open ? <div>Connection Form Dialog</div> : null,
}))

const mockConnections: Connection[] = [
  {
    id: 'conn-1',
    userId: 'user-1',
    name: 'Conexão Alpha',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'conn-2',
    userId: 'user-1',
    name: 'Conexão Beta',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

describe('ConnectionsList', () => {
  const defaultProps = {
    userId: 'user-1',
    selectedConnectionId: null,
    onSelectConnection: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza skeleton durante carregamento', async () => {
  const { useConnections } = await import('@/hooks/use-connections')
  vi.mocked(useConnections).mockReturnValue({
    connections: [],
    loading: true,
    error: null,
  })

  const { container } = render(<ConnectionsList {...defaultProps} />)
  expect(container.querySelectorAll('.MuiSkeleton-root').length).toBeGreaterThan(0)
})

  it('renderiza empty state quando não há conexões', async () => {
    const { useConnections } = await import('@/hooks/use-connections')
    vi.mocked(useConnections).mockReturnValue({
      connections: [],
      loading: false,
      error: null,
    })

    render(<ConnectionsList {...defaultProps} />)
    expect(screen.getByText('Nenhuma conexão')).toBeInTheDocument()
  })

  it('renderiza lista de conexões', async () => {
    const { useConnections } = await import('@/hooks/use-connections')
    vi.mocked(useConnections).mockReturnValue({
      connections: mockConnections,
      loading: false,
      error: null,
    })

    render(<ConnectionsList {...defaultProps} />)
    expect(screen.getByText('Conexão Alpha')).toBeInTheDocument()
    expect(screen.getByText('Conexão Beta')).toBeInTheDocument()
  })

  it('chama onSelectConnection ao clicar em uma conexão', async () => {
    const { useConnections } = await import('@/hooks/use-connections')
    const onSelectConnection = vi.fn()
    vi.mocked(useConnections).mockReturnValue({
      connections: mockConnections,
      loading: false,
      error: null,
    })

    render(<ConnectionsList {...defaultProps} onSelectConnection={onSelectConnection} />)
    fireEvent.click(screen.getByText('Conexão Alpha'))
    expect(onSelectConnection).toHaveBeenCalledWith('conn-1')
  })

  it('abre o form dialog ao clicar em Nova', async () => {
    const { useConnections } = await import('@/hooks/use-connections')
    vi.mocked(useConnections).mockReturnValue({
      connections: [],
      loading: false,
      error: null,
    })

    render(<ConnectionsList {...defaultProps} />)
    fireEvent.click(screen.getByText('Nova'))
    expect(screen.getByText('Connection Form Dialog')).toBeInTheDocument()
  })

  it('abre confirm dialog ao clicar em excluir', async () => {
    const { useConnections } = await import('@/hooks/use-connections')
    vi.mocked(useConnections).mockReturnValue({
      connections: mockConnections,
      loading: false,
      error: null,
    })

    render(<ConnectionsList {...defaultProps} />)
    const deleteButtons = screen.getAllByRole('button', { name: 'Excluir' })
    fireEvent.click(deleteButtons[0])
    expect(screen.getByText('Excluir conexão')).toBeInTheDocument()
  })
})