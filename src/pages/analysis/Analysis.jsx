import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import './Analysis.css'

const SAMPLE_PROMPTS = [
  'Mangrove restoration in Sundarbans — 15 hectares',
  'Seagrass replanting near coastal Tamil Nadu',
  'Wetland recovery project at Chilika Lake, Odisha',
  'Coral reef buffer zone in Andaman Islands',
]

const LOADING_STEPS = [
  { label: 'Connecting to AI agents...', duration: 2000 },
  { label: 'Carbon Analyst evaluating project...', duration: 5000 },
  { label: 'Fraud Detector assessing risk...', duration: 5000 },
  { label: 'Compiling results...', duration: 2000 },
]

/**
 * Lightweight markdown → HTML for AI output.
 * Handles headings, bold, lists, hr, and line breaks.
 */
function renderMarkdown(text) {
  if (!text) return ''
  const lines = text.split('\n')
  let html = ''
  let inList = false

  for (const line of lines) {
    let trimmed = line.trimEnd()

    // Horizontal rule
    if (/^---+$/.test(trimmed)) {
      if (inList) { html += '</ul>'; inList = false }
      html += '<hr class="md-hr" />'
      continue
    }

    // Headings
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/)
    if (headingMatch) {
      if (inList) { html += '</ul>'; inList = false }
      const level = headingMatch[1].length
      const content = headingMatch[2].replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      html += `<h${level + 2} class="md-h md-h${level}">${content}</h${level + 2}>`
      continue
    }

    // List items
    const listMatch = trimmed.match(/^[-*]\s+(.+)$/)
    const numListMatch = trimmed.match(/^\d+\.\s+(.+)$/)
    if (listMatch || numListMatch) {
      if (!inList) { html += '<ul class="md-list">'; inList = true }
      const content = (listMatch?.[1] || numListMatch?.[1])
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      html += `<li>${content}</li>`
      continue
    }

    // Close open list
    if (inList && trimmed === '') {
      html += '</ul>'
      inList = false
      html += '<div class="md-spacer"></div>'
      continue
    }

    // Regular text
    if (trimmed) {
      if (inList) { html += '</ul>'; inList = false }
      const content = trimmed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      html += `<p class="md-p">${content}</p>`
    } else {
      html += '<div class="md-spacer"></div>'
    }
  }

  if (inList) html += '</ul>'
  return html
}

function RenderedContent({ text }) {
  const html = renderMarkdown(text)
  return (
    <div
      className="analysis-result-card__content analysis-result-card__content--rendered"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

function TrustScoreGauge({ score }) {
  const radius = 62
  const circumference = 2 * Math.PI * radius
  const progress = ((100 - score) / 100) * circumference

  const getColor = (s) => {
    if (s >= 75) return '#00E59B'
    if (s >= 50) return '#F59E0B'
    return '#EF4444'
  }

  const getVerdict = (s) => {
    if (s >= 85) return { text: 'Highly Trustworthy', class: 'high', icon: '✅' }
    if (s >= 70) return { text: 'Trustworthy', class: 'high', icon: '🟢' }
    if (s >= 50) return { text: 'Moderate Risk', class: 'medium', icon: '🟡' }
    if (s >= 30) return { text: 'High Risk', class: 'low', icon: '🟠' }
    return { text: 'Very High Risk', class: 'low', icon: '🔴' }
  }

  const color = getColor(score)
  const verdict = getVerdict(score)

  return (
    <div className="trust-score-display">
      <div className="trust-score-ring" style={{ '--score-color': color }}>
        <svg viewBox="0 0 140 140">
          <circle className="trust-score-ring__bg" cx="70" cy="70" r={radius} />
          <motion.circle
            className="trust-score-ring__fill"
            cx="70"
            cy="70"
            r={radius}
            stroke={color}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: progress }}
            transition={{ duration: 1.5, ease: [0.34, 1.56, 0.64, 1], delay: 0.3 }}
          />
        </svg>
        <div className="trust-score-ring__value">
          <motion.div
            className="trust-score-ring__number"
            style={{ color }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          >
            {score}
          </motion.div>
          <div className="trust-score-ring__label">Trust Score</div>
        </div>
      </div>
      <motion.div
        className={`trust-score-verdict trust-score-verdict--${verdict.class}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <span>{verdict.icon}</span>
        <span>{verdict.text}</span>
      </motion.div>
    </div>
  )
}

function LoadingState() {
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    let elapsed = 0
    const timers = LOADING_STEPS.map((step, i) => {
      const timer = setTimeout(() => setActiveStep(i), elapsed)
      elapsed += step.duration
      return timer
    })
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <motion.div
      className="analysis-loading"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="analysis-loading__spinner" />
      <div className="analysis-loading__text">AI Agents Working...</div>
      <div className="analysis-loading__sub">
        Our Carbon Analyst and Fraud Detector agents are analyzing your project. This may take 30–60 seconds.
      </div>
      <div className="analysis-loading__steps">
        {LOADING_STEPS.map((step, i) => (
          <div
            key={i}
            className={`analysis-loading__step ${
              i === activeStep ? 'analysis-loading__step--active' :
              i < activeStep ? 'analysis-loading__step--done' : ''
            }`}
          >
            <span className="analysis-loading__step-icon">
              {i < activeStep ? '✓' : i === activeStep ? '⟳' : '○'}
            </span>
            <span>{step.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function ResultCard({ icon, iconClass, label, accentClass, content, children, delay = 0 }) {
  return (
    <motion.div
      className="analysis-result-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className={`analysis-result-card__accent ${accentClass}`} />
      <div className="analysis-result-card__body">
        <div className="analysis-result-card__header">
          <div className={`analysis-result-card__icon ${iconClass}`}>
            {icon}
          </div>
          <div className="analysis-result-card__label">{label}</div>
        </div>
        {children || (
          <RenderedContent text={content} />
        )}
      </div>
    </motion.div>
  )
}

export default function Analysis() {
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const textareaRef = useRef(null)

  const handleAnalyze = async () => {
    if (!input.trim() || loading) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input.trim() }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Server error (${response.status})`)
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      console.error('Analysis failed:', err)
      setError(
        err.message === 'Failed to fetch'
          ? 'Cannot connect to the AI server. Make sure the backend is running on port 8000.'
          : err.message
      )
    } finally {
      setLoading(false)
    }
  }

  const handleSampleClick = (prompt) => {
    setInput(prompt)
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleAnalyze()
    }
  }

  return (
    <div className="analysis-page">
      {/* Background orbs */}
      <div className="analysis-orb analysis-orb--1" />
      <div className="analysis-orb analysis-orb--2" />
      <div className="analysis-orb analysis-orb--3" />

      {/* Back button */}
      <motion.button
        className="analysis-back"
        onClick={() => navigate(-1)}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        id="analysis-back-btn"
      >
        <span className="analysis-back__arrow">←</span>
        <span>Back</span>
      </motion.button>

      <div className="analysis-container">
        {/* Header */}
        <motion.div
          className="analysis-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="analysis-header__icon">🧠</span>
          <h1 className="analysis-header__title">
            <span className="text-gradient">AI-Powered</span> Analysis
          </h1>
          <p className="analysis-header__subtitle">
            Describe your carbon restoration project below. Our AI agents — a Carbon Analyst and
            Fraud Detector — will evaluate it and return a comprehensive report.
          </p>
        </motion.div>

        {/* Input Panel */}
        <motion.div
          className="analysis-input-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <div className="analysis-input-label">
            <span className="analysis-input-label__dot" />
            <span>Project Description</span>
          </div>
          <textarea
            ref={textareaRef}
            className="analysis-textarea"
            placeholder={`Describe your carbon restoration project in detail...\n\nExample: "We are restoring 12 hectares of mangrove forest in the Sundarbans region. The project involves replanting Rhizophora and Avicennia species across degraded coastal areas. We have satellite imagery from 2023-2025 showing vegetation recovery, and local community members are involved in monitoring."`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            id="analysis-textarea"
          />

          {/* Sample prompts */}
          <div className="analysis-samples">
            <div className="analysis-samples__title">Try a sample</div>
            <div className="analysis-samples__list">
              {SAMPLE_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  className="analysis-sample-chip"
                  onClick={() => handleSampleClick(prompt)}
                  disabled={loading}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="analysis-input-footer">
            <span className="analysis-char-count">
              {input.length} characters
              {input.length > 0 && ' • Ctrl+Enter to analyze'}
            </span>
            <button
              className="analysis-submit-btn"
              onClick={handleAnalyze}
              disabled={!input.trim() || loading}
              id="analysis-submit-btn"
            >
              {loading ? (
                <>
                  <span className="analysis-loading__spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <span className="analysis-submit-btn__icon">🔬</span>
                  <span>Analyze Project</span>
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Loading State */}
        <AnimatePresence>
          {loading && <LoadingState />}
        </AnimatePresence>

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="analysis-error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="analysis-error__header">
                <span>❌</span>
                <span className="analysis-error__title">Analysis Failed</span>
              </div>
              <p className="analysis-error__message">{error}</p>
              <button className="analysis-error__retry" onClick={handleAnalyze}>
                🔄 Retry Analysis
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div
              className="analysis-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                className="analysis-results__title"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <span>📋</span>
                <span>Analysis Results</span>
              </motion.div>

              <div className="analysis-results__grid">
                {/* Carbon Credit Estimation */}
                <ResultCard
                  icon="🌿"
                  iconClass="analysis-result-card__icon--carbon"
                  label="Carbon Credit Estimation"
                  accentClass="analysis-result-card__accent--carbon"
                  content={result.carbon_analysis || 'No carbon analysis data available.'}
                  delay={0.1}
                />

                {/* Fraud Risk Analysis */}
                <ResultCard
                  icon="🛡️"
                  iconClass="analysis-result-card__icon--fraud"
                  label="Fraud Risk Analysis"
                  accentClass="analysis-result-card__accent--fraud"
                  content={result.fraud_analysis || 'No fraud analysis data available.'}
                  delay={0.3}
                />

                {/* Trust Score */}
                <ResultCard
                  icon="📊"
                  iconClass="analysis-result-card__icon--trust"
                  label="Trust Score"
                  accentClass="analysis-result-card__accent--trust"
                  delay={0.5}
                >
                  <TrustScoreGauge score={result.trust_score ?? 0} />
                </ResultCard>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
