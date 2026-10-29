import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Search,
  Code2,
  Layers,
  Sparkles,
  Image as ImageIcon,
  MessageSquare,
  Video,
  Flame,
  TrendingUp,
  Compass,
  SlidersHorizontal,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import BentoCard from '../components/BentoCard'
import EditorialHero from '../components/EditorialHero'
import PromptShelf from '../components/PromptShelf'
import PromptModal from '../components/PromptModal'
import { MARKETPLACE_CATEGORIES } from '../data/marketplacePrompts'
import { subscribeToWorks } from '../services/workService'

function Home() {
  const [works, setWorks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('Discover')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedModalWork, setSelectedModalWork] = useState(null)

  useEffect(() => {
    document.title = 'AI Prompt Gallery & Component Marketplace | PromptPen'

    setLoading(true)
    const unsubscribe = subscribeToWorks(selectedCategory, searchQuery, (data) => {
      setWorks(data)
      setLoading(false)
    })

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe()
    }
  }, [selectedCategory, searchQuery])

  // Featured Work for Hero (Top copied or first item)
  const featuredWork = useMemo(() => {
    if (works.length === 0) return null
    return [...works].sort((a, b) => (b.copiesCount || 0) - (a.copiesCount || 0))[0] || works[0]
  }, [works])

  // Categorized Shelves for Netflix-style browsing
  const trendingWorks = useMemo(() => {
    return [...works].sort((a, b) => ((b.copiesCount || 0) + (b.likesCount || 0)) - ((a.copiesCount || 0) + (a.likesCount || 0)))
  }, [works])

  const codeWorks = useMemo(() => {
    return works.filter(
      (w) =>
        w.workType === 'code' ||
        w.code ||
        w.category?.toLowerCase().includes('code') ||
        w.category?.toLowerCase().includes('web')
    )
  }, [works])

  const imageWorks = useMemo(() => {
    return works.filter(
      (w) =>
        w.workType === 'image' ||
        w.category?.toLowerCase().includes('image') ||
        w.category?.toLowerCase().includes('brand') ||
        w.category?.toLowerCase().includes('art')
    )
  }, [works])

  const textWorks = useMemo(() => {
    return works.filter(
      (w) =>
        w.workType === 'text' ||
        w.category?.toLowerCase().includes('chatgpt') ||
        w.category?.toLowerCase().includes('llm') ||
        Boolean(w.textOutput)
    )
  }, [works])

  const videoWorks = useMemo(() => {
    return works.filter(
      (w) =>
        w.workType === 'video' ||
        w.category?.toLowerCase().includes('video') ||
        w.category?.toLowerCase().includes('motion') ||
        Boolean(w.videoUrl)
    )
  }, [works])

  const isBrowsingAll = (selectedCategory === 'Discover' || selectedCategory === 'All') && !searchQuery.trim()

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white selection:bg-sky-400 selection:text-black relative overflow-x-hidden">
      {/* Editorial Hero Banner */}
      <EditorialHero
        featuredWork={featuredWork}
        onQuickView={(work) => setSelectedModalWork(work)}
      />

      {/* Main Content Showcase */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-12">
        {/* Category Pill Navbar & Search Header */}
        <div className="flex flex-col gap-6 mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sky-400" />
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {selectedCategory === 'Discover' ? 'Curated Prompt Shelves' : `${selectedCategory} Prompts`}
                </h2>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Explore real UI code, high-res image prompts, and LLM instructions created by top builders.
              </p>
            </div>

            {/* Glass Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search prompts, models, styles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-14 py-2.5 rounded-full bg-[#141b2d]/80 border border-white/15 focus:border-sky-400/50 focus:bg-[#182137] text-white text-xs placeholder:text-slate-500 outline-none backdrop-blur-xl transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills (Matches Modern App Store & Netflix Shelf Selector) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-1">
            {MARKETPLACE_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`relative px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 whitespace-nowrap cursor-pointer select-none ${
                    isActive ? 'glass-pill-active' : 'glass-pill-inactive'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeHomeCategoryPill"
                      className="absolute inset-0 rounded-full bg-white shadow-md shadow-white/20 -z-10"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span className={isActive ? 'text-black' : 'text-slate-200'}>
                    {cat}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Dynamic Display Mode: Netflix Shelves when on Discover tab, or Grid when searching/filtering */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[290px]">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="rounded-2xl bg-white/[0.04] border border-white/10 animate-pulse h-full min-h-[290px]"
              />
            ))}
          </div>
        ) : works.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24 px-6 rounded-3xl glass-panel-elevated border border-white/10 max-w-2xl mx-auto shadow-2xl"
          >
            <div className="w-14 h-14 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mx-auto mb-4 text-sky-400">
              <Code2 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No matching prompt works found</h3>
            <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
              {searchQuery
                ? `No prompt creations matched "${searchQuery}". Try different keywords or reset filter.`
                : `No works posted in ${selectedCategory} yet.`}
            </p>
            <div className="flex justify-center gap-3">
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('Discover')
                  }}
                  className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-all"
                >
                  Reset Filters
                </button>
              )}
              <Link
                to="/create"
                className="px-5 py-2.5 rounded-full bg-white text-black text-xs font-extrabold hover:bg-slate-200 transition-all shadow-md"
              >
                Post the First Work
              </Link>
            </div>
          </motion.div>
        ) : isBrowsingAll ? (
          /* Netflix Style Shelves Mode */
          <div className="space-y-4">
            {/* Shelf 1: Trending Prompts */}
            <PromptShelf
              title="🔥 Trending Prompts"
              subtitle="Community favorites with the most copies and likes"
              icon={TrendingUp}
              works={trendingWorks}
              onSelectWork={(work) => setSelectedModalWork(work)}
              viewAllCategory="All"
            />

            {/* Shelf 2: UI & Web Code */}
            {codeWorks.length > 0 && (
              <PromptShelf
                title="💻 UI & Interactive Web Code"
                subtitle="Live rendered HTML/CSS/JS components created via AI prompts"
                icon={Code2}
                works={codeWorks}
                onSelectWork={(work) => setSelectedModalWork(work)}
                viewAllCategory="UI & Web Code"
              />
            )}

            {/* Shelf 3: AI Image Gen */}
            {imageWorks.length > 0 && (
              <PromptShelf
                title="🎨 Master AI Image Gen"
                subtitle="High-fidelity prompts for Midjourney, DALL-E 3, and Flux"
                icon={Sparkles}
                works={imageWorks}
                onSelectWork={(work) => setSelectedModalWork(work)}
                viewAllCategory="AI Image Gen"
              />
            )}

            {/* Shelf 4: ChatGPT & LLMs */}
            {textWorks.length > 0 && (
              <PromptShelf
                title="💬 ChatGPT & Deep Reasoning"
                subtitle="Expert system prompts, copy frameworks, and role specifications"
                icon={MessageSquare}
                works={textWorks}
                onSelectWork={(work) => setSelectedModalWork(work)}
                viewAllCategory="ChatGPT & LLMs"
              />
            )}

            {/* Shelf 5: AI Video & Motion */}
            {videoWorks.length > 0 && (
              <PromptShelf
                title="🎬 AI Video & Motion"
                subtitle="Cinematic camera directions for Sora, Runway Gen-3, and Kling"
                icon={Video}
                works={videoWorks}
                onSelectWork={(work) => setSelectedModalWork(work)}
                viewAllCategory="AI Video & Motion"
              />
            )}
          </div>
        ) : (
          /* Filtered Grid Mode */
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-6 border-b border-white/10 pb-3">
              <p>Showing {works.length} prompt creations in <strong className="text-white">{selectedCategory}</strong></p>
            </div>
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[300px]"
            >
              <AnimatePresence>
                {works.map((work) => (
                  <BentoCard
                    key={work.id}
                    work={work}
                    onQuickView={(w) => setSelectedModalWork(w)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </main>

      {/* App Store Style Quick View Modal */}
      {selectedModalWork && (
        <PromptModal
          work={selectedModalWork}
          onClose={() => setSelectedModalWork(null)}
        />
      )}

      {/* Footer Banner */}
      <footer className="border-t border-white/10 py-12 px-6 text-center bg-[#0d1322]/80 backdrop-blur-md relative z-10">
        <p className="text-slate-400 text-xs font-medium tracking-wider">
          PROMPTPEN &copy; {new Date().getFullYear()} — The AI Prompt & Work Gallery for Creators.
        </p>
      </footer>
    </div>
  )
}

export default Home