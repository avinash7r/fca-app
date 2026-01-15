import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { axiosInstance } from '../lib/axiosInstance.js'
import { useAuthStore } from '../store/useAuthStore.js'
import { Toaster, toast } from 'react-hot-toast'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  const { authCheck,login } = useAuthStore()

  const validateForm = () => {
    if (!email) {
      toast.error("Email is required")
      return false
    }
    if (!password) {
      toast.error("Password is required")
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    try {
      await login({email,password})
    } catch (error) {
      console.error("Login error:", error)
      toast.error(error.response?.data?.message || "Login failed")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded shadow-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 mt-1 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring focus:border-blue-300" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 mt-1 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring focus:border-blue-300" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 py-2 text-sm text-gray-400 focus:outline-none">
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <button type="submit" className="w-full px-4 py-2 font-medium text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Login</button>
        </form>
        <div className="text-sm text-center text-gray-400">
          <p>Don't have an account? <Link to="/signup" className="text-blue-400 hover:underline">Sign Up</Link></p>
        </div>
      </div>
      <Toaster />
    </div>
  )
}

export default Login