import { useState } from 'react'
import vbackground from '../assets/vbackground.mp4'

const channels = [vbackground]

function VideoPanel() {
  const [channelIndex] = useState(0)

  return (
    <div className="hidden lg:block lg:w-[55%] h-full relative overflow-hidden bg-black">
      <video
        key={channels[channelIndex]}
        className="w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src={channels[channelIndex]} type="video/mp4" />
      </video>
    </div>
  )
}

export default VideoPanel