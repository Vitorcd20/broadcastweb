import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useMessageScheduler } from '@/hooks/use-message-scheduler'

// Mock do Firebase
vi.mock('@/lib/firebase', () => ({ db: {} }))

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn().mockResolvedValue({ empty: true, docs: [] }),
  writeBatch: vi.fn(() => ({
    update: vi.fn(),
    commit: vi.fn().mockResolvedValue(undefined),
  })),
  doc: vi.fn(),
  Timestamp: { now: vi.fn(() => ({ toMillis: () => Date.now() })) },
  serverTimestamp: vi.fn(),
}))

describe('useMessageScheduler', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('não faz nada se userId for undefined', async () => {
    const { getDocs } = vi.mocked(await import('firebase/firestore'))
    renderHook(() => useMessageScheduler(undefined))
    expect(getDocs).not.toHaveBeenCalled()
  })

  it('chama getDocs imediatamente ao montar com userId', async () => {
  const { getDocs } = await import('firebase/firestore')
  const mockedGetDocs = vi.mocked(getDocs)

  renderHook(() => useMessageScheduler('user-123'))

  await vi.advanceTimersByTimeAsync(0)

  expect(mockedGetDocs).toHaveBeenCalled()
})

it('chama getDocs novamente após 1 minuto', async () => {
  const { getDocs } = await import('firebase/firestore')
  const mockedGetDocs = vi.mocked(getDocs)

  renderHook(() => useMessageScheduler('user-123'))
  await vi.advanceTimersByTimeAsync(0)
  const callsAfterMount = mockedGetDocs.mock.calls.length

  await vi.advanceTimersByTimeAsync(60_000)

  expect(mockedGetDocs.mock.calls.length).toBeGreaterThan(callsAfterMount)
})

it('cancela o intervalo ao desmontar', async () => {
  const { getDocs } = await import('firebase/firestore')
  const mockedGetDocs = vi.mocked(getDocs)

  const { unmount } = renderHook(() => useMessageScheduler('user-123'))
  await vi.advanceTimersByTimeAsync(0)

  unmount()
  const callsAfterUnmount = mockedGetDocs.mock.calls.length

  await vi.advanceTimersByTimeAsync(120_000)

  expect(mockedGetDocs.mock.calls.length).toBe(callsAfterUnmount)
})
})