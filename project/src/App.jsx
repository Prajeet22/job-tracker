import React, { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { AuthForm } from './components/AuthForm'
import { Sidebar } from './components/Sidebar'
import { StatusPipeline } from './components/StatusPipeline'
import { JobTable } from './components/JobTable'
import { JobDetail } from './components/JobDetail'
import { AddJobModal } from './components/AddJobModal'
import { EditJobModal } from './components/EditJobModal'
import { Analytics } from './components/Analytics'
import { ProfileModal } from './components/ProfileModal'
import { useJobs } from './hooks/useJobs'
import { useProfile } from './hooks/useProfile'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)
  const { jobs, loading: jobsLoading, error: jobsError, addJob, updateJob, deleteJob } = useJobs(session?.user?.id)
  const { profile } = useProfile(session?.user?.id)
  const [selectedJob, setSelectedJob] = useState(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingJob, setEditingJob] = useState(null)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [currentView, setCurrentView] = useState('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error)
        setAuthError('Failed to load session. Please refresh the page.')
      } else {
        setAuthError(null)
      }
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      setAuthError(null)
      setSession(session)
      setLoading(false)
      
      // Create profile after email confirmation
      if (event === 'SIGNED_IN' && session?.user && !profile) {
        try {
          // Check if profile exists, if not create one
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single()
          
          if (!existingProfile) {
            await supabase
              .from('profiles')
              .insert([
                {
                  user_id: session.user.id,
                  full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              ])
          }
        } catch (error) {
          console.error('Error creating profile:', error)
          setAuthError('Failed to create user profile')
        }
      }
      
      // Clear selected job when user signs out
      if (event === 'SIGNED_OUT') {
        setSelectedJob(null)
        setCurrentView('dashboard')
        setAuthError(null)
      }

    })

    return () => subscription.unsubscribe()
  }, [])


  const handleAddJob = () => {
    setIsAddModalOpen(true)
  }

  const handleEditJob = (job) => {
    setEditingJob(job)
    setIsEditModalOpen(true)
  }

  const handleJobAdded = async (jobData) => {
    try {
      await addJob(jobData)
      setIsAddModalOpen(false)
    } catch (error) {
      console.error('Failed to add job:', error)
      // Error is handled in the hook
    }
  }

  const handleJobUpdated = async (job) => {
    try {
      await updateJob(job)
      setIsEditModalOpen(false)
      setEditingJob(null)
    } catch (error) {
      console.error('Failed to update job:', error)
      // Error is already handled in the hook and modal
    }
  }

  const handleJobDeleted = async (jobId) => {
    try {
      await deleteJob(jobId)
      if (selectedJob?.id === jobId) {
        setSelectedJob(null)
      }
    } catch (error) {
      console.error('Failed to delete job:', error)
      // Error is handled in the hook
    }
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error)
      }
    } catch (error) {
      console.error('Unexpected error during sign out:', error)
    }
  }

  const renderContent = () => {
    if (jobsLoading) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your jobs...</p>
            <p className="text-xs text-gray-400 mt-2">This may take a few moments</p>
          </div>
        </div>
      )
    }

    if (jobsError) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-4">Failed to load jobs: {jobsError}</p>
            <div className="space-y-2">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors mr-2"
              >
                Refresh Page
              </button>
              <button
                onClick={() => {
                  console.log('Retrying job fetch...')
                  // This will trigger a refetch through the useJobs hook
                  setCurrentView('dashboard')
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Retry Loading
              </button>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )
    }

    switch (currentView) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <StatusPipeline jobs={jobs} />
            <JobTable 
              jobs={jobs}
              onAddJob={handleAddJob}
              onUpdateJob={handleJobUpdated}
              onDeleteJob={handleJobDeleted}
              onEditJob={handleEditJob}
            />
          </div>
        )
      case 'jobs':
        return (
          <JobTable 
            jobs={jobs}
            onAddJob={handleAddJob}
            onUpdateJob={handleJobUpdated}
            onDeleteJob={handleJobDeleted}
            onEditJob={handleEditJob}
          />
        )
      case 'analytics':
        return <Analytics jobs={jobs} />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading JobTracker...</p>
          <p className="text-sm text-gray-400 mt-2">Connecting to database...</p>
          {authError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{authError}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (!session) {
    return <AuthForm />
  }

  return (
    <>
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out`}>
        <Sidebar 
          jobs={jobs}
          onAddJob={handleAddJob}
          currentView={currentView}
          onViewChange={setCurrentView}
          onClose={() => setIsSidebarOpen(false)}
          onSignOut={handleSignOut}
        />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Mobile and Desktop */}
        <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left side - Mobile menu button and title */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="lg:hidden">
                <h1 className="text-lg font-semibold text-gray-900 capitalize">{currentView}</h1>
              </div>
              <div className="hidden lg:block">
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">
                  Welcome back, {profile?.full_name || session.user.email?.split('@')[0]}
                </h1>
                <p className="text-gray-600 text-sm">Track and manage your job applications</p>
                {jobsError && (
                  <p className="text-red-600 text-xs mt-1">⚠️ Having trouble loading jobs</p>
                )}
              </div>
            </div>

            {/* Right side - Actions and Profile */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Add Job Button */}
              <button
                onClick={handleAddJob}
                className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
              >
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline text-sm font-medium">Add Job</span>
              </button>

              {/* Profile Button */}
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 bg-teal-600 rounded-full flex items-center justify-center">
                  <svg className="h-3 w-3 sm:h-4 sm:w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="hidden md:inline text-sm font-medium">Profile</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
            {renderContent()}
          </div>
        </div>
      </div>

      <AddJobModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddJob={handleJobAdded}
      />

      <EditJobModal 
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingJob(null)
        }}
        job={editingJob}
        onUpdateJob={handleJobUpdated}
      />

    </div>

    {/* Profile Modal */}
    <ProfileModal
      isOpen={isProfileModalOpen}
      onClose={() => setIsProfileModalOpen(false)}
      user={session.user}
    />
    </>
  )
}

export default App