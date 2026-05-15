import { useState, type FormEvent } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  LinearProgress,
  TextField,
  Typography,
  Avatar,
} from '@mui/material'
import LinkIcon from '@mui/icons-material/Link'
import PeopleIcon from '@mui/icons-material/People'
import MessageIcon from '@mui/icons-material/Message'
import CelebrationIcon from '@mui/icons-material/Celebration'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import dayjs, { type Dayjs } from 'dayjs'
import 'dayjs/locale/pt-br'
import confetti from 'canvas-confetti'
import { createConnection } from '@/services/connections.service'
import { createContact } from '@/services/contacts.service'
import { createMessage } from '@/services/messages.service'
import { useConnections } from '@/hooks/use-connections'
import { useContacts } from '@/hooks/use-contacts'

interface OnboardingWizardProps {
  open: boolean
  userId: string
  onFinish: () => void
}

const STEPS = [
  {
    icon: <LinkIcon sx={{ fontSize: 32 }} />,
    title: 'Crie sua primeira conexão',
    description: 'Conexões organizam seus contatos e mensagens. Pode ser um grupo, campanha ou canal.',
    color: '#6366f1',
  },
  {
    icon: <PeopleIcon sx={{ fontSize: 32 }} />,
    title: 'Adicione um contato',
    description: 'Contatos são as pessoas que vão receber suas mensagens.',
    color: '#0ea5e9',
  },
  {
    icon: <MessageIcon sx={{ fontSize: 32 }} />,
    title: 'Agende sua primeira mensagem',
    description: 'Escreva uma mensagem e escolha quando ela será disparada.',
    color: '#f59e0b',
  },
  {
    icon: <CelebrationIcon sx={{ fontSize: 32 }} />,
    title: 'Tudo pronto! 🎉',
    description: 'Sua conta está configurada. Agora você pode explorar todas as funcionalidades do Broadcast.',
    color: '#22c55e',
  },
]

export const OnboardingWizard = ({ open, userId, onFinish }: OnboardingWizardProps) => {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [connectionName, setConnectionName] = useState('')
  const [createdConnectionId, setCreatedConnectionId] = useState<string | null>(null)

  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')

  const [messageContent, setMessageContent] = useState('')
  const [scheduledAt, setScheduledAt] = useState<Dayjs | null>(dayjs().add(1, 'hour'))

  const { connections } = useConnections(userId)
  const { contacts } = useContacts(userId, createdConnectionId ?? '')

  const progress = (step / (STEPS.length - 1)) * 100

  const handleStep1 = async (e: FormEvent) => {
    e.preventDefault()
    if (!connectionName.trim()) return
    setError(null)
    setLoading(true)
    try {
      await createConnection(userId, connectionName.trim())
      setTimeout(() => {
        const conn = connections.find((c) => c.name === connectionName.trim())
        if (conn) setCreatedConnectionId(conn.id)
      }, 1000)
      setStep(1)
    } catch {
      setError('Erro ao criar conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleStep2 = async (e: FormEvent) => {
    e.preventDefault()
    if (!contactName.trim() || !contactPhone.trim()) return

    const connectionId = createdConnectionId ?? connections[0]?.id
    if (!connectionId) {
      setStep(2)
      return
    }

    setError(null)
    setLoading(true)
    try {
      await createContact(userId, connectionId, contactName.trim(), contactPhone.trim())
      setCreatedConnectionId(connectionId)
      setStep(2)
    } catch {
      setError('Erro ao criar contato. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleStep3 = async (e: FormEvent) => {
    e.preventDefault()
    if (!messageContent.trim() || !scheduledAt) return

    const connectionId = createdConnectionId ?? connections[0]?.id
    const contactId = contacts[0]?.id
    if (!connectionId) {
      fireConfetti()
      setStep(3)
      return
    }

    setError(null)
    setLoading(true)
    try {
      await createMessage(
        userId,
        connectionId,
        contactId ? [contactId] : [],
        messageContent.trim(),
        scheduledAt.toDate()
      )
      fireConfetti()
      setStep(3)
    } catch {
      setError('Erro ao criar mensagem. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const fireConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#818cf8', '#a5b4fc', '#22c55e', '#f59e0b'],
    })
    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#6366f1', '#22c55e'],
      })
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#f59e0b', '#818cf8'],
      })
    }, 300)
  }

  const currentStep = STEPS[step]

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      <Dialog
        open={open}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
      >
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ height: 4 }}
        />

        <DialogContent className="flex flex-col gap-6 p-8">
          <Box className="flex flex-col items-center text-center gap-3">
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: `${currentStep.color}18`,
                color: currentStep.color,
              }}
            >
              {currentStep.icon}
            </Avatar>
            <Box>
              <Typography variant="caption" color="text.disabled" fontWeight={600} sx={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Passo {step + 1} de {STEPS.length}
              </Typography>
              <Typography variant="h5" fontWeight={800} sx={{ mt: 0.5 }}>
                {currentStep.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {currentStep.description}
              </Typography>
            </Box>
          </Box>

          {step === 0 && (
            <Box component="form" onSubmit={handleStep1} className="flex flex-col gap-3">
              {error && <Box sx={{ color: 'error.main' }}><Typography variant="caption">{error}</Typography></Box>}
              <TextField
                label="Nome da conexão"
                value={connectionName}
                onChange={(e) => setConnectionName(e.target.value)}
                placeholder="ex: Clientes VIP, Promoções, Newsletter"
                required
                fullWidth
                autoFocus
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading || !connectionName.trim()}
                size="large"
                sx={{ py: 1.5, fontWeight: 700, borderRadius: 2 }}
              >
                {loading ? 'Criando...' : 'Criar conexão →'}
              </Button>
            </Box>
          )}

          {step === 1 && (
            <Box component="form" onSubmit={handleStep2} className="flex flex-col gap-3">
              {error && <Typography variant="caption" color="error">{error}</Typography>}
              <TextField
                label="Nome do contato"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="ex: João Silva"
                required
                fullWidth
                autoFocus
              />
              <TextField
                label="Telefone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+55 11 99999-0001"
                required
                fullWidth
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading || !contactName.trim() || !contactPhone.trim()}
                size="large"
                sx={{ py: 1.5, fontWeight: 700, borderRadius: 2 }}
              >
                {loading ? 'Adicionando...' : 'Adicionar contato →'}
              </Button>
              <Button
                variant="text"
                fullWidth
                onClick={() => setStep(2)}
                color="inherit"
                size="small"
              >
                Pular esta etapa
              </Button>
            </Box>
          )}

          {step === 2 && (
            <Box component="form" onSubmit={handleStep3} className="flex flex-col gap-3">
              {error && <Typography variant="caption" color="error">{error}</Typography>}
              <TextField
                label="Mensagem"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="ex: Olá! Temos uma promoção exclusiva para você 🎉"
                required
                fullWidth
                multiline
                rows={3}
                autoFocus
              />
              <DateTimePicker
                label="Agendar para"
                value={scheduledAt}
                onChange={(val) => setScheduledAt(val)}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading || !messageContent.trim()}
                size="large"
                sx={{ py: 1.5, fontWeight: 700, borderRadius: 2 }}
              >
                {loading ? 'Agendando...' : 'Agendar mensagem →'}
              </Button>
              <Button
                variant="text"
                fullWidth
                onClick={() => { fireConfetti(); setStep(3) }}
                color="inherit"
                size="small"
              >
                Pular esta etapa
              </Button>
            </Box>
          )}

          {step === 3 && (
            <Box className="flex flex-col gap-4">
              <Box
                className="flex flex-col gap-2 p-4 rounded-xl"
                sx={{ bgcolor: 'background.default' }}
              >
                {[
                  '✅ Conexão criada',
                  '✅ Contato adicionado',
                  '✅ Mensagem agendada',
                  '✅ Conta configurada',
                ].map((item) => (
                  <Typography key={item} variant="body2" fontWeight={500}>
                    {item}
                  </Typography>
                ))}
              </Box>
              <Button
                variant="contained"
                fullWidth
                onClick={onFinish}
                size="large"
                sx={{
                  py: 1.5,
                  fontWeight: 700,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                  boxShadow: '0 4px 15px rgba(99,102,241,0.4)',
                }}
              >
                Começar a usar o Broadcast!
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </LocalizationProvider>
  )
}