import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, Code2, Compass, Layers, Sparkles } from 'lucide-react'
import AuthPanel from '../components/AuthPanel'
import HeroVideoPlayer from '../components/HeroVideoPlayer'
import vbackground from '../assets/vbackground.mp4'
import vlb2Video from '../assets/VLB2.mp4'

const welcomePhrases = [
  {
    badge: 'Welcome to PromptPen',
    title: 'CRAFT STUNNING AI UIs.',
    subtitle: 'Generate, inspect, and copy exact prompt specifications for top AI models.\nCraft production-ready UI components in seconds.',
    tag: '100% Prompt Specs',
  },
  {
    badge: 'Community Showcase',
    title: 'BRING IDEAS TO LIFE.',
    subtitle: 'Discover real frontend creations built by developers & designers worldwide.\nInspect live code structures and interactive previews.',
    tag: 'Live Interactive Code',
  },
  {
    badge: 'Prompt Engineering',
    title: 'DESIGN WITH PRECISION.',
    subtitle: 'Copy exact, verified prompt engineering templates for ChatGPT, Claude & Gemini.\nEliminate trial-and-error in your AI workflows.',
    tag: 'Instant Clipboard Copy',
  },
  {
    badge: 'Ship Faster',
    title: 'ELEVATE YOUR BUILDS.',
    subtitle: 'Transform raw prompts into high-performance live frontend code instantly.\nAccelerate your web application design workflow.',
    tag: 'Developer Engine',
  },
]

function Login() {
  const [phraseIndex, setPhraseIndex] = useState(0)

  useEffect(() => {
    document.title = 'Sign In | PromptPen'

    const timer = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % welcomePhrases.length)
    }, 4500)

    return () => clearInterval(timer)
  }, [])

  const currentPhrase = welcomePhrases[phraseIndex]

  return (
    <div className="h-screen w-screen bg-[#0b0f19] text-white selection:bg-sky-400 selection:text-black relative overflow-hidden flex flex-col justify-between font-sans">
      {/* Background Video Player */}
      <HeroVideoPlayer
        videos={[vbackground, vlb2Video]}
        intervalMs={8000}
        opacityLevel="opacity-90"
        videoPosition="object-[22%_center]"
        overlayClass="absolute inset-0 bg-[#0b0f19]/40 backdrop-brightness-[0.96] pointer-events-none z-10"
      />

      {/* Ambient Top Light Mesh */}
      <div className="w-[500px] h-[400px] bg-gradient-to-b from-sky-500/20 via-indigo-500/10 to-transparent blur-[90px] absolute top-0 left-1/2 -translate-x-1/2 rounded-full pointer-events-none z-10" />

      {/* Main Container: Dynamic Left Text + Glass Form Card */}
      <div className="relative flex-1 flex items-center justify-between w-full px-6 sm:px-10 md:px-14 lg:pl-16 lg:pr-10 py-6 z-20 overflow-y-auto gap-8">
        {/* Left Side: Dynamic Welcome Text */}
        <div className="hidden lg:flex flex-col justify-center items-start max-w-xl lg:max-w-2xl w-full pointer-events-none pr-6">
          {/* Brand Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141b2d]/80 backdrop-blur-xl border border-white/20 mb-6 shadow-xl pointer-events-auto">
            <div className="w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
              <Terminal className="text-white w-3 h-3" />
            </div>
            <span className="font-extrabold text-[11px] tracking-widest text-white uppercase">
              Prompt<span className="text-sky-300">Pen</span>
            </span>
          </div>

          {/* Dynamic Rotating Text */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPhrase.title}
              initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -14, filter: 'blur(4px)' }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4 text-left w-full"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141b2d]/80 backdrop-blur-xl border border-white/20 shadow-lg text-[11px] font-bold text-white uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{currentPhrase.badge}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight uppercase leading-[1.05] text-white drop-shadow-md">
                {currentPhrase.title}
              </h1>

              <p className="text-slate-200 text-xs sm:text-sm font-medium leading-relaxed max-w-xl whitespace-pre-line">
                {currentPhrase.subtitle}
              </p>

              <div className="pt-1">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-[11px] font-semibold text-white backdrop-blur-md shadow-md">
                  <Code2 className="w-3.5 h-3.5 text-sky-300" />
                  <span>{currentPhrase.tag}</span>
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5 mt-8 pointer-events-auto">
            {welcomePhrases.map((_, i) => (
              <button
                key={i}
                onClick={() => setPhraseIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  phraseIndex === i ? 'w-6 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/60'
                }`}
                title={`Switch to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Right Side: Glass Login Form Panel */}
        <div className="w-full lg:w-auto flex justify-center lg:justify-end">
          <AuthPanel />
        </div>
      </div>

      {/* Footer */}
      <footer className="py-3 px-6 text-center text-slate-400 text-[11px] font-medium relative z-20 shrink-0 w-full">
        PROMPTPEN &copy; {new Date().getFullYear()} — AI Component & Prompt Engine.
      </footer>
    </div>
  )
}

export default Login