import { useState, useEffect, type FormEvent } from "react";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  FormLabel,
  TextField,
  Alert,
  Typography,
  Divider,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import PsychologyIcon from "@mui/icons-material/Psychology";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import dayjs, { type Dayjs } from "dayjs";
import "dayjs/locale/pt-br";
import { createMessage, updateMessage } from "@/services/messages.service";
import { useContacts } from "@/hooks/use-contacts";
import { useTemplates } from "@/hooks/use-templates";
import type { Message } from "@/types";
import { generateMessage, improveMessage } from "@/services/ai.service";

interface MessageFormDialogProps {
  open: boolean;
  userId: string;
  connectionId: string;
  message?: Message | null;
  onClose: () => void;
}

export const MessageFormDialog = ({
  open,
  userId,
  connectionId,
  message,
  onClose,
}: MessageFormDialogProps) => {
  const { contacts } = useContacts(userId, connectionId);
  const { templates } = useTemplates(userId);
  const [content, setContent] = useState("");
  const [aiDescription, setAiDescription] = useState("");
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState<Dayjs | null>(dayjs());
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showAiGenerator, setShowAiGenerator] = useState(false);

  const isEditing = Boolean(message);

  useEffect(() => {
    if (open) {
      setContent(message?.content ?? "");
      setSelectedContactIds(message?.contactIds ?? []);
      setScheduledAt(
        message?.scheduledAt ? dayjs(message.scheduledAt) : dayjs(),
      );
      setError(null);
      setAiError(null);
      setAiDescription("");
      setShowAiGenerator(false);
    }
  }, [open, message]);

  const toggleContact = (contactId: string) => {
    setSelectedContactIds((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId],
    );
  };

  const toggleAll = () => {
    setSelectedContactIds((prev) =>
      prev.length === contacts.length ? [] : contacts.map((c) => c.id),
    );
  };

  const handleApplyTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) setContent(template.content);
  };

  const handleGenerate = async () => {
    if (!aiDescription.trim()) return;
    setAiError(null);
    setAiLoading(true);
    try {
      const generated = await generateMessage(aiDescription.trim());
      setContent(generated);
      setShowAiGenerator(false);
      setAiDescription("");
    } catch (err) {
      setAiError(
        err instanceof Error ? err.message : "Erro ao gerar mensagem.",
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleImprove = async () => {
    if (!content.trim()) return;
    setAiError(null);
    setAiLoading(true);
    try {
      const improved = await improveMessage(content.trim());
      setContent(improved);
    } catch (err) {
      setAiError(
        err instanceof Error ? err.message : "Erro ao melhorar mensagem.",
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("Escreva o conteúdo da mensagem.");
      return;
    }
    if (selectedContactIds.length === 0) {
      setError("Selecione ao menos um contato.");
      return;
    }
    if (!scheduledAt) {
      setError("Defina a data e hora de agendamento.");
      return;
    }
    if (scheduledAt && scheduledAt.isBefore(dayjs()) && !isEditing) {
      setError("O agendamento deve ser em uma data futura.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      if (isEditing && message) {
        await updateMessage(
          message.id,
          selectedContactIds,
          content.trim(),
          scheduledAt.toDate(),
        );
      } else {
        await createMessage(
          userId,
          connectionId,
          selectedContactIds,
          content.trim(),
          scheduledAt.toDate(),
        );
      }
      onClose();
    } catch {
      setError("Erro ao salvar mensagem. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isEditing ? "Editar Mensagem" : "Nova Mensagem"}
        </DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent className="flex flex-col gap-4">
            {error && <Alert severity="error">{error}</Alert>}
            {aiError && (
              <Alert severity="warning" onClose={() => setAiError(null)}>
                {aiError}
              </Alert>
            )}

            {/* Template selector */}
            {templates.length > 0 && (
              <FormControl size="small" fullWidth>
                <InputLabel>Usar template</InputLabel>
                <Select
                  label="Usar template"
                  value=""
                  onChange={(e) => handleApplyTemplate(e.target.value)}
                  startAdornment={
                    <InputAdornment position="start">
                      <BookmarkIcon fontSize="small" color="action" />
                    </InputAdornment>
                  }
                >
                  {templates.map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      <Box>
                        <Typography variant="body2">{t.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t.content.length > 60
                            ? t.content.slice(0, 60) + "..."
                            : t.content}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* AI Generator panel */}
            {showAiGenerator && (
              <Box
                className="flex flex-col gap-2 p-3 rounded-lg border"
                sx={{ borderColor: "primary.light", bgcolor: "primary.50" }}
              >
                <Box className="flex items-center gap-1 mb-1">
                  <PsychologyIcon fontSize="small" color="primary" />
                  <Typography variant="body2" fontWeight={600} color="primary">
                    Gerar com IA
                  </Typography>
                </Box>
                <TextField
                  placeholder="Descreva o que quer comunicar... ex: promoção de 20% para clientes VIP"
                  value={aiDescription}
                  onChange={(e) => setAiDescription(e.target.value)}
                  size="small"
                  fullWidth
                  multiline
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleGenerate();
                    }
                  }}
                />
                <Box className="flex gap-2 justify-end">
                  <Button
                    size="small"
                    color="inherit"
                    onClick={() => {
                      setShowAiGenerator(false);
                      setAiDescription("");
                    }}
                    disabled={aiLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={handleGenerate}
                    disabled={aiLoading || !aiDescription.trim()}
                    startIcon={
                      aiLoading ? (
                        <CircularProgress size={14} color="inherit" />
                      ) : (
                        <PsychologyIcon />
                      )
                    }
                  >
                    {aiLoading ? "Gerando..." : "Gerar"}
                  </Button>
                </Box>
              </Box>
            )}

            {/* AI buttons + message field */}
            <Box className="flex flex-col gap-1">
              <Box className="flex gap-2 justify-end">
                <Tooltip title="Gerar mensagem com IA">
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    onClick={() => setShowAiGenerator(true)}
                    disabled={aiLoading}
                    startIcon={<PsychologyIcon sx={{ fontSize: 16 }} />}
                  >
                    Gerar com IA
                  </Button>
                </Tooltip>
                <Tooltip title="Melhorar mensagem com IA">
                  <span>
                    <Button
                      size="small"
                      variant="outlined"
                      color="secondary"
                      onClick={handleImprove}
                      disabled={aiLoading || !content.trim()}
                      startIcon={
                        aiLoading ? (
                          <CircularProgress size={14} />
                        ) : (
                          <AutoFixHighIcon sx={{ fontSize: 16 }} />
                        )
                      }
                    >
                      Melhorar
                    </Button>
                  </span>
                </Tooltip>
              </Box>
              <TextField
                label="Mensagem"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                fullWidth
                multiline
                rows={4}
                autoFocus={!showAiGenerator}
              />
              <Box className="flex items-center justify-between">
                <Box className="flex items-center gap-1">
                  <PsychologyIcon sx={{ fontSize: 13, color: "text.disabled" }} />
                  <Typography variant="caption" color="text.disabled">
                    Use os botões para gerar ou melhorar com IA
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  color={content.length > 900 ? "error" : "text.disabled"}
                >
                  {content.length}/1000
                </Typography>
              </Box>
            </Box>

            <DateTimePicker
              label="Agendar para"
              value={scheduledAt}
              onChange={(val) => setScheduledAt(val)}
              slotProps={{ textField: { fullWidth: true, size: "small" } }}
            />

            <Divider />

            <Box>
              <Box className="flex items-center justify-between mb-2">
                <FormLabel component="legend">
                  <strong>Contatos</strong>
                </FormLabel>
                {contacts.length > 0 && (
                  <Button size="small" onClick={toggleAll} variant="text">
                    {selectedContactIds.length === contacts.length
                      ? "Desmarcar todos"
                      : "Selecionar todos"}
                  </Button>
                )}
              </Box>

              {contacts.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Nenhum contato nesta conexão.
                </Typography>
              ) : (
                <FormGroup className="max-h-48 overflow-y-auto">
                  {contacts.map((contact) => (
                    <FormControlLabel
                      key={contact.id}
                      control={
                        <Checkbox
                          checked={selectedContactIds.includes(contact.id)}
                          onChange={() => toggleContact(contact.id)}
                          size="small"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2">
                            {contact.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {contact.phone}
                          </Typography>
                        </Box>
                      }
                    />
                  ))}
                </FormGroup>
              )}
            </Box>
          </DialogContent>

          <DialogActions>
            <Button onClick={onClose} disabled={loading} color="inherit">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} variant="contained">
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </LocalizationProvider>
  );
};