import { Link, useLocation, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { Plus, LogOut, Heart, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { auth } from '../firebase'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut(auth)
    navigate('/home')
  }

  const navItems = [
    { name: 'Discover', path: '/home' },
    { name: 'Library', path: '/library' },
    ...(user ? [{ name: 'Saved', path: '/library?tab=saved' }] : []),
    ...(user ? [{ name: 'Profile', path: '/profile' }] : []),
  ]

  return (
    <header className="fixed top-4 sm:top-5 left-0 right-0 z-[999] flex justify-center px-4 pointer-events-none">
      {/* Floating Connected Capsule Dock */}
      <nav className="pointer-events-auto flex items-center gap-1.5 p-1.5 rounded-full bg-[#0d1322]/90 backdrop-blur-2xl border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.7)] transition-all duration-300">
        {/* Left Circular Pod: Brand Logo Badge ("P.") */}
        <Link
          to="/home"
          className="w-9 h-9 rounded-full bg-white text-black font-black text-sm flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
          title="PromptPen Home"
        >
          P.
        </Link>

        {/* Central Connected Capsule: Menu with active animated pill */}
        <div className="flex items-center px-3 sm:px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/10 gap-1 sm:gap-2">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path === '/home' && location.pathname === '/') ||
              (item.path === '/library?tab=saved' && location.search.includes('tab=saved'))
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`relative px-3 py-1 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all ${
                  isActive ? 'text-black font-extrabold' : 'text-slate-300 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavPill"
                    className="absolute inset-0 rounded-full bg-white shadow-md shadow-white/20 -z-10"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>

        {/* Right Capsule Pod: CTA Actions */}
        <div className="flex items-center pl-1">
          {user ? (
            <div className="flex items-center gap-1.5">
              <Link
                to="/create"
                className="px-4 py-2 rounded-full bg-white text-black font-extrabold text-xs shadow-md hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all whitespace-nowrap flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span className="hidden sm:inline">Post Work</span>
                <span className="sm:hidden">Post</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-5 py-2 rounded-full bg-white text-black font-extrabold text-xs shadow-md hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Navbar