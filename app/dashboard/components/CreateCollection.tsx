import { RootState } from '@/redux/store';
import axios from 'axios';
import React, { useState } from 'react'
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { createAlert } from '@/redux/alertSlice';
import { motion } from 'framer-motion';

type Props = {
    isModalVisible:Function,
    refetchRef:Function
}

export default function CreateCollection({isModalVisible,refetchRef}:Props) {
    const session = useSelector((state:RootState)=>state.persistedUserReducer.user)
    const dispatch = useDispatch()
    const refetch = refetchRef

    const [collectionName,setCollectionName] = useState("")
    
    async function handleCollectionAdd() {
        if(collectionName.length >= 5){
            try {
                await axios.post(`/api/user/collections/${session?._id}`, {
                    collection: collectionName,
                });
                //This refetch is passed in this order: Main --> CollectionTab --> this
                refetch(true)
                isModalVisible(false)
            } catch (error: any) {
                console.log(error)
                dispatch(createAlert({type:"warning",text:error.response.data.error}))
            }
        }else{
            dispatch(createAlert({type:"warning",text:"Collection name must be at least 5 characters."}))
        }
        
    }

  return (
    <div className='overflow-hidden p-5 sm:p-0 bg-black bg-opacity-25 backdrop-blur-sm fixed inset-0 flex justify-center items-center w-screen h-screen z-20'>
        <motion.div
            initial={{ opacity: 0, scale: 0.5 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.2, ease: "easeOut" }} 
            className='overflow-hidden flex flex-col w-full h-[200px] sm:w-[400px] sm:h-[200px] bg-neutral-900 text-white p-8 gap-5 rounded-xl shadow-md'
            >
            <p className='text-2xl'>Create Collection</p>
            <input 
                onChange={(e)=>setCollectionName(e.target.value)}
                type='text' 
                className='outline-none bg-transparent border-2 border-blue-300 text-white text-xl rounded h-11 w-full px-2 underline-none' 
                
            />
            <div className='flex justify-center'>
                <div className='flex items-center gap-5'>
                    <button
                        onClick={()=>isModalVisible(false)}
                        className='hover:bg-neutral-700 px-[20px] rounded-xl'
                        >
                        Cancel
                    </button>
                    <button 
                        onClick={handleCollectionAdd}
                        className='hover:bg-neutral-700 px-[35px] rounded-xl'
                        >
                        OK
                    </button>
                </div>
            </div>
        </motion.div>
    </div>
  )
}
