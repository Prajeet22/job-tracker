import React, { useState } from 'react'
import { 
  MapPin, 
  DollarSign, 
  Calendar, 
  ExternalLink, 
  Star,
  Edit3,
  Trash2,
  Save,
  X,
  Building,
  CalendarCheck
} from 'lucide-react'

const statusConfig = {
  bookmarked: { label: 'Bookmarked', color: 'bg-gray-100 text-gray-800' },
  applying: { label: 'Applying', color: 'bg-blue-100 text-blue-800' },
  applied: { label: 'Applied', color: 'bg-yellow-100 text-yellow-800' },
  interviewing: { label: 'Interviewing', color: 'bg-purple-100 text-purple-800' },
  negotiating: { label: 'Negotiating', color: 'bg-orange-100 text-orange-800' },
  accepted: { label: 'Accepted', color: 'bg-green-100 text-green-800' }
}

const JobDetail = ({ job, onUpdateJob, onDeleteJob, onClose }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedJob, setEditedJob] = useState(job)

  const handleSave = () => {
    onUpdateJob(editedJob)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedJob(job)
    setIsEditing(false)
  }

  const handleStatusChange = (newStatus) => {
    const updatedJob = { ...job, status: newStatus }
    onUpdateJob(updatedJob)
  }

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Not specified'
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`
    if (min) return `$${min.toLocaleString()}+`
    return `Up to $${max?.toLocaleString()}`
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatDateForInput = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toISOString().split('T')[0]
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-2xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-3 sm:p-4 lg:p-6 border-b border-gray-200">
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-3 sm:space-y-4">
                <input
                  type="text"
                  value={editedJob.position}
                  onChange={(e) => setEditedJob({ ...editedJob, position: e.target.value })}
                  className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 bg-transparent border-b border-gray-300 focus:outline-none focus:border-teal-500 w-full"
                />
                <input
                  type="text"
                  value={editedJob.company}
                  onChange={(e) => setEditedJob({ ...editedJob, company: e.target.value })}
                  className="text-sm sm:text-base lg:text-lg text-gray-600 bg-transparent border-b border-gray-300 focus:outline-none focus:border-teal-500 w-full"
                />
              </div>
            ) : (
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-2 break-words">{job.position}</h1>
                <div className="flex items-center text-sm sm:text-base lg:text-lg text-gray-600 mb-2 sm:mb-4">
                  <Building className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 flex-shrink-0" />
                  <span className="break-words">{job.company}</span>
                </div>
              </div>
            )}

            {/* Job Details */}
            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
              <div className="flex items-center">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                {isEditing ? (
                  <input
                    type="text"
                    value={editedJob.location || ''}
                    onChange={(e) => setEditedJob({ ...editedJob, location: e.target.value })}
                    className="bg-transparent border-b border-gray-300 focus:outline-none focus:border-teal-500 flex-1 min-w-0"
                    placeholder="Location"
                  />
                ) : (
                  <span className="break-words">{job.location || 'Not specified'}</span>
                )}
              </div>
              
              <div className="flex items-center">
                <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                {isEditing ? (
                  <div className="flex space-x-1 sm:space-x-2 flex-1">
                    <input
                      type="number"
                      value={editedJob.salary_min || ''}
                      onChange={(e) => setEditedJob({ ...editedJob, salary_min: Number(e.target.value) || undefined })}
                      className="w-16 sm:w-20 bg-transparent border-b border-gray-300 focus:outline-none focus:border-teal-500 text-xs sm:text-sm"
                      placeholder="Min"
                    />
                    <span className="text-xs sm:text-sm">-</span>
                    <input
                      type="number"
                      value={editedJob.salary_max || ''}
                      onChange={(e) => setEditedJob({ ...editedJob, salary_max: Number(e.target.value) || undefined })}
                      className="w-16 sm:w-20 bg-transparent border-b border-gray-300 focus:outline-none focus:border-teal-500 text-xs sm:text-sm"
                      placeholder="Max"
                    />
                  </div>
                ) : (
                  <span className="break-words">{formatSalary(job.salary_min, job.salary_max)}</span>
                )}
              </div>

              {job.job_url && (
                <div className="flex items-center">
                  <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                  <a
                    href={job.job_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:text-teal-500 break-all"
                  >
                    View Job Posting
                  </a>
                </div>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center mb-3 sm:mb-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 sm:h-5 sm:w-5 cursor-pointer ${
                    i < job.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                  onClick={() => {
                    const newRating = i + 1 === job.rating ? 0 : i + 1
                    onUpdateJob({ ...job, rating: newRating })
                  }}
                />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 ml-2 sm:ml-4">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="flex items-center justify-center w-8 h-8 sm:w-auto sm:h-auto sm:px-3 sm:py-1 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors text-xs sm:text-sm"
                >
                  <Save className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline sm:ml-1">Save</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center justify-center w-8 h-8 sm:w-auto sm:h-auto sm:px-3 sm:py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-xs sm:text-sm"
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline sm:ml-1">Cancel</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center justify-center w-8 h-8 sm:w-auto sm:h-auto sm:px-3 sm:py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs sm:text-sm"
                >
                  <Edit3 className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline sm:ml-1">Edit</span>
                </button>
                <button
                  onClick={() => onDeleteJob(job.id)}
                  className="flex items-center justify-center w-8 h-8 sm:w-auto sm:h-auto sm:px-3 sm:py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-xs sm:text-sm"
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline sm:ml-1">Delete</span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 sm:w-auto sm:h-auto sm:px-3 sm:py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-xs sm:text-sm"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline sm:ml-1">Close</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 lg:p-6">
          {/* Status Pipeline */}
          <div className="mb-4 sm:mb-6">
            <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Application Status</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 sm:gap-2">
              {Object.entries(statusConfig).map(([status, config]) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`px-2 sm:px-3 lg:px-4 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    job.status === status
                      ? config.color
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Management */}
          <div className="mb-4 sm:mb-6">
            <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Important Dates</h3>
            <div className="space-y-3 sm:space-y-4">
              {/* Date Applied */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center mb-2 sm:mb-0">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2" />
                  <span className="text-sm sm:text-base font-medium text-gray-700">Date Applied</span>
                </div>
                {isEditing ? (
                  <input
                    type="date"
                    value={formatDateForInput(editedJob.date_applied)}
                    onChange={(e) => setEditedJob({ 
                      ...editedJob, 
                      date_applied: e.target.value ? new Date(e.target.value).toISOString() : null 
                    })}
                    className="text-sm sm:text-base border border-gray-300 rounded px-2 py-1 focus:ring-teal-500 focus:border-teal-500 w-full sm:w-auto"
                  />
                ) : (
                  <span className="text-sm sm:text-base text-gray-600">{formatDate(job.date_applied)}</span>
                )}
              </div>

              {/* Test Date */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center mb-2 sm:mb-0">
                  <CalendarCheck className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2" />
                  <span className="text-sm sm:text-base font-medium text-gray-700">Test Date</span>
                </div>
                {isEditing ? (
                  <input
                    type="date"
                    value={formatDateForInput(editedJob.test_date)}
                    onChange={(e) => setEditedJob({ 
                      ...editedJob, 
                      test_date: e.target.value ? new Date(e.target.value).toISOString() : null 
                    })}
                    className="text-sm sm:text-base border border-gray-300 rounded px-2 py-1 focus:ring-teal-500 focus:border-teal-500 w-full sm:w-auto"
                  />
                ) : (
                  <span className="text-sm sm:text-base text-gray-600">{formatDate(job.test_date)}</span>
                )}
              </div>

              {/* Interview Date */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center mb-2 sm:mb-0">
                  <CalendarCheck className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2" />
                  <span className="text-sm sm:text-base font-medium text-gray-700">Interview Date</span>
                </div>
                {isEditing ? (
                  <input
                    type="date"
                    value={formatDateForInput(editedJob.interview_date)}
                    onChange={(e) => setEditedJob({ 
                      ...editedJob, 
                      interview_date: e.target.value ? new Date(e.target.value).toISOString() : null 
                    })}
                    className="text-sm sm:text-base border border-gray-300 rounded px-2 py-1 focus:ring-teal-500 focus:border-teal-500 w-full sm:w-auto"
                  />
                ) : (
                  <span className="text-sm sm:text-base text-gray-600">{formatDate(job.interview_date)}</span>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Notes</h3>
            <textarea
              value={isEditing ? editedJob.notes : job.notes}
              onChange={(e) => {
                if (isEditing) {
                  setEditedJob({ ...editedJob, notes: e.target.value })
                } else {
                  onUpdateJob({ ...job, notes: e.target.value })
                }
              }}
              rows={4}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm sm:text-base resize-none"
              placeholder="Add your notes about this job application..."
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export { JobDetail }