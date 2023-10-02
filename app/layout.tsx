'use client'
import { StrictMode, useEffect } from 'react'
import './globals.css'
import AuthProvider from "./components/AuthProvider"
import ReduxProvider from "./components/ReduxProvider"
import { PersistGate } from 'redux-persist/es/integration/react';
import { persistor } from "../redux/store";
import { BrowserRouter } from "react-router-dom";
import Notification from './dashboard/components/Alert';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  
  return (
    <html lang="en">
      <body className='bg-neutral-100 overflow-hidden'>
        <ReduxProvider>
          <PersistGate loading={null} persistor={persistor}>
            <AuthProvider>
              <BrowserRouter>
                <Notification/>
                {children}
              </BrowserRouter>
            </AuthProvider>
          </PersistGate>
        </ReduxProvider>
      </body>
    </html>
  )
}


