import { useState } from 'react'
import { LoginForm } from '@/components/auth/login-form'
import { RegisterForm } from '@/components/auth/register-form'

export const AuthPage = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login')

  if (mode === 'register') {
    return <RegisterForm onSwitchToLogin={() => setMode('login')} />
  }

  return <LoginForm onSwitchToRegister={() => setMode('register')} />
}
