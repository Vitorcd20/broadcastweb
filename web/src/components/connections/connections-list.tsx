import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Typography,
  Tooltip,
  Skeleton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LinkIcon from "@mui/icons-material/Link";
import { deleteConnection } from "@/services/connections.service";
import { useConnections } from "@/hooks/use-connections";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ConnectionFormDialog } from "./connection-form-dialog";
import type { Connection } from "@/types";

interface ConnectionsListProps {
  userId: string;
  selectedConnectionId: string | null;
  onSelectConnection: (id: string) => void;
}

export const ConnectionsList = ({
  userId,
  selectedConnectionId,
  onSelectConnection,
}: ConnectionsListProps) => {
  const { connections, loading } = useConnections(userId);
  const [formOpen, setFormOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<Connection | null>(
    null,
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleEdit = (connection: Connection) => {
    setEditingConnection(connection);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingConnection(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      await deleteConnection(deletingId);
      if (selectedConnectionId === deletingId) onSelectConnection("");
    } finally {
      setDeleteLoading(false);
      setDeletingId(null);
    }
  };

  return (
    <Card className="h-full">
      <CardContent className="flex flex-col gap-3 h-full">
        <Box className="flex items-center justify-between">
          <Typography variant="h6" fontWeight={600}>
            Conexões
          </Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setFormOpen(true)}
          >
            Nova
          </Button>
        </Box>

        {loading ? (
          <Box className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height={48} />
            ))}
          </Box>
        ) : connections.length === 0 ? (
          <EmptyState
            icon={<LinkIcon sx={{ fontSize: 48 }} />}
            title="Nenhuma conexão"
            description="Crie sua primeira conexão para começar"
          />
        ) : (
          <List disablePadding>
            {connections.map((connection) => (
              <ListItem
                key={connection.id}
                button
                selected={selectedConnectionId === connection.id}
                onClick={() => onSelectConnection(connection.id)}
                className="rounded-lg mb-2"
                sx={{
                  borderRadius: "8px !important",
                }}
              >
                <ListItemText primary={connection.name} />
                <ListItemSecondaryAction>
                  <Tooltip title="Editar">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(connection);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingId(connection.id);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>

      <ConnectionFormDialog
        open={formOpen}
        userId={userId}
        connection={editingConnection}
        onClose={handleCloseForm}
      />

      <ConfirmDialog
        open={Boolean(deletingId)}
        title="Excluir conexão"
        description="Tem certeza que deseja excluir esta conexão? Esta ação não pode ser desfeita."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingId(null)}
        loading={deleteLoading}
      />
    </Card>
  );
};
