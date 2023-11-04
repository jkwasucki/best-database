import React, { useEffect, useState } from 'react'
import {BsInfoCircle} from 'react-icons/bs'
import {AiOutlineHome} from 'react-icons/ai'
import Link from 'next/link'
import { getCookie, setCookie } from 'cookies-next';
import { hasCookie } from 'cookies-next';
import { IoIosNotificationsOutline } from 'react-icons/io'
import { motion } from 'framer-motion'
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';


type Props = {
    isNavOpen?:Function
}
export default function NavbarLeft({isNavOpen}:Props) {
    const session = useSelector((state:RootState)=>state.persistedUserReducer.user)
    
    const [infoDismissed,setInfoDismissed] = useState<boolean | null>(null)
    const [isMobileScreen, setIsMobileScreen] = useState(false)
    function dismissToggler(){
        setCookie("infoActive",false)
        setInfoDismissed(true)
    }
   

    //Side popup info handler
    useEffect(() => {
        const isCookie = hasCookie('infoActive')
        if(!isCookie) setCookie('infoActive',true)

        const isInfoActive = getCookie('infoActive')
       
        if(isInfoActive === 'true'){
            setInfoDismissed(false)
        }else{
            //Info is dismissed, it wont be visible until browser gets reopened.
            setInfoDismissed(true)
        }
    }, [])
    

    //Device screen size tracker
    useEffect(()=>{
        const screenWidthThreshold = 450; 
      
        // Check the screen width and conditionally render components
        const isMobileScreen = window.innerWidth <= screenWidthThreshold;
        setIsMobileScreen(isMobileScreen)
    },[])

    return (
    <motion.div
        initial={{ opacity: 0, y: -20 }} // Initial state (hidden and moved to the left)
        animate={{ opacity: 1, y: 0 }} // Animate to visible and original position
        exit={{ opacity: 0, x: '100%' }} //When leaving the dom, animate out
        transition={{ duration: 0.3}}
        className={`${isMobileScreen ? 'top-[80px] left-3' : 'top-0 left-0'} fixed bg-neutral-100 py-2 rounded-xl z-10 shadow-xl border sm:relative sm:border-none sm:shadow-none`}
        >
        <div className='w-full min-h-full flex-col text-neutral-900 flex'>
            <div className='flex mx-auto flex-col gap-6 text-[15px] items-center w-[200px] px-3 sm:mt-[40px]  bg-opacity-50'>
                <Link 
                    href={`/dashboard/session/${session._id}`}
                    onClick={()=>{isNavOpen && isNavOpen!()}} 
                    className='w-full flex justify-start items-center gap-4 cursor-pointer sm:hover:border-blue-200 sm:hover:bg-blue-100 sm:px-3 rounded-xl'
                >
                    <AiOutlineHome size={20}/>
                    <p>Home</p>
                </Link>
                <Link 
                    href='/dashboard/notifications' 
                    onClick={()=>isNavOpen && isNavOpen!()} 
                    className='w-full flex justify-start gap-4 cursor-pointer sm:hover:border-blue-200 sm:hover:bg-blue-100 sm:px-3 rounded-xl'
                >
                    <IoIosNotificationsOutline size={20}/>
                    <p>Notifications</p>
                </Link>
                <div className='w-full flex justify-start gap-4 cursor-pointer sm:hover:border-blue-200 sm:hover:bg-blue-100 sm:px-3 rounded-xl'>
                    <BsInfoCircle size={20}/>
                    <p>Info</p>
                </div>
            </div>
        </div>
    </motion.div>
  )
}
