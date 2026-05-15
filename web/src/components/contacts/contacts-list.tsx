import { useState, useMemo } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
  Tooltip,
  Skeleton,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import SearchIcon from '@mui/icons-material/Search'
import PeopleIcon from '@mui/icons-material/People'
import { deleteContact } from '@/services/contacts.service'
import { useContacts } from '@/hooks/use-contacts'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { EmptyState } from '@/components/shared/empty-state'
import { ContactFormDialog } from './contact-form-dialog'
import { CsvImportDialog } from './csv-import-dialog'
import type { Contact } from '@/types'

type SortField = 'name' | 'phone'
type SortOrder = 'asc' | 'desc'

interface ContactsListProps {
  userId: string
  connectionId: string
  connectionName: string
}

const sortContacts = (contacts: Contact[], field: SortField, order: SortOrder): Contact[] =>
  [...contacts].sort((a, b) => {
    const cmp = a[field].localeCompare(b[field], 'pt-BR')
    return order === 'asc' ? cmp : -cmp
  })

const filterContacts = (contacts: Contact[], search: string): Contact[] => {
  const q = search.toLowerCase().trim()
  if (!q) return contacts
  return contacts.filter(
    (c) => c.name.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q)
  )
}

export const ContactsList = ({ userId, connectionId, connectionName }: ContactsListProps) => {
  const { contacts, loading } = useContacts(userId, connectionId)
  const [formOpen, setFormOpen] = useState(false)
  const [csvOpen, setCsvOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const visibleContacts = useMemo(
    () => sortContacts(filterContacts(contacts, search), sortField, sortOrder),
    [contacts, search, sortField, sortOrder]
  )

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact)
    setFormOpen(true)
  }

  const handleCloseForm = () => {
    setFormOpen(false)
    setEditingContact(null)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingId) return
    setDeleteLoading(true)
    try {
      await deleteContact(deletingId)
    } finally {
      setDeleteLoading(false)
      setDeletingId(null)
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <Box className="flex items-start justify-between flex-wrap gap-2">
          <Box>
            <Typography variant="h6" fontWeight={600}>Contatos</Typography>
            <Typography variant="body2" color="text.secondary">{connectionName}</Typography>
          </Box>
          <Box className="flex items-center gap-2 flex-wrap">
            <Chip label={`${contacts.length}`} size="small" variant="outlined" />
            {!isMobile && (
              <Button variant="outlined" size="small" startIcon={<UploadFileIcon />} onClick={() => setCsvOpen(true)}>
                Importar CSV
              </Button>
            )}
            {isMobile && (
              <Tooltip title="Importar CSV">
                <IconButton size="small" onClick={() => setCsvOpen(true)}>
                  <UploadFileIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
              Novo
            </Button>
          </Box>
        </Box>

        <TextField
          placeholder="Buscar por nome ou telefone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        {loading ? (
          <Box className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => <Skeleton key={i} height={52} />)}
          </Box>
        ) : contacts.length === 0 ? (
          <EmptyState
            icon={<PeopleIcon sx={{ fontSize: 48 }} />}
            title="Nenhum contato"
            description="Adicione contatos ou importe um CSV"
          />
        ) : visibleContacts.length === 0 ? (
          <EmptyState
            icon={<SearchIcon sx={{ fontSize: 48 }} />}
            title="Nenhum resultado"
            description={`Nenhum contato encontrado para "${search}"`}
          />
        ) : isMobile ? (
          <Box className="flex flex-col gap-2">
            {visibleContacts.map((contact) => (
              <Box
                key={contact.id}
                className="flex items-center justify-between p-3 rounded-lg border"
                sx={{ borderColor: 'divider' }}
              >
                <Box>
                  <Typography variant="body2" fontWeight={600}>{contact.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{contact.phone}</Typography>
                </Box>
                <Box className="flex gap-1">
                  <IconButton size="small" onClick={() => handleEdit(contact)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => setDeletingId(contact.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sortDirection={sortField === 'name' ? sortOrder : false}>
                    <TableSortLabel
                      active={sortField === 'name'}
                      direction={sortField === 'name' ? sortOrder : 'asc'}
                      onClick={() => handleSort('name')}
                    >
                      <strong>Nome</strong>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sortDirection={sortField === 'phone' ? sortOrder : false}>
                    <TableSortLabel
                      active={sortField === 'phone'}
                      direction={sortField === 'phone' ? sortOrder : 'asc'}
                      onClick={() => handleSort('phone')}
                    >
                      <strong>Telefone</strong>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right"><strong>Ações</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleContacts.map((contact) => (
                  <TableRow key={contact.id} hover>
                    <TableCell>{contact.name}</TableCell>
                    <TableCell>{contact.phone}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => handleEdit(contact)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton size="small" color="error" onClick={() => setDeletingId(contact.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>

      <ContactFormDialog open={formOpen} userId={userId} connectionId={connectionId} contact={editingContact} onClose={handleCloseForm} />
      <CsvImportDialog open={csvOpen} userId={userId} connectionId={connectionId} onClose={() => setCsvOpen(false)} />
      <ConfirmDialog
        open={Boolean(deletingId)}
        title="Excluir contato"
        description="Tem certeza que deseja excluir este contato?"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingId(null)}
        loading={deleteLoading}
      />
    </Card>
  )
}
