import { useEffect, useState, useMemo } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { Link } from 'react-router-dom'
import {
  User,
  Sparkles,
  Copy,
  Heart,
  Plus,
  Layers,
  Code2,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import BentoCard from '../components/BentoCard'
import PromptModal from '../components/PromptModal'

function Profile() {
  const { user } = useAuth()
  const [works, setWorks] = useState([])
  const [savedWorks, setSavedWorks] = useState([])
  const [activeTab, setActiveTab] = useState('created') // 'created' | 'saved'
  const [loading, setLoading] = useState(true)
  const [selectedModalWork, setSelectedModalWork] = useState(null)

  useEffect(() => {
    if (!user) return
    document.title = 'My Profile & Creations | PromptPen'

    // Fetch creations by this user
    const qMyWorks = query(collection(db, 'works'), where('authorId', '==', user.uid))
    const unsubMyWorks = onSnapshot(qMyWorks, (snapshot) => {
      setWorks(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
      setLoading(false)
    })

    // Fetch all works to filter saved/liked works by this user
    const qAll = query(collection(db, 'works'))
    const unsubAll = onSnapshot(qAll, (snapshot) => {
      const all = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      const liked = all.filter((w) => Array.isArray(w.likedBy) && w.likedBy.includes(user.uid))
      setSavedWorks(liked)
    })

    return () => {
      unsubMyWorks()
      unsubAll()
    }
  }, [user])

  const totalCopies = useMemo(() => {
    return works.reduce((sum, w) => sum + (w.copiesCount || 0), 0)
  }, [works])

  const totalLikes = useMemo(() => {
    return works.reduce((sum, w) => sum + (w.likesCount || 0), 0)
  }, [works])

  const displayWorks = activeTab === 'created' ? works : savedWorks

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white relative font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 pt-28 sm:pt-36 pb-20">
        {/* Profile Card Header */}
        <div className="rounded-3xl glass-panel-elevated p-6 sm:p-8 border border-white/15 bg-[#12192c] mb-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-white via-slate-200 to-slate-400 flex items-center justify-center text-xl sm:text-2xl font-black text-black ring-4 ring-white/20 shadow-xl">
                {(user?.displayName || user?.email || '?').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {user?.displayName || user?.email?.split('@')[0]}
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm mt-0.5">{user?.email}</p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-500/30 text-sky-300 text-[11px] font-bold uppercase tracking-wider mt-2">
                  <Sparkles className="w-3 h-3" />
                  <span>Prompt Creator</span>
                </div>
              </div>
            </div>

            <Link
              to="/create"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-black font-extrabold text-xs sm:text-sm hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10 shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Post New Work</span>
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/10 text-center sm:text-left">
            <div className="sm:pl-2">
              <p className="text-2xl sm:text-3xl font-black text-white">{works.length}</p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">Works Posted</p>
            </div>
            <div className="border-l border-white/10 pl-4 sm:pl-8">
              <p className="text-2xl sm:text-3xl font-black text-sky-300">{totalCopies}</p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">Total Prompt Copies</p>
            </div>
            <div className="border-l border-white/10 pl-4 sm:pl-8">
              <p className="text-2xl sm:text-3xl font-black text-rose-300">{totalLikes}</p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">Total Likes Received</p>
            </div>
          </div>
        </div>

        {/* Tab Selector: Created vs Liked */}
        <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab('created')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'created'
                ? 'bg-white text-black shadow-md'
                : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            My Creations ({works.length})
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'saved'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Saved Prompts ({savedWorks.length})</span>
          </button>
        </div>

        {/* Works Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[290px]">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-2xl bg-white/[0.04] border border-white/10 animate-pulse h-full min-h-[290px]"
              />
            ))}
          </div>
        ) : displayWorks.length === 0 ? (
          <div className="text-center py-24 glass-panel-elevated rounded-3xl border border-white/10 p-8 max-w-md mx-auto space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto text-slate-300">
              <Code2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">
              {activeTab === 'created' ? 'No creations posted yet' : 'No saved prompts yet'}
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              {activeTab === 'created'
                ? 'Share your first prompt-driven component or AI creation with the community!'
                : 'Browse the library and click the heart on any prompt to save it to your collection.'}
            </p>
            <Link
              to={activeTab === 'created' ? '/create' : '/library'}
              className="inline-block px-6 py-2.5 rounded-full bg-white text-black font-bold text-xs hover:bg-slate-200 transition-all shadow-md"
            >
              {activeTab === 'created' ? 'Post Work' : 'Explore Library'}
            </Link>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[300px]">
            <AnimatePresence>
              {displayWorks.map((work) => (
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

export default Profile