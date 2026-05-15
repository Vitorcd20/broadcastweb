import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export const ConfirmDialog = ({
  open,
  title,
  description,
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) => (
  <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <DialogContentText>{description}</DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel} disabled={loading} color="inherit">
        Cancelar
      </Button>
      <Button onClick={onConfirm} disabled={loading} color="error" variant="contained">
        {loading ? 'Excluindo...' : 'Excluir'}
      </Button>
    </DialogActions>
  </Dialog>
)
