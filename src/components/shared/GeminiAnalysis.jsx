import { motion, AnimatePresence } from 'framer-motion'
import './GeminiAnalysis.css'

/**
 * GeminiAnalysis — Displays AI Environmental Analysis results
 *
 * Props:
 * - analysis: { vegetationLevel, insight, confidence, status } | null
 * - loading: boolean
 * - error: string | null
 */
export default function GeminiAnalysis({ analysis, loading, error }) {
  const getLevelConfig = (level) => {
    switch (level) {
      case 'high':
        return { icon: '🌿', color: '#00E59B', label: 'High', barWidth: '90%' }
      case 'medium':
        return { icon: '🌱', color: '#F59E0B', label: 'Medium', barWidth: '55%' }
      case 'low':
        return { icon: '🏜️', color: '#EF4444', label: 'Low', barWidth: '25%' }
      default:
        return { icon: '❓', color: '#64748B', label: 'Unknown', barWidth: '0%' }
    }
  }

  const getStatusConfig = (status) => {
    if (status === 'Verified') {
      return { icon: '✅', className: 'gemini-status--verified' }
    }
    return { icon: '🔍', className: 'gemini-status--review' }
  }

  return (
    <div className="gemini-analysis" id="gemini-analysis-section">
      {/* Header */}
      <div className="gemini-analysis__header">
        <div className="gemini-analysis__header-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <h3 className="gemini-analysis__title">AI Environmental Analysis</h3>
          <p className="gemini-analysis__powered">Powered by Google Gemini</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Loading State */}
        {loading && (
          <motion.div
            key="loading"
            className="gemini-analysis__loading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="gemini-analysis__loading-spinner" />
            <div className="gemini-analysis__loading-text">
              <span>Analyzing with Gemini AI</span>
              <span className="gemini-analysis__loading-dots">
                <span>.</span><span>.</span><span>.</span>
              </span>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {error && !loading && (
          <motion.div
            key="error"
            className="gemini-analysis__error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <span className="gemini-analysis__error-icon">⚠️</span>
            <span className="gemini-analysis__error-text">{error}</span>
          </motion.div>
        )}

        {/* Results */}
        {analysis && !loading && !error && (
          <motion.div
            key="results"
            className="gemini-analysis__results"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {(() => {
              const levelConfig = getLevelConfig(analysis.vegetationLevel)
              const statusConfig = getStatusConfig(analysis.status)
              return (
                <>
                  {/* Vegetation Level */}
                  <div className="gemini-metric">
                    <div className="gemini-metric__label">Vegetation Presence</div>
                    <div className="gemini-metric__value-row">
                      <span className="gemini-metric__icon">{levelConfig.icon}</span>
                      <span className="gemini-metric__value" style={{ color: levelConfig.color }}>
                        {levelConfig.label}
                      </span>
                    </div>
                    <div className="gemini-metric__bar">
                      <motion.div
                        className="gemini-metric__bar-fill"
                        style={{ background: levelConfig.color }}
                        initial={{ width: '0%' }}
                        animate={{ width: levelConfig.barWidth }}
                        transition={{ duration: 1, delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
                      />
                    </div>
                  </div>

                  {/* AI Insight */}
                  <div className="gemini-insight">
                    <div className="gemini-insight__label">AI Insight</div>
                    <p className="gemini-insight__text">{analysis.insight}</p>
                  </div>

                  {/* Confidence */}
                  <div className="gemini-confidence">
                    <div className="gemini-confidence__label">Confidence Reasoning</div>
                    <p className="gemini-confidence__text">{analysis.confidence}</p>
                  </div>

                  {/* Status */}
                  <div className="gemini-status-row">
                    <span className="gemini-status-row__label">Status</span>
                    <span className={`gemini-status ${statusConfig.className}`}>
                      <span>{statusConfig.icon}</span>
                      <span>{analysis.status}</span>
                    </span>
                  </div>
                </>
              )
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state (no analysis yet) */}
      {!analysis && !loading && !error && (
        <div className="gemini-analysis__empty">
          <span className="gemini-analysis__empty-icon">🛰️</span>
          <p>Upload an image to receive AI-powered environmental analysis</p>
        </div>
      )}
    </div>
  )
}
