import React, { useEffect, useState } from 'react'
import {AiOutlineSearch} from 'react-icons/ai'
import { useRouter } from 'next/navigation'
import { BiRightArrowAlt } from 'react-icons/bi'
import { motion } from 'framer-motion'


export default function Search() {
    const router = useRouter()
    const [searchTerm,setSearchTerm] = useState("")
    const [searchExtended,setSearchExtended] = useState(false)
    const [isMobileScreen,setIsMobileScreen] = useState(false)

    function handleSearch(e:React.KeyboardEvent<HTMLInputElement>) {
        if(searchTerm.length === 0){
            return
        }
        //If enter is pressed
        if(e.key === 'Enter'){
            const encodedSearchTerm = encodeURIComponent(searchTerm);
            
            router.push(`/dashboard/search?phrase=${encodedSearchTerm}`);
            
        //If icon is clicked
        }else if(e.key === undefined){
            const encodedSearchTerm = encodeURIComponent(searchTerm);
            router.push(`/dashboard/search?phrase=${encodedSearchTerm}`);
        }
       
    }
   
    //Device screen size tracker
    useEffect(()=>{
        const screenWidthThreshold = 450; 
      
        // Check the screen width and conditionally render components
        const isMobileScreen = window.innerWidth <= screenWidthThreshold;
        
        setIsMobileScreen(isMobileScreen)
    },[])

    return (
        <>
            {isMobileScreen ? 
                <motion.div
                    animate={{ width: searchExtended ? 'calc(100vw - 110px)' : '40px' }}
                    initial={{ width: '40px' }}
                    transition={{ duration: 0.3 }}
                    className={`relative rounded-full h-[40px] bg-slate-200 flex justify-start items-center  sm:gap-3 shadow-sm`}
                    >
                    <AiOutlineSearch
                        size={20}
                        className={`sm:ml-5 cursor-pointer mx-3 absolute` }
                        onClick={() => setSearchExtended(!searchExtended)}
                    />
                    {searchExtended && (
                        <>
                            <input
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleSearch}
                            type='text'
                            className={`ml-3 pl-8 bg-slate-200 select-none w-full  rounded-full text-black outline-none underline-none`}
                            />
                            <BiRightArrowAlt onClick={handleSearch} size={20} className='mr-2'/>
                        </>
                    
                    )}
                </motion.div>
                :
                <div className='px-3 rounded-full h-[40px] sm:w-[calc(100vw-830px)] sm:min-w-[300px] sm:rounded-[15px] bg-slate-200 flex items-center justify-start sm:gap-3 shadow-sm'>
                    <AiOutlineSearch
                        size={20}
                        className='sm:ml-5 cursor-pointer'
                        onClick={handleSearch}
                    />
                     <input
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleSearch}
                        type='text'
                        className={`underline-none px-2 bg-slate-200 select-none w-full text-black outline-none underline-none`}
                    />
                </div>
            }
        </>
    )
}
