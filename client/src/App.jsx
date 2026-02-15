import React from 'react'
import Navbar from './components/Navbar.jsx'
import { Route, Routes } from 'react-router-dom'
import {useAuthStore} from './store/useAuthStore.js'
import {Loader} from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import HomePage from './pages/HomePage.jsx'
import Login from './pages/Login.jsx'
import SignUp from './pages/SignUp.jsx'
import Profile from './pages/Profile.jsx'
import Setting from './pages/Setting.jsx'
import { useEffect } from 'react'

function App() {
  const {authUser,authCheck,isCheckingAuth,onlineUsers} = useAuthStore()

  useEffect(() => {
    authCheck();
  },[authCheck]);

  console.log(onlineUsers);

  if(isCheckingAuth) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className='size-10 animate-spin' />
      </div>
    );
  }

  return (
    <>
    <Navbar/>
    <Routes>
      <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
      <Route path="/login" element={!authUser ? <Login />: <Navigate to="/" />} />
      <Route path="/signup" element={!authUser ? <SignUp />: <Navigate to="/" />} />
      <Route path="/Profile" element={authUser ? <Profile /> : <Navigate to="/login" />} />
      <Route path="/Setting" element={<Setting />} />
    </Routes>
    <Toaster />
    </>
  )
}

export default App
