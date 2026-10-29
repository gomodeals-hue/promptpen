import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  ArrowRight,
  Compass,
  Copy,
  Check,
  Play,
  Flame,
  Maximize2,
  Code2,
  Lock,
} from 'lucide-react'
import HeroVideoPlayer from './HeroVideoPlayer'
import heroVideo from '../assets/hero.mp4'
import vb2Video from '../assets/VB2.mp4'
import { useAuth } from '../context/AuthContext'
import { incrementCopyCount } from '../services/workService'

function EditorialHero({ featuredWork, onQuickView }) {
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)

  const handleCopyFeatured = (e) => {
    e.preventDefault()
    if (!user) {
      if (onQuickView && featuredWork) {
        onQuickView(featuredWork)
      }
      return
    }

    if (featuredWork?.prompt) {
      navigator.clipboard.writeText(featuredWork.prompt)
      setCopied(true)
      incrementCopyCount(featuredWork.id)
      setTimeout(() => setCopied(false), 2200)
    }
  }

  return (
    <section className="relative min-h-[82vh] sm:min-h-[86vh] flex flex-col justify-center px-4 sm:px-8 md:px-14 pt-32 sm:pt-36 pb-16 overflow-hidden border-b border-white/10">
      {/* Dual Video Background with Balanced Visible Dark Overlays */}
      <HeroVideoPlayer
        videos={[heroVideo, vb2Video]}
        intervalMs={8000}
        opacityLevel="opacity-90"
        overlayClass="absolute inset-0 bg-gradient-to-b from-[#0b0f19]/90 via-[#0b0f19]/70 to-[#0b0f19] z-10 pointer-events-none"
      />

      {/* Dynamic Ambient Glow Meshes (Cyan & Violet) */}
      <div className="ambient-glow top-1/4 left-1/4 w-[450px] h-[450px] bg-sky-500/15" />
      <div className="ambient-glow bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/15" />

      {/* Content Container */}
      <div className="relative z-20 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Side: Headline & Editorial Story */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          {/* Top Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#141b2d]/80 backdrop-blur-xl border border-white/20 mb-6 shadow-xl"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/90">
              The AI Prompt & Work Gallery
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-white mb-6"
          >
            Prompt to Masterpiece. <br />
            <span className="bg-gradient-to-r from-sky-300 via-indigo-200 to-purple-300 bg-clip-text text-transparent">
              Live, Copy-Ready Works.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-300 text-sm sm:text-base md:text-lg max-w-2xl mb-8 leading-relaxed font-normal"
          >
            Browse real components, visuals, and logic built 100% by AI prompts. Inspect live previews, copy exact model instructions, and build faster.
          </motion.p>

          {/* Main Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center gap-3.5 w-full sm:w-auto"
          >
            <Link
              to="/create"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-white text-black text-sm font-extrabold rounded-full hover:bg-slate-100 hover:scale-[1.03] active:scale-95 transition-all duration-200 shadow-xl shadow-white/10"
            >
              <span>Post Your Work</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/library"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#162035]/80 backdrop-blur-xl border border-white/20 hover:border-white/40 text-white text-sm font-semibold hover:bg-white/10 transition-all duration-200"
            >
              <Compass className="w-4 h-4 text-sky-300" />
              <span>Explore Library</span>
            </Link>
          </motion.div>

          {/* Stats Metrics Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex items-center gap-6 sm:gap-8 mt-10 pt-6 border-t border-white/10"
          >
            <div>
              <p className="text-xl sm:text-2xl font-black text-white">100%</p>
              <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-400">Prompt Ready</p>
            </div>
            <div className="h-7 w-[1px] bg-white/20" />
            <div>
              <p className="text-xl sm:text-2xl font-black text-white">Live AI</p>
              <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-400">Gallery</p>
            </div>
            <div className="h-7 w-[1px] bg-white/20" />
            <div>
              <p className="text-xl sm:text-2xl font-black text-white">Instant</p>
              <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-400">Clipboard Copy</p>
            </div>
          </motion.div>
        </div>

        {/* Right Side: App Store Style "Prompt of the Day" Showcase Card */}
        {featuredWork && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 w-full"
          >
            <div className="rounded-3xl glass-panel-elevated p-5 sm:p-6 border border-white/20 bg-[#12192c]/90 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-36 h-36 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Card Header Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-300 text-xs font-extrabold tracking-wide uppercase">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Prompt of the Day</span>
                </div>

                <span className="text-xs font-semibold text-slate-400">
                  {featuredWork.aiTool || 'AI Model'}
                </span>
              </div>

              {/* Title & Preview Image or Snippet */}
              <div className="space-y-3 mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-white leading-snug line-clamp-2">
                  {featuredWork.title}
                </h3>

                {featuredWork.imageUrl ? (
                  <div className="relative rounded-2xl overflow-hidden h-48 bg-black/40 border border-white/10">
                    <img
                      src={featuredWork.imageUrl}
                      alt={featuredWork.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-[#0a0e1a] border border-white/10 text-xs text-slate-300 font-mono line-clamp-3 leading-relaxed">
                    "{featuredWork.prompt}"
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCopyFeatured}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-white text-black font-extrabold text-xs hover:bg-slate-200 transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                >
                  {user ? (
                    copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Prompt</span>
                      </>
                    )
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Unlock Prompt</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onQuickView && onQuickView(featuredWork)}
                  className="py-2.5 px-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-semibold text-xs transition-all flex items-center gap-1"
                  title="Quick Inspect"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Inspect</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}

export default EditorialHero
