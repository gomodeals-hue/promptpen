/**
 * PromptPen AI Service - Free AI API Integration
 * Supports NVIDIA AI (Default for AQ.Ab... keys), Google Gemini, Groq, OpenRouter
 */

const LOCAL_STORAGE_KEY_API = 'promptpen_ai_key'
const LOCAL_STORAGE_KEY_PROVIDER = 'promptpen_ai_provider'

export function getSavedApiKey() {
  return localStorage.getItem(LOCAL_STORAGE_KEY_API) || ''
}

export function getSavedProvider() {
  const key = getSavedApiKey()
  if (key.startsWith('AQ.Ab')) return 'nvidia'
  return localStorage.getItem(LOCAL_STORAGE_KEY_PROVIDER) || 'gemini'
}

export function saveAiSettings(key, provider = 'nvidia') {
  localStorage.setItem(LOCAL_STORAGE_KEY_API, key)
  localStorage.setItem(LOCAL_STORAGE_KEY_PROVIDER, provider)
}

/**
 * Call Free AI API (NVIDIA AI / Gemini / Groq / OpenRouter) to edit code and stitch prompts
 */
export async function processAiEdit({ originalPrompt, originalCode, userInstruction, apiKey, provider }) {
  const effectiveKey = apiKey || getSavedApiKey()
  if (!effectiveKey) {
    throw new Error('Please provide an AI provider API key in AI settings.')
  }
  const effectiveProvider = provider || (effectiveKey.startsWith('AQ.Ab') ? 'nvidia' : getSavedProvider())

  // System Prompt for UI Code Modification & Stitched Prompt Generation
  const systemPrompt = `You are PromptPen AI Engine. You are a senior frontend engineer.
The user wants to edit a UI component live.

[BASE PROMPT]:
${originalPrompt}

[EXISTING HTML/CSS CODE]:
${originalCode}

[USER EDIT REQUEST]:
${userInstruction}

INSTRUCTIONS:
1. Modify the HTML/CSS code to strictly fulfill the user request. Keep all other styles intact.
2. Generate an accurate STITCHED PROMPT combining the original base prompt with a clear list of the exact visual modifications made.
3. Return ONLY a valid JSON object strictly in this format (no markdown fence, raw JSON only):

{
  "editedCode": "<complete updated HTML code>",
  "stitchedPrompt": "<complete accurate stitched prompt>",
  "summary": "<short description of edits>"
}`

  const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

  // 1. NVIDIA AI API (Free Tier with Llama-3.1 405B / Nemotron 70B)
  if (effectiveProvider === 'nvidia' || effectiveKey.startsWith('AQ.Ab')) {
    const nvidiaModels = [
      'meta/llama-3.1-405b-instruct',
      'nvidia/llama-3.1-nemotron-70b-instruct',
      'qwen/qwen2.5-72b-instruct'
    ]

    // Use local Vite proxy if available to avoid CORS preflight errors
    const endpoints = isLocal
      ? ['/api/nvidia/v1/chat/completions', 'https://integrate.api.nvidia.com/v1/chat/completions']
      : ['https://integrate.api.nvidia.com/v1/chat/completions']

    let lastError = null

    for (const endpoint of endpoints) {
      for (const model of nvidiaModels) {
        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${effectiveKey}`,
            },
            body: JSON.stringify({
              model: model,
              messages: [{ role: 'user', content: systemPrompt }],
              temperature: 0.2,
              max_tokens: 2048
            })
          })

          if (!response.ok) {
            const errJson = await response.json().catch(() => ({}))
            lastError = new Error(errJson?.detail || errJson?.message || `NVIDIA API error ${response.status} on ${model}`)
            continue
          }

          const data = await response.json()
          const textOutput = data?.choices?.[0]?.message?.content
          if (!textOutput) continue

          const cleanedText = textOutput.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
          return JSON.parse(cleanedText)
        } catch (e) {
          lastError = e
        }
      }
    }

    throw lastError || new Error('Could not connect to NVIDIA AI API. Please check your network connection.')
  }

  // 2. Google Gemini API
  if (effectiveProvider === 'gemini') {
    const geminiModels = [
      'gemini-2.0-flash-exp',
      'gemini-1.5-flash',
      'gemini-2.0-flash'
    ]

    const baseUrl = isLocal ? '/api/gemini/v1beta/models' : 'https://generativelanguage.googleapis.com/v1beta/models'

    let lastError = null

    for (const model of geminiModels) {
      try {
        const endpoint = `${baseUrl}/${model}:generateContent?key=${effectiveKey}`
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.2
            }
          })
        })

        if (!response.ok) {
          const errJson = await response.json().catch(() => ({}))
          lastError = new Error(errJson?.error?.message || `Gemini API error ${response.status}`)
          continue
        }

        const data = await response.json()
        const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text
        if (!textOutput) continue

        const cleanedText = textOutput.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        return JSON.parse(cleanedText)
      } catch (e) {
        lastError = e
      }
    }

    throw lastError || new Error('Gemini API error. Please verify your Gemini API key.')
  }

  // 3. Groq Free API
  if (effectiveProvider === 'groq') {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
              'Authorization': `Bearer ${effectiveKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: systemPrompt }],
        response_format: { type: 'json_object' },
        temperature: 0.2
      })
    })

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}))
      throw new Error(errJson?.error?.message || `Groq API error ${response.status}`)
    }

    const data = await response.json()
    const textOutput = data?.choices?.[0]?.message?.content
    if (!textOutput) throw new Error('No output returned from Groq API.')

    const cleanedText = textOutput.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(cleanedText)
  }

  // 4. OpenRouter Free Tier
  if (effectiveProvider === 'openrouter') {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
              'Authorization': `Bearer ${effectiveKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp:free',
        messages: [{ role: 'user', content: systemPrompt }],
        response_format: { type: 'json_object' },
        temperature: 0.2
      })
    })

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}))
      throw new Error(errJson?.error?.message || `OpenRouter API error ${response.status}`)
    }

    const data = await response.json()
    const textOutput = data?.choices?.[0]?.message?.content
    if (!textOutput) throw new Error('No output returned from OpenRouter.')

    const cleanedText = textOutput.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(cleanedText)
  }

  throw new Error(`Unsupported AI provider: ${effectiveProvider}`)
}
