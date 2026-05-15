import { useState, type FormEvent } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Alert,
  Link,
  InputAdornment,
  IconButton,
} from '@mui/material'
import EmailIcon from '@mui/icons-material/Email'
import LockIcon from '@mui/icons-material/Lock'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import CampaignIcon from '@mui/icons-material/Campaign'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact'
import { sendPasswordResetEmail } from 'firebase/auth'
import { signIn } from '@/services/auth.service'
import { auth } from '@/lib/firebase'

interface LoginFormProps {
  onSwitchToRegister: () => void
}

const FEATURES = [
  'Gerencie conexões e contatos em um só lugar',
  'Agende mensagens com disparo automático',
  'Dashboard com métricas em tempo real',
  '100% seguro e isolado por conta',
  'Inteligência artificial integrada para uma melhor experiência',
  'Onboarding para facilitar aos novos usuarios'
]

export const LoginForm = ({ onSwitchToRegister }: LoginFormProps) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [resetOpen, setResetOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)
  const [resetSuccess, setResetSuccess] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signIn(email, password)
    } catch {
      setError('E-mail ou senha inválidos.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!resetEmail.trim()) return
    setResetError(null)
    setResetLoading(true)
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim())
      setResetSuccess(true)
    } catch {
      setResetError('E-mail não encontrado. Verifique e tente novamente.')
    } finally {
      setResetLoading(false)
    }
  }

  const handleCloseReset = () => {
    setResetOpen(false)
    setResetEmail('')
    setResetError(null)
    setResetSuccess(false)
  }

  return (
    <Box className="flex min-h-screen">
      <Box
        className="hidden md:flex flex-col justify-between p-12 flex-1"
        sx={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #818cf8 100%)',
        }}
      >
        <Box className="flex items-center gap-3">
          <Box
            className="flex items-center justify-center rounded-xl p-2"
            sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}
          >
            <ConnectWithoutContactIcon sx={{ color: 'white', fontSize: 30 }} />
          </Box>
          <Typography variant="h5" fontWeight={800} sx={{ color: 'white' }}>
            Broadcast
          </Typography>
        </Box>

        <Box className="flex flex-col gap-6">
          <Box>
            <Typography variant="h3" fontWeight={800} sx={{ color: 'white', lineHeight: 1.2 }}>
              Dispare mensagens
              <br />
              com inteligência.
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.75)', mt: 2 }}>
              A plataforma SaaS para gerenciar e agendar
              <br />
              mensagens para seus contatos.
            </Typography>
          </Box>

          <Box className="flex flex-col gap-3">
            {FEATURES.map((feature) => (
              <Box key={feature} className="flex items-center gap-3">
                <CheckCircleIcon sx={{ color: 'rgba(255,255,255,0.9)', fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                  {feature}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
          © 2025 Broadcast. Todos os direitos reservados.
        </Typography>
      </Box>

      <Box
        className="flex flex-col justify-center items-center flex-1 p-8"
        sx={{ bgcolor: 'background.default' }}
      >
        <Box className="w-full" sx={{ maxWidth: 400 }}>
          {/* Mobile logo */}
          <Box className="flex md:hidden items-center gap-2 mb-8 justify-center">
            <Box
              className="flex items-center justify-center rounded-xl p-2"
              sx={{ bgcolor: 'primary.main' }}
            >
              <CampaignIcon sx={{ color: 'white', fontSize: 22 }} />
            </Box>
            <Typography variant="h6" fontWeight={800} color="primary">
              Broadcast
            </Typography>
          </Box>

          <Box className="mb-8">
            <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
              Bem-vindo de volta!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Entre na sua conta para continuar
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} className="flex flex-col gap-4">
            <TextField
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              size="medium"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <Box className="flex flex-col gap-1">
              <TextField
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
                size="medium"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                        size="small"
                        aria-label="Mostrar senha"
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Box className="flex justify-end">
                <Link
                  component="button"
                  type="button"
                  variant="caption"
                  onClick={() => setResetOpen(true)}
                  underline="hover"
                  color="text.secondary"
                >
                  Esqueceu a senha?
                </Link>
              </Box>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              size="large"
              sx={{
                mt: 1,
                py: 1.5,
                fontWeight: 700,
                fontSize: '1rem',
                borderRadius: 2,
                background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                boxShadow: '0 4px 15px rgba(99,102,241,0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4338ca, #4f46e5)',
                  boxShadow: '0 6px 20px rgba(99,102,241,0.5)',
                },
              }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </Box>

          <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 3 }}>
            Não tem conta?{' '}
            <Link
              component="button"
              type="button"
              onClick={onSwitchToRegister}
              underline="hover"
              fontWeight={600}
            >
              Cadastre-se grátis
            </Link>
          </Typography>
        </Box>
      </Box>

      <Dialog open={resetOpen} onClose={handleCloseReset} maxWidth="xs" fullWidth>
        <DialogTitle>Recuperar senha</DialogTitle>
        <DialogContent className="flex flex-col gap-3">
          {resetSuccess ? (
            <Alert severity="success">
              E-mail de recuperação enviado! Verifique sua caixa de entrada.
            </Alert>
          ) : (
            <>
              {resetError && <Alert severity="error">{resetError}</Alert>}
              <Typography variant="body2" color="text.secondary">
                Digite seu e-mail e enviaremos um link para redefinir sua senha.
              </Typography>
              <TextField
                label="E-mail"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                fullWidth
                autoFocus
                size="small"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReset} color="inherit">
            {resetSuccess ? 'Fechar' : 'Cancelar'}
          </Button>
          {!resetSuccess && (
            <Button
              onClick={handleResetPassword}
              disabled={resetLoading || !resetEmail.trim()}
              variant="contained"
            >
              {resetLoading ? 'Enviando...' : 'Enviar link'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  )
}