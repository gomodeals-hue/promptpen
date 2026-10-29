import { useEffect, useState, useMemo } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Copy,
  Check,
  Home,
  Play,
  User,
  FileCode,
  Upload,
  Layers,
  Lock,
  Heart,
  Share2,
  Sliders,
  Sparkles,
  Download,
  Code2,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { subscribeToWorkById, incrementCopyCount, toggleLikeWork } from '../services/workService'
import { prepareSafeIframeDoc } from '../utils/security'

function WorkDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)

  const [work, setWork] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copiedPrompt, setCopiedPrompt] = useState(false)
  const [copyFormat, setCopyFormat] = useState('raw') // 'raw' | 'markdown' | 'json'
  const [showReplacer, setShowReplacer] = useState(false)
  const [replacements, setReplacements] = useState({})
  const [toastMessage, setToastMessage] = useState('')
  const [isLiking, setIsLiking] = useState(false)

  const activePrompt = work?.prompt || ''
  const activeCode = work?.code || ''

  const isTextWork = useMemo(() => {
    if (!work) return false
    return work.workType === 'text' || work.category === 'ChatGPT & LLMs' || Boolean(work.textOutput)
  }, [work])

  const isVideoWork = useMemo(() => {
    if (!work) return false
    return work.workType === 'video' || work.category === 'AI Video & Motion' || Boolean(work.videoUrl)
  }, [work])

  const isImageWork = useMemo(() => {
    if (!work || isTextWork || isVideoWork) return false
    return (
      work.workType === 'image' ||
      work.category === 'AI Image Gen' ||
      work.category === 'Image Edit' ||
      work.category === 'Product & Brand' ||
      (!work.code && work.imageUrl)
    )
  }, [work, isTextWork, isVideoWork])

  // Extract bracketed variables like [Variable] or {variable} or <variable>
  const detectedVariables = useMemo(() => {
    if (!activePrompt) return []
    const matches = activePrompt.match(/\[([^[\]]+)\]|\{([^{}]+)\}|<([^<>]+)>/g) || []
    return Array.from(new Set(matches.map((m) => m.slice(1, -1).trim()))).filter((v) => v.length < 30)
  }, [activePrompt])

  const customizedPrompt = useMemo(() => {
    let result = activePrompt
    if (!showReplacer) return result

    for (const [key, val] of Object.entries(replacements)) {
      if (val && val.trim()) {
        result = result.split(`[${key}]`).join(val.trim())
        result = result.split(`{${key}}`).join(val.trim())
        result = result.split(`<${key}>`).join(val.trim())
      }
    }
    return result
  }, [activePrompt, showReplacer, replacements])

  const formattedOutput = useMemo(() => {
    const text = customizedPrompt
    if (copyFormat === 'markdown') {
      return `### ${work?.title || 'Prompt'}\n**AI Tool**: ${work?.aiTool || 'AI'}\n**Category**: ${work?.category || 'General'}\n\n\`\`\`text\n${text}\n\`\`\``
    }
    if (copyFormat === 'json') {
      return JSON.stringify(
        {
          title: work?.title || '',
          aiTool: work?.aiTool || 'AI',
          category: work?.category || 'General',
          prompt: text,
          author: work?.authorName || 'Anonymous',
        },
        null,
        2
      )
    }
    return text
  }, [customizedPrompt, copyFormat, work])

  useEffect(() => {
    const unsubscribe = subscribeToWorkById(id, (fetchedWork) => {
      setWork(fetchedWork)
      setLoading(false)
    })
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe()
    }
  }, [id])

  useEffect(() => {
    const shouldAutoCopy = location.state?.autoCopy || searchParams.get('autoCopy') === 'true'
    if (shouldAutoCopy && activePrompt && user) {
      handleCopyPrompt()
    }
  }, [work, user, location.state, activePrompt])

  function showToast(msg) {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  function handleCopyPrompt() {
    if (!user) {
      navigate('/login', {
        state: {
          redirect: `/work/${id}`,
          autoCopy: true,
        },
      })
      return
    }

    if (formattedOutput) {
      navigator.clipboard.writeText(formattedOutput)
      setCopiedPrompt(true)
      incrementCopyCount(id)
      showToast(`Master prompt copied (${copyFormat.toUpperCase()})!`)
      setTimeout(() => setCopiedPrompt(false), 2500)
    }
  }

  async function handleToggleLike() {
    if (!user) {
      navigate('/login', {
        state: { redirect: `/work/${id}` },
      })
      return
    }

    try {
      setIsLiking(true)
      await toggleLikeWork(id, user)
    } catch (err) {
      console.warn('Like toggle error:', err)
    } finally {
      setIsLiking(false)
    }
  }

  const hasLiked = user && Array.isArray(work?.likedBy) && work.likedBy.includes(user.uid)
  const likesCount = work?.likesCount || 0
  const previewSrcDoc = prepareSafeIframeDoc(activeCode || '')

  function renderPromptBox(promptText, maxHeightClass = 'max-h-[280px]') {
    if (user) {
      return (
        <div className={`bg-[#080d1a] border border-white/10 rounded-2xl p-4 sm:p-5 ${maxHeightClass} overflow-y-auto custom-scrollbar`}>
          <p className="text-xs sm:text-sm text-slate-200 font-mono leading-relaxed whitespace-pre-wrap select-all">
            {promptText}
          </p>
        </div>
      )
    }

    return (
      <div className={`relative overflow-hidden rounded-2xl bg-[#080d1a] border border-white/10 p-5 ${maxHeightClass} flex items-center justify-center`}>
        <p className="text-xs sm:text-sm text-slate-400 font-mono leading-relaxed whitespace-pre-wrap select-none blur-[4px] opacity-25 pointer-events-none w-full">
          {promptText}
        </p>

        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-3 z-10">
          <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-lg">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-white uppercase tracking-wider">Master Prompt Locked</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[240px]">
              Sign in or create an account to view and copy the verified prompt.
            </p>
          </div>
          <button
            onClick={handleCopyPrompt}
            className="px-5 py-2 rounded-full bg-white text-black font-extrabold text-xs hover:bg-slate-200 transition-all shadow-xl active:scale-95 cursor-pointer"
          >
            Sign In to Reveal Prompt
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-slate-400 flex items-center justify-center text-xs font-semibold tracking-wider uppercase">
        Loading creation details...
      </div>
    )
  }

  if (!work) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Prompt Not Found</h2>
        <p className="text-slate-400 text-sm mb-6">The prompt creation you are looking for does not exist or was removed.</p>
        <Link
          to="/library"
          className="px-6 py-2.5 rounded-full bg-white text-black font-extrabold text-xs hover:bg-slate-200 transition-all shadow-lg"
        >
          Back to Library
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white relative font-sans selection:bg-sky-400 selection:text-black">
      {/* Floating Toast */}
      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[1000] px-5 py-2.5 rounded-full bg-white text-black text-xs font-extrabold shadow-2xl animate-fade-in">
          {toastMessage}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 pt-28 sm:pt-36 pb-20">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <Link to="/home" className="hover:text-white transition-colors flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <span>/</span>
          <Link to="/library" className="hover:text-white transition-colors">
            Library
          </Link>
          <span>/</span>
          <span className="text-slate-200 font-medium truncate max-w-[220px]">{work.title}</span>
        </div>

        {/* Header Title Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10 mb-8">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-extrabold uppercase tracking-wider text-white bg-sky-500/20 text-sky-300 px-3 py-1 rounded-full border border-sky-500/30">
                {work.category || 'General'}
              </span>
              <span className="text-xs font-semibold text-slate-300 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                {work.aiTool || 'AI Model'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {work.title}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm flex items-center gap-2 pt-1">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Created by <strong className="text-white font-semibold">{work.authorName || 'Anonymous'}</strong></span>
            </p>
          </div>

          {/* Action Header Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Like Button */}
            <button
              onClick={handleToggleLike}
              disabled={isLiking}
              className={`flex items-center gap-2 px-4 py-3 rounded-full text-xs sm:text-sm font-bold border transition-all ${
                hasLiked
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
                  : 'bg-white/10 text-white border-white/15 hover:bg-white/20'
              }`}
            >
              <Heart className={`w-4 h-4 ${hasLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
              <span>{likesCount} {likesCount === 1 ? 'Like' : 'Likes'}</span>
            </button>

            {/* Copy CTA */}
            <button
              onClick={handleCopyPrompt}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-extrabold text-xs sm:text-sm hover:bg-slate-100 active:scale-95 transition-all shadow-xl shadow-white/10 cursor-pointer"
            >
              {user ? (
                <>
                  {copiedPrompt ? <Check className="w-4 h-4 text-emerald-600 stroke-[3]" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedPrompt ? 'Copied to Clipboard!' : 'Copy Master Prompt'}</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-black" />
                  <span>Sign In to Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content Section Grid */}
        {isTextWork ? (
          /* Specialized LLM Text Prompt View */
          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 items-start">
            <div className="space-y-6">
              <div className="rounded-3xl border border-white/10 p-6 bg-[#12192c] shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
                    <FileCode className="w-4 h-4 text-sky-400" />
                    <span>Master ChatGPT / LLM Prompt</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    {['raw', 'markdown', 'json'].map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setCopyFormat(fmt)}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${
                          copyFormat === fmt ? 'bg-white text-black' : 'bg-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                {renderPromptBox(formattedOutput, 'min-h-[220px]')}
              </div>

              {work.textOutput && (
                <div className="rounded-3xl border border-white/10 p-6 bg-[#12192c]/70 shadow-xl space-y-3">
                  <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Sample AI Response / Output</span>
                  </h3>
                  <div className="p-4 rounded-2xl bg-[#080d1a] border border-white/10 text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-wrap">
                    {work.textOutput}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6 lg:sticky lg:top-28">
              {/* Variable Customizer */}
              {detectedVariables.length > 0 && user && (
                <div className="rounded-3xl border border-white/10 p-5 bg-[#12192c] shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-sky-300 flex items-center gap-1.5 uppercase tracking-wider">
                      <Sliders className="w-4 h-4" />
                      <span>Customize Prompt Variables ({detectedVariables.length})</span>
                    </h3>
                    <button
                      onClick={() => setReplacements({})}
                      className="text-[10px] text-slate-400 hover:text-white"
                    >
                      Reset
                    </button>
                  </div>
                  <div className="space-y-2.5 pt-1">
                    {detectedVariables.map((v) => (
                      <div key={v}>
                        <label className="text-[10px] font-semibold uppercase text-slate-400 mb-1 block">{v}</label>
                        <input
                          type="text"
                          placeholder="Type custom replacement..."
                          value={replacements[v] || ''}
                          onChange={(e) => setReplacements({ ...replacements, [v]: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-xs text-white placeholder:text-slate-500 outline-none focus:border-sky-400"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-3xl border border-white/10 p-6 bg-[#12192c] shadow-2xl space-y-4">
                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Model used:</span>
                  <span className="text-white font-bold">{work.aiTool || 'ChatGPT'}</span>
                </div>
              </div>
            </div>
          </div>
        ) : isVideoWork ? (
          /* Motion Video Prompt View */
          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-8 items-start">
            <div className="space-y-6">
              <div className="rounded-3xl border border-white/10 overflow-hidden bg-[#12192c] shadow-2xl">
                <div className="px-5 py-3.5 bg-[#172036] border-b border-white/10 text-xs font-semibold text-slate-200 flex items-center justify-between">
                  <span className="flex items-center gap-2 font-bold uppercase tracking-wider text-xs">
                    <Play className="w-3.5 h-3.5 text-sky-400" />
                    <span>PREVIEW</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">MOTION VIDEO</span>
                </div>
                <div className="p-4 bg-[#080d1a] flex justify-center">
                  {work.videoUrl ? (
                    <video src={work.videoUrl} controls autoPlay loop muted className="w-full rounded-2xl max-h-[480px]" />
                  ) : work.imageUrl ? (
                    <img src={work.imageUrl} alt={work.title} className="w-full rounded-2xl object-cover" />
                  ) : (
                    <p className="text-slate-400 text-xs py-10">Video preview loading...</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6 lg:sticky lg:top-28">
              <div className="rounded-3xl border border-white/10 p-6 bg-[#12192c] shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-white">Camera & Motion Prompt</span>
                </div>

                {renderPromptBox(formattedOutput)}

                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Model used:</span>
                  <span className="text-white font-bold">{work.aiTool || 'Runway Gen-3'}</span>
                </div>
              </div>
            </div>
          </div>
        ) : isImageWork ? (
          /* AI Image Generation View */
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 items-start">
            <div className="rounded-3xl border border-white/10 overflow-hidden bg-[#12192c] shadow-2xl">
              <div className="flex items-center justify-between px-5 py-3.5 bg-[#172036] border-b border-white/10 text-xs font-semibold text-slate-200">
                <span className="text-white font-bold text-xs uppercase tracking-wider">Preview</span>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">High Resolution</span>
              </div>
              <div className="p-4 sm:p-6 flex items-center justify-center bg-[#080d1a] min-h-[360px]">
                {work.imageUrl ? (
                  <img
                    src={work.imageUrl}
                    alt={work.title}
                    className="max-h-[520px] w-auto max-w-full object-contain rounded-2xl border border-white/10 shadow-2xl"
                  />
                ) : (
                  <p className="text-slate-400 text-sm">No preview image available.</p>
                )}
              </div>
            </div>

            <div className="space-y-6 lg:sticky lg:top-28">
              <div className="rounded-3xl border border-white/10 p-6 bg-[#12192c] shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-white">
                    <FileCode className="w-4 h-4 text-sky-400" />
                    <span>Master Prompt</span>
                  </span>
                  <div className="flex items-center gap-1">
                    {['raw', 'markdown', 'json'].map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setCopyFormat(fmt)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${
                          copyFormat === fmt ? 'bg-white text-black' : 'bg-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                {renderPromptBox(formattedOutput)}

                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Model used:</span>
                  <span className="text-white font-bold">{work.aiTool || 'Midjourney v6'}</span>
                </div>
              </div>

              {/* 3-Step Recipe Guide */}
              <div className="rounded-3xl border border-white/10 p-6 bg-[#12192c]/80 shadow-xl space-y-4">
                <h3 className="text-xs font-extrabold text-white flex items-center gap-2 uppercase tracking-wider">
                  <Layers className="w-4 h-4 text-sky-400" />
                  <span>How To Use This Prompt</span>
                </h3>
                <div className="space-y-3 pt-1">
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/10 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Open {work.aiTool || 'AI Tool'}</p>
                      <p className="text-[11px] text-slate-400 leading-normal mt-0.5">Navigate to your AI generation interface.</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/10 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Paste Master Prompt</p>
                      <p className="text-[11px] text-slate-400 leading-normal mt-0.5">Copy and paste the exact prompt provided above.</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/10 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Generate Result</p>
                      <p className="text-[11px] text-slate-400 leading-normal mt-0.5">Hit generate to craft your masterpiece.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* UI Code Component Live Preview View */
          <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-8 items-start">
            <div className="rounded-3xl border border-white/10 overflow-hidden shadow-2xl bg-[#080d1a]">
              <div className="flex items-center justify-between px-5 py-3.5 bg-[#172036] border-b border-white/10 text-xs font-semibold text-slate-200">
                <span className="flex items-center gap-2 text-white font-bold">
                  <Play className="w-3.5 h-3.5 text-sky-400" />
                  <span>Live Interactive Preview</span>
                </span>
              </div>

              <div className="w-full bg-[#080d1a] relative">
                <iframe
                  title={work.title}
                  srcDoc={previewSrcDoc}
                  sandbox="allow-scripts allow-modals allow-forms"
                  className="w-full h-[520px] sm:h-[600px] border-0"
                />
              </div>
            </div>

            <div className="space-y-6 lg:sticky lg:top-28">
              <div className="rounded-3xl border border-white/10 p-6 bg-[#12192c] shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-white">
                    <FileCode className="w-4 h-4 text-sky-400" />
                    <span>Master Code Prompt</span>
                  </span>
                </div>

                {renderPromptBox(formattedOutput)}

                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Model used:</span>
                  <span className="text-white font-bold">{work.aiTool || 'Claude 3.7 / ChatGPT'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default WorkDetail