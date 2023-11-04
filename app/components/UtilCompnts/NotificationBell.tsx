import { RootState } from '@/redux/store'
import axios from 'axios'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { AiFillCloseCircle } from 'react-icons/ai'
import { useSelector } from 'react-redux'
import { useDataContext } from '../Providers/DataContextProvider'


type Props = {
  
    areNotifiExtended:Function
}

export default function NotificationBell({areNotifiExtended}:Props) {
    const { shouldRefetchData,shakeData } = useDataContext()
    const session = useSelector((state:RootState)=>state.persistedUserReducer.user)
    const [notifications,setNotifications] = useState<notifications[]>()
  

  

    async function dismissNotification(notificationId:string){
        const notificationIndex = notifications?.findIndex((notification:notifications)=>notification._id === notificationId)
        notifications?.splice(notificationIndex!,1)
        shakeData()
        await axios.post(`/api/user/handleNotifications/${session._id}`,{
                action: "dismiss", notificationId:notificationId
        })
    }

    //Fetch notifications
    useEffect(()=>{
        async function fetchNotifications(){
            const notifications = await axios.get(`http://localhost:3000/api/user/notifications/getNotifications/${session._id}`)
            const sortedNotifications = notifications.data.sort(
                (a:notifications, b:notifications) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            ).filter((notification:notifications) => notification.state.dismissed === false);

            // Take the first 5 notifications
            const recentNotifications = sortedNotifications.slice(0, 5);

            setNotifications(recentNotifications)

            //Make the most recent 5 notifications "seen" on mount.
            await axios.post(`/api/user/handleNotifications/${session._id}`, {
                action: "seen",
            }).then(()=>{
                shakeData()
            })
        }
        fetchNotifications()
    },[])

  return (
    <div className='fixed max-w-[300px] w-[300px] h-max right-12 top-[50px] z-20 '>
        <div className='flex flex-col gap-8'>
            <AnimatePresence>
                {notifications && notifications?.map((notification,index)=>{
                    return(
                    <motion.div 
                        key={notification._id}
                        initial={{ opacity: 0, y: -20 }} // Initial state (hidden and moved to the left)
                        animate={{ opacity: 1, y: 30 }} // Animate to visible and original position
                        exit={{ opacity: 0, x: '100%' }} //When leaving the dom, animate out
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className={`${!notification.state.clicked && 'border-[2px] border-slate-300' } flex flex-col bg-white rounded-2xl shadow-xl p-3 cursor-pointer`}
                        >
                        <div className='flex items-center justify-between'>
                            <p className='opacity-50 text-sm'>
                                {
                                    new Date(notification.createdAt).getHours()
                                     + ":" + 
                                     String(new Date(notification.createdAt).getMinutes()).padStart(2, '0')
                                }
                            </p>
                            <AiFillCloseCircle 
                                onClick={()=>dismissNotification(notification._id)} 
                                className='text-red-600 cursor-pointer' 
                            />
                        </div>
                        <p>
                            <span className='font-semibold'>{notification.triggeredBy.split('@').shift()} </span>
                            <span>{notification.text}</span>
                            <span className='font-semibold'> {notification.collectionRef.name}</span>
                        </p>
                         
                    </motion.div>
                    )
                })}
               {notifications && notifications?.length > 0 && 
                    <Link 
                        href='/dashboard/notifications' 
                        onClick={()=>{shakeData(); areNotifiExtended(true)}} 
                        className='flex justify-end'
                    >
                        See all
                    </Link>
                }
            </AnimatePresence>
        </div>
       
    </div>
  )
}
