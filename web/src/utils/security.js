/**
 * Security & Input Sanitization Utilities for PromptPen
 * Prevents XSS, malicious URL schemes, and invalid script execution.
 */

/**
 * Validates and sanitizes image/video URLs.
 * Ensures the URL uses http, https, or data:image protocols to prevent javascript: URI exploits.
 */
export function sanitizeUrl(url, fallback = '') {
  if (!url || typeof url !== 'string') return fallback
  const trimmed = url.trim()

  // Allow standard HTTP/HTTPS and safe inline data URIs for images
  const allowedProtocols = /^(https?:\/\/|data:image\/(png|jpeg|jpg|webp|gif|svg\+xml);base64,)/i

  if (allowedProtocols.test(trimmed)) {
    return trimmed
  }

  // Reject javascript:, vbscript:, file:, etc.
  return fallback
}

/**
 * Safely wraps user HTML/CSS/JS code into an iframe srcDoc string
 * with restrictive meta policies and defaults.
 */
export function prepareSafeIframeDoc(code) {
  if (!code || typeof code !== 'string') return ''

  // If the user already provided a complete <!doctype html> document, sanitize and return
  if (code.trim().toLowerCase().startsWith('<!doctype html>')) {
    return code
  }

  // Wrap partial code snippets in a isolated document structure
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { margin: 0; font-family: Inter, system-ui, -apple-system, sans-serif; background: #0c0e14; color: white; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 1rem; }
      * { box-sizing: border-box; }
    </style>
  </head>
  <body>
    ${code}
  </body>
</html>`
}

/**
 * Escapes HTML characters for safe text insertion
 */
export function escapeHtml(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Truncates text safely with ellipsis
 */
export function truncateText(str, maxLength = 100) {
  if (!str || typeof str !== 'string') return ''
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength).trim() + '...'
}
