import { useEffect, useState, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  Search,
  Sparkles,
  Heart,
  SlidersHorizontal,
  ArrowUpDown,
  Tag,
  Code2,
  Layers,
  Flame,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import BentoCard from '../components/BentoCard'
import PromptModal from '../components/PromptModal'
import { MARKETPLACE_CATEGORIES } from '../data/marketplacePrompts'
import { subscribeToWorks } from '../services/workService'
import { useAuth } from '../context/AuthContext'

const POPULAR_TAGS = [
  'All Tags',
  'Midjourney',
  'ChatGPT',
  'Claude 3.7',
  'React',
  'Tailwind',
  'Landing Page',
  'Sora',
  'Flux',
  'Runway Gen-3',
  'Cyberpunk',
]

function Library() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialCategory = searchParams.get('category') || 'All'
  const initialTab = searchParams.get('tab') || 'all'

  const [works, setWorks] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState(initialCategory)
  const [activeTab, setActiveTab] = useState(initialTab) // 'all' | 'saved'
  const [search, setSearch] = useState('')
  const [selectedTag, setSelectedTag] = useState('All Tags')
  const [sortBy, setSortBy] = useState('trending') // 'trending' | 'newest' | 'likes'
  const [selectedModalWork, setSelectedModalWork] = useState(null)

  useEffect(() => {
    document.title = 'AI Prompt & Work Library | PromptPen'
    setLoading(true)

    const unsubscribe = subscribeToWorks(category, search, (data) => {
      setWorks(data)
      setLoading(false)
    })

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe()
    }
  }, [category, search])

  // Apply Tab (All vs Saved), Tag Filtering & Sorting
  const filteredAndSortedWorks = useMemo(() => {
    let result = [...works]

    // Saved / Liked filter
    if (activeTab === 'saved') {
      if (!user) return []
      result = result.filter((w) => Array.isArray(w.likedBy) && w.likedBy.includes(user.uid))
    }

    // Tag filter
    if (selectedTag !== 'All Tags') {
      const tagLower = selectedTag.toLowerCase()
      result = result.filter(
        (w) =>
          w.title?.toLowerCase().includes(tagLower) ||
          w.prompt?.toLowerCase().includes(tagLower) ||
          w.aiTool?.toLowerCase().includes(tagLower) ||
          w.category?.toLowerCase().includes(tagLower)
      )
    }

    // Sort order
    if (sortBy === 'trending') {
      result.sort((a, b) => ((b.copiesCount || 0) + (b.likesCount || 0)) - ((a.copiesCount || 0) + (a.likesCount || 0)))
    } else if (sortBy === 'likes') {
      result.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))
    } else if (sortBy === 'newest') {
      // already sorted by createdAt from Firestore query
    }

    return result
  }, [works, activeTab, user, selectedTag, sortBy])

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white relative font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 pt-28 sm:pt-36 pb-20">
        {/* Header Title Section */}
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs font-bold uppercase tracking-wider">
                  Master Repository
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                AI Prompt & Work Library
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1.5 max-w-2xl">
                Explore, test, and copy master prompts for ChatGPT, Claude, Midjourney, Sora, Flux, and web code components.
              </p>
            </div>

            {/* Glass Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search prompts, tools, categories..."
                className="w-full pl-11 pr-14 py-2.5 rounded-full bg-[#141b2d]/80 border border-white/15 focus:border-sky-400/50 focus:bg-[#182137] text-white text-xs placeholder:text-slate-500 outline-none backdrop-blur-xl transition-all shadow-inner"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Sub-Tabs Switcher: "All Prompts" vs "Saved Prompts" */}
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                activeTab === 'all'
                  ? 'bg-white text-black shadow-md'
                  : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              All Prompts ({works.length})
            </button>

            {user && (
              <button
                onClick={() => setActiveTab('saved')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'saved'
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                    : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>My Saved & Liked</span>
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {MARKETPLACE_CATEGORIES.map((cat) => {
              const isActive = category === cat
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`relative px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 whitespace-nowrap cursor-pointer select-none ${
                    isActive ? 'glass-pill-active' : 'glass-pill-inactive'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="libraryCategoryPill"
                      className="absolute inset-0 rounded-full bg-white shadow-md shadow-white/20 -z-10"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span className={isActive ? 'text-black' : 'text-slate-200'}>{cat}</span>
                </button>
              )
            })}
          </div>

          {/* Popular Tag Chips & Sort Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            {/* Quick Tag Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 max-w-full">
              <Tag className="w-3.5 h-3.5 text-slate-500 shrink-0 mr-1" />
              {POPULAR_TAGS.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTag(t)}
                  className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all shrink-0 ${
                    selectedTag === t
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                      : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/10'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                <ArrowUpDown className="w-3 h-3" /> Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#141b2d] border border-white/15 text-xs text-slate-200 px-3 py-1.5 rounded-full outline-none focus:border-sky-400"
              >
                <option value="trending">🔥 Trending (Most Copied)</option>
                <option value="likes">❤️ Most Liked</option>
                <option value="newest">⚡ Newest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Status Bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-6 border-b border-white/10 pb-3">
          <p>
            {loading
              ? 'Loading library...'
              : `Showing ${filteredAndSortedWorks.length} prompt creations in ${category}`}
          </p>
        </div>

        {/* Works Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[300px]">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="rounded-2xl bg-white/[0.04] border border-white/10 animate-pulse h-full min-h-[300px]"
              />
            ))}
          </div>
        ) : filteredAndSortedWorks.length === 0 ? (
          <div className="text-center py-24 glass-panel-elevated rounded-3xl border border-white/10 p-8 max-w-lg mx-auto space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto text-slate-300">
              <Code2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">
              {activeTab === 'saved' ? 'No Saved Prompts' : 'No Prompts Found'}
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
              {activeTab === 'saved'
                ? 'You have not liked or bookmarked any prompt works yet. Click the heart icon on any prompt to save it here!'
                : search || selectedTag !== 'All Tags'
                ? 'No prompts match the active filters or search terms. Try resetting your search.'
                : 'No master prompts have been posted in this category yet.'}
            </p>
            <div className="flex justify-center gap-3 pt-2">
              {(search || selectedTag !== 'All Tags') && (
                <button
                  onClick={() => {
                    setSearch('')
                    setSelectedTag('All Tags')
                    setCategory('All')
                  }}
                  className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-all"
                >
                  Reset Filters
                </button>
              )}
              <Link
                to="/create"
                className="px-6 py-2.5 rounded-full bg-white text-black font-extrabold text-xs hover:bg-slate-200 transition-all shadow-lg"
              >
                Post a Master Prompt
              </Link>
            </div>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[300px]"
          >
            <AnimatePresence>
              {filteredAndSortedWorks.map((work) => (
                <BentoCard
                  key={work.id}
                  work={work}
                  onQuickView={(w) => setSelectedModalWork(w)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* App Store Style Quick View Modal */}
      {selectedModalWork && (
        <PromptModal
          work={selectedModalWork}
          onClose={() => setSelectedModalWork(null)}
        />
      )}
    </div>
  )
}

export default Library