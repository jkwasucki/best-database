'use client'
import { RootState } from "@/redux/store";
import axios from "axios";
import { useEffect, useState } from "react";
import { BsFileEarmarkMusicFill, BsFillFileEarmarkTextFill } from "react-icons/bs";
import { MdInsertPhoto, MdMovie, MdOutlineFindReplace } from "react-icons/md";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { referenceFile } from "@/redux/fileSlice";
import FileViewer from "../components/FileViewer";
import { updateCollectionId } from "@/redux/collectionSlice";
import { useSearchParams } from 'next/navigation'
import { useRouter } from "next/navigation";

export default function SearchResults() {
    const session = useSelector((state:RootState)=>state.persistedUserReducer.user)
    const dispatch = useDispatch()
    const router = useRouter()
    //Listen to changes in query (in searched phrase)
    const searchParams = useSearchParams()
    const search = searchParams.get('phrase')

    const [results,setResults] = useState<mongoFileRef[]>()
    const [fileViewerVisible,setFileViewerVisible] = useState(false)
    const [refetch,setRefetch] = useState(false)
   
    
    //Fetch search results
    useEffect(() => {
        async function fetchResults(){
            const url = new URL(window.location.href);
            const phrase = url.searchParams.get("phrase")
            const response = await axios.get<mongoFileRef[]>(`/api/user/search/${session._id}?phrase=${phrase}`)
            setResults(response.data)
        }
        fetchResults()
    },[refetch,search])

    

    async function insideWhatCollection(file:mongoFileRef) {
        const extractedCollectionId = file.fullPath.match(/col\+(.*?)\//)!;
        const insideCollection = await axios.get(`/api/user/collections/${session._id}/${extractedCollectionId[1]}`)
        return insideCollection.data.name
    }

    async function handleRedirect(file:mongoFileRef){
        const extractedCollectionId = file.fullPath.match(/col\+(.*?)\//)!;
        const insideCollection = await axios.get(`/api/user/collections/${session._id}/${extractedCollectionId[1]}`)
        router.push(`/dashboard/collections/${session?._id}/${insideCollection.data._id}`)
        dispatch(referenceFile({file:file,for:"scrollInView"}))
    }

    function refetchFiles(refetch:boolean){
        if(refetch) setRefetch(true)
      }

    function handleViewer(file:mongoFileRef){
        dispatch(referenceFile(file))
        setFileViewerVisible(true)

        const extractedCollectionId = file.fullPath.match(/col\+(.*?)\//);
        dispatch(updateCollectionId({collectionId:extractedCollectionId![1]}))
      }

      function handleFileViewer(status:boolean){
        if(status) setFileViewerVisible(true)
        if(!status) setFileViewerVisible(false)
      }

    function handleIcons(file:mongoFileRef){
        switch(file.type){
            case "text":
                return <BsFillFileEarmarkTextFill size={20}/>
            case "video":
                return <MdMovie className='text-red-700' size={20}/>
            case "image":
                return <MdInsertPhoto className='text-blue-700' size={20}/>
            case "audio":
                return <BsFileEarmarkMusicFill className='text-blue-700' size={20}/>
            case "application":
                return <BsFillFileEarmarkTextFill size={20}/>
        }
    }

  return (
    <div className='px-2 h-[590px] bg-white w-[calc(100vw-10px)] rounded-[15px] sm:max-w-[calc(100vw-450px)] sm:w-[calc(100vw-230px)] sm:min-w-[700px]  sm:h-[calc(100vh-100px)]  sm:p-5 shadow-sm flex flex-col gap-6'>
        {results && results?.length === 0 &&
            <div className="w-full h-full flex justify-center items-center">
                <div className="flex flex-col items-center text-center">
                    <MdOutlineFindReplace size={100} className='text-slate-300' />
                    <p className="text-2xl">Couldn't find the file.</p>
                    <p>Correct your spelling or check if the file actually exists.</p>
                </div>
            </div>
        }
        {results && results.length > 0 &&
            <div className="w-full h-full flex flex-col p-4">
                <p className="text-3xl font-light mb-12">Search results</p>
                <div className="w-full flex justify-between pb-2 px-5">
                    <p>Name</p>
                    <p>Location</p>
                </div>
                {results?.map((res)=>{
                return (
                    <div 
                        onClick={()=>handleRedirect(res)} key={res._id} className="w-full flex justify-between items-center h-12  border-l-transparent border-r-transparent border-t-black border-b-black hover:bg-neutral-100 cursor-pointer">
                        <div className="w-full flex justify-between">
                            <div className="w-1/3 flex items-center gap-4 ml-5">
                                {handleIcons(res)}
                                <p>{res.name}</p>
                            </div>
                            <div className="w-1/3 flex items-center gap-1">
                                <p>Created at: </p>
                                <p>{new Date(res.createdAt).toLocaleString()}</p>
                            </div>
                            <div className="w-1/3 flex items-end justify-end gap-1 cursor-pointer ">
                                <div className="flex justify-start bg-white rounded-xl px-2 gap-1 border shadow">
                                    <p className="font-semibold max-w-[150px] truncate">
                                        <span className="text-ellipsis whitespace-nowrap overflow-hidden overflow-ellipsis">{insideWhatCollection(res)}</span>
                                    </p>
                                    <p>collection</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )
                })}
            </div>
        }
        {fileViewerVisible && 
            <FileViewer 
                isfileViewerVisible={handleFileViewer} 
                refetchFilesRef={refetchFiles}
            />
        }
    </div>
  )
}
