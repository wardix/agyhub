import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout/Layout'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { useAuth } from './hooks/useAuth'
import {
  ConversationPage,
  ExplorePage,
  HomePage,
  LoginPage,
  ProfilePage,
  RegisterPage,
  SettingsPage,
  UploadPage,
} from './pages'
import './index.css'

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

// Ensure AuthContext is loaded before routing decisions
const AppRoutes = () => {
  const { isLoading } = useAuth()

  if (isLoading) {
    return <div>Initializing...</div>
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route path="conversations/:id" element={<ConversationPage />} />
        <Route path="profile/:username" element={<ProfilePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route
          path="upload"
          element={
            <ProtectedRoute>
              <UploadPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  )
}

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export { App }
