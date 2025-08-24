import React from 'react'

const statusConfig = {
  bookmarked: { label: 'BOOKMARKED', color: 'bg-gray-400', textColor: 'text-gray-600' },
  applying: { label: 'APPLYING', color: 'bg-blue-400', textColor: 'text-blue-600' },
  applied: { label: 'APPLIED', color: 'bg-yellow-400', textColor: 'text-yellow-600' },
  interviewing: { label: 'INTERVIEWING', color: 'bg-purple-400', textColor: 'text-purple-600' },
  negotiating: { label: 'NEGOTIATING', color: 'bg-orange-400', textColor: 'text-orange-600' },
  accepted: { label: 'ACCEPTED', color: 'bg-green-400', textColor: 'text-green-600' }
}

const StatusPipeline = ({ jobs }) => {
  const getStatusCount = (status) => {
    return jobs.filter(job => job.status === status).length
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4 lg:gap-6">
        {Object.entries(statusConfig).map(([status, config]) => {
          const count = getStatusCount(status)
          return (
            <div key={status} className="text-center">
              <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-full text-white text-sm sm:text-lg lg:text-2xl font-bold ${config.color} mb-1 sm:mb-2 lg:mb-3`}>
                {count}
              </div>
              <div className={`text-xs sm:text-xs lg:text-sm font-bold uppercase tracking-wider ${config.textColor} leading-tight px-1`}>
                {config.label}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { StatusPipeline }