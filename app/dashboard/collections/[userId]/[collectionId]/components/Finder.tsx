import LoaderSVG from '@/app/dashboard/components/svgs/LoaderSVG';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { AiFillCloseCircle, AiOutlineQuestionCircle } from 'react-icons/ai'
import { useDispatch, useSelector } from 'react-redux';
import { createAlert } from '@/redux/alertSlice';
import { RootState } from '@/redux/store';
import { motion } from 'framer-motion';


type Props = {
    isFinderVisible:Function,
    refetchColRef:Function,
    userId:string,
}

//MODAL COMPONENT
export default function Finder({isFinderVisible,refetchColRef,userId}:Props) {
    const collectionId = useSelector((state:RootState)=>state.collectionReducer.collection.collectionId)
    const session = useSelector((state:RootState)=>state.persistedUserReducer.user)
    
    const dispatch = useDispatch()
    const refetch = refetchColRef

    const [isTooltipVisible, setTooltipVisible] = useState(false);
    const [searchValue,setSearchValue] = useState('')
    const [resultUser,setResultUser] = useState<dbUser>()

    //loader while user is beign invited
    const [buffer,setBuffer] = useState(false) 

  const handleTooltipToggle = () => {
    setTooltipVisible(!isTooltipVisible);
  };


  //Dynamic search while typing
  useEffect(()=>{
    async function handleFinder(){
        if(/^\d+$/.test(searchValue)){
            try {
                const res = await axios.get(`/api/user/findUser/${searchValue}`)
                setResultUser(res.data)
            } catch (error) {
                //
            }
        }
      }
      handleFinder()
  },[searchValue])

  async function handleInvite(invitedId:string){
    if(invitedId === session._id){
        dispatch(createAlert({type:"warning",text:"You can't invite yourself!"}))
        return
    }else{
        try {
            setBuffer(true)
            const res = await axios.post(`/api/user/collections/${userId}/${collectionId}`,{invitedId})
            setBuffer(false)
    
            dispatch(createAlert({type:"info",text:res.data}))
    
            setSearchValue("")
            setResultUser(undefined)
            refetch(true)
        } catch (error) {
            console.log(error) 
        }
    }
  }

  return (
    <div className='bg-black bg-opacity-25 backdrop-blur-sm fixed inset-0 flex justify-center items-center w-screen h-screen z-40'>
        <div/>
        <motion.div 
            initial={{ opacity: 0, scale: 0.5 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.2, ease: "easeOut" }} 
            className='relative z-50 w-full h-full flex items-center justify-center'
            >
            <div className='relative w-[300px] bg-white rounded flex flex-col p-5 gap-3'>
                <AiFillCloseCircle 
                    onClick={()=>isFinderVisible(false)}  
                    size={20} 
                    className='text-red-500 ml-auto cursor-pointer'
                />
                <div className='flex items-center gap-3'>
                    <p className='text-2xl font-bold'>Finder</p>
                    <div
                        className='relative'
                        onMouseEnter={handleTooltipToggle}
                        onMouseLeave={handleTooltipToggle}
                        >
                        <AiOutlineQuestionCircle size={20} className='cursor-pointer'/>
                        {isTooltipVisible && (
                            <div className='absolute top-0 border left-5 bg-white p-2 rounded shadow min-w-max text-sm z-50'>
                                <p className='w-[150px] sm:w-max'>User Tag is a 5 digit number found next to your avatar.</p>
                            </div>
                        )}
                    </div>
                </div>
                <div className='relative flex items-center mx-auto'>
                    <p className='font-bold text-xl'>#</p>
                    <input 
                        type='text'
                        value={searchValue}
                        onChange={(e)=>setSearchValue(e.target.value)}
                        placeholder='Insert user tag' 
                        className='px-1 outline-none underline-none'
                    />
                    {resultUser &&
                        <div
                            onClick={()=>handleInvite(resultUser!._id)} 
                            className='absolute top-8 bg-white shadow border hover:bg-slate-100 cursor-pointer'
                            >
                            <div className='p-5 relative flex items-center justify-center'>
                                <p 
                                    className={`${buffer && 'opacity-20'}`}
                                    >
                                    {resultUser?.email}
                                </p>
                                {buffer &&
                                <div className='absolute'>
                                    <LoaderSVG size={50}/>
                                </div>
                                }
                            </div>
                        </div>
                    }
                </div>
            </div>
        </motion.div>
    </div>
  )
}
