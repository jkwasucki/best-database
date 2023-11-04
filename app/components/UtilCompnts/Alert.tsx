'use client'

import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { clearAlert } from '@/redux/alertSlice';
import { useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { motion } from 'framer-motion';
export default function Alert() {
    const dispatch = useDispatch()
    const notificationData = useSelector((state:RootState) => state.alertReducer.alert);

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    //Alert timing controls
    useEffect(() => {
        // Clear the existing timeout if its set
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set a new timeout only if there is a notification
        if (notificationData.type) {
            timeoutRef.current = setTimeout(() => {
                dispatch(clearAlert({}));
            }, 3000);
        }

        // Clean up the timeout when the component unmounts
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [notificationData, dispatch]);
    
      
    return (
        <>
            {notificationData?.type === 'warning' &&
               <div className='absolute left-1/2 -translate-x-1/2 top-5 flex items-center select-none z-50'>
                    <motion.div  
                        animate={{
                            x: 0,
                            y: [-150, 20, 20, 20, -180],
                            scale: 1,
                            rotate: 0,
                        }} 
                        transition={{duration: 2}} 
                        className='bg-red-600 p-3 rounded-xl w-max'
                    >
                        <p className='font-semibold text-md text-white '>{notificationData.text}</p>
                    </motion.div>
                </div>
            }
            {notificationData?.type === 'info' && 
                <div className='absolute left-1/2 -translate-x-1/2 top-5 flex items-center select-none z-50'>
                    <motion.div 
                        animate={{
                            x: 0,
                            y: [-150,20,20,20,-180],
                            scale: 1,
                            rotate: 0,
                        }} 
                        transition={{duration:2}}
                        className='bg-green-600 p-3 rounded-xl w-max'
                        >
                        <p className='font-semibold text-md text-white'>{notificationData.text}</p>
                    </motion.div>          
                </div>
            }
        </>
    )
}
