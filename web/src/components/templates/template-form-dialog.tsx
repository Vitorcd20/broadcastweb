import { useState, useEffect, type FormEvent } from 'react'
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Alert,
  Typography,
} from '@mui/material'
import { createTemplate, updateTemplate } from '@/services/templates.service'
import type { Template } from '@/types'

interface TemplateFormDialogProps {
  open: boolean
  userId: string
  template?: Template | null
  onClose: () => void
}

const VARIABLES = ['{{nome}}', '{{telefone}}']

export const TemplateFormDialog = ({
  open,
  userId,
  template,
  onClose,
}: TemplateFormDialogProps) => {
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = Boolean(template)

  useEffect(() => {
    if (open) {
      setName(template?.name ?? '')
      setContent(template?.content ?? '')
      setError(null)
    }
  }, [open, template])

  const insertVariable = (variable: string) => {
    setContent((prev) => prev + variable)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !content.trim()) return
    setError(null)
    setLoading(true)
    try {
      if (isEditing && template) {
        await updateTemplate(template.id, name.trim(), content.trim())
      } else {
        await createTemplate(userId, name.trim(), content.trim())
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar template.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? 'Editar Template' : 'Novo Template'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent className="flex flex-col gap-4">
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Nome do template"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
            autoFocus
            placeholder="ex: Promoção VIP, Lembrete de pagamento"
          />

          <Box>
            <Typography variant="caption" color="text.secondary" className="mb-2 block">
              Variáveis disponíveis — clique para inserir:
            </Typography>
            <Box className="flex gap-2 flex-wrap mb-3">
              {VARIABLES.map((v) => (
                <Chip
                  key={v}
                  label={v}
                  size="small"
                  color="primary"
                  variant="outlined"
                  onClick={() => insertVariable(v)}
                  clickable
                />
              ))}
            </Box>
            <TextField
              label="Conteúdo do template"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              fullWidth
              multiline
              rows={4}
              placeholder="ex: Olá {{nome}}, temos uma promoção exclusiva para você!"
              helperText={`${content.length}/1000 caracteres`}
              inputProps={{ maxLength: 1000 }}
            />
          </Box>

          {content && (
            <Box
              className="p-3 rounded-lg border"
              sx={{ borderColor: 'divider', bgcolor: 'background.default' }}
            >
              <Typography variant="caption" color="text.secondary" className="block mb-1">
                Pré-visualização (exemplo):
              </Typography>
              <Typography variant="body2">
                {content
                  .replace(/\{\{nome\}\}/gi, 'João Silva')
                  .replace(/\{\{telefone\}\}/gi, '+55 11 99999-0001')}
              </Typography>
            </Box>
          )}
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