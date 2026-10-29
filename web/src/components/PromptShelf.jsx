import { useRef } from 'react'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import BentoCard from './BentoCard'

function PromptShelf({ title, subtitle, icon: Icon, works = [], onSelectWork, viewAllCategory }) {
  const scrollContainerRef = useRef(null)

  const handleScroll = (direction) => {
    if (!scrollContainerRef.current) return
    const container = scrollContainerRef.current
    const scrollAmount = container.clientWidth * 0.75
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  if (!works || works.length === 0) return null

  return (
    <section className="relative py-6 sm:py-8">
      {/* Shelf Header */}
      <div className="flex items-end justify-between gap-4 mb-4 px-1">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white shrink-0 shadow-md">
              <Icon className="w-4 h-4 text-sky-300" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {title}
              </h2>
              <span className="text-[11px] font-bold text-white/50 bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
                {works.length}
              </span>
            </div>
            {subtitle && <p className="text-white/60 text-xs sm:text-sm mt-0.5">{subtitle}</p>}
          </div>
        </div>

        {/* Action / View All Link & Scroll Chevrons */}
        <div className="flex items-center gap-2">
          {viewAllCategory && (
            <Link
              to={`/library?category=${encodeURIComponent(viewAllCategory)}`}
              className="text-xs font-semibold text-white/70 hover:text-white flex items-center gap-1 transition-colors mr-2 hidden sm:flex"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          <button
            onClick={() => handleScroll('left')}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center transition-all active:scale-95 disabled:opacity-30 cursor-pointer shadow-md"
            title="Scroll Left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleScroll('right')}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center transition-all active:scale-95 disabled:opacity-30 cursor-pointer shadow-md"
            title="Scroll Right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Shelf (Netflix Style) */}
      <div
        ref={scrollContainerRef}
        className="flex items-stretch gap-5 overflow-x-auto no-scrollbar py-3 px-1 scroll-smooth snap-x snap-mandatory"
        style={{ scrollPaddingLeft: '4px' }}
      >
        {works.map((work) => (
          <div
            key={work.id}
            className="w-[280px] sm:w-[320px] md:w-[340px] shrink-0 snap-start h-[320px]"
          >
            <BentoCard work={work} onQuickView={onSelectWork} />
          </div>
        ))}
      </div>
    </section>
  )
}

export default PromptShelf
