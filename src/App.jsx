import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'

import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import DashboardPage from '@/pages/DashboardPage'
import RoutinePage from '@/pages/RoutinePage'
import TrainingMapsPage from '@/pages/TrainingMapsPage'
import ProgressPage from '@/pages/ProgressPage'
import ClipAnalysisPage from '@/pages/ClipAnalysisPage'
import CoachPage from '@/pages/CoachPage'
import ProfilePage from '@/pages/ProfilePage'
import AdminPage from '@/pages/AdminPage'
import SubscribePage from '@/pages/SubscribePage'
import SubscribeSuccessPage from '@/pages/SubscribeSuccessPage'
import OnboardingPage from '@/pages/OnboardingPage'
import ChallengePage from '@/pages/ChallengePage'
import SessionTimerPage from '@/pages/SessionTimerPage'
import JournalPage from '@/pages/JournalPage'
import RankedTrackerPage from '@/pages/RankedTrackerPage'
import MentalGamePage from '@/pages/MentalGamePage'
import TournamentPrepPage from '@/pages/TournamentPrepPage'
import VODReviewPage from '@/pages/VODReviewPage'
import KeybindsPage from '@/pages/KeybindsPage'
import MetaPage from '@/pages/MetaPage'
import ReferralPage from '@/pages/ReferralPage'
import Layout from '@/components/Layout'
import LoadingScreen from '@/components/LoadingScreen'

function ProtectedRoute({ children, adminOnly = false, tier = null }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />

  if (!user) {
    console.log('[Auth] Blocked unauthenticated access — redirecting to login')
    return <Navigate to="/login" replace />
  }

  if (adminOnly && user.role !== 'admin') {
    console.log(`[Auth] Blocked user id=${user.id} from admin-only route`)
    return <Navigate to="/dashboard" replace />
  }

  if (user.role !== 'admin' && !user.tier) {
    console.log(`[Auth] Blocked user id=${user.id} — no active subscription, redirecting to /subscribe`)
    return <Navigate to="/subscribe" replace />
  }

  if (tier === 'extreme' && user.tier !== 'extreme' && user.role !== 'admin') {
    console.log(`[Auth] Blocked user id=${user.id} (tier: ${user.tier}) from extreme-only route`)
    return <Navigate to="/subscribe?upgrade=extreme" replace />
  }

  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (user?.tier) return <Navigate to="/dashboard" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
      <Route path="/subscribe" element={<SubscribePage />} />
      <Route path="/subscribe/success" element={<SubscribeSuccessPage />} />
      <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/challenges" element={<ChallengePage />} />
        <Route path="/routine" element={<RoutinePage />} />
        <Route path="/maps" element={<TrainingMapsPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/timer" element={<SessionTimerPage />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/ranked" element={<RankedTrackerPage />} />
        <Route path="/mental-game" element={<MentalGamePage />} />
        <Route path="/tournament-prep" element={<TournamentPrepPage />} />
        <Route path="/meta" element={<MetaPage />} />
        <Route path="/vod-review" element={<VODReviewPage />} />
        <Route path="/keybinds" element={<KeybindsPage />} />
        <Route path="/referral" element={<ReferralPage />} />
        <Route path="/clips" element={<ProtectedRoute tier="extreme"><ClipAnalysisPage /></ProtectedRoute>} />
        <Route path="/coach" element={<ProtectedRoute tier="extreme"><CoachPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: '#0a0f1a', color: '#e2e8f0', border: '1px solid rgba(0,245,255,0.2)' },
              success: { iconTheme: { primary: '#00f5ff', secondary: '#000' } },
              error: { iconTheme: { primary: '#ec4899', secondary: '#000' } },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
