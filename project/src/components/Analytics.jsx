import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { TrendingUp, Target, Clock, DollarSign } from 'lucide-react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
)

const Analytics = ({ jobs }) => {
  // Status distribution data
  const statusCounts = jobs.reduce((acc, job) => {
    acc[job.status] = (acc[job.status] || 0) + 1
    return acc
  }, {})

  const statusData = {
    labels: Object.keys(statusCounts).map(status => status.charAt(0).toUpperCase() + status.slice(1)),
    datasets: [
      {
        data: Object.values(statusCounts),
        backgroundColor: [
          '#9CA3AF', // gray for bookmarked
          '#3B82F6', // blue for applying
          '#EAB308', // yellow for applied
          '#8B5CF6', // purple for interviewing
          '#F97316', // orange for negotiating
          '#10B981', // green for accepted
        ],
        borderWidth: 0,
      },
    ],
  }

  // Applications over time
  const monthlyData = jobs.reduce((acc, job) => {
    const month = new Date(job.date_saved).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    acc[month] = (acc[month] || 0) + 1
    return acc
  }, {})

  const timelineData = {
    labels: Object.keys(monthlyData).slice(-6), // Last 6 months
    datasets: [
      {
        label: 'Applications',
        data: Object.values(monthlyData).slice(-6),
        borderColor: '#14B8A6',
        backgroundColor: 'rgba(20, 184, 166, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  }

  // Salary distribution
  const salaryRanges = {
    '0-50k': 0,
    '50k-75k': 0,
    '75k-100k': 0,
    '100k-125k': 0,
    '125k+': 0,
  }

  jobs.forEach(job => {
    const maxSalary = job.salary_max || job.salary_min || 0
    if (maxSalary === 0) return
    if (maxSalary <= 50000) salaryRanges['0-50k']++
    else if (maxSalary <= 75000) salaryRanges['50k-75k']++
    else if (maxSalary <= 100000) salaryRanges['75k-100k']++
    else if (maxSalary <= 125000) salaryRanges['100k-125k']++
    else salaryRanges['125k+']++
  })

  const salaryData = {
    labels: Object.keys(salaryRanges),
    datasets: [
      {
        label: 'Number of Jobs',
        data: Object.values(salaryRanges),
        backgroundColor: 'rgba(20, 184, 166, 0.8)',
        borderColor: '#14B8A6',
        borderWidth: 1,
      },
    ],
  }

  // Calculate metrics
  const totalJobs = jobs.length
  const appliedJobs = jobs.filter(job => ['applied', 'interviewing', 'negotiating', 'accepted'].includes(job.status)).length
  const acceptedJobs = jobs.filter(job => job.status === 'accepted').length
  const avgSalary = jobs.reduce((sum, job) => sum + (job.salary_max || job.salary_min || 0), 0) / jobs.filter(job => job.salary_max || job.salary_min).length || 0

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  }

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Target className="h-8 w-8 text-teal-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Jobs</p>
              <p className="text-2xl font-semibold text-gray-900">{totalJobs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Applied</p>
              <p className="text-2xl font-semibold text-gray-900">{appliedJobs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Success Rate</p>
              <p className="text-2xl font-semibold text-gray-900">
                {appliedJobs > 0 ? Math.round((acceptedJobs / appliedJobs) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg. Salary</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${avgSalary > 0 ? Math.round(avgSalary).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Status Distribution</h3>
          <div className="h-64">
            <Doughnut data={statusData} options={chartOptions} />
          </div>
        </div>

        {/* Applications Over Time */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Applications Over Time</h3>
          <div className="h-64">
            <Line data={timelineData} options={chartOptions} />
          </div>
        </div>

        {/* Salary Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 xl:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Salary Range Distribution</h3>
          <div className="h-64">
            <Bar data={salaryData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {jobs.slice(0, 5).map((job) => (
            <div key={job.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  job.status === 'accepted' ? 'bg-green-400' :
                  job.status === 'interviewing' ? 'bg-purple-400' :
                  job.status === 'applied' ? 'bg-yellow-400' :
                  job.status === 'applying' ? 'bg-blue-400' : 'bg-gray-400'
                }`}></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{job.position}</p>
                  <p className="text-xs text-gray-500">{job.company}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-900 capitalize">{job.status}</p>
                <p className="text-xs text-gray-500">
                  {new Date(job.date_saved).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export { Analytics }