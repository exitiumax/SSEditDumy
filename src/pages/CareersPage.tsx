import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { JobPosting } from '../types/jobs';
import { Briefcase, MapPin, DollarSign } from 'lucide-react';

const CareersPage: React.FC = () => {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('job_postings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setJobs(data || []);
    } catch (error) {
      setError('Failed to fetch job postings');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0085c2]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Join Our Team</h1>
          <p className="text-lg text-gray-600 mb-12">
            At Galin Education, we're always looking for talented educators who are passionate about helping students succeed. Explore our current openings below.
          </p>

          {error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">No Current Openings</h2>
              <p className="text-gray-600 mb-6">
                We don't have any open positions right now, but we're always interested in meeting talented educators.
              </p>
              <a
                href="mailto:info@galined.com?subject=General Application Inquiry"
                className="inline-block bg-[#0085c2] text-white px-8 py-3 rounded-md hover:bg-[#FFB546] transition-colors duration-200"
              >
                Contact Us
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {jobs.map((job) => (
                <div key={job.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900">{job.title}</h2>
                      <div className="flex items-center mt-2 space-x-4">
                        <span className="text-sm bg-[#0085c2] text-white px-3 py-1 rounded-full">
                          {job.type}
                        </span>
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-1" />
                          {job.location}
                        </div>
                        {job.salary_range && (
                          <div className="flex items-center text-gray-600">
                            <DollarSign className="w-4 h-4 mr-1" />
                            {job.salary_range}
                          </div>
                        )}
                      </div>
                    </div>
                    <a
                      href={`mailto:info@galined.com?subject=Application for ${job.title} Position&body=I am interested in the ${job.title} position in ${job.location}.`}
                      className="bg-[#0085c2] text-white px-6 py-2 rounded-md hover:bg-[#FFB546] transition-colors duration-200"
                    >
                      Apply Now
                    </a>
                  </div>
                  <p className="text-gray-600 mb-4">{job.description}</p>
                  {job.requirements.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Requirements:</h3>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        {job.requirements.map((requirement, index) => (
                          <li key={index}>{requirement}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-12 bg-gray-50 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Don't see the right position?</h2>
            <p className="text-gray-600 mb-6">
              We're always interested in meeting talented educators. Send us your resume and let us know how you can contribute to our team.
            </p>
            <a
              href="mailto:info@galined.com?subject=General Application Inquiry"
              className="inline-block bg-[#0085c2] text-white px-8 py-3 rounded-md hover:bg-[#FFB546] transition-colors duration-200"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareersPage;