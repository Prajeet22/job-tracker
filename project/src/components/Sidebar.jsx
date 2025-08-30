import React from 'react'
import { 
  Briefcase, 
  Plus, 
  Home,
  BarChart3,
  User,
  X,
  LogOut,
  LogIn
} from 'lucide-react'

const Sidebar = ({
  jobs,
  onAddJob,
  currentView,
  onViewChange,
  onClose,
  isAuthenticated,
  onSignOut,
  onSignIn,
  selectedJob,
  onJobSelect,
}) => {
  const menuItems = [
    { icon: Home, label: 'Dashboard', key: 'dashboard' },
    { icon: Briefcase, label: 'Jobs', key: 'jobs', count: jobs.length },
    { icon: BarChart3, label: 'Analytics', key: 'analytics' },
  ]

  return (
    <div className="w-full h-full bg-teal-600 text-white flex flex-col shadow-xl lg:shadow-none">
        {/* Header */}
        <div className="p-4 border-b border-teal-500 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <Briefcase className="h-5 w-5 text-teal-600" />
              </div>
              <h1 className="text-lg font-semibold">JobTracker</h1>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-md text-teal-200 hover:text-white hover:bg-teal-500 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-hidden flex flex-col">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  onViewChange(item.key)
                  onClose()
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                  currentView === item.key
                    ? 'bg-teal-500 text-white shadow-sm' 
                    : 'text-teal-100 hover:bg-teal-500/80 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full font-medium">
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Add Job Button - Only for authenticated users */}
          {isAuthenticated && (
          <div className="mt-6">
            <button
              onClick={() => {
                onAddJob()
                onClose()
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 bg-white text-teal-600 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm"
            >
              <Plus className="h-5 w-5" />
              <span>Add a New Job</span>
            </button>
          </div>
          )}

          {/* Guest Mode Info */}
          {!isAuthenticated && (
          <div className="mt-6 p-3 bg-teal-500 rounded-lg text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
              <p className="text-xs text-teal-100 font-medium">Preview Mode</p>
            </div>
            <p className="text-xs text-teal-200">Sign in to add your jobs</p>
          </div>
          )}

          {/* Recent Jobs */}
          <div className="mt-6 flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-medium text-teal-200 uppercase tracking-wider">
                {isAuthenticated ? 'Recent Jobs' : 'Sample Jobs'}
              </h3>
              {jobs.length > 0 && (
                <span className="text-xs text-teal-300">{jobs.length}</span>
              )}
            </div>
            <div className="space-y-1 overflow-y-auto flex-1 min-h-0">
              {jobs.slice(0, 8).map((job) => (
                <button
                  key={job.id}
                  onClick={() => {
                    if (onJobSelect) {
                      onJobSelect(job)
                    }
                    onClose()
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors group ${
                    selectedJob?.id === job.id
                      ? 'bg-teal-500 text-white'
                      : 'text-teal-100 hover:bg-teal-500/60 hover:text-white'
                  }`}
                >
                  <div className="text-sm font-medium truncate">{job.position}</div>
                  <div className="text-xs opacity-75 truncate">{job.company}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      job.status === 'accepted' ? 'bg-green-400/20 text-green-200' :
                      job.status === 'interviewing' ? 'bg-purple-400/20 text-purple-200' :
                      job.status === 'applied' ? 'bg-yellow-400/20 text-yellow-200' :
                      job.status === 'applying' ? 'bg-blue-400/20 text-blue-200' : 
                      'bg-gray-400/20 text-gray-200'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                </button>
              ))}
              {jobs.length === 0 && (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Briefcase className="h-6 w-6 text-teal-300" />
                  </div>
                  <p className="text-xs text-teal-200 mb-1">
                    {isAuthenticated ? 'No jobs yet' : 'Sample jobs will appear here'}
                  </p>
                  <p className="text-xs text-teal-300 opacity-75">
                    {isAuthenticated ? 'Add your first job to get started!' : 'after you sign in'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Bottom Section - Sign In/Out */}
        <div className="p-4 border-t border-teal-500 flex-shrink-0 mt-auto">
          {isAuthenticated ? (
            <button
              onClick={onSignOut}
              className="flex items-center justify-center space-x-2 w-full py-2 px-4 text-teal-200 hover:text-white hover:bg-teal-500/60 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          ) : (
            <div className="space-y-2">
              <button
                onClick={onSignIn}
                className="flex items-center justify-center space-x-2 w-full py-2 px-3 bg-white text-teal-600 hover:bg-gray-50 rounded-lg transition-colors font-medium shadow-sm"
              >
                <LogIn className="h-4 w-4" />
                <span className="text-sm">Sign In</span>
              </button>
              <div className="text-center pt-1">
                <div className="flex items-center justify-center mb-1">
                  <div className="w-8 h-8 bg-gradient-to-r from-teal-400 to-blue-400 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                </div>
                <p className="text-xs text-teal-200 mb-0.5 font-medium">Ready to get started?</p>
                <p className="text-xs text-teal-300">Sign in to track your jobs</p>
              </div>
            </div>
          )}
        </div>
    </div>
  )
}

export { Sidebar }