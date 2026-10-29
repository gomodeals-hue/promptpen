import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Copy,
  Check,
  Heart,
  ExternalLink,
  Code2,
  Sparkles,
  MessageSquare,
  Video,
  Play,
  Share2,
  Lock,
  Sliders,
  FileText,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { incrementCopyCount, toggleLikeWork } from '../services/workService'
import { prepareSafeIframeDoc } from '../utils/security'

function PromptModal({ work, onClose }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [copyFormat, setCopyFormat] = useState('raw') // 'raw' | 'markdown' | 'json'
  const [copied, setCopied] = useState(false)
  const [showReplacer, setShowReplacer] = useState(false)
  const [replacements, setReplacements] = useState({})
  const [isLiking, setIsLiking] = useState(false)

  if (!work) return null

  const isTextWork = work.workType === 'text' || work.category === 'ChatGPT & LLMs' || Boolean(work.textOutput)
  const isVideoWork = work.workType === 'video' || work.category === 'AI Video & Motion' || Boolean(work.videoUrl)
  const isCodeWork = work.workType === 'code' || work.code || work.category === 'UI & Web Code'
  const isImageWork =
    work.workType === 'image' ||
    work.category === 'AI Image Gen' ||
    work.category === 'Image Edit' ||
    work.category === 'Product & Brand' ||
    (!work.code && work.imageUrl && !isTextWork && !isVideoWork)

  // Extract bracketed variables like [Variable] or {variable} or <variable>
  const detectedVariables = useMemo(() => {
    const raw = work.prompt || ''
    const matches = raw.match(/\[([^[\]]+)\]|\{([^{}]+)\}|<([^<>]+)>/g) || []
    return Array.from(new Set(matches.map((m) => m.slice(1, -1).trim()))).filter((v) => v.length < 30)
  }, [work.prompt])

  const customizedPrompt = useMemo(() => {
    let result = work.prompt || ''
    if (!showReplacer) return result

    for (const [key, val] of Object.entries(replacements)) {
      if (val && val.trim()) {
        result = result.split(`[${key}]`).join(val.trim())
        result = result.split(`{${key}}`).join(val.trim())
        result = result.split(`<${key}>`).join(val.trim())
      }
    }
    return result
  }, [work.prompt, showReplacer, replacements])

  const formattedOutput = useMemo(() => {
    const text = customizedPrompt
    if (copyFormat === 'markdown') {
      return `### ${work.title}\n**AI Tool**: ${work.aiTool || 'AI'}\n**Category**: ${work.category || 'General'}\n\n\`\`\`text\n${text}\n\`\`\``
    }
    if (copyFormat === 'json') {
      return JSON.stringify(
        {
          title: work.title,
          aiTool: work.aiTool || 'AI',
          category: work.category || 'General',
          prompt: text,
          author: work.authorName || 'Anonymous',
        },
        null,
        2
      )
    }
    return text
  }, [customizedPrompt, copyFormat, work])

  const hasLiked = user && Array.isArray(work.likedBy) && work.likedBy.includes(user.uid)
  const likesCount = work.likesCount || 0

  const handleCopy = (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    if (!user) {
      onClose()
      navigate('/login', {
        state: {
          redirect: `/work/${work.id}`,
          autoCopy: true,
        },
      })
      return
    }

    if (formattedOutput) {
      navigator.clipboard.writeText(formattedOutput)
      setCopied(true)
      incrementCopyCount(work.id)
      setTimeout(() => setCopied(false), 2200)
    }
  }

  const handleLike = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      onClose()
      navigate('/login', {
        state: { redirect: `/work/${work.id}` },
      })
      return
    }

    try {
      setIsLiking(true)
      await toggleLikeWork(work.id, user)
    } catch (err) {
      console.warn('Like toggle error:', err)
    } finally {
      setIsLiking(false)
    }
  }

  const previewSrcDoc = prepareSafeIframeDoc(work.code || '')

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-6 md:p-10 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-xl transition-opacity"
        />

        {/* Modal Content Box (App Store Style Floating Sheet) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-5xl rounded-3xl glass-panel-elevated border border-white/20 bg-[#0f1422]/95 overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.8)] z-10 my-auto flex flex-col max-h-[90vh]"
        >
          {/* Top Bar Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#141b2d]/80 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-white/90 shrink-0">
                {isTextWork && <MessageSquare className="w-3.5 h-3.5 text-amber-400" />}
                {isVideoWork && <Video className="w-3.5 h-3.5 text-cyan-400" />}
                {isImageWork && <Sparkles className="w-3.5 h-3.5 text-purple-400" />}
                {isCodeWork && !isImageWork && !isVideoWork && !isTextWork && <Code2 className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{work.aiTool || 'AI Tool'}</span>
              </div>
              <span className="text-white/30 hidden sm:inline">|</span>
              <span className="text-xs text-white/60 truncate hidden sm:inline">{work.category || 'General'}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleLike}
                disabled={isLiking}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  hasLiked
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
                    : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/15 hover:text-white'
                }`}
                title={user ? (hasLiked ? 'Unlike Prompt' : 'Like Prompt') : 'Sign in to Like'}
              >
                <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
                <span>{likesCount}</span>
              </button>

              <Link
                to={`/work/${work.id}`}
                onClick={onClose}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white transition-all"
                title="Open Dedicated Full Page"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Detail</span>
              </Link>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Modal Body: Two-Column Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto custom-scrollbar flex-1">
            {/* Left Preview Column (7 Cols on desktop) */}
            <div className="lg:col-span-7 bg-[#0b0f19] border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-center items-center min-h-[280px] sm:min-h-[380px] p-4 sm:p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08),transparent_70%)] pointer-events-none" />

              {isTextWork ? (
                <div className="w-full h-full p-5 rounded-2xl bg-[#121727] border border-white/10 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                      <MessageSquare className="w-4 h-4" />
                      <span>Prompt Specification Preview</span>
                    </div>
                    <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-xs sm:text-sm text-neutral-200 font-sans leading-relaxed max-h-[260px] overflow-y-auto custom-scrollbar">
                      {user ? (
                        work.prompt
                      ) : (
                        <div className="relative py-4 text-center">
                          <p className="blur-sm opacity-30 select-none">{work.prompt}</p>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <Lock className="w-5 h-5 text-white/80 mb-1.5" />
                            <span className="text-xs font-bold text-white">Sign In to Reveal Full Prompt</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {work.textOutput && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-1.5">Sample AI Output</p>
                      <p className="text-xs text-white/80 line-clamp-3 bg-white/[0.03] p-3 rounded-lg border border-white/5">
                        {work.textOutput}
                      </p>
                    </div>
                  )}
                </div>
              ) : isVideoWork ? (
                <div className="w-full h-full flex flex-col items-center justify-center rounded-2xl overflow-hidden bg-black/60 border border-white/10">
                  {work.videoUrl ? (
                    <video
                      src={work.videoUrl}
                      controls
                      autoPlay
                      loop
                      muted
                      className="w-full max-h-[360px] rounded-xl object-contain"
                    />
                  ) : work.imageUrl ? (
                    <img src={work.imageUrl} alt={work.title} className="w-full max-h-[360px] rounded-xl object-cover" />
                  ) : (
                    <div className="py-16 text-center text-white/50 text-xs flex items-center gap-2">
                      <Play className="w-4 h-4" /> Motion Video Preview
                    </div>
                  )}
                </div>
              ) : isImageWork ? (
                <div className="w-full h-full flex items-center justify-center">
                  {work.imageUrl ? (
                    <img
                      src={work.imageUrl}
                      alt={work.title}
                      className="max-h-[380px] w-auto max-w-full rounded-2xl object-contain border border-white/10 shadow-2xl"
                    />
                  ) : (
                    <div className="py-20 text-center text-white/40 text-xs">No preview image</div>
                  )}
                </div>
              ) : (
                <div className="w-full h-[360px] sm:h-[420px] rounded-2xl overflow-hidden bg-black/60 border border-white/10 relative">
                  <iframe
                    title={work.title}
                    srcDoc={previewSrcDoc}
                    sandbox="allow-scripts allow-modals allow-forms"
                    className="w-full h-full border-0"
                  />
                </div>
              )}
            </div>

            {/* Right Prompt Details & Actions Column (5 Cols on desktop) */}
            <div className="lg:col-span-5 p-5 sm:p-7 flex flex-col justify-between space-y-5 bg-[#0f1422]">
              {/* Header Title & Author */}
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                  {work.title}
                </h2>
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-white to-neutral-400 text-black font-bold text-[9px] flex items-center justify-center">
                    {(work.authorName || 'U').slice(0, 1).toUpperCase()}
                  </div>
                  <span>By <strong className="text-white/90">{work.authorName || 'Anonymous'}</strong></span>
                </div>
              </div>

              {/* Variable Replacer Tool if detected */}
              {detectedVariables.length > 0 && user && (
                <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setShowReplacer(!showReplacer)}
                      className="flex items-center gap-1.5 text-xs font-bold text-sky-300 hover:text-sky-200 transition-colors"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>{showReplacer ? 'Hide Variables' : `Customize Prompt Variables (${detectedVariables.length})`}</span>
                    </button>
                    {showReplacer && (
                      <button
                        type="button"
                        onClick={() => setReplacements({})}
                        className="text-[10px] text-white/40 hover:text-white"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  {showReplacer && (
                    <div className="space-y-2 pt-1">
                      {detectedVariables.map((v) => (
                        <div key={v} className="flex flex-col gap-1">
                          <label className="text-[10px] font-semibold uppercase tracking-wider text-white/50">{v}</label>
                          <input
                            type="text"
                            placeholder={`e.g. Modern SaaS dashboard...`}
                            value={replacements[v] || ''}
                            onChange={(e) => setReplacements({ ...replacements, [v]: e.target.value })}
                            className="px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/15 text-xs text-white placeholder:text-white/30 outline-none focus:border-white/40"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Master Prompt Box */}
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-white/70 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Master Prompt</span>
                  </span>

                  {/* Format Selector Pills */}
                  <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/[0.06] border border-white/10 text-[10px]">
                    {['raw', 'markdown', 'json'].map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setCopyFormat(fmt)}
                        className={`px-2 py-0.5 rounded-md font-semibold uppercase transition-all ${
                          copyFormat === fmt ? 'bg-white text-black' : 'text-white/60 hover:text-white'
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative rounded-2xl bg-[#090d16] border border-white/10 p-3.5 min-h-[140px] max-h-[190px] overflow-y-auto custom-scrollbar">
                  {user ? (
                    <p className="text-xs text-neutral-200 font-mono leading-relaxed whitespace-pre-wrap select-all">
                      {formattedOutput}
                    </p>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-3">
                      <p className="text-xs text-neutral-400 font-mono select-none blur-[3px] opacity-30 pointer-events-none mb-3">
                        {work.prompt}
                      </p>
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-white/10 px-3 py-1.5 rounded-full border border-white/15 shadow-md">
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Sign In to Unlock Prompt</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Big CTA Action */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="w-full py-3.5 px-6 rounded-2xl bg-white text-black font-extrabold text-sm hover:bg-neutral-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 shadow-xl shadow-white/10 cursor-pointer"
                >
                  {user ? (
                    copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                        <span className="text-emerald-700">Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Master Prompt ({copyFormat.toUpperCase()})</span>
                      </>
                    )
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Sign In & Copy Prompt</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default PromptModal
