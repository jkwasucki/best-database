'use client'
import React, { Suspense, useEffect, useState } from 'react'
import Upload from './Upload'
import getFiles from "@/utils/getAllFiles";
import CollectionTab from './CollectionTab';
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';
import File from './File';
import { motion } from 'framer-motion';

export default function Main() {
  const session = useSelector((state:RootState)=>state.persistedUserReducer.user)
  
  const [colRenderTrigger,setColRenderTrigger] = useState(-100) 
  const [uploadRenderTrigger,setUploadRenderTrigger] = useState(100)

  const [fileViewerVisible,setFileViewerVisible] = useState(false)

  function handleFileViewer(status:boolean){
    if(status) setFileViewerVisible(true)
    if(!status) setFileViewerVisible(false)
  }

  function handleUploadReRender(){
    setUploadRenderTrigger(uploadRenderTrigger + 1)
  }

  const [refetch,setRefetch] = useState(true)
  const [filePrevs, setFilePrevs] = useState<Promise<mongoFileRef[]> | null>(null);

  function refetchFiles(refetch:boolean){
    if(refetch) setRefetch(true)
  }


  //Fetch files
  useEffect(() => {
    if(session._id.length > 1){
      // When refetch is true, fetch the files
      setFilePrevs(getFiles(session?._id));
      setRefetch(false); // Reset the refetch state
    }
  }, [refetch]);


  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }} // Initial state (hidden and moved to the left)
      animate={{ opacity: 1, y: 0 }} // Animate to visible and original position
      exit={{ opacity: 0, x: '100%' }} //When leaving the dom, animate out
      transition={{ duration: 0.3}} 
      className='px-2 h-[590px] bg-white w-[calc(100vw-10px)] rounded-[15px] sm:max-w-[calc(100vw-450px)] sm:w-[calc(100vw-230px)] sm:min-w-[700px] sm:p-5  sm:h-[calc(100vh-100px)] shadow-sm flex flex-col gap-6'
      >
        <div className='relative pt-2'>
            <Upload 
                refetchRef={refetchFiles}
            />
        </div>
        <p className='text-[15px]'>Recent files</p>
        <div className='sm:min-h-[180px] h-full sm:max-h-[180px] flex gap-4 overflow-x-auto overflow-y-hidden'>
            <Suspense>
                {filePrevs && 
                    <File
                        promise={filePrevs}
                    />
                }
            </Suspense>
        </div>
        <CollectionTab 
            key={colRenderTrigger} 
            onEvent={handleUploadReRender} 
            refetchRef={refetchFiles}
        />
    </motion.div>
  )
}