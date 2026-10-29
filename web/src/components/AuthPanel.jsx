import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, LogIn, UserPlus, Send, Mail, Lock, User, Info, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db, googleProvider, githubProvider } from '../firebase'

let toastId = 0
const tabs = [
  { id: 'signin', label: 'Login' },
  { id: 'signup', label: 'Register' },
]

function AuthPanel() {
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)

  // Retrieve target redirect path from location state or URL search params
  const redirectTarget = location.state?.redirect || searchParams.get('redirect') || '/home'
  const autoCopy = location.state?.autoCopy || searchParams.get('autoCopy') === 'true'

  const [tab, setTab] = useState('signin')
  const [toasts, setToasts] = useState([])
  const [showPass, setShowPass] = useState(false)
  const [showSignupPass, setShowSignupPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const [signinForm, setSigninForm] = useState({ email: '', password: '' })
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '' })
  const [recoverEmail, setRecoverEmail] = useState('')

  function showToast(message, type = 'info') {
    const id = toastId++
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }

  function getFinalDestination() {
    if (autoCopy && !redirectTarget.includes('autoCopy=true')) {
      const separator = redirectTarget.includes('?') ? '&' : '?'
      return `${redirectTarget}${separator}autoCopy=true`
    }
    return redirectTarget
  }

  function parseAuthError(err) {
    const code = err?.code || ''
    if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
      return "Invalid email or password. If you don't have an account yet, please click the 'Register' tab above!"
    }
    if (code === 'auth/email-already-in-use') {
      return "An account with this email already exists! Click the 'Login' tab to sign in."
    }
    if (code === 'auth/weak-password') {
      return "Password should be at least 6 characters long."
    }
    if (code === 'auth/invalid-email') {
      return "Please enter a valid email address."
    }
    return err.message || "Authentication failed. Please check your details."
  }

  async function handleGoogleLogin() {
    setLoading(true)
    try {
      await signInWithPopup(auth, googleProvider)
      showToast('Logged in successfully', 'success')
      navigate(getFinalDestination(), { replace: true })
    } catch (err) {
      showToast(parseAuthError(err), 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleGithubLogin() {
    setLoading(true)
    try {
      await signInWithPopup(auth, githubProvider)
      showToast('Logged in successfully', 'success')
      navigate(getFinalDestination(), { replace: true })
    } catch (err) {
      showToast(parseAuthError(err), 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleSignin(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, signinForm.email, signinForm.password)
      showToast('Logged in successfully', 'success')
      navigate(getFinalDestination(), { replace: true })
    } catch (err) {
      showToast(parseAuthError(err), 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleSignup(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await createUserWithEmailAndPassword(auth, signupForm.email, signupForm.password)
      await setDoc(doc(db, 'users', result.user.uid), {
        name: signupForm.name,
        email: result.user.email,
        createdAt: new Date().toISOString(),
      })
      showToast('Account created successfully!', 'success')
      navigate(getFinalDestination(), { replace: true })
    } catch (err) {
      showToast(parseAuthError(err), 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleRecover(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await sendPasswordResetEmail(auth, recoverEmail)
      showToast('Reset link sent to your email', 'success')
      setTab('signin')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full bg-[#141b2d]/80 backdrop-blur-md border border-white/15 focus:border-sky-400/60 focus:bg-[#182239] pl-10 pr-10 py-3 text-white text-xs sm:text-sm rounded-2xl outline-none transition-all placeholder:text-slate-400 shadow-inner'
  const labelClass = 'block text-xs font-medium text-slate-300 mb-1 text-left'

  return (
    <div className="w-full max-w-[440px] ml-auto mr-0 relative z-20">
      {/* Redirect Notice Banner (if user was prompted to login to copy a prompt) */}
      {redirectTarget !== '/home' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3.5 rounded-2xl bg-[#141b2d]/95 border border-white/20 backdrop-blur-xl flex items-center gap-3 shadow-xl text-left"
        >
          <Info className="w-4 h-4 text-sky-400 shrink-0" />
          <div className="text-[11px]">
            <p className="font-bold text-white">Log in / Sign up required</p>
            <p className="text-slate-300">Sign in to automatically copy prompt & view this creation.</p>
          </div>
        </motion.div>
      )}

      {/* Glassmorphic Ultra-Translucent Card */}
      <div className="rounded-3xl bg-[#0f1422]/85 backdrop-blur-3xl border border-white/20 p-7 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.7)] relative overflow-hidden text-center">
        {/* Header Title & Disclaimer */}
        <div className="mb-6 space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-snug">
            {tab === 'signin' ? 'Sign in to PromptPen' : tab === 'signup' ? 'Create your account' : 'Reset Password'}
          </h2>
          <p className="text-slate-400 text-[11px] font-normal">
            By continuing, you agree to our <span className="underline cursor-pointer hover:text-white">privacy policy</span>.
          </p>
        </div>

        {/* Capsule Pill Tab Switcher */}
        <div className="flex items-center p-1 rounded-full bg-[#141b2d]/90 backdrop-blur-md border border-white/15 mb-6">
          {tabs.map((t) => {
            const isActive = tab === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className="relative flex-1 py-2 rounded-full text-xs font-bold transition-all duration-300 select-none text-center"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeAuthTab"
                    className="absolute inset-0 rounded-full bg-white shadow-md shadow-white/20 -z-10"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className={isActive ? 'text-black font-extrabold' : 'text-white/70 hover:text-white'}>
                  {t.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* Tab Forms */}
        <AnimatePresence mode="wait">
          {tab === 'signin' && (
            <motion.div
              key="signin"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* White Glass Social Action Buttons (Reference Image 1 style) */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-2xl bg-white text-black hover:bg-neutral-200 text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2.5 shadow-lg active:scale-[0.98]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <button
                  type="button"
                  onClick={handleGithubLogin}
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2.5 shadow-md active:scale-[0.98]"
                >
                  <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  <span>Continue with GitHub</span>
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-white/15" />
                <span className="text-white/40 text-[10px] font-medium lowercase">or</span>
                <div className="flex-1 h-px bg-white/15" />
              </div>

              {/* Form Input */}
              <form onSubmit={handleSignin} className="space-y-3">
                <div>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="email"
                      required
                      value={signinForm.email}
                      onChange={(e) => setSigninForm({ ...signinForm, email: e.target.value })}
                      placeholder="enter your email"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={signinForm.password}
                      onChange={(e) => setSigninForm({ ...signinForm, password: e.target.value })}
                      placeholder="••••••••••••"
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-0.5">
                  <button
                    type="button"
                    onClick={() => setTab('recover')}
                    className="text-[11px] text-white/50 hover:text-white transition-colors font-medium"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 text-xs sm:text-sm font-bold rounded-2xl transition-all duration-200 shadow-md flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                >
                  <span>Continue with email</span>
                  <LogIn className="w-4 h-4" />
                </button>
              </form>

              {/* Bottom Navigation Link (Reference Image 1 Close button style) */}
              <div className="pt-2">
                <Link
                  to="/home"
                  className="text-xs text-white/50 hover:text-white font-medium transition-colors"
                >
                  Close / Back to Home
                </Link>
              </div>
            </motion.div>
          )}

          {tab === 'signup' && (
            <motion.div
              key="signup"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-3.5"
            >
              <form onSubmit={handleSignup} className="space-y-3">
                <div>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      required
                      value={signupForm.name}
                      onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                      placeholder="full name"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="email"
                      required
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      placeholder="enter your email"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type={showSignupPass ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      placeholder="••••••••••••"
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPass(!showSignupPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                    >
                      {showSignupPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-black hover:bg-neutral-200 py-3.5 text-xs sm:text-sm font-extrabold uppercase tracking-wider rounded-2xl transition-all duration-200 shadow-xl flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 mt-1"
                >
                  <span>CREATE ACCOUNT</span>
                  <UserPlus className="w-4 h-4" />
                </button>
              </form>

              <div className="pt-2">
                <Link
                  to="/home"
                  className="text-xs text-white/50 hover:text-white font-medium transition-colors"
                >
                  Close / Back to Home
                </Link>
              </div>
            </motion.div>
          )}

          {tab === 'recover' && (
            <motion.div
              key="recover"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-3.5"
            >
              <form onSubmit={handleRecover} className="space-y-3.5">
                <div>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="email"
                      required
                      value={recoverEmail}
                      onChange={(e) => setRecoverEmail(e.target.value)}
                      placeholder="enter your email"
                      className={inputClass}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-black hover:bg-neutral-200 py-3.5 text-xs sm:text-sm font-extrabold uppercase tracking-wider rounded-2xl transition-all duration-200 shadow-xl flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 mt-1"
                >
                  <span>SEND RESET LINK</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setTab('signin')}
                  className="text-xs text-white/50 hover:text-white font-medium transition-colors"
                >
                  Back to Sign In
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Toast Alerts */}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none text-left">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ x: 80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 80, opacity: 0 }}
              className={`px-4 py-3 rounded-2xl shadow-2xl font-semibold text-xs flex items-center gap-2 backdrop-blur-xl border ${
                t.type === 'error'
                  ? 'bg-red-950/90 text-red-200 border-red-500/40'
                  : t.type === 'success'
                  ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40'
                  : 'bg-white text-black border-white'
              }`}
            >
              {t.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400" />
              )}
              <span>{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default AuthPanel