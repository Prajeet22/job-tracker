import React, { useState } from 'react';
import { Star, Edit, Trash2, Building, MapPin, Calendar, DollarSign, ExternalLink } from 'lucide-react';

const JobTable = ({ jobs, onEdit, onDelete, onRatingChange, isAuthenticated = false }) => {
  const [sortBy, setSortBy] = useState('date_saved');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterStatus, setFilterStatus] = useState('all');

  // Demo data for non-authenticated users
  const demoJobs = [
    {
      id: 'demo-1',
      company: 'TechCorp Inc.',
      position: 'Senior Frontend Developer',
      location: 'San Francisco, CA',
      salary: '$120,000 - $150,000',
      status: 'applied',
      rating: 4,
      date_saved: '2024-01-15',
      job_url: '#',
      notes: 'Great company culture, remote-friendly'
    },
    {
      id: 'demo-2',
      company: 'StartupXYZ',
      position: 'Full Stack Engineer',
      location: 'New York, NY',
      status: 'interview',
      rating: 5,
      date_saved: '2024-01-12',
      job_url: '#',
      notes: 'Exciting product, fast-growing team'
    },
    {
      id: 'demo-3',
      company: 'Enterprise Solutions',
      position: 'React Developer',
      location: 'Austin, TX',
      salary: '$95,000 - $115,000',
      status: 'rejected',
      rating: 3,
      date_saved: '2024-01-10',
      job_url: '#',
      notes: 'Good interview process, competitive salary'
    }
  ];

  const displayJobs = isAuthenticated ? jobs : demoJobs;

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      saved: 'bg-gray-100 text-gray-800',
      applied: 'bg-blue-100 text-blue-800',
      interview: 'bg-yellow-100 text-yellow-800',
      offer: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.saved;
  };

  const filteredJobs = displayJobs.filter(job => 
    filterStatus === 'all' || job.status === filterStatus
  );

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    
    if (sortBy === 'date_saved') {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    }
    
    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const renderStars = (rating, jobId) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 cursor-pointer transition-colors ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            } ${!isAuthenticated ? 'cursor-not-allowed opacity-50' : ''}`}
            onClick={() => isAuthenticated && onRatingChange && onRatingChange(jobId, star)}
          />
        ))}
      </div>
    );
  };

  if (!displayJobs || displayJobs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {isAuthenticated ? 'No jobs saved yet' : 'Welcome to JobTracker!'}
        </h3>
        <p className="text-gray-500 mb-4">
          {isAuthenticated 
            ? 'Start tracking your job applications by adding your first job.'
            : 'Sign in to start tracking your job applications and see your personalized dashboard.'
          }
        </p>
        {!isAuthenticated && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <p className="text-blue-800 text-sm">
              👆 This is a preview of what your job tracker will look like. Sign in to get started!
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {!isAuthenticated && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 text-sm font-medium">
            📋 Preview Mode - This is sample data to show you how JobTracker works. Sign in to track your real applications!
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Filters */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Filter by status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!isAuthenticated}
              >
                <option value="all">All</option>
                <option value="saved">Saved</option>
                <option value="applied">Applied</option>
                <option value="test">Test</option>
                <option value="interview">Interview</option>
                <option value="accepted">Accepted</option>
              </select>
            </div>
            <div className="text-sm text-gray-500">
              Showing {sortedJobs.length} job{sortedJobs.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('company')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Company</span>
                    {sortBy === 'company' && (
                      <span className="text-blue-500">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('position')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Position</span>
                    {sortBy === 'position' && (
                      <span className="text-blue-500">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salary
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Status</span>
                    {sortBy === 'status' && (
                      <span className="text-blue-500">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('date_saved')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Date Saved</span>
                    {sortBy === 'date_saved' && (
                      <span className="text-blue-500">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedJobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Building className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {job.company}
                        </div>
                        {job.job_url && (
                          <a
                            href={isAuthenticated ? job.job_url : '#'}
                            target={isAuthenticated ? "_blank" : "_self"}
                            rel="noopener noreferrer"
                            className={`text-xs text-blue-600 hover:text-blue-800 flex items-center mt-1 ${
                              !isAuthenticated ? 'cursor-not-allowed opacity-50' : ''
                            }`}
                            onClick={!isAuthenticated ? (e) => e.preventDefault() : undefined}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View Job
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{job.position}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-1" />
                      {job.location || 'Not specified'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {job.salary || 'Not specified'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderStars(job.rating || 0, job.id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(job.date_saved).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => isAuthenticated && onEdit && onEdit(job)}
                        className={`text-blue-600 hover:text-blue-900 ${
                          !isAuthenticated ? 'cursor-not-allowed opacity-50' : ''
                        }`}
                        disabled={!isAuthenticated}
                        title={!isAuthenticated ? 'Sign in to edit jobs' : 'Edit job'}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => isAuthenticated && onDelete && onDelete(job.id)}
                        className={`text-red-600 hover:text-red-900 ${
                          !isAuthenticated ? 'cursor-not-allowed opacity-50' : ''
                        }`}
                        disabled={!isAuthenticated}
                        title={!isAuthenticated ? 'Sign in to delete jobs' : 'Delete job'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!isAuthenticated && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600 text-center">
              💡 <strong>Ready to get started?</strong> Sign in to add your own jobs and track your applications!
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default JobTable;