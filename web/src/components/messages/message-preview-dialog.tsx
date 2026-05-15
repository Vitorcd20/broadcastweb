import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Typography,
} from '@mui/material'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
import { applyTemplate } from '@/services/templates.service'
import type { Contact } from '@/types'

interface MessagePreviewDialogProps {
  open: boolean
  content: string
  scheduledAt: Date | null
  contacts: Contact[]
  onClose: () => void
}

export const MessagePreviewDialog = ({
  open,
  content,
  scheduledAt,
  contacts,
  onClose,
}: MessagePreviewDialogProps) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Pré-visualização da Mensagem</DialogTitle>
    <DialogContent className="flex flex-col gap-4">
      {scheduledAt && (
        <Typography variant="caption" color="text.secondary">
          Agendada para:{' '}
          <strong>
            {dayjs(scheduledAt).locale('pt-br').format('DD/MM/YYYY [às] HH:mm')}
          </strong>
        </Typography>
      )}

      <Typography variant="body2" fontWeight={600}>
        Como cada contato vai receber:
      </Typography>

      <Box className="flex flex-col gap-3">
        {contacts.map((contact) => {
          const personalized = applyTemplate(content, contact.name, contact.phone)
          const hasVariables = content.includes('{{')

          return (
            <Box key={contact.id} className="border rounded-xl p-3" sx={{ borderColor: 'divider' }}>
              <Box className="flex items-center gap-2 mb-2">
                <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.light', fontSize: 12 }}>
                  {contact.name[0]?.toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {contact.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {contact.phone}
                  </Typography>
                </Box>
                {hasVariables && (
                  <Box
                    className="ml-auto px-2 py-0.5 rounded-full"
                    sx={{ bgcolor: 'success.light' }}
                  >
                    <Typography
  variant="caption"
  sx={{
    color: 'success.contrastText',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  }}
>
  personalizada
</Typography>
                  </Box>
                )}
              </Box>
              <Divider className="mb-2" />
              <Box
                className="rounded-lg p-2"
                sx={{ bgcolor: 'background.default' }}
              >
                <Typography variant="body2" className="whitespace-pre-wrap">
                  {personalized}
                </Typography>
              </Box>
            </Box>
          )
        })}
      </Box>

      {content.includes('{{') && (
        <Box
          className="p-2 rounded-lg"
          sx={{ bgcolor: 'info.light' }}
        >
          <Typography variant="caption" sx={{ color: 'info.contrastText' }}>
            ✦ Esta mensagem usa variáveis — cada contato recebe uma versão personalizada.
          </Typography>
        </Box>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} variant="contained">
        Fechar
      </Button>
    </DialogActions>
  </Dialog>
)