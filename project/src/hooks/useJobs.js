import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useJobs = (userId) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchJobs = async () => {
    if (!userId) {
      setJobs([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching jobs for user:', userId);
      
      const { data, error: fetchError } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', userId)
        .order('date_saved', { ascending: false });

      if (fetchError) {
        console.error('Error fetching jobs:', fetchError);
        setError('Failed to load jobs: ' + fetchError.message);
        return;
      }

      console.log('Jobs fetched successfully:', data?.length || 0, 'jobs');
      setJobs(data || []);
      
    } catch (err) {
      console.error('Unexpected error in fetchJobs:', err);
      setError('Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addJob = async (jobData) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      
      const jobWithDefaults = {
        ...jobData,
        user_id: userId,
        date_saved: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('jobs')
        .insert([jobWithDefaults])
        .select()
        .single();

      if (error) {
        console.error('Error adding job:', error);
        throw error;
      }

      console.log('Job added successfully:', data);
      setJobs(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error in addJob:', err);
      setError('Failed to add job: ' + err.message);
      throw err;
    }
  };

  const updateJob = async (jobToUpdate) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      
      const updates = {
        ...jobToUpdate,
        updated_at: new Date().toISOString()
      };
      
      const { id, ...updateData } = updates;
      const { data, error } = await supabase
        .from('jobs')
        .update(updateData)
        .eq('id', jobToUpdate.id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating job:', error);
        throw error;
      }

      console.log('Job updated successfully:', data);
      setJobs(prev => prev.map(job => job.id === jobToUpdate.id ? data : job));
      return data;
    } catch (err) {
      console.error('Error in updateJob:', err);
      setError('Failed to update job: ' + err.message);
      throw err;
    }
  };

  const deleteJob = async (id) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting job:', error);
        throw error;
      }

      console.log('Job deleted successfully');
      setJobs(prev => prev.filter(job => job.id !== id));
    } catch (err) {
      console.error('Error in deleteJob:', err);
      setError('Failed to delete job: ' + err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const subscription = supabase
      .channel('jobs_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'jobs',
          filter: `user_id=eq.${userId}`
        }, 
        (payload) => {
          console.log('Real-time update received:', payload);
          fetchJobs();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  return {
    jobs,
    loading,
    error,
    addJob,
    updateJob,
    deleteJob,
    refetch: fetchJobs
  };
};