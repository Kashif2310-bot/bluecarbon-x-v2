/**
 * Gemini AI Service — BlueCarbon-X
 * Handles image analysis using Google Gemini's multimodal capabilities.
 * Provides vegetation presence detection and environmental assessment.
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { ENV, hasGeminiKey } from '../config/env'

// Singleton instance (lazy-initialized)
let genAI = null
let model = null

function getModel() {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY)
    model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
  }
  return model
}

/**
 * Convert a File object to a generative AI Part for Gemini.
 * @param {File} file - The image file to convert
 * @returns {Promise<{inlineData: {data: string, mimeType: string}}>}
 */
async function fileToGenerativePart(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1]
      resolve({
        inlineData: {
          data: base64,
          mimeType: file.type,
        },
      })
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Analyze an uploaded image using Google Gemini for vegetation presence.
 *
 * @param {File} imageFile - The image file to analyze
 * @returns {Promise<{
 *   vegetationLevel: 'low' | 'medium' | 'high',
 *   insight: string,
 *   confidence: string,
 *   status: 'Verified' | 'Needs Review',
 *   raw: string
 * }>}
 */
export async function analyzeImageWithGemini(imageFile) {
  if (!hasGeminiKey()) {
    throw new Error('Gemini API key not configured. Set VITE_GEMINI_API_KEY in your .env file.')
  }

  const geminiModel = getModel()
  const imagePart = await fileToGenerativePart(imageFile)

  const prompt = `You are an environmental analysis AI for a blue carbon restoration platform.

Analyze this image and respond ONLY in the following JSON format (no markdown, no code fences, just raw JSON):

{
  "vegetationLevel": "<low | medium | high>",
  "insight": "<1-2 sentence explanation of what you observe regarding vegetation, ecosystem health, or environmental condition>",
  "confidence": "<1 sentence reasoning about your confidence in this assessment>",
  "status": "<Verified | Needs Review>"
}

Rules:
- "vegetationLevel": Assess the density and health of visible vegetation. "low" = sparse/barren, "medium" = moderate coverage, "high" = dense/lush vegetation.
- "insight": Be specific about what you see. Mention plant types if identifiable (mangroves, seagrass, wetland vegetation, etc.).
- "confidence": Explain briefly why you are confident or uncertain.
- "status": Set to "Verified" if vegetation is clearly present and identifiable. Set to "Needs Review" if the image is ambiguous, low quality, or shows minimal vegetation.

Respond with valid JSON only.`

  const result = await geminiModel.generateContent([prompt, imagePart])
  const response = await result.response
  const text = response.text()

  // Parse the JSON response from Gemini
  try {
    // Clean potential markdown code fences
    const cleaned = text
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim()

    const parsed = JSON.parse(cleaned)

    return {
      vegetationLevel: parsed.vegetationLevel || 'medium',
      insight: parsed.insight || 'Analysis completed.',
      confidence: parsed.confidence || 'Assessment based on visual analysis.',
      status: parsed.status || 'Needs Review',
      raw: text,
    }
  } catch {
    // If JSON parsing fails, extract what we can from raw text
    console.warn('Gemini response was not valid JSON, extracting manually:', text)

    const levelMatch = text.match(/vegetationLevel["\s:]+["']?(low|medium|high)["']?/i)
    const insightMatch = text.match(/insight["\s:]+["'](.+?)["']/i)

    return {
      vegetationLevel: levelMatch ? levelMatch[1].toLowerCase() : 'medium',
      insight: insightMatch ? insightMatch[1] : 'Environmental analysis completed. Review image for details.',
      confidence: 'Automated assessment — manual verification recommended.',
      status: 'Needs Review',
      raw: text,
    }
  }
}
