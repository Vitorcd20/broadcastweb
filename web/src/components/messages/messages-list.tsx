import { useState, useMemo } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  Tooltip,
  Skeleton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import MessageIcon from "@mui/icons-material/Message";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { deleteMessage } from "@/services/messages.service";
import { generateMessagesReport } from "@/services/report.service";
import { useMessages } from "@/hooks/use-messages";
import { useContacts } from "@/hooks/use-contacts";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { MessageFormDialog } from "./message-form-dialog";
import { MessagePreviewDialog } from "./message-preview-dialog";
import type { Message, MessageStatus, Contact, Connection } from "@/types";

type FilterTab = "all" | MessageStatus;
type SortField = "scheduledAt" | "status" | "content";
type SortOrder = "asc" | "desc";

interface MessagesListProps {
  userId: string;
  connectionId: string;
  connectionName: string;
  connection: Connection;
  userName: string;
}

const STATUS_LABELS: Record<MessageStatus, string> = {
  scheduled: "Agendada",
  sent: "Enviada",
};

const STATUS_COLORS: Record<MessageStatus, "warning" | "success"> = {
  scheduled: "warning",
  sent: "success",
};

const sortMessages = (
  messages: Message[],
  field: SortField,
  order: SortOrder,
): Message[] =>
  [...messages].sort((a, b) => {
    let cmp = 0;
    if (field === "scheduledAt")
      cmp = a.scheduledAt.getTime() - b.scheduledAt.getTime();
    else if (field === "status") cmp = a.status.localeCompare(b.status);
    else if (field === "content")
      cmp = a.content.localeCompare(b.content, "pt-BR");
    return order === "asc" ? cmp : -cmp;
  });

export const MessagesList = ({
  userId,
  connectionId,
  connectionName,
  connection,
  userName
}: MessagesListProps) => {
  const { filteredMessages, loading } = useMessages(userId, connectionId);
  const { contacts } = useContacts(userId, connectionId);
  const [tab, setTab] = useState<FilterTab>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [previewMessage, setPreviewMessage] = useState<Message | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [sortField, setSortField] = useState<SortField>("scheduledAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const messages = useMemo(
    () => sortMessages(filteredMessages(tab), sortField, sortOrder),
    [filteredMessages, tab, sortField, sortOrder],
  );

  const getContactNames = (contactIds: string[]) =>
    contactIds
      .map((id) => contacts.find((c) => c.id === id)?.name ?? "Desconhecido")
      .join(", ");

  const getPreviewContacts = (contactIds: string[]): Contact[] =>
    contactIds.flatMap((id) => {
      const c = contacts.find((c) => c.id === id);
      return c ? [c] : [];
    });

  const resolvePreview = (content: string, contactIds: string[]): string => {
    const firstContact = contacts.find((c) => c.id === contactIds[0]);
    if (!firstContact) return content;
    return content
      .replace(/\{\{nome\}\}/gi, firstContact.name)
      .replace(/\{\{telefone\}\}/gi, firstContact.phone);
  };

  const handleEdit = (message: Message) => {
    setEditingMessage(message);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingMessage(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      await deleteMessage(deletingId);
    } finally {
      setDeleteLoading(false);
      setDeletingId(null);
    }
  };

  const handleExportPdf = () => {
  generateMessagesReport(connection, messages, contacts, userName);
};

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <Box className="flex items-center justify-between flex-wrap gap-2">
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Mensagens
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {connectionName}
            </Typography>
          </Box>
          <Box className="flex items-center gap-2">
            <Tooltip title="Exportar relatório PDF">
              <span>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PictureAsPdfIcon />}
                  onClick={handleExportPdf}
                  disabled={messages.length === 0}
                >
                  Exportar PDF
                </Button>
              </span>
            </Tooltip>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setFormOpen(true)}
            >
              Nova
            </Button>
          </Box>
        </Box>

        <Tabs
          value={tab}
          onChange={(_, val: FilterTab) => setTab(val)}
          textColor="primary"
          indicatorColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          className="-mx-4 px-4 border-b border-slate-100"
        >
          <Tab value="all" label="Todas" />
          <Tab value="scheduled" label="Agendadas" />
          <Tab value="sent" label="Enviadas" />
        </Tabs>

        {loading ? (
          <Box className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height={52} />
            ))}
          </Box>
        ) : messages.length === 0 ? (
          <EmptyState
            icon={<MessageIcon sx={{ fontSize: 48 }} />}
            title="Nenhuma mensagem"
            description={
              tab === "all"
                ? "Crie a primeira mensagem agendada"
                : `Nenhuma mensagem ${tab === "scheduled" ? "agendada" : "enviada"}`
            }
          />
        ) : isMobile ? (
          <Box className="flex flex-col gap-2">
            {messages.map((message) => (
              <Box
                key={message.id}
                className="flex flex-col gap-2 p-3 rounded-lg border"
                sx={{ borderColor: "divider" }}
              >
                <Box className="flex items-start justify-between gap-2">
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    className="flex-1"
                    sx={{ wordBreak: "break-word" }}
                  >
                    {resolvePreview(message.content, message.contactIds)}
                  </Typography>
                  <Chip
                    label={STATUS_LABELS[message.status]}
                    color={STATUS_COLORS[message.status]}
                    size="small"
                    variant="outlined"
                  />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {getContactNames(message.contactIds)}
                </Typography>
                <Box className="flex items-center justify-between">
                  <Typography variant="caption" color="text.secondary">
                    {dayjs(message.scheduledAt)
                      .locale("pt-br")
                      .format("DD/MM/YY [às] HH:mm")}
                  </Typography>
                  <Box className="flex gap-1">
                    <IconButton
                      size="small"
                      onClick={() => setPreviewMessage(message)}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    {message.status === "scheduled" && (
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(message)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setDeletingId(message.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === "content"}
                      direction={sortField === "content" ? sortOrder : "asc"}
                      onClick={() => handleSort("content")}
                    >
                      <strong>Mensagem</strong>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <strong>Contatos</strong>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === "scheduledAt"}
                      direction={
                        sortField === "scheduledAt" ? sortOrder : "asc"
                      }
                      onClick={() => handleSort("scheduledAt")}
                    >
                      <strong>Agendado para</strong>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === "status"}
                      direction={sortField === "status" ? sortOrder : "asc"}
                      onClick={() => handleSort("status")}
                    >
                      <strong>Status</strong>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Ações</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {messages.map((message) => (
                  <TableRow key={message.id} hover>
                    <TableCell sx={{ maxWidth: 200 }}>
                      <Typography
                        variant="body2"
                        noWrap
                        title={resolvePreview(
                          message.content,
                          message.contactIds,
                        )}
                      >
                        {resolvePreview(message.content, message.contactIds)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 180 }}>
                      <Typography
                        variant="body2"
                        noWrap
                        title={getContactNames(message.contactIds)}
                      >
                        {getContactNames(message.contactIds)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {dayjs(message.scheduledAt)
                          .locale("pt-br")
                          .format("DD/MM/YYYY [às] HH:mm")}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={STATUS_LABELS[message.status]}
                        color={STATUS_COLORS[message.status]}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Pré-visualizar">
                        <IconButton
                          size="small"
                          onClick={() => setPreviewMessage(message)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {message.status === "scheduled" && (
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(message)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Excluir">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeletingId(message.id)}
                        >
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

      <MessageFormDialog
        open={formOpen}
        userId={userId}
        connectionId={connectionId}
        message={editingMessage}
        onClose={handleCloseForm}
      />

      {previewMessage && (
        <MessagePreviewDialog
          open={Boolean(previewMessage)}
          content={previewMessage.content}
          scheduledAt={previewMessage.scheduledAt}
          contacts={getPreviewContacts(previewMessage.contactIds)}
          onClose={() => setPreviewMessage(null)}
        />
      )}

      <ConfirmDialog
        open={Boolean(deletingId)}
        title="Excluir mensagem"
        description="Tem certeza que deseja excluir esta mensagem?"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingId(null)}
        loading={deleteLoading}
      />
    </Card>
  );
};