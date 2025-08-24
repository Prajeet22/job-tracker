import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useJobs = (userId) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use passed userId or get current user
      let currentUserId = userId;
      if (!currentUserId) {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.error('Error getting user:', userError);
          setError('Authentication error: ' + userError.message);
          return;
        }
        currentUserId = user?.id;
      }
      
      if (!currentUserId) {
        console.log('No authenticated user found');
        setJobs([]);
        return;
      }

      console.log('Fetching jobs for user:', currentUserId);
      
      const { data, error: fetchError } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', currentUserId)
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
      setError('Unexpected error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const addJob = async (jobData) => {
    try {
      setError(null);
      
      let currentUserId = userId;
      if (!currentUserId) {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw new Error('Authentication error: ' + userError.message);
        currentUserId = user?.id;
      }
      
      if (!currentUserId) {
        throw new Error('User not authenticated');
      }

      const jobWithDefaults = {
        ...jobData,
        user_id: currentUserId,
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
    try {
      setError(null);
      
      let currentUserId = userId;
      if (!currentUserId) {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw new Error('Authentication error: ' + userError.message);
        currentUserId = user?.id;
      }
      
      if (!currentUserId) {
        throw new Error('User not authenticated');
      }

      const updates = {
        ...jobToUpdate,
        updated_at: new Date().toISOString()
      };
      
      // Remove id from updates to avoid conflicts
      const { id, ...updateData } = updates;
      const { data, error } = await supabase
        .from('jobs')
        .update(updateData)
        .eq('id', jobToUpdate.id)
        .eq('user_id', currentUserId)
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
    try {
      setError(null);
      
      let currentUserId = userId;
      if (!currentUserId) {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw new Error('Authentication error: ' + userError.message);
        currentUserId = user?.id;
      }
      
      if (!currentUserId) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id)
        .eq('user_id', currentUserId);

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
    if (userId) {
      fetchJobs();
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    // Set up real-time subscription for the specific user
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