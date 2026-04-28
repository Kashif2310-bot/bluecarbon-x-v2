import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useApp } from '../../context/AppContext'
import GlassCard from '../../components/shared/GlassCard'
import GeminiAnalysis from '../../components/shared/GeminiAnalysis'
import { analyzeImageWithGemini } from '../../ai/geminiService'
import { hasGeminiKey } from '../../config/env'
import './UploadProof.css'

export default function UploadProof() {
  const navigate = useNavigate()
  const { addProject } = useApp()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  // Gemini AI analysis state
  const [geminiResult, setGeminiResult] = useState(null)
  const [geminiLoading, setGeminiLoading] = useState(false)
  const [geminiError, setGeminiError] = useState(null)

  const [form, setForm] = useState({
    name: '', description: '', location: '',
    lat: '', lng: '', images: [], video: null,
  })

  const handleInput = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  /**
   * Trigger Gemini analysis when a new image is added.
   * Only analyzes the first image (primary evidence).
   */
  const triggerGeminiAnalysis = async (imageFile) => {
    if (!hasGeminiKey()) {
      setGeminiError('Gemini API key not configured. Set VITE_GEMINI_API_KEY in .env')
      return
    }

    setGeminiLoading(true)
    setGeminiError(null)
    setGeminiResult(null)

    try {
      const result = await analyzeImageWithGemini(imageFile)
      setGeminiResult(result)
    } catch (err) {
      console.error('Gemini analysis failed:', err)
      setGeminiError(err.message || 'AI analysis failed. Please try again.')
    } finally {
      setGeminiLoading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    if (files.length) {
      const newImages = [...form.images, ...files].slice(0, 5)
      setForm(prev => ({ ...prev, images: newImages }))
      // Analyze the first new image if no analysis exists yet
      if (!geminiResult && !geminiLoading) {
        triggerGeminiAnalysis(files[0])
      }
    }
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'))
    if (files.length) {
      const newImages = [...form.images, ...files].slice(0, 5)
      setForm(prev => ({ ...prev, images: newImages }))
      // Analyze the first new image if no analysis exists yet
      if (!geminiResult && !geminiLoading) {
        triggerGeminiAnalysis(files[0])
      }
    }
  }

  const handleVideoSelect = (e) => {
    const file = e.target.files[0]
    if (file) setForm(prev => ({ ...prev, video: file }))
  }

  const removeImage = (idx) => {
    const newImages = form.images.filter((_, i) => i !== idx)
    setForm(prev => ({ ...prev, images: newImages }))
    // Clear analysis if all images removed
    if (newImages.length === 0) {
      setGeminiResult(null)
      setGeminiError(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.images.length === 0) { alert('Please upload at least one image'); return }
    if (!form.name.trim()) { alert('Please enter a project name'); return }

    setIsSubmitting(true)
    await new Promise(r => setTimeout(r, 1500))

    // Use Gemini results if available, otherwise fall back to random values
    const vegetationScore = geminiResult
      ? (geminiResult.vegetationLevel === 'high' ? (Math.random() * 10 + 85).toFixed(1) :
         geminiResult.vegetationLevel === 'medium' ? (Math.random() * 20 + 50).toFixed(1) :
         (Math.random() * 20 + 15).toFixed(1))
      : (Math.random() * 30 + 65).toFixed(1)

    const projectId = addProject({
      name: form.name,
      description: form.description,
      location: {
        lat: parseFloat(form.lat) || 20.5937,
        lng: parseFloat(form.lng) || 78.9629,
        name: form.location || 'India',
      },
      communityId: 'comm-user',
      communityName: 'Your Community',
      images: form.images.map(f => f.name),
      videoFile: form.video?.name || null,
      analysis: {
        vegetationScore: vegetationScore,
        biomassDetected: (Math.random() * 40 + 15).toFixed(1),
        carbonRestored: Math.floor(Math.random() * 180 + 100),
        confidence: (Math.random() * 10 + 82).toFixed(1),
        hasVegetation: geminiResult ? geminiResult.vegetationLevel !== 'low' : true,
        speciesDetected: ['Rhizophora sp.', 'Avicennia sp.'],
        healthIndex: (Math.random() * 0.25 + 0.7).toFixed(2),
      },
      geminiAnalysis: geminiResult || null,
      afterImage: { name: form.images[0]?.name, size: form.images[0]?.size },
    })

    setIsSubmitting(false)
    navigate('/community/submissions')
  }

  return (
    <div className="upload-page">
      <div className="dashboard-page-header">
        <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          Upload Restoration Proof
        </motion.h1>
        <p>Submit geo-tagged evidence of your blue carbon restoration project</p>
      </div>

      <form onSubmit={handleSubmit} className="upload-form">
        <div className="upload-form__grid">
          {/* Left: Project info */}
          <GlassCard delay={0.1} className="upload-form__section">
            <h3 className="upload-form__section-title">📋 Project Information</h3>

            <div className="form-group">
              <label htmlFor="upload-name">Project Name *</label>
              <input id="upload-name" name="name" value={form.name} onChange={handleInput} placeholder="e.g. Sundarbans Mangrove Belt" required />
            </div>

            <div className="form-group">
              <label htmlFor="upload-desc">Description</label>
              <textarea id="upload-desc" name="description" value={form.description} onChange={handleInput} placeholder="Describe the restoration effort, area, and species..." rows="4" />
            </div>

            <div className="form-group">
              <label htmlFor="upload-location">Location Name</label>
              <input id="upload-location" name="location" value={form.location} onChange={handleInput} placeholder="e.g. Sundarbans, West Bengal" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="upload-lat">Latitude</label>
                <input id="upload-lat" name="lat" type="number" step="any" value={form.lat} onChange={handleInput} placeholder="e.g. 21.9497" />
              </div>
              <div className="form-group">
                <label htmlFor="upload-lng">Longitude</label>
                <input id="upload-lng" name="lng" type="number" step="any" value={form.lng} onChange={handleInput} placeholder="e.g. 89.1833" />
              </div>
            </div>
          </GlassCard>

          {/* Right: Media upload + Gemini Analysis */}
          <div className="upload-form__right-column">
            <GlassCard delay={0.2} className="upload-form__section">
              <h3 className="upload-form__section-title">📸 Media Evidence</h3>

              {/* Drop zone */}
              <div
                className={`upload-dropzone ${dragActive ? 'upload-dropzone--active' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input').click()}
              >
                <input id="file-input" type="file" accept="image/*" multiple onChange={handleFileSelect} style={{ display: 'none' }} />
                <div className="upload-dropzone__icon">📤</div>
                <p className="upload-dropzone__text">Drag & drop geo-tagged images here</p>
                <p className="upload-dropzone__hint">or click to browse • Max 5 images</p>
              </div>

              {/* Preview */}
              {form.images.length > 0 && (
                <div className="upload-previews">
                  {form.images.map((file, i) => (
                    <div key={i} className="upload-preview">
                      <img src={URL.createObjectURL(file)} alt={file.name} />
                      <button type="button" className="upload-preview__remove" onClick={() => removeImage(i)}>✕</button>
                      <span className="upload-preview__name">{file.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Video */}
              <div className="form-group" style={{ marginTop: 'var(--space-lg)' }}>
                <label htmlFor="upload-video">Video Evidence (Optional)</label>
                <input id="upload-video" type="file" accept="video/*" onChange={handleVideoSelect} />
                {form.video && <p className="upload-video-name">📹 {form.video.name}</p>}
              </div>
            </GlassCard>

            {/* Gemini AI Analysis Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <GeminiAnalysis
                analysis={geminiResult}
                loading={geminiLoading}
                error={geminiError}
              />
            </motion.div>
          </div>
        </div>

        {/* Submit */}
        <motion.div className="upload-submit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting || form.images.length === 0}>
            {isSubmitting ? (
              <><span className="spinner" /> Submitting...</>
            ) : (
              <>🚀 Submit for AI Analysis & Review</>
            )}
          </button>
          <p className="upload-submit__hint">
            Your submission will be analyzed by AI and then reviewed by the multi-signature governance panel.
          </p>
        </motion.div>
      </form>
    </div>
  )
}
