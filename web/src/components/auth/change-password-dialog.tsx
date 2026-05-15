import { useState, type FormEvent } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Alert,
  IconButton,
  InputAdornment,
} from '@mui/material'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  type User,
} from 'firebase/auth'

interface ChangePasswordDialogProps {
  open: boolean
  user: User
  onClose: () => void
}

export const ChangePasswordDialog = ({
  open,
  user,
  onClose,
}: ChangePasswordDialogProps) => {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleClose = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setError(null)
    setSuccess(false)
    onClose()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (newPassword.length < 6) {
      setError('A nova senha deve ter no mínimo 6 caracteres.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)
    try {
      const credential = EmailAuthProvider.credential(
        user.email!,
        currentPassword
      )
      await reauthenticateWithCredential(user, credential)
      await updatePassword(user, newPassword)
      setSuccess(true)
      setTimeout(handleClose, 1500)
    } catch (err: unknown) {
      const code = (err as { code?: string }).code
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Senha atual incorreta.')
      } else {
        setError('Erro ao alterar senha. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Alterar Senha</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent className="flex flex-col gap-4">
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">Senha alterada com sucesso!</Alert>}

          <TextField
            label="Senha atual"
            type={showCurrent ? 'text' : 'password'}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            fullWidth
            autoFocus
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowCurrent((p) => !p)}
                    edge="end"
                    size="small"
                    aria-label="Mostrar senha atual"
                  >
                    {showCurrent ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Nova senha"
            type={showNew ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            fullWidth
            helperText="Mínimo 6 caracteres"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowNew((p) => !p)}
                    edge="end"
                    size="small"
                    aria-label="Mostrar nova senha"
                  >
                    {showNew ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Confirmar nova senha"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            fullWidth
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading} color="inherit">
            Cancelar
          </Button>
          <Button type="submit" disabled={loading} variant="contained">
            {loading ? 'Salvando...' : 'Alterar senha'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}