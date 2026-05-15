import { Box, Card, CardContent, Typography, LinearProgress, Chip } from '@mui/material'
import PeopleIcon from '@mui/icons-material/People'
import LinkIcon from '@mui/icons-material/Link'
import ScheduleIcon from '@mui/icons-material/Schedule'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import type { Connection } from '@/types'
import { useDashboardStats } from '@/hooks/use-dashboard-stats'

interface MetricCardProps {
  title: string
  value: number
  icon: React.ReactNode
  color: string
}

const MetricCard = ({ title, value, icon, color }: MetricCardProps) => (
  <Card sx={{ flex: '1 1 140px', minWidth: 0 }}>
    <CardContent className="flex items-center gap-3">
      <Box
        className="flex items-center justify-center rounded-xl p-2 shrink-0"
        sx={{ backgroundColor: `${color}18` }}
      >
        <Box sx={{ color }}>{icon}</Box>
      </Box>
      <Box className="min-w-0">
        <Typography variant="h5" fontWeight={700} noWrap>
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {title}
        </Typography>
      </Box>
    </CardContent>
  </Card>
)

interface DashboardMetricsProps {
  userId: string
  connections: Connection[]
}

export const DashboardMetrics = ({ userId, connections }: DashboardMetricsProps) => {
  const stats = useDashboardStats(userId, connections)
  const totalMessages = stats.totalScheduled + stats.totalSent
  const sentPercent = totalMessages > 0 ? Math.round((stats.totalSent / totalMessages) * 100) : 0

  return (
    <Box className="flex flex-col gap-4">
      <Box className="flex flex-wrap gap-3">
        <MetricCard title="Conexões" value={stats.totalConnections} icon={<LinkIcon />} color="#6366f1" />
        <MetricCard title="Contatos" value={stats.totalContacts} icon={<PeopleIcon />} color="#0ea5e9" />
        <MetricCard title="Agendadas" value={stats.totalScheduled} icon={<ScheduleIcon />} color="#f59e0b" />
        <MetricCard title="Enviadas" value={stats.totalSent} icon={<CheckCircleIcon />} color="#22c55e" />
      </Box>

      {totalMessages > 0 && (
        <Card>
          <CardContent className="flex flex-col gap-2">
            <Box className="flex items-center justify-between flex-wrap gap-2">
              <Typography variant="body2" fontWeight={600}>Taxa de envio</Typography>
              <Chip label={`${sentPercent}% enviadas`} size="small" color="success" variant="outlined" />
            </Box>
            <LinearProgress variant="determinate" value={sentPercent} sx={{ height: 8, borderRadius: 4 }} color="success" />
            <Typography variant="caption" color="text.secondary">
              {stats.totalSent} enviadas de {totalMessages} mensagens no total
            </Typography>
          </CardContent>
        </Card>
      )}

      {connections.length > 0 && (
        <Card>
          <CardContent className="flex flex-col gap-3">
            <Typography variant="body2" fontWeight={600}>Por conexão</Typography>
            {stats.statsByConnection.map((s, i) => (
              <Box
                key={s.connectionId}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 border-b border-slate-100 last:border-0"
              >
                <Typography variant="body2" fontWeight={500}>{connections[i]?.name}</Typography>
                <Box className="flex flex-wrap gap-1">
                  <Chip label={`${s.contactCount} contatos`} size="small" variant="outlined" />
                  <Chip label={`${s.scheduledCount} agendadas`} size="small" color="warning" variant="outlined" />
                  <Chip label={`${s.sentCount} enviadas`} size="small" color="success" variant="outlined" />
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>
      )}
    </Box>
  )
}
