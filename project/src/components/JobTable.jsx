import React, { useState, useMemo } from 'react'
import { Search, Filter, Star, Edit, Trash2, Plus } from 'lucide-react'

const JobTable = ({ 
  jobs, 
  onAddJob,
  onUpdateJob,
  onDeleteJob,
  onEditJob
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [groupBy, setGroupBy] = useState('none')
  const [showViewOptions, setShowViewOptions] = useState(false)

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'bookmarked', label: 'Bookmarked' },
    { value: 'applying', label: 'Applying' },
    { value: 'applied', label: 'Applied' },
    { value: 'interviewing', label: 'Interviewing' },
    { value: 'negotiating', label: 'Negotiating' },
    { value: 'accepted', label: 'Accepted' }
  ]

  const groupByOptions = [
    { value: 'none', label: 'None' },
    { value: 'status', label: 'Status' },
    { value: 'company', label: 'Company' },
    { value: 'location', label: 'Location' }
  ]

  const statusConfig = {
    bookmarked: { label: 'Bookmarked', color: 'bg-gray-100 text-gray-800' },
    applying: { label: 'Applying', color: 'bg-blue-100 text-blue-800' },
    applied: { label: 'Applied', color: 'bg-yellow-100 text-yellow-800' },
    interviewing: { label: 'Interviewing', color: 'bg-purple-100 text-purple-800' },
    negotiating: { label: 'Negotiating', color: 'bg-orange-100 text-orange-800' },
    accepted: { label: 'Accepted', color: 'bg-green-100 text-green-800' }
  }

  const filteredAndGroupedJobs = useMemo(() => {
    // Filter jobs
    let filtered = jobs.filter(job => {
      const matchesSearch = job.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (job.location && job.location.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter
      return matchesSearch && matchesStatus
    })

    // Sort by date_applied (newest first)
    filtered.sort((a, b) => new Date(b.date_applied || b.created_at) - new Date(a.date_applied || a.created_at))

    // Group if needed
    if (groupBy === 'none') {
      return [{ key: 'all', jobs: filtered }]
    }

    const grouped = filtered.reduce((acc, job) => {
      const key = job[groupBy] || 'Other'
      if (!acc[key]) acc[key] = []
      acc[key].push(job)
      return acc
    }, {})

    return Object.entries(grouped).map(([key, jobs]) => ({ key, jobs }))
  }, [jobs, searchTerm, statusFilter, groupBy])

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Not specified'
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`
    if (min) return `$${min.toLocaleString()}+`
    return `Up to $${max?.toLocaleString()}`
  }

  const handleRatingChange = (job, newRating) => {
    const rating = newRating === job.rating ? 0 : newRating
    onUpdateJob({ ...job, rating })
  }

  if (jobs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Plus className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs yet</h3>
          <p className="text-gray-600 mb-6">Start tracking your job applications by adding your first job.</p>
          <button
            onClick={onAddJob}
            className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors font-medium"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Job
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Job Applications</h2>
          
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            {/* Search */}
            <div className="relative flex-1 sm:flex-none sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm bg-white"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* View Options */}
            <div className="relative">
              <button
                onClick={() => setShowViewOptions(!showViewOptions)}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm bg-white"
              >
                <Filter className="h-4 w-4" />
                <span>View Options</span>
              </button>
              
              {showViewOptions && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                  <div className="p-3">
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-700 mb-2">Group By</label>
                      <select
                        value={groupBy}
                        onChange={(e) => setGroupBy(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                      >
                        {groupByOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {filteredAndGroupedJobs.map(group => (
          <div key={group.key}>
            {groupBy !== 'none' && (
              <div className="px-3 sm:px-4 lg:px-6 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 capitalize">
                  {group.key} ({group.jobs.length})
                </h3>
              </div>
            )}
            
            <div className="min-w-full">
              {/* Desktop Table */}
              <div className="hidden lg:block">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Applied</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interview Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {group.jobs.map((job) => (
                      <tr key={job.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{job.position}</div>
                            <div className="text-sm text-gray-500">{job.company}</div>
                            {job.location && <div className="text-xs text-gray-400">{job.location}</div>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusConfig[job.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                            {statusConfig[job.status]?.label || job.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatSalary(job.salary_min, job.salary_max)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(job.date_applied)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(job.test_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(job.interview_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 cursor-pointer ${
                                  i < job.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRatingChange(job, i + 1)
                                }}
                              />
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => onEditJob(job)}
                              className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded hover:bg-blue-50"
                              title="Edit job"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => onDeleteJob(job.id)}
                              className="text-red-600 hover:text-red-900 transition-colors p-1 rounded hover:bg-red-50"
                              title="Delete job"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden">
                {group.jobs.map((job) => (
                  <div key={job.id} className="p-4 border-b border-gray-200 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">{job.position}</h3>
                        <p className="text-sm text-gray-500">{job.company}</p>
                        {job.location && <p className="text-xs text-gray-400">{job.location}</p>}
                      </div>
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusConfig[job.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                        {statusConfig[job.status]?.label || job.status}
                      </span>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Salary:</span>
                        <span className="text-gray-900">{formatSalary(job.salary_min, job.salary_max)}</span>
                      </div>
                      
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Applied:</span>
                        <span className="text-gray-900">{formatDate(job.date_applied)}</span>
                      </div>

                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Test:</span>
                        <span className="text-gray-900">{formatDate(job.test_date)}</span>
                      </div>

                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Interview:</span>
                        <span className="text-gray-900">{formatDate(job.interview_date)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 cursor-pointer ${
                              i < job.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                            onClick={() => handleRatingChange(job, i + 1)}
                          />
                        ))}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onEditJob(job)}
                          className="p-2 text-blue-600 hover:text-blue-900 transition-colors rounded hover:bg-blue-50"
                          title="Edit job"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDeleteJob(job.id)}
                          className="p-2 text-red-600 hover:text-red-900 transition-colors rounded hover:bg-red-50"
                          title="Delete job"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Click outside to close view options */}
      {showViewOptions && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowViewOptions(false)}
        />
      )}
    </div>
  )
}

export { JobTable }