import { Box, Typography } from '@mui/material'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => (
  <Box className="flex flex-col items-center justify-center py-16 gap-3 text-center">
    <Box className="text-slate-300">{icon}</Box>
    <Typography variant="h6" color="text.secondary">
      {title}
    </Typography>
    <Typography variant="body2" color="text.disabled">
      {description}
    </Typography>
    {action && <Box className="mt-2">{action}</Box>}
  </Box>
)
