import { useEffect, useRef, useState } from 'react'

function HeroVideoPlayer({ videos = [], intervalMs = 7000, overlayClass = '', opacityLevel = 'opacity-90', videoPosition = 'object-center' }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const videoRefs = useRef([])

  // Ensure all video elements continuously play in the background to prevent black flashes or glitches
  useEffect(() => {
    videoRefs.current.forEach((v) => {
      if (v) {
        v.muted = true
        v.play().catch(() => {})
      }
    })
  }, [videos])

  useEffect(() => {
    if (videos.length <= 1) return

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % videos.length)
    }, intervalMs)

    return () => clearInterval(timer)
  }, [videos.length, intervalMs])

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#030303]">
      {videos.map((vSrc, idx) => {
        const isActive = activeIndex === idx
        return (
          <video
            key={vSrc}
            ref={(el) => (videoRefs.current[idx] = el)}
            src={vSrc}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className={`w-full h-full object-cover ${videoPosition} absolute inset-0 transition-opacity duration-1000 ease-in-out pointer-events-none ${
              isActive
                ? `${opacityLevel} z-10`
                : 'opacity-0 z-0'
            }`}
          />
        )
      })}
      {overlayClass && <div className={overlayClass} />}
    </div>
  )
}

export default HeroVideoPlayer
