import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useProfile = (userId) => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (userId) {
      fetchProfile()
    } else {
      setProfile(null)
      setLoading(false)
    }
  }, [userId])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching profile:', error)
        setError(error.message)
        setProfile(null)
      } else {
        setProfile(data || null)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('Failed to load profile')
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (profileData) => {
    try {
      setError(null)
      
      const updatedProfile = {
        user_id: userId,
        ...profileData,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('profiles')
        .upsert(updatedProfile, { 
          onConflict: 'user_id',
          returning: 'representation'
        })
        .select()
        .single()

      if (error) {
        console.error('Error updating profile:', error)
        setError(error.message)
        throw error
      } else {
        setProfile(data)
        return data
      }
    } catch (err) {
      console.error('Error updating profile:', err)
      setError('Failed to update profile')
      throw err
    }
  }

  return {
    profile,
    loading,
    error,
    updateProfile,
    refetch: fetchProfile
  }
}