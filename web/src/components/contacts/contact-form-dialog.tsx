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
import { createContact, updateContact } from '@/services/contacts.service'
import type { Contact } from '@/types'

interface ContactFormDialogProps {
  open: boolean
  userId: string
  connectionId: string
  contact?: Contact | null
  onClose: () => void
}

export const ContactFormDialog = ({
  open,
  userId,
  connectionId,
  contact,
  onClose,
}: ContactFormDialogProps) => {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = Boolean(contact)

  useEffect(() => {
    if (open) {
      setName(contact?.name ?? '')
      setPhone(contact?.phone ?? '')
      setError(null)
    }
  }, [open, contact])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) return
    setError(null)
    setLoading(true)
    try {
      if (isEditing && contact) {
        await updateContact(contact.id, name.trim(), phone.trim())
      } else {
        await createContact(userId, connectionId, name.trim(), phone.trim())
      }
      onClose()
    } catch {
      setError('Erro ao salvar contato. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{isEditing ? 'Editar Contato' : 'Novo Contato'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent className="flex flex-col gap-3">
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
            autoFocus
          />
          <TextField
            label="Telefone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            fullWidth
            placeholder="+55 (11) 99999-9999"
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
