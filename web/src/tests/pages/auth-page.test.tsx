import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AuthPage } from '@/pages/auth-page'

// Mock dos formulários para isolar o teste da página
vi.mock('@/components/auth/login-form', () => ({
  LoginForm: ({ onSwitchToRegister }: { onSwitchToRegister: () => void }) => (
    <div>
      <span>Login Form</span>
      <button onClick={onSwitchToRegister}>Ir para cadastro</button>
    </div>
  ),
}))

vi.mock('@/components/auth/register-form', () => ({
  RegisterForm: ({ onSwitchToLogin }: { onSwitchToLogin: () => void }) => (
    <div>
      <span>Register Form</span>
      <button onClick={onSwitchToLogin}>Ir para login</button>
    </div>
  ),
}))

describe('AuthPage', () => {
  it('renderiza LoginForm por padrão', () => {
    render(<AuthPage />)
    expect(screen.getByText('Login Form')).toBeInTheDocument()
    expect(screen.queryByText('Register Form')).not.toBeInTheDocument()
  })

  it('troca para RegisterForm ao chamar onSwitchToRegister', () => {
    render(<AuthPage />)
    fireEvent.click(screen.getByText('Ir para cadastro'))
    expect(screen.getByText('Register Form')).toBeInTheDocument()
    expect(screen.queryByText('Login Form')).not.toBeInTheDocument()
  })

  it('volta para LoginForm ao chamar onSwitchToLogin', () => {
    render(<AuthPage />)

    // vai para cadastro
    fireEvent.click(screen.getByText('Ir para cadastro'))
    expect(screen.getByText('Register Form')).toBeInTheDocument()

    // volta para login
    fireEvent.click(screen.getByText('Ir para login'))
    expect(screen.getByText('Login Form')).toBeInTheDocument()
  })
})