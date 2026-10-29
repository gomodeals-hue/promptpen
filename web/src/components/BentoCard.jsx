import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Copy,
  Check,
  ArrowUpRight,
  Sparkles,
  Code2,
  MessageSquare,
  Video,
  Lock,
  Heart,
  Maximize2,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { incrementCopyCount, toggleLikeWork } from '../services/workService'
import { prepareSafeIframeDoc } from '../utils/security'

function BentoCard({ work, onQuickView }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const [isLiking, setIsLiking] = useState(false)

  const initials = (work.authorName || '?').slice(0, 2).toUpperCase()

  const isTextWork = work.workType === 'text' || work.category === 'ChatGPT & LLMs' || Boolean(work.textOutput)
  const isVideoWork = work.workType === 'video' || work.category === 'AI Video & Motion' || Boolean(work.videoUrl)
  const isCodeWork = work.workType === 'code' || work.code || work.category === 'UI & Web Code'
  const isImageWork =
    work.workType === 'image' ||
    work.category === 'AI Image Gen' ||
    work.category === 'Image Edit' ||
    work.category === 'Product & Brand' ||
    (!work.code && work.imageUrl && !isTextWork && !isVideoWork)

  const hasLiked = user && Array.isArray(work.likedBy) && work.likedBy.includes(user.uid)
  const likesCount = work.likesCount || 0

  const handleCopyPrompt = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      navigate('/login', {
        state: {
          redirect: `/work/${work.id}`,
          autoCopy: true,
        },
      })
      return
    }

    if (work.prompt) {
      navigator.clipboard.writeText(work.prompt)
      setCopied(true)
      incrementCopyCount(work.id)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleToggleLike = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
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

  const handleCardClick = (e) => {
    // If onQuickView is provided, trigger modal instead of navigating away directly
    if (onQuickView) {
      e.preventDefault()
      onQuickView(work)
    }
  }

  const previewSrcDoc = prepareSafeIframeDoc(work.code || '')

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.015 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="h-full group/card"
    >
      <div
        onClick={handleCardClick}
        className="relative flex flex-col h-full rounded-2xl overflow-hidden glass-panel glass-panel-hover border border-white/15 hover:border-sky-400/40 transition-all duration-300 shadow-xl shadow-black/40 cursor-pointer bg-[#101626]"
      >
        {/* Top Tag Bar */}
        <div className="relative z-10 flex items-center justify-between px-3.5 py-2.5 bg-[#141b2d]/85 backdrop-blur-md border-b border-white/10">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-semibold text-white/90">
            {isTextWork && <MessageSquare className="w-3 h-3 text-amber-400" />}
            {isVideoWork && <Video className="w-3 h-3 text-cyan-400" />}
            {isImageWork && <Sparkles className="w-3 h-3 text-purple-400" />}
            {isCodeWork && !isImageWork && !isVideoWork && !isTextWork && <Code2 className="w-3 h-3 text-emerald-400" />}
            <span className="truncate max-w-[100px]">{work.aiTool || 'AI Tool'}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Like Heart Button */}
            <button
              onClick={handleToggleLike}
              disabled={isLiking}
              className={`p-1.5 rounded-full border transition-all ${
                hasLiked
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
                  : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/15 hover:text-white'
              }`}
              title={user ? (hasLiked ? 'Unlike' : 'Like') : 'Sign in to Like'}
            >
              <Heart className={`w-3 h-3 ${hasLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
            </button>

            {/* Quick Copy Prompt Button */}
            {work.prompt && (
              <button
                onClick={handleCopyPrompt}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-[10px] font-semibold text-white/80 hover:text-white transition-all shadow-sm"
                title={user ? 'Copy Prompt' : 'Login to Copy Prompt'}
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400 stroke-[2.5]" />
                    <span className="text-emerald-400 font-bold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Prompt</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Preview / Thumbnail Container */}
        <div className="relative flex-1 min-h-[160px] bg-[#0b0f19] overflow-hidden group/preview flex items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_70%)] z-10 pointer-events-none" />

          {isTextWork ? (
            <div className="w-full h-full p-4 bg-[#0d1220] flex flex-col justify-between overflow-hidden">
              <div
                className={`p-3 rounded-xl bg-white/[0.04] border border-white/10 text-[11px] text-slate-300 font-sans leading-relaxed line-clamp-4 select-none ${
                  !user ? 'blur-[3px] opacity-40' : ''
                }`}
              >
                "{work.prompt}"
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-3 h-3 text-amber-400" /> Master Prompt
                </span>
                {!user && (
                  <span className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                    <Lock className="w-3 h-3 text-slate-400" /> Locked
                  </span>
                )}
              </div>
            </div>
          ) : work.imageUrl ? (
            <img
              src={work.imageUrl}
              alt={work.title}
              className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
              <iframe
                title={work.title}
                srcDoc={previewSrcDoc}
                sandbox="allow-scripts allow-modals allow-forms"
                className="w-[125%] h-[125%] origin-center scale-[0.8] pointer-events-none group-hover/card:scale-[0.85] transition-transform duration-500 border-0"
              />
            </div>
          )}

          {/* Hover Overlay Inspect Button */}
          <div className="absolute bottom-3 right-3 z-20 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all duration-300 translate-y-2 group-hover/card:translate-y-0 shadow-lg">
            <Maximize2 className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        </div>

        {/* Footer Metadata */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-[#141b2d]/90 backdrop-blur-md border-t border-white/10">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-white truncate group-hover/card:text-sky-300 transition-colors">
              {work.title}
            </h3>
            <p className="text-[11px] text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
              <span
                className={`w-1.5 h-1.5 rounded-full inline-block shrink-0 ${
                  isTextWork
                    ? 'bg-amber-400'
                    : isVideoWork
                    ? 'bg-cyan-400'
                    : isImageWork
                    ? 'bg-purple-400'
                    : 'bg-emerald-400'
                }`}
              />
              <span className="truncate">{work.category || 'Prompt'}</span>
            </p>
          </div>

          <div
            className="w-7 h-7 rounded-full bg-gradient-to-br from-white to-slate-400 flex items-center justify-center text-[10px] font-black text-black shrink-0 ring-2 ring-white/20"
            title={work.authorName || 'User'}
          >
            {initials}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default BentoCard