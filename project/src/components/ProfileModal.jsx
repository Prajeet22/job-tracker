import React, { useState, useEffect } from 'react'
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Building, 
  Globe, 
  Linkedin, 
  Github,
  Save,
  Edit3,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { supabase } from '../lib/supabase'

const ProfileModal = ({ isOpen, onClose, user }) => {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({
    full_name: '',
    phone: '',
    location: '',
    job_title: '',
    company: '',
    bio: '',
    website: '',
    linkedin_url: '',
    github_url: '',
    avatar_url: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (isOpen && user) {
      fetchProfile()
    }
  }, [isOpen, user])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError('')

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching profile:', error)
        setError('Failed to load profile')
      } else if (data) {
        setProfile(data)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfile(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
    setSuccess('')
  }

  const validateUrls = () => {
    const urlFields = ['website', 'linkedin_url', 'github_url']
    for (const field of urlFields) {
      const value = profile[field]
      if (value && !value.startsWith('http://') && !value.startsWith('https://')) {
        setError(`${field.replace('_', ' ')} must start with http:// or https://`)
        return false
      }
    }
    return true
  }

  const handleSave = async () => {
    if (!validateUrls()) return

    try {
      setSaving(true)
      setError('')

      const profileData = {
        user_id: user.id,
        ...profile,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileData, { 
          onConflict: 'user_id',
          returning: 'minimal'
        })

      if (error) {
        console.error('Error saving profile:', error)
        setError('Failed to save profile. Please try again.')
      } else {
        setSuccess('Profile updated successfully!')
        setTimeout(() => {
          setSuccess('')
          onClose()
        }, 1500)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('Failed to save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-blue-50">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-teal-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <User className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
              <p className="text-gray-600">Manage your personal information and preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-white rounded-lg"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your profile...</p>
              </div>
            </div>
          ) : (
            <div className="p-6">
              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-green-700 text-sm">{success}</p>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {/* Left Column - Personal Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <User className="h-5 w-5 mr-2 text-teal-600" />
                      Personal Information
                    </h3>
                    
                    {/* Email (Read-only) */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>

                    {/* Full Name */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="full_name"
                          value={profile.full_name}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          value={profile.phone}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>

                    {/* Location */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MapPin className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="location"
                          value={profile.location}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                          placeholder="City, State/Country"
                        />
                      </div>
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        value={profile.bio}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all resize-none"
                        placeholder="Tell us about yourself, your career goals, and what you're looking for..."
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column - Professional & Social */}
                <div className="space-y-6">
                  {/* Professional Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Briefcase className="h-5 w-5 mr-2 text-teal-600" />
                      Professional Information
                    </h3>
                    
                    {/* Job Title */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Job Title
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Briefcase className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="job_title"
                          value={profile.job_title}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                          placeholder="Your current or desired role"
                        />
                      </div>
                    </div>

                    {/* Company */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Building className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="company"
                          value={profile.company}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                          placeholder="Current or previous company"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Globe className="h-5 w-5 mr-2 text-teal-600" />
                      Social Links
                    </h3>
                    
                    {/* Website */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Globe className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="url"
                          name="website"
                          value={profile.website}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                    </div>

                    {/* LinkedIn */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        LinkedIn
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Linkedin className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="url"
                          name="linkedin_url"
                          value={profile.linkedin_url}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                          placeholder="https://linkedin.com/in/yourprofile"
                        />
                      </div>
                    </div>

                    {/* GitHub */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        GitHub
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Github className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="url"
                          name="github_url"
                          value={profile.github_url}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                          placeholder="https://github.com/yourusername"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 border-t border-gray-200 bg-gray-50 space-y-3 sm:space-y-0">
          <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
            Your profile information is securely stored and only visible to you.
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 sm:px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-teal-600 to-blue-600 border border-transparent rounded-lg hover:from-teal-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:hover:scale-100"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export { ProfileModal }