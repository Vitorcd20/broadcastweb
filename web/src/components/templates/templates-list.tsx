import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Tooltip,
  Skeleton,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import { deleteTemplate } from '@/services/templates.service'
import { useTemplates } from '@/hooks/use-templates'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { EmptyState } from '@/components/shared/empty-state'
import { TemplateFormDialog } from './template-form-dialog'
import type { Template } from '@/types'

interface TemplatesListProps {
  userId: string
}

export const TemplatesList = ({ userId }: TemplatesListProps) => {
  const { templates, loading } = useTemplates(userId)
  const [formOpen, setFormOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const handleEdit = (template: Template) => {
    setEditingTemplate(template)
    setFormOpen(true)
  }

  const handleCloseForm = () => {
    setFormOpen(false)
    setEditingTemplate(null)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingId) return
    setDeleteLoading(true)
    try {
      await deleteTemplate(deletingId)
    } finally {
      setDeleteLoading(false)
      setDeletingId(null)
    }
  }

  const countVariables = (content: string) => {
    const matches = content.match(/\{\{[^}]+\}\}/g) ?? []
    return [...new Set(matches)]
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <Box className="flex items-center justify-between">
          <Box>
            <Typography variant="h6" fontWeight={600}>Templates</Typography>
            <Typography variant="body2" color="text.secondary">
              Modelos reutilizáveis com variáveis dinâmicas
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setFormOpen(true)}
          >
            Novo
          </Button>
        </Box>

        {loading ? (
          <Box className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => <Skeleton key={i} height={52} />)}
          </Box>
        ) : templates.length === 0 ? (
          <EmptyState
            icon={<BookmarkIcon sx={{ fontSize: 48 }} />}
            title="Nenhum template"
            description="Crie templates com variáveis como {{nome}} e {{telefone}}"
          />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Nome</strong></TableCell>
                  <TableCell><strong>Conteúdo</strong></TableCell>
                  <TableCell><strong>Variáveis</strong></TableCell>
                  <TableCell align="right"><strong>Ações</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {template.name}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 300 }}>
                      <Typography variant="body2" noWrap title={template.content}>
                        {template.content}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box className="flex gap-1 flex-wrap">
                        {countVariables(template.content).map((v) => (
                          <Chip key={v} label={v} size="small" color="primary" variant="outlined" />
                        ))}
                        {countVariables(template.content).length === 0 && (
                          <Typography variant="caption" color="text.disabled">
                            Nenhuma
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => handleEdit(template)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton size="small" color="error" onClick={() => setDeletingId(template.id)}>
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

      <TemplateFormDialog
        open={formOpen}
        userId={userId}
        template={editingTemplate}
        onClose={handleCloseForm}
      />

      <ConfirmDialog
        open={Boolean(deletingId)}
        title="Excluir template"
        description="Tem certeza que deseja excluir este template?"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingId(null)}
        loading={deleteLoading}
      />
    </Card>
  )
}