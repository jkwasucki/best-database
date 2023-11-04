import React, { useEffect, useState } from 'react'
import "node_modules/video-react/dist/video-react.css"; // import css
import ReactPlayer from 'react-player'
import LoaderSVG from '../svgs/LoaderSVG';

type Props = {
    file:mongoFileRef,

}
export default function VideoContent({file}:Props) {
    const [loadReady,setLoadReady] = useState(false)

    //Delay until loaded.
    useEffect(() => {
     setTimeout(()=>{
        setLoadReady(true)
     },550)
    }, [])
    
    return (
        <div className='fixed w-screen h-screen flex justify-center items-center z-40'>
            <div className='max-h-[300px] sm:max-h-[600px] sm:min-h-[300px] sm:max-w-[900px] w-full h-full rounded-xl overflow-hidden !important'>
               {loadReady &&
                    <ReactPlayer url={file.url} controls volume={1} width="100%" height="100%" />
                }
            </div>
            {!loadReady &&
                <LoaderSVG size={150}/>
            }
        </div>
      );
}
