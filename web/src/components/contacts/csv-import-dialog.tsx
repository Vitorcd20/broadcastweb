import { useState, useRef, type ChangeEvent } from 'react'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import { parseCsv, importContactsFromCsv, type CsvContact } from '@/services/csv-import.service'

interface CsvImportDialogProps {
  open: boolean
  userId: string
  connectionId: string
  onClose: () => void
}

export const CsvImportDialog = ({ open, userId, connectionId, onClose }: CsvImportDialogProps) => {
  const [preview, setPreview] = useState<CsvContact[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setSuccess(null)

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string
        const contacts = parseCsv(text)
        if (contacts.length === 0) {
          setError('Nenhum contato válido encontrado no arquivo.')
          setPreview([])
        } else {
          setPreview(contacts)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao ler arquivo.')
        setPreview([])
      }
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (preview.length === 0) return
    setLoading(true)
    try {
      const count = await importContactsFromCsv(userId, connectionId, preview)
      setSuccess(count)
      setPreview([])
      if (inputRef.current) inputRef.current.value = ''
    } catch {
      setError('Erro ao importar contatos. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setPreview([])
    setError(null)
    setSuccess(null)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Importar Contatos via CSV</DialogTitle>
      <DialogContent className="flex flex-col gap-4">
        <Box className="p-3 bg-slate-50 rounded-lg">
          <Typography variant="caption" color="text.secondary">
            O arquivo CSV deve ter as colunas <strong>nome</strong> e <strong>telefone</strong>.
            Exemplo:
          </Typography>
          <Typography variant="caption" color="text.secondary" component="pre" className="block mt-1 font-mono text-xs">
            {`nome,telefone\nJoão Silva,+55 11 99999-0001\nMaria Souza,+55 11 99999-0002`}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<UploadFileIcon />}
          component="label"
          fullWidth
        >
          Selecionar arquivo CSV
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            hidden
            onChange={handleFileChange}
          />
        </Button>

        {error && <Alert severity="error">{error}</Alert>}
        {success !== null && (
          <Alert severity="success">{success} contatos importados com sucesso!</Alert>
        )}

        {preview.length > 0 && (
          <Box>
            <Typography variant="body2" fontWeight={600} className="mb-1">
              Pré-visualização — {preview.length} contatos encontrados
            </Typography>
            <Box className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
              <List dense disablePadding>
                {preview.slice(0, 10).map((c, i) => (
                  <Box key={i}>
                    <ListItem>
                      <ListItemText primary={c.name} secondary={c.phone} />
                    </ListItem>
                    {i < Math.min(preview.length, 10) - 1 && <Divider />}
                  </Box>
                ))}
                {preview.length > 10 && (
                  <ListItem>
                    <ListItemText
                      secondary={`...e mais ${preview.length - 10} contatos`}
                    />
                  </ListItem>
                )}
              </List>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading} color="inherit">
          Fechar
        </Button>
        <Button
          onClick={handleImport}
          disabled={loading || preview.length === 0}
          variant="contained"
        >
          {loading ? 'Importando...' : `Importar ${preview.length > 0 ? preview.length : ''} contatos`}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
