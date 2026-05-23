import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useApp } from '../../context/AppContext'
import './Sidebar.css'

const ROLE_NAV = {
  community: {
    title: 'Community',
    icon: '🌱',
    color: '#00E59B',
    items: [
      { path: '/community', icon: '📊', label: 'Dashboard', end: true },
      { path: '/community/upload', icon: '📤', label: 'Upload Proof' },
      { path: '/community/submissions', icon: '📋', label: 'My Submissions' },
      { path: '/community/wallet', icon: '💼', label: 'Wallet' },
      { path: '/community/marketplace', icon: '🏪', label: 'Marketplace' },
      { path: '/analysis', icon: '🤖', label: 'AI Analysis' },
    ],
  },
  admin: {
    title: 'Admin Panel',
    icon: '🛡️',
    color: '#00D4FF',
    items: [
      { path: '/admin', icon: '📊', label: 'Overview', end: true },
      { path: '/admin/review', icon: '📝', label: 'Review Queue' },
      { path: '/admin/transparency', icon: '🔍', label: 'Transparency' },
      { path: '/admin/risk', icon: '⚠️', label: 'Risk Control' },
      { path: '/analysis', icon: '🤖', label: 'AI Analysis' },
    ],
  },
  industry: {
    title: 'Industry',
    icon: '🏭',
    color: '#8B5CF6',
    items: [
      { path: '/industry', icon: '📊', label: 'Dashboard', end: true },
      { path: '/industry/marketplace', icon: '🏪', label: 'Marketplace' },
      { path: '/industry/portfolio', icon: '💎', label: 'Portfolio' },
      { path: '/analysis', icon: '🤖', label: 'AI Analysis' },
    ],
  },
}

export default function Sidebar({ role }) {
  const navigate = useNavigate()
  const { setCurrentRole } = useApp()
  const nav = ROLE_NAV[role]
  if (!nav) return null

  const handleExit = () => {
    setCurrentRole(null)
    navigate('/')
  }

  return (
    <motion.aside
      className="sidebar"
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="sidebar__header">
        <div className="sidebar__logo" onClick={() => navigate('/')}>
          <span className="sidebar__logo-icon">🌊</span>
          <span className="sidebar__logo-text">BlueCarbon-X</span>
        </div>
        <div className="sidebar__role-badge" style={{ '--role-color': nav.color }}>
          <span>{nav.icon}</span>
          <span>{nav.title}</span>
        </div>
      </div>

      <nav className="sidebar__nav">
        {nav.items.map((item, i) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
          >
            <span className="sidebar__link-icon">{item.icon}</span>
            <span className="sidebar__link-label">{item.label}</span>
            {/* Active indicator */}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <button className="sidebar__exit-btn" onClick={handleExit}>
          <span>← </span>
          <span>Switch Role</span>
        </button>
      </div>
    </motion.aside>
  )
}
