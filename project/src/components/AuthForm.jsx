import React, { useState } from 'react'
import { Eye, EyeOff, User, Mail, Lock, Briefcase, AlertCircle, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

const AuthForm = () => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields')
      return false
    }

    if (isSignUp && !formData.fullName.trim()) {
      setError('Please enter your full name')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address')
      return false
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return false
    }

    if (isSignUp && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }

    return true
  }

  const createProfile = async (userId, email, fullName) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert([
          {
            user_id: userId,
            full_name: fullName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])

      if (error) {
        console.error('Error creating profile:', error)
      }
    } catch (err) {
      console.error('Error creating profile:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              full_name: formData.fullName
            }
          }
        })

        if (error) {
          if (error.message.includes('already registered')) {
            setError('An account with this email already exists. Please sign in instead.')
          } else if (error.message.includes('Email rate limit exceeded')) {
            setError('Too many signup attempts. Please wait a few minutes before trying again.')
          } else if (error.message.includes('Signup is disabled')) {
            setError('New user registration is currently disabled. Please contact support.')
          } else {
            setError(error.message)
          }
        } else if (data.user) {
          if (data.user && !data.user.email_confirmed_at) {
            setMessage('Account created successfully! Please check your email for a verification link. You may need to check your spam folder. After clicking the link, return here to sign in.')
          } else {
            // Create profile immediately if email is already confirmed
            await createProfile(data.user.id, formData.email, formData.fullName)
            setMessage('Account created successfully! You can now sign in.')
          }
          setFormData({ email: '', password: '', confirmPassword: '', fullName: '' })
          // Switch to sign in mode after successful signup
          setTimeout(() => {
            setIsSignUp(false)
            setMessage('')
          }, 3000)
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        })

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setError('Invalid email or password. Please check your credentials and try again.')
          } else if (error.message.includes('Email not confirmed')) {
            setError('Please verify your email address before signing in. Check your inbox (and spam folder) for a verification link.')
          } else if (error.message.includes('Too many requests')) {
            setError('Too many login attempts. Please wait a few minutes before trying again.')
          } else {
            setError(error.message)
          }
        }
      }
    } catch (err) {
      console.error('Auth error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setIsSignUp(!isSignUp)
    setFormData({ email: '', password: '', confirmPassword: '', fullName: '' })
    setError('')
    setMessage('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-teal-600 to-blue-600 rounded-2xl mb-4 shadow-lg">
            <Briefcase className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">JobTracker</h1>
          <p className="text-gray-600">
            {isSignUp ? 'Create your account to start tracking jobs' : 'Welcome back! Sign in to continue'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <p className="text-green-700 text-sm">{message}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name Field (Sign Up Only) */}
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="Enter your full name"
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-teal-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password Field (Sign Up Only) */}
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-teal-600 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
              </div>
            )}
          </button>
        </form>

        {/* Switch Mode */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button
              onClick={switchMode}
              className="ml-1 font-medium text-teal-600 hover:text-teal-500 transition-colors underline"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>

        {/* Additional Info for Sign Up */}
        {isSignUp && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700 text-center leading-relaxed">
              By creating an account, you agree to our terms of service and privacy policy. 
              Your data is securely stored and only accessible to you.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export { AuthForm }