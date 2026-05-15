import { AuthProvider, useAuth } from '@/hooks/use-auth'
import { AuthPage } from '@/pages/auth-page'
import { DashboardPage } from '@/pages/dashboard-page'
import { PageLoader } from '@/components/shared/page-loader'

const AppContent = () => {
  const { user, loading } = useAuth()

  if (loading) return <PageLoader />
  if (!user) return <AuthPage />
  return <DashboardPage user={user} />
}

export const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
)
