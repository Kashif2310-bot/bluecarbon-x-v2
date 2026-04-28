/**
 * Environment Configuration for BlueCarbon-X
 * Handles API keys and environment variables cleanly.
 *
 * For local development, create a .env file in the project root:
 *   VITE_GEMINI_API_KEY=your_gemini_api_key_here
 *
 * For production (Firebase), set the key in your CI/CD or build env.
 */

export const ENV = {
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || '',
  IS_PRODUCTION: import.meta.env.PROD,
  MODE: import.meta.env.MODE,
}

export function hasGeminiKey() {
  return Boolean(ENV.GEMINI_API_KEY && ENV.GEMINI_API_KEY.trim().length > 0)
}
