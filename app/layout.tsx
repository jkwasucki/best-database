'use client'
import './globals.css'
import AuthProvider from "./components/Authentication/AuthProvider"
import ReduxProvider from "./components/Authentication/ReduxProvider"
import { PersistGate } from 'redux-persist/es/integration/react';
import { persistor } from "../redux/store";
import { BrowserRouter } from "react-router-dom";
import Notification from './components/UtilCompnts/Alert';
import { DataContextProvider } from './components/Providers/DataContextProvider';

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
                <DataContextProvider>
                  <Notification/>
                  {children}
                </DataContextProvider>
              </BrowserRouter>
            </AuthProvider>
          </PersistGate>
        </ReduxProvider>
      </body>
    </html>
  )
}


