import { useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Drawer,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Tab,
  Tabs,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
  SwipeableDrawer,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import MenuIcon from "@mui/icons-material/Menu";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import ConnectWithoutContactIcon from "@mui/icons-material/ConnectWithoutContact";
import type { User as FirebaseUser } from "firebase/auth";
import { logOut } from "@/services/auth.service";
import { ConnectionsList } from "@/components/connections/connections-list";
import { ContactsList } from "@/components/contacts/contacts-list";
import { MessagesList } from "@/components/messages/messages-list";
import { DashboardMetrics } from "@/components/dashboard/dashboard-metrics";
import { TemplatesList } from "@/components/templates/templates-list";
import { useConnections } from "@/hooks/use-connections";
import { useMessageScheduler } from "@/hooks/use-message-scheduler";
import { useThemeMode } from "@/lib/theme-provider";
import LockIcon from "@mui/icons-material/Lock";
import { ChangePasswordDialog } from "@/components/auth/change-password-dialog";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { useOnboarding } from "@/hooks/use-onboarding";

const DRAWER_WIDTH = 280;

type MainTab = "contacts" | "messages";
type ActiveView = "dashboard" | "templates";

interface DashboardPageProps {
  user: FirebaseUser;
}

export const DashboardPage = ({ user }: DashboardPageProps) => {
  const [selectedConnectionId, setSelectedConnectionId] = useState<
    string | null
  >(null);
  const [mainTab, setMainTab] = useState<MainTab>("contacts");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const { connections } = useConnections(user.uid);
  const { mode, toggleMode } = useThemeMode();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  useMessageScheduler(user.uid);

  const selectedConnection =
    connections.find((c) => c.id === selectedConnectionId) ?? null;

  const { showOnboarding, finishOnboarding } = useOnboarding(user.uid);

  const handleSelectConnection = (id: string) => {
    setSelectedConnectionId(id || null);
    setMainTab("contacts");
    if (isMobile) setMobileDrawerOpen(false);
  };

  const handleGoToDashboard = () => {
    setSelectedConnectionId(null);
    setActiveView("dashboard");
    if (isMobile) setMobileDrawerOpen(false);
  };

  const handleGoToTemplates = () => {
    setSelectedConnectionId(null);
    setActiveView("templates");
    if (isMobile) setMobileDrawerOpen(false);
  };

  const drawerContent = (
    <Box className="p-3 h-full flex flex-col gap-3">
      <Box
        onClick={handleGoToDashboard}
        className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors"
        sx={{
          bgcolor:
            !selectedConnectionId && activeView === "dashboard"
              ? "primary.main"
              : "transparent",
          color:
            !selectedConnectionId && activeView === "dashboard"
              ? "primary.contrastText"
              : "text.secondary",
          "&:hover": {
            bgcolor:
              !selectedConnectionId && activeView === "dashboard"
                ? "primary.dark"
                : "action.hover",
          },
        }}
      >
        <DashboardIcon fontSize="small" />
        <Typography
          variant="body2"
          fontWeight={
            !selectedConnectionId && activeView === "dashboard" ? 700 : 400
          }
        >
          Dashboard
        </Typography>
      </Box>

      <Box
        onClick={handleGoToTemplates}
        className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors"
        sx={{
          bgcolor:
            !selectedConnectionId && activeView === "templates"
              ? "primary.main"
              : "transparent",
          color:
            !selectedConnectionId && activeView === "templates"
              ? "primary.contrastText"
              : "text.secondary",
          "&:hover": {
            bgcolor:
              !selectedConnectionId && activeView === "templates"
                ? "primary.dark"
                : "action.hover",
          },
        }}
      >
        <BookmarkIcon fontSize="small" />
        <Typography
          variant="body2"
          fontWeight={
            !selectedConnectionId && activeView === "templates" ? 700 : 400
          }
        >
          Templates
        </Typography>
      </Box>

      <ConnectionsList
        userId={user.uid}
        selectedConnectionId={selectedConnectionId}
        onSelectConnection={handleSelectConnection}
      />
    </Box>
  );

  return (
    <Box className="flex h-screen" sx={{ bgcolor: "background.default" }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          color: "text.primary",
        }}
      >
        <Toolbar className="flex justify-between">
          <Box className="flex items-center gap-2">
            {isMobile && (
              <IconButton
                onClick={() => setMobileDrawerOpen(true)}
                aria-label="Abrir menu"
              >
                <MenuIcon />
              </IconButton>
            )}
            <Box
              className="flex items-center gap-2 cursor-pointer"
              onClick={handleGoToDashboard}
            >
              <Box
                className="flex items-center justify-center rounded-lg p-1"
                sx={{ bgcolor: "transparent" }}
              >
                <ConnectWithoutContactIcon
                  sx={{ color: "text.primary", fontSize: 30 }}
                />
              </Box>
              <Typography variant="h6" fontWeight={700} color="primary">
                Broadcast
              </Typography>
            </Box>
          </Box>

          <Box className="flex items-center gap-2">
            <Tooltip title={mode === "light" ? "Modo escuro" : "Modo claro"}>
              <IconButton onClick={toggleMode} aria-label="Alternar tema">
                {mode === "light" ? (
                  <DarkModeIcon fontSize="small" />
                ) : (
                  <LightModeIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>

            <Box
              className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded-lg"
              sx={{ "&:hover": { bgcolor: "action.hover" } }}
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "primary.main",
                  fontSize: 14,
                }}
              >
                {user.displayName?.[0]?.toUpperCase() ??
                  user.email?.[0]?.toUpperCase()}
              </Avatar>
              <Typography
                variant="body2"
                sx={{ display: { xs: "none", sm: "block" } }}
              >
                {user.displayName ?? user.email}
              </Typography>
            </Box>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              slotProps={{
                paper: {
                  sx: { mt: 1, minWidth: 200, bgcolor: "background.paper" },
                },
              }}
            >
              <Box className="px-4 py-2">
                <Typography variant="body2" fontWeight={600}>
                  {user.displayName ?? "Usuário"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
              <Divider />
              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  setChangePasswordOpen(true);
                }}
                sx={{ gap: 1 }}
              >
                <ListItemIcon sx={{ minWidth: 0 }}>
                  <LockIcon fontSize="small" />
                </ListItemIcon>
                Alterar senha
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  setLogoutOpen(true);
                }}
                sx={{ color: "error.main", gap: 1 }}
              >
                <ListItemIcon sx={{ color: "error.main", minWidth: 0 }}>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Sair
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
              top: "64px",
              height: "calc(100% - 64px)",
              borderRight: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {isMobile && (
        <SwipeableDrawer
          open={mobileDrawerOpen}
          onOpen={() => setMobileDrawerOpen(true)}
          onClose={() => setMobileDrawerOpen(false)}
          sx={{
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              bgcolor: "background.paper",
              pt: "64px",
            },
          }}
        >
          {drawerContent}
        </SwipeableDrawer>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: "64px",
          ml: 0,
          bgcolor: "background.default",
          minHeight: "calc(100vh - 64px)",
        }}
        className="p-4 md:p-6 overflow-auto"
      >
        {!selectedConnection && activeView === "dashboard" && (
          <Box className="flex flex-col gap-4">
            <Typography variant="h5" fontWeight={700}>
              Dashboard
            </Typography>
            <DashboardMetrics userId={user.uid} connections={connections} />
          </Box>
        )}

        {!selectedConnection && activeView === "templates" && (
          <Box className="flex flex-col gap-4">
            <Typography variant="h5" fontWeight={700}>
              Templates
            </Typography>
            <TemplatesList userId={user.uid} />
          </Box>
        )}

        {selectedConnection && (
          <Box className="flex flex-col gap-4">
            <Tabs
              value={mainTab}
              onChange={(_, val: MainTab) => setMainTab(val)}
              textColor="primary"
              indicatorColor="primary"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab value="contacts" label="Contatos" />
              <Tab value="messages" label="Mensagens" />
            </Tabs>

            {mainTab === "contacts" && (
              <ContactsList
                userId={user.uid}
                connectionId={selectedConnection.id}
                connectionName={selectedConnection.name}
              />
            )}
            {mainTab === "messages" && (
              <MessagesList
                userId={user.uid}
                connectionId={selectedConnection.id}
                connectionName={selectedConnection.name}
                connection={selectedConnection}
                userName={user.displayName ?? user.email ?? "Usuário"}
              />
            )}
          </Box>
        )}
      </Box>

      <ChangePasswordDialog
        open={changePasswordOpen}
        user={user}
        onClose={() => setChangePasswordOpen(false)}
      />

      <Dialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Sair da conta</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja sair? Você precisará fazer login novamente
            para acessar.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutOpen(false)} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={logOut}
            variant="contained"
            color="error"
            startIcon={<LogoutIcon />}
          >
            Sair
          </Button>
        </DialogActions>
      </Dialog>

      <OnboardingWizard
        open={showOnboarding}
        userId={user.uid}
        onFinish={finishOnboarding}
      />
    </Box>
  );
};
