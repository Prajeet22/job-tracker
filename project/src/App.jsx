import React, { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { AuthForm } from './components/AuthForm'
import { Sidebar } from './components/Sidebar'
import { StatusPipeline } from './components/StatusPipeline'
import JobTable from './components/JobTable'
import { JobDetail } from './components/JobDetail'
import { AddJobModal } from './components/AddJobModal'
import { EditJobModal } from './components/EditJobModal'
import { Analytics } from './components/Analytics'
import { ProfileModal } from './components/ProfileModal'
import { useJobs } from './hooks/useJobs'
import { useProfile } from './hooks/useProfile'

function App() {
  // Demo data for guest users
  const demoJobs = [
    {
      id: 'demo-1',
      position: 'Senior Software Engineer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      status: 'interviewing',
      salary_min: 120000,
      salary_max: 150000,
      date_applied: '2024-01-15',
      date_saved: '2024-01-15',
      rating: 4,
      notes: 'Great company culture, exciting projects'
    },
    {
      id: 'demo-2',
      position: 'Frontend Developer',
      company: 'StartupXYZ',
      location: 'Remote',
      status: 'applied',
      salary_min: 80000,
      salary_max: 100000,
      date_applied: '2024-01-10',
      date_saved: '2024-01-10',
      rating: 3,
      notes: 'Remote-first company, good benefits'
    },
    {
      id: 'demo-3',
      position: 'Full Stack Developer',
      company: 'Innovation Labs',
      location: 'New York, NY',
      status: 'accepted',
      salary_min: 100000,
      salary_max: 130000,
      date_applied: '2024-01-05',
      date_saved: '2024-01-05',
      rating: 5,
      notes: 'Dream job! Great team and challenging work'
    }
  ]

  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  
  // Only use hooks when authenticated
  const { jobs, loading: jobsLoading, error: jobsError, addJob, updateJob, deleteJob, refetch } = useJobs(session?.user?.id)
  const { profile } = useProfile(session?.user?.id)
  
  const [selectedJob, setSelectedJob] = useState(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingJob, setEditingJob] = useState(null)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [currentView, setCurrentView] = useState('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Determine which data to show
  const isAuthenticated = !!session
  const displayJobs = isAuthenticated ? jobs : demoJobs
  const isDataLoading = isAuthenticated ? jobsLoading : false

  useEffect(() => {
    let mounted = true
    
    const initializeAuth = async () => {
      try {
        setLoading(true)
        
        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession()
        
        if (mounted) {
          setSession(initialSession)
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
        // Don't block the app for auth errors
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      
      console.log('Auth state changed:', event, session?.user?.email)
      setSession(session)
      
      // Clear selected job when user signs out
      if (event === 'SIGNED_OUT') {
        setSelectedJob(null)
        setCurrentView('dashboard')
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const handleAddJob = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
      return
    }
    setIsAddModalOpen(true)
  }

  const handleEditJob = (job) => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
      return
    }
    setEditingJob(job)
    setIsEditModalOpen(true)
  }

  const handleJobAdded = async (jobData) => {
    try {
      await addJob(jobData)
      setIsAddModalOpen(false)
    } catch (error) {
      console.error('Failed to add job:', error)
    }
  }

  const handleJobUpdated = async (job) => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
      return
    }
    try {
      await updateJob(job)
      setIsEditModalOpen(false)
      setEditingJob(null)
    } catch (error) {
      console.error('Failed to update job:', error)
    }
  }

  const handleJobDeleted = async (jobId) => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
      return
    }
    try {
      await deleteJob(jobId)
      if (selectedJob?.id === jobId) {
        setSelectedJob(null)
      }
    } catch (error) {
      console.error('Failed to delete job:', error)
    }
  }

  const handleRatingChange = async (jobId, rating) => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
      return
    }
    const job = displayJobs.find(j => j.id === jobId)
    if (job) {
      try {
        await updateJob({ ...job, rating })
      } catch (error) {
        console.error('Failed to update rating:', error)
      }
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

  const handleSignIn = () => {
    setShowAuthModal(true)
  }

  const renderContent = () => {
    if (isAuthenticated && isDataLoading) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your jobs...</p>
          </div>
        </div>
      )
    }

    if (isAuthenticated && jobsError) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-4">Failed to load jobs: {jobsError}</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
            >
              Retry Loading
            </button>
          </div>
        </div>
      )
    }

    switch (currentView) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {!isAuthenticated && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">Welcome to JobTracker!</h3>
                    <p className="text-blue-700 text-sm">This is a preview with sample data. Sign up to start tracking your real job applications.</p>
                  </div>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            )}
            <StatusPipeline jobs={displayJobs} />
            <JobTable 
              jobs={displayJobs}
              onEdit={handleEditJob}
              onDelete={handleJobDeleted}
              onRatingChange={handleRatingChange}
              isAuthenticated={isAuthenticated}
            />
          </div>
        )
      case 'jobs':
        return (
          <>
            {!isAuthenticated && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">Sample Job Applications</h3>
                    <p className="text-blue-700 text-sm">Sign up to add and manage your own job applications.</p>
                  </div>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                  >
                    Sign Up Now
                  </button>
                </div>
              </div>
            )}
            <JobTable 
              jobs={displayJobs}
              onEdit={handleEditJob}
              onDelete={handleJobDeleted}
              onRatingChange={handleRatingChange}
              isAuthenticated={isAuthenticated}
            />
          </>
        )
      case 'analytics':
        return (
          <>
            {!isAuthenticated && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">Analytics Preview</h3>
                    <p className="text-blue-700 text-sm">See insights from your job search. Sign up to track your real progress.</p>
                  </div>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                  >
                    Start Tracking
                  </button>
                </div>
              </div>
            )}
            <Analytics jobs={displayJobs} />
          </>
        )
      default:
        return null
    }
  }

  // Show loading screen only during initial auth check
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading JobTracker...</p>
        </div>
      </div>
    )
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
        <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 lg:z-auto transition-transform duration-300 ease-in-out w-64 lg:w-64`}>
          <Sidebar 
            jobs={displayJobs}
            onAddJob={handleAddJob}
            currentView={currentView}
            onViewChange={setCurrentView}
            onClose={() => setIsSidebarOpen(false)}
            onSignOut={handleSignOut}
            onSignIn={handleSignIn}
            isAuthenticated={isAuthenticated}
            selectedJob={selectedJob}
            onJobSelect={setSelectedJob}
          />
        </div>
        
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          {/* Header - Mobile and Desktop */}
          <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 relative z-30">
            <div className="flex items-center justify-between">
              {/* Left side - Mobile menu button and title */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors z-40"
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
                    {isAuthenticated ? `Welcome back, ${profile?.full_name || session.user.email?.split('@')[0]}` : 'Welcome to JobTracker'}
                  </h1>
                  <p className="text-gray-600 text-sm">
                    {isAuthenticated ? 'Track and manage your job applications' : 'The smart way to organize your job search'}
                  </p>
                </div>
              </div>

              {/* Right side - Actions and Profile */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                {/* Add Job Button */}
                {isAuthenticated && (
                  <button
                    onClick={handleAddJob}
                    className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                  >
                    <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="hidden sm:inline text-sm font-medium">Add Job</span>
                  </button>
                )}
                
                {!isAuthenticated && (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-sm font-medium">Sign In</span>
                  </button>
                )}

                {/* Profile Button */}
                {isAuthenticated && (
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
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto relative z-10">
            <div className="p-4 sm:p-6">
              {renderContent()}
            </div>
          </div>
        </div>

        {/* Modals */}
        {isAuthenticated && (
          <AddJobModal 
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onAddJob={handleJobAdded}
          />
        )}

        {isAuthenticated && (
          <EditJobModal 
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false)
              setEditingJob(null)
            }}
            job={editingJob}
            onUpdateJob={handleJobUpdated}
          />
        )}
      </div>

      {/* Profile Modal */}
      {isAuthenticated && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={session.user}
        />
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Get Started with JobTracker</h2>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <AuthForm onClose={() => setShowAuthModal(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default App