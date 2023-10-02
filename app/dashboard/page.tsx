'use client'
import React from 'react';
import Main from './components/Main'
import Cookies from 'js-cookie';
import { useDispatch } from 'react-redux';
import { useSession } from 'next-auth/react';
import { createSession } from '@/redux/userSlice';
import { useEffect } from 'react';
import { clearCollectionData } from '@/redux/collectionSlice';
import { useRouter } from 'next/navigation';
export default function Dashboard() {
    const router = useRouter()
    const dispatch = useDispatch();
    const { data: session } = useSession();
    
    
    //Push signed in user to redux store.
    useEffect(() => {
      if (session?.user) {
        dispatch(createSession(session.user));
      }
    }, [session]);

    //Clear collection data when navigating to home page.
    useEffect(()=>{
      dispatch(clearCollectionData({}))
    },[])
    
    //Check if auth-token is present
    useEffect(()=>{
      const tokenValue = Cookies.get('token');
      const nextAuthTokenValue = Cookies.get('next-auth.session-token')
      if(!tokenValue && !nextAuthTokenValue) router.push('/')
    },[])

    return (
        <main>
            <Main/>
        </main>
    );
}
