import React, { useState } from 'react'
import { 
  Briefcase, 
  Plus, 
  Home,
  BarChart3,
  User,
  X,
  LogOut,
  Settings
} from 'lucide-react'
import { ProfileModal } from './ProfileModal'

const Sidebar = ({
  jobs,
  selectedJob,
  onJobSelect,
  onAddJob,
  currentView,
  onViewChange,
  onClose,
  onSignOut
}) => {
  const menuItems = [
    { icon: Home, label: 'Dashboard', key: 'dashboard' },
    { icon: Briefcase, label: 'Jobs', key: 'jobs', count: jobs.length },
    { icon: BarChart3, label: 'Analytics', key: 'analytics' },
  ]

  return (
    <div className="w-64 bg-teal-600 text-white h-screen flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-teal-500 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-teal-600" />
              </div>
              <h1 className="text-lg font-semibold">JobTracker</h1>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-md text-teal-200 hover:text-white hover:bg-teal-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 min-h-0">
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
                    ? 'bg-teal-500 text-white' 
                    : 'text-teal-100 hover:bg-teal-500 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                {item.count && (
                  <span className="bg-teal-400 text-teal-900 text-xs px-2 py-1 rounded-full font-medium">
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Add Job Button */}
          <div className="mt-6">
            <button
              onClick={() => {
                onAddJob()
                onClose()
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 bg-white text-teal-600 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              <Plus className="h-5 w-5" />
              <span>Add a New Job</span>
            </button>
          </div>

          {/* Recent Jobs */}
          <div className="mt-6 flex-1 min-h-0">
            <h3 className="text-xs font-medium text-teal-200 uppercase tracking-wider mb-3">
              Recent Jobs
            </h3>
            <div className="space-y-1 overflow-y-auto max-h-64">
              {jobs.slice(0, 8).map((job) => (
                <button
                  key={job.id}
                  onClick={() => {
                    onJobSelect(job)
                    onClose()
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedJob?.id === job.id
                      ? 'bg-teal-500 text-white'
                      : 'text-teal-100 hover:bg-teal-500 hover:text-white'
                  }`}
                >
                  <div className="text-sm font-medium truncate">{job.position}</div>
                  <div className="text-xs text-teal-200 truncate">{job.company}</div>
                </button>
              ))}
              {jobs.length === 0 && (
                <div className="text-xs text-teal-200 text-center py-4">
                  No jobs yet. Add your first job to get started!
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Sign Out Button */}
        <div className="p-4 border-t border-teal-500 flex-shrink-0">
          <div className="flex items-center justify-center">
            <button
              onClick={onSignOut}
              className="flex items-center space-x-2 w-full justify-center py-2 px-4 text-teal-200 hover:text-white hover:bg-teal-500 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
    </div>
  )
}

export { Sidebar }