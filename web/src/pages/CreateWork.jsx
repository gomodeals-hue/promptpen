import { useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Play,
  Sparkles,
  Code2,
  Image as ImageIcon,
  MessageSquare,
  Video,
  Upload,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { createWork } from '../services/workService'
import { uploadImageFile } from '../services/imageUploadService'

const codeCategories = ['UI & Web Code', 'Web Design', 'Component', 'Landing Page', 'Mobile UI', 'Other']
const imageCategories = ['AI Image Gen', 'Image Edit', 'Product & Brand', 'Portrait & Face', '3D Avatar', 'Art Style']
const textCategories = ['ChatGPT & LLMs', 'SEO & Marketing', 'System Prompts', 'Coding Assistants', 'Copywriting']
const videoCategories = ['AI Video & Motion', 'Cinematic Camera', 'Runway Gen-3', 'Sora Prompts']

function CreateWork() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [workType, setWorkType] = useState('code') // 'code' | 'image' | 'text' | 'video'
  const [form, setForm] = useState({
    title: '',
    category: codeCategories[0],
    aiTool: 'Claude 3.7 / ChatGPT',
    prompt: '',
    html: '',
    css: '',
    js: '',
    combined: '',
    imageUrl: '',
    inputImageUrl: '',
    textOutput: '',
    videoUrl: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingInputImage, setUploadingInputImage] = useState(false)
  const [error, setError] = useState('')

  async function handleFileUpload(file, fieldName) {
    if (!file) return
    setError('')
    if (fieldName === 'imageUrl') setUploadingImage(true)
    if (fieldName === 'inputImageUrl') setUploadingInputImage(true)

    try {
      const uploadedUrl = await uploadImageFile(file)
      setForm((prev) => ({ ...prev, [fieldName]: uploadedUrl }))
    } catch (err) {
      setError(`Image upload error: ${err.message}`)
    } finally {
      if (fieldName === 'imageUrl') setUploadingImage(false)
      if (fieldName === 'inputImageUrl') setUploadingInputImage(false)
    }
  }

  const combinedCode = useMemo(() => {
    if (form.combined) return form.combined

    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { margin: 0; font-family: system-ui, sans-serif; background: #0b0f19; color: #f8fafc; }
      ${form.css || ''}
    </style>
  </head>
  <body>
    ${form.html || '<div style="padding:20px;text-align:center;">Interactive Component Preview</div>'}
    <script>${form.js || ''}</script>
  </body>
</html>`
  }, [form.combined, form.html, form.css, form.js])

  const handleTypeSwitch = (type) => {
    setWorkType(type)
    let defaultCat = codeCategories[0]
    let defaultTool = 'Claude 3.7 / ChatGPT'

    if (type === 'image') {
      defaultCat = imageCategories[0]
      defaultTool = 'Midjourney v6'
    } else if (type === 'text') {
      defaultCat = textCategories[0]
      defaultTool = 'ChatGPT / Claude 3.7'
    } else if (type === 'video') {
      defaultCat = videoCategories[0]
      defaultTool = 'Sora / Runway Gen-3'
    }

    setForm((prev) => ({
      ...prev,
      category: defaultCat,
      aiTool: defaultTool,
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const payload = {
        ...form,
        workType,
        code: workType === 'code' ? combinedCode : undefined,
      }

      await createWork(payload, user)
      navigate('/library')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full bg-[#141b2d]/90 border border-white/15 px-4 py-3 text-white text-xs sm:text-sm rounded-xl outline-none focus:border-sky-400 focus:bg-[#182239] transition-all shadow-inner'
  const labelClass = 'block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5'

  const currentCategories =
    workType === 'image'
      ? imageCategories
      : workType === 'text'
      ? textCategories
      : workType === 'video'
      ? videoCategories
      : codeCategories

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white relative font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-10 pt-28 sm:pt-36 pb-20">
        <button
          type="button"
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/home'))}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="mb-8">
          <span className="px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs font-bold uppercase tracking-wider mb-2 inline-block">
            Publish To Community
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Post Master AI Prompt & Work
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Share your verified prompts with fellow builders — whether it's UI web code, Midjourney artwork, ChatGPT frameworks, or Sora video motions.
          </p>
        </div>

        {/* Work Type Selection Pills */}
        <div className="flex items-center gap-2 mb-8 p-1.5 rounded-2xl bg-[#141b2d] border border-white/15 max-w-xl overflow-x-auto no-scrollbar shadow-lg">
          <button
            type="button"
            onClick={() => handleTypeSwitch('code')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              workType === 'code' ? 'bg-white text-black shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>UI & Code</span>
          </button>
          <button
            type="button"
            onClick={() => handleTypeSwitch('image')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              workType === 'image' ? 'bg-white text-black shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>AI Image</span>
          </button>
          <button
            type="button"
            onClick={() => handleTypeSwitch('text')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              workType === 'text' ? 'bg-white text-black shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>ChatGPT / LLM</span>
          </button>
          <button
            type="button"
            onClick={() => handleTypeSwitch('video')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              workType === 'video' ? 'bg-white text-black shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>AI Video</span>
          </button>
        </div>

        {error && (
          <p className="text-rose-300 text-xs sm:text-sm mb-6 p-4 bg-rose-950/60 border border-rose-500/30 rounded-2xl">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Work Title</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder={
                  workType === 'image'
                    ? 'Cyberpunk Neon Samurai Avatar'
                    : workType === 'text'
                    ? 'Senior Frontend Architect Persona'
                    : workType === 'video'
                    ? 'Cinematic Drone City Flythrough'
                    : 'Glassmorphic Login Card Component'
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>AI Tool / Model Used</label>
              <input
                type="text"
                required
                value={form.aiTool}
                onChange={(e) => setForm({ ...form, aiTool: e.target.value })}
                placeholder={
                  workType === 'image'
                    ? 'Midjourney v6 / DALL-E 3'
                    : workType === 'text'
                    ? 'ChatGPT GPT-4o / Claude 3.7'
                    : workType === 'video'
                    ? 'Sora / Runway Gen-3'
                    : 'Claude 3.7 Sonnet / Cursor'
                }
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={inputClass}
              >
                {currentCategories.map((c) => (
                  <option key={c} value={c} className="bg-[#141b2d] text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>
                Generated AI Result Image {workType === 'image' ? '(Required)' : '(Optional)'}
              </label>

              {/* Inbuilt File Upload Box */}
              <div className="relative rounded-2xl border border-dashed border-white/20 bg-white/[0.03] hover:bg-white/[0.06] p-4 text-center transition-all mb-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files?.[0], 'imageUrl')}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                  {uploadingImage ? (
                    <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading image to online CDN...</span>
                    </div>
                  ) : form.imageUrl ? (
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="truncate max-w-[240px]">Image Uploaded & Ready</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-slate-400" />
                      <p className="text-xs font-bold text-white">Click or drag image file here to upload</p>
                      <p className="text-[11px] text-slate-400">Directly hosted online via free image CDN</p>
                    </>
                  )}
                </div>
              </div>

              {/* URL Fallback */}
              <input
                type="url"
                required={workType === 'image' && !form.imageUrl}
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="Or paste direct image URL (https://...)"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Master Prompt</label>
            <textarea
              required
              rows={4}
              value={form.prompt}
              onChange={(e) => setForm({ ...form, prompt: e.target.value })}
              placeholder="Paste the exact master prompt instructions here..."
              className={`${inputClass} resize-none font-mono text-xs`}
            />
          </div>

          {workType === 'text' && (
            <div>
              <label className={labelClass}>Sample AI Output / Response (optional)</label>
              <textarea
                rows={5}
                value={form.textOutput}
                onChange={(e) => setForm({ ...form, textOutput: e.target.value })}
                placeholder="Paste sample output generated by ChatGPT/Claude with this prompt..."
                className={`${inputClass} resize-none font-mono text-xs`}
              />
            </div>
          )}

          {workType === 'code' && (
            <div className="grid lg:grid-cols-2 gap-6 pt-2">
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>HTML</label>
                  <textarea
                    rows={6}
                    value={form.html}
                    onChange={(e) => setForm({ ...form, html: e.target.value })}
                    placeholder={'<div class="card">\n  <h2>Hello World</h2>\n</div>'}
                    className={`${inputClass} resize-none font-mono text-xs`}
                  />
                </div>
                <div>
                  <label className={labelClass}>CSS</label>
                  <textarea
                    rows={6}
                    value={form.css}
                    onChange={(e) => setForm({ ...form, css: e.target.value })}
                    placeholder=".card { background: #1a2234; padding: 20px; border-radius: 12px; }"
                    className={`${inputClass} resize-none font-mono text-xs`}
                  />
                </div>
                <div>
                  <label className={labelClass}>JavaScript</label>
                  <textarea
                    rows={4}
                    value={form.js}
                    onChange={(e) => setForm({ ...form, js: e.target.value })}
                    placeholder="console.log('Component initialized');"
                    className={`${inputClass} resize-none font-mono text-xs`}
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-[#101626] p-5 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-slate-300">Live Component Preview</p>
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-sky-400 font-semibold">
                      <Play className="w-3.5 h-3.5" /> Interactive
                    </span>
                  </div>
                  <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#080d1a] h-[360px]">
                    <iframe
                      title="live-preview"
                      srcDoc={combinedCode}
                      sandbox="allow-scripts allow-modals allow-forms"
                      className="w-full h-full border-0"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-white text-black font-black text-sm rounded-2xl hover:bg-slate-100 hover:scale-[1.01] active:scale-95 transition-all shadow-xl shadow-white/10 disabled:opacity-50 cursor-pointer"
          >
            {submitting ? 'Publishing Creation...' : `Publish ${workType.toUpperCase()} Master Prompt`}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreateWork