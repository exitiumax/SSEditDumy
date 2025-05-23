import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { JobPosting } from '../../../types/jobs';
import { PlusCircle, Edit, Trash2, Save, X } from 'lucide-react';

const JobsAdmin: React.FC = () => {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [newRequirement, setNewRequirement] = useState('');
  const [error, setError] = useState<string | null>(null);

  const jobTypes = ['Full-time', 'Part-time', 'Contract'] as const;
  const jobStatuses = ['active', 'filled', 'draft'] as const;

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('job_postings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setJobs(data || []);
    } catch (error) {
      setError('Failed to fetch jobs');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = () => {
    setEditingJob({
      id: '',
      title: '',
      type: 'Full-time',
      location: '',
      description: '',
      requirements: [],
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  };

  const handleEditJob = (job: JobPosting) => {
    setEditingJob(job);
  };

  const handleSaveJob = async () => {
    try {
      if (!editingJob) return;

      if (!editingJob.title || !editingJob.description || !editingJob.location) {
        throw new Error('Please fill in all required fields');
      }

      const isNewJob = !editingJob.id;
      const { data, error } = isNewJob
        ? await supabase
            .from('job_postings')
            .insert([editingJob])
            .select()
            .single()
        : await supabase
            .from('job_postings')
            .update(editingJob)
            .eq('id', editingJob.id)
            .select()
            .single();

      if (error) throw error;

      await fetchJobs();
      setEditingJob(null);
      setError(null);
    } catch (error) {
      setError(error.message);
      console.error('Error:', error);
    }
  };

  const handleDeleteJob = async (id: string) => {
    try {
      const { error } = await supabase
        .from('job_postings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchJobs();
      setError(null);
    } catch (error) {
      setError('Failed to delete job posting');
      console.error('Error:', error);
    }
  };

  const handleAddRequirement = () => {
    if (!editingJob || !newRequirement.trim()) return;
    setEditingJob({
      ...editingJob,
      requirements: [...editingJob.requirements, newRequirement.trim()]
    });
    setNewRequirement('');
  };

  const handleRemoveRequirement = (index: number) => {
    if (!editingJob) return;
    const newRequirements = [...editingJob.requirements];
    newRequirements.splice(index, 1);
    setEditingJob({
      ...editingJob,
      requirements: newRequirements
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-semibold">Manage Job Postings</h2>
        <button
          onClick={handleCreateJob}
          className="flex items-center px-4 py-2 bg-[#0085c2] text-white rounded-md hover:bg-[#FFB546]"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          New Job Posting
        </button>
      </div>

      {/* Job Editor Modal */}
      {editingJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {editingJob.id ? 'Edit Job Posting' : 'New Job Posting'}
              </h2>
              <button
                onClick={() => setEditingJob(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editingJob.title}
                  onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={editingJob.type}
                    onChange={(e) => setEditingJob({ ...editingJob, type: e.target.value as JobPosting['type'] })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    {jobTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editingJob.status}
                    onChange={(e) => setEditingJob({ ...editingJob, status: e.target.value as JobPosting['status'] })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    {jobStatuses.map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={editingJob.location}
                  onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salary Range (Optional)
                </label>
                <input
                  type="text"
                  value={editingJob.salary_range || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, salary_range: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="e.g., $50,000 - $70,000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editingJob.description}
                  onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requirements
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {editingJob.requirements.map((requirement, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100"
                    >
                      {requirement}
                      <button
                        onClick={() => handleRemoveRequirement(index)}
                        className="ml-2 text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    className="flex-grow px-3 py-2 border rounded-md"
                    placeholder="Add a requirement..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddRequirement();
                      }
                    }}
                  />
                  <button
                    onClick={handleAddRequirement}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={handleSaveJob}
                  className="flex items-center px-4 py-2 bg-[#0085c2] text-white rounded-md hover:bg-[#FFB546]"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Save Job Posting
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {jobs.map((job) => (
          <div key={job.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                    job.status === 'active' ? 'bg-green-100 text-green-800' :
                    job.status === 'filled' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>
                  <span className="px-2 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {job.type}
                  </span>
                  <h2 className="text-xl font-semibold">{job.title}</h2>
                </div>
                <p className="text-gray-600 mb-2">{job.location}</p>
                {job.salary_range && (
                  <p className="text-gray-600 mb-2">{job.salary_range}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {job.requirements.map((requirement, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 bg-gray-100 rounded-full text-sm"
                    >
                      {requirement}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditJob(job)}
                  className="p-2 text-blue-600 hover:text-blue-800"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteJob(job.id)}
                  className="p-2 text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobsAdmin;