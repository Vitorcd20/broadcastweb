import { useState, useEffect, type FormEvent } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Alert,
} from '@mui/material'
import { createConnection, updateConnection } from '@/services/connections.service'
import type { Connection } from '@/types'

interface ConnectionFormDialogProps {
  open: boolean
  userId: string
  connection?: Connection | null
  onClose: () => void
}

export const ConnectionFormDialog = ({
  open,
  userId,
  connection,
  onClose,
}: ConnectionFormDialogProps) => {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = Boolean(connection)

  useEffect(() => {
    if (open) {
      setName(connection?.name ?? '')
      setError(null)
    }
  }, [open, connection])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setError(null)
    setLoading(true)
    try {
      if (isEditing && connection) {
        await updateConnection(connection.id, name.trim())
      } else {
        await createConnection(userId, name.trim())
      }
      onClose()
    } catch {
      setError('Erro ao salvar conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{isEditing ? 'Editar Conexão' : 'Nova Conexão'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent className="flex flex-col gap-3">
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Nome da conexão"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading} color="inherit">
            Cancelar
          </Button>
          <Button type="submit" disabled={loading} variant="contained">
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}


