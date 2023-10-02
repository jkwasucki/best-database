import React from 'react'
import ReactAudioPlayer from 'react-audio-player';


type Props = {
    file:mongoFileRef,

}

export default function AudioContent({file}:Props) {
  return (
    <div className='fixed w-screen min-h-screen flex items-center justify-center z-40'>
      <ReactAudioPlayer
          src={file.url}
          autoPlay
          controls
      />
    </div>
    
  )
}
