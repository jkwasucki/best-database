'use client'
import { RootState } from '@/redux/store'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import LoaderSVG from '../components/svgs/LoaderSVG'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { referenceFile } from '@/redux/fileSlice'
import { AiFillCloseCircle } from 'react-icons/ai'
import { AnimatePresence, motion } from 'framer-motion'

export default function NotificationsPage() {
    const session = useSelector((state:RootState)=>state.persistedUserReducer.user)
    const router = useRouter()
    const dispatch = useDispatch()
    const [notifications,setNotifications] = useState<notifications[]>()
    const [refetch,setRefetch] = useState(false)
 
    async function clearNotifications(userId:string){
        await axios.post(`/api/user/handleNotifications/${session._id}`,{
            action:'clear'
        }).then(()=>{
            setRefetch(true)
        })
    }

    async function removeNotification(userId:string,notificationId:string){
        const notificationIndex = notifications?.findIndex((notification:notifications)=>notification._id === notificationId)
        notifications?.splice(notificationIndex!,1)
        await axios.post(`/api/user/handleNotifications/${session._id}`,{
            action:'remove',notificationId:notificationId
        }).then(()=>{
            setRefetch(true)
        })
    }

    async function handleRedirect(notification:notifications){
        await axios.post(`/api/user/handleNotifications/${session._id}`, {
            action: "clicked",notificationId:notification._id
        })
        router.push(`/dashboard/collections/${session?._id}/${notification.collectionRef.collectionId}`)
        dispatch(referenceFile({file:notification.fileRef,for:"scrollInView"}))
    }

    //Fetch notifications
    useEffect(() => {
        async function fetchNotifications(){
            const notifications = await axios.get(`/api/user/handleNotifications/${session._id}`)
            const sortedNotifications = notifications.data.sort(
                (a:notifications, b:notifications) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )

            setNotifications(sortedNotifications)
            setRefetch(false)
        }
        fetchNotifications()
    }, [refetch])
    
  return (
    <div className='w-[calc(100vw-30px)] h-max bg-white rounded-[15px] sm:max-w-[calc(100vw-450px)] sm:w-[calc(100vw-230px)] sm:min-w-[700px] max-h-[calc(100vh-110px)] shadow-sm flex flex-col px-5 py-5 gap-6'>
        <div className='flex justify-between items-center'>
            <p className='font-thin text-3xl'>Notifications</p>
           {notifications && notifications?.length > 0 &&
                <p 
                    onClick={()=>clearNotifications(session._id)}
                    className='px-2 rounded-xl shadow-xl w-max flex justify-end border cursor-pointer'
                    >
                    Clear all
                </p>
            }
        </div>
        <div className='overflow-y-auto flex flex-col gap-6 sm:px-6'>
            <AnimatePresence>
                {notifications && notifications?.length > 0 ? notifications.map((notification: notifications,index) => (
                    <motion.div initial={{ opacity: 0, y: -20 }} // Initial state (hidden and moved to the left)
                    animate={{ opacity: 1, y: 0 }} // Animate to visible and original position
                    exit={{ opacity: 0, x: '100%' }} //When leaving the dom, animate out
                    transition={{ duration: 0.5, delay: index * 0.1 }} key={notification._id} className={`${!notification.state.clicked ? 'border-[2px] border-black opacity-[90%]' : "border-[2px]" } flex justify-between bg-white rounded-2xl p-3 cursor-pointer`}>
                        <div onClick={()=>handleRedirect(notification)} className='flex flex-col sm:w-3/4 max-w-[500px]'>
                                <p>
                                    {
                                        new Date(notification.createdAt).getHours()
                                        + ":" + 
                                        String(new Date(notification.createdAt).getMinutes()).padStart(2, '0')
                                    }
                                </p>
                                <p className='max-w-full'>
                                    <span className='font-semibold'>{notification.triggeredBy.split('@').shift()} </span>
                                    <span>{notification.text} </span>
                                    <span className='font-semibold'>{notification.collectionRef.name}</span>
                                </p>
                        </div>
                        <AiFillCloseCircle size={20} className='min-w-[20px] cursor-pointer text-red-600' onClick={()=>removeNotification(session._id,notification._id)}/>
                    </motion.div>
                    )) || <LoaderSVG size={150} />
                    :
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        >
                        <p className='opacity-50'>There aren't any new notifications.</p>
                    </motion.div>
                }
            </AnimatePresence>
        </div>
    </div>
  )
}
