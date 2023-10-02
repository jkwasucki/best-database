'use client'
import getCollection from "@/utils/getCollection"
import getFiles from "@/utils/getFiles"
import { Suspense, useEffect, useState } from "react"
import Upload from "@/app/dashboard/components/Upload"
import FileList from "./components/FileList"
import ColSettings from "./components/ColSettings"
import Finder from "./components/Finder"
import {FiUsers} from 'react-icons/fi'
import ManageAccess from "./components/ManageAccess"
import axios from "axios"
import { useDispatch } from "react-redux"
import { updateAccessData, updateCollectionId, updateOwner, updatePartyData } from "@/redux/collectionSlice"
import { useSelector } from "react-redux"
import { RootState } from "@/redux/store"
import FileViewer from "@/app/dashboard/components/FileViewer"
import Avatar from "boring-avatars";
import { motion } from "framer-motion"
import Alert from "@/app/dashboard/components/Alert"

type Params = {
  params: {
    userId:string,
    collectionId:string
  }
}



export default function Collection({params:{userId,collectionId}}:Params) {
    const session = useSelector((state:RootState)=>state.persistedUserReducer.user)
    
    const partyData = useSelector((state:RootState)=>state.collectionReducer.collection.partyData)
    const dispatch = useDispatch()

    useEffect(()=>{
      dispatch(updateCollectionId({collectionId:collectionId}))
    },[collectionId])
    


    const [refetchFiles,setRefetchFiles] = useState(false)
    const [refetchCol,setRefetchCol] = useState(false)
    const [filesPromise,setFilesPromise] = useState<Promise<mongoFileRef[]> | null>(null)
    const [colPromise,setColPromise] = useState<Promise<collection> | null>(null)
    const [colRenderTrigger,setColRenderTrigger] = useState(0)
    const [col,setCol] = useState<collection>()
    const [showUsers,setShowUsers] = useState(false)


    const [fileViewerVisible,setFileViewerVisible] = useState(false)

    function handleViewerToggler(status:boolean){
      if(status) setFileViewerVisible(true)
      if(!status) setFileViewerVisible(false)
    }

    const [owner,setOwner] = useState({
      isOwner:false,
    })

    //modal switchers
    const [isFinderVisible,setIsFinderVisible] = useState(false)
    const [isManageAccessVisible, setIsManageAccesVisible] = useState(false)
    
    function handleColReRender(){
      setColRenderTrigger(colRenderTrigger + 1)
    }

    function reRenderFiles(refetch:boolean){
      if(refetch) setRefetchFiles(true)
    }
    function reRenderCol(refetch:boolean){
      if(refetch) setRefetchCol(true)
    }

    //MODAL 1
    function handleFinderToggler(status:boolean){
      if(status) setIsFinderVisible(true)
      if(!status) setIsFinderVisible(false)
    }

    //MODAL 2
    function handleAccesTabToggler(status:boolean){
      if(status) setIsManageAccesVisible(true)
      if(!status) setIsManageAccesVisible(false)
    }
   
    //FETCH COLLECTION DATA
    useEffect(()=>{
      async function fetchCol(){
        const colData:Promise<collection> = await getCollection(userId,collectionId)
        //collection is passed as a promise to the colSettings component
        setColPromise(colData)

        //collection is also directly aquired in this component to handle access settings
        const col = await colData
        setCol(col)
      
    
        //decide the owner
        if(col.owner === userId){

          setOwner({
            isOwner:true,
          })

          dispatch(updateOwner(
            {owner:{
              isOwner:true,
              user:""
            }}
          ))

        }else{
          const userObject:userObject = col.acces.find((user: userObject) => user._id === userId)!;
          dispatch(updateAccessData(
            {accessData:{
              canRename: userObject.canRename,
              canDelete: userObject.canDelete,
              canDownload: userObject.canDownload,
              canUpload: userObject.canUpload
            }}
          ))
          const ownerUser = await axios.get(`/api/user/findUserById/${col.owner}`)
          setOwner({
            isOwner:false,
          })
          dispatch(updateOwner(
            {owner:{
              isOwner:false,
              //Pass owner user reference
              user:ownerUser.data
            }}
          ))
        }
        setRefetchCol(false)
      } 
      fetchCol()
    },[session,refetchCol])


    //FETCH FILES
    useEffect(()=>{
      async function fetchFiles(){
        const fileData:Promise<mongoFileRef[]> = await getFiles(userId,collectionId)
        setFilesPromise(fileData)
        setRefetchFiles(false)
      } 
      fetchFiles()
    },[userId,refetchFiles])

   
    //Handle access data depending on owner boolean
    useEffect(() => {
    if(owner?.isOwner){
        dispatch(updatePartyData(
          {partyData:{
            sharedWithCount: col!.acces.length ,
            sharedWithUserObjects: col!.acces
          }}
        ))
      }
    }, [owner])

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }} // Initial state (hidden and moved to the left)
      animate={{ opacity: 1, y: 0 }} // Animate to visible and original position
      exit={{ opacity: 0, x: '100%' }} //When leaving the dom, animate out
      transition={{ duration: 0.3}} 
      className='h-[590px] w-[calc(100vw-10px)] bg-white rounded-[15px] sm:max-w-[calc(100vw-450px)] sm:w-[calc(100vw-230px)] sm:min-w-[700px] sm:h-[calc(100vh-100px)] shadow-sm flex flex-col px-5 py-5 gap-6'
      >
        <Alert/>
        <div className="relative flex items-center justify-between">
            {partyData?.sharedWithCount > 0 &&
            <div className="relative flex items-center gap-2">
                <p>Shared with:</p>
                <div 
                onClick={()=>setShowUsers(!showUsers)}
                className="flex items-center gap-1 font-bold cursor-pointer"
                >
                  <p>{partyData?.sharedWithCount}</p>
                  <FiUsers/>
                  {showUsers && 
                      <div className="absolute left-[150px] top-[-12] flex gap-4 p-3">
                          {partyData?.sharedWithUserObjects.map((user,index)=>{
                            return (
                              <motion.div
                                className="group relative flex flex-col items-center"
                                key={user._id} // Make sure to set a unique key for each item
                                initial={{ opacity: 0, x: -20 }} // Initial state (hidden and moved to the left)
                                animate={{ opacity: 1, x: 0 }} // Animate to visible and original position
                                transition={{ duration: 0.5, delay: index * 0.1 }} // Add delay based on the index
                                >
                                <Avatar
                                  size={40}
                                  name="Maria Mitchell"
                                  variant="beam"
                                  colors={["#2A2F4F", "#917FB3", "#E5BEEC", "#FDE2F3"]}
                                />
                                <p className="group-hover:block hidden absolute top-12 bg-white rounded-xl border px-2 text-sm">{user.email}</p>
                              </motion.div>
                            )
                          })}
                      </div>  
                  }
                </div>
            </div>}
        </div>
        <Suspense>
            <Upload 
              refetchRef={reRenderFiles} 
            />
            { colPromise && 
              <ColSettings 
                promise={colPromise} 
                refetchColRef={reRenderCol} 
                isFinderVisible={handleFinderToggler} 
                isManageAccessVisible={handleAccesTabToggler}
              />
            }
            { filesPromise &&
              <FileList 
                promise={filesPromise} 
                refetchFilesRef={reRenderFiles} 
                isfileViewerVisible={handleViewerToggler}
              />
            }          
        </Suspense>
        {isFinderVisible && 
            <Finder 
              isFinderVisible={handleFinderToggler} 
              refetchColRef={reRenderCol}
              userId={userId}
            />
        }
        {isManageAccessVisible && 
            <ManageAccess
              isManageAccessVisible={handleAccesTabToggler}
              refetchColRef={reRenderCol}
            /> 
        }
        {fileViewerVisible && filesPromise && 
          <FileViewer
            promise={filesPromise}
            isfileViewerVisible={handleViewerToggler}
            refetchFilesRef={reRenderFiles}  
          />
        }
    </motion.div>
  )
}




