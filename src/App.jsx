import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AppProvider, useApp } from './context/AppContext'
import ParticleBackground from './components/shared/ParticleBackground'

// Landing
import Landing from './pages/landing/Landing'

// Community
import CommunityLayout from './pages/community/CommunityLayout'
import CommunityDashboard from './pages/community/CommunityDashboard'
import UploadProof from './pages/community/UploadProof'
import MySubmissions from './pages/community/MySubmissions'
import CommunityWalletPage from './pages/community/CommunityWalletPage'
import CommunityMarketplace from './pages/community/CommunityMarketplace'

// Admin
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import ReviewSubmission from './pages/admin/ReviewSubmission'
import TransparencyPanel from './pages/admin/TransparencyPanel'
import RiskControl from './pages/admin/RiskControl'

// Industry
import IndustryLayout from './pages/industry/IndustryLayout'
import IndustryDashboard from './pages/industry/IndustryDashboard'
import BrowseMarketplace from './pages/industry/BrowseMarketplace'
import Portfolio from './pages/industry/Portfolio'

// AI Analysis
import Analysis from './pages/analysis/Analysis'

import './App.css'

function AppRoutes() {
  const { currentRole } = useApp()

  return (
    <div className="App">
      {/* Particle background on dashboard pages */}
      {currentRole && <ParticleBackground />}

      <AnimatePresence mode="wait">
        <Routes>
          {/* Landing / Role Selector */}
          <Route path="/" element={<Landing />} />

          {/* Community Dashboard */}
          <Route path="/community" element={<CommunityLayout />}>
            <Route index element={<CommunityDashboard />} />
            <Route path="upload" element={<UploadProof />} />
            <Route path="submissions" element={<MySubmissions />} />
            <Route path="wallet" element={<CommunityWalletPage />} />
            <Route path="marketplace" element={<CommunityMarketplace />} />
          </Route>

          {/* Admin Dashboard */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="review" element={<ReviewSubmission />} />
            <Route path="transparency" element={<TransparencyPanel />} />
            <Route path="risk" element={<RiskControl />} />
          </Route>

          {/* Industry Dashboard */}
          <Route path="/industry" element={<IndustryLayout />}>
            <Route index element={<IndustryDashboard />} />
            <Route path="marketplace" element={<BrowseMarketplace />} />
            <Route path="portfolio" element={<Portfolio />} />
          </Route>

          {/* AI Analysis (standalone) */}
          <Route path="/analysis" element={<Analysis />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  )
}

function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  )
}

export default App
