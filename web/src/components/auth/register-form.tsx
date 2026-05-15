import { useState, type FormEvent } from 'react'
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Link,
  InputAdornment,
  IconButton,
} from '@mui/material'
import EmailIcon from '@mui/icons-material/Email'
import LockIcon from '@mui/icons-material/Lock'
import PersonIcon from '@mui/icons-material/Person'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import CampaignIcon from '@mui/icons-material/Campaign'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { signUp } from '@/services/auth.service'

interface RegisterFormProps {
  onSwitchToLogin: () => void
}

const FEATURES = [
  'Gerencie conexões e contatos em um só lugar',
  'Agende mensagens com disparo automático',
  'Dashboard com métricas em tempo real',
  '100% seguro e isolado por conta',
  'Inteligência artificial integrada para uma melhor experiência',
  'Onboarding para facilitar aos novos usuarios'
]

export const RegisterForm = ({ onSwitchToLogin }: RegisterFormProps) => {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      await signUp(email, password, displayName)
    } catch {
      setError('Erro ao criar conta. Verifique os dados e tente novamente.')
    } finally {
      setLoading(false)
    }
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
            <CampaignIcon sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          <Typography variant="h5" fontWeight={800} sx={{ color: 'white' }}>
            Broadcast
          </Typography>
        </Box>

        <Box className="flex flex-col gap-6">
          <Box>
            <Typography variant="h3" fontWeight={800} sx={{ color: 'white', lineHeight: 1.2 }}>
              Comece a disparar
              <br />
              mensagens hoje.
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.75)', mt: 2 }}>
              Crie sua conta gratuitamente e tenha
              <br />
              acesso a todas as funcionalidades.
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
              Crie sua conta
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Comece gratuitamente, sem cartão de crédito
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} className="flex flex-col gap-4">
            <TextField
              label="Nome completo"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              fullWidth
              size="medium"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
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
            <TextField
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              size="medium"
              helperText="Mínimo 6 caracteres"
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
              {loading ? 'Criando conta...' : 'Criar conta grátis'}
            </Button>
          </Box>

          <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 3 }}>
            Já tem conta?{' '}
            <Link
              component="button"
              type="button"
              onClick={onSwitchToLogin}
              underline="hover"
              fontWeight={600}
            >
              Entrar
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
