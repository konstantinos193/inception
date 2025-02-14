"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'react-hot-toast'

type Profile = {
  username: string
  address: string
  bio: string
  profile_picture: string
}

type EditProfileModalProps = {
  isOpen: boolean
  onClose: () => void
  onUpdate: (profile: Profile) => void
  currentProfile: Profile
}

export default function EditProfileModal({ isOpen, onClose, onUpdate, currentProfile }: EditProfileModalProps) {
  const [profile, setProfile] = useState(currentProfile)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    setProfile(currentProfile)
  }, [currentProfile])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfile((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0])
    }
  }

  const uploadImage = async (file: File): Promise<string> => {
    try {
      setUploading(true)
      
      // Delete the old profile picture if it exists
      if (profile.profile_picture && profile.profile_picture.includes('profile-pictures')) {
        console.log('Old profile picture URL:', profile.profile_picture)
        
        // Get just the filename from the URL
        const oldFileName = profile.profile_picture.split('/').pop()?.split('?')[0]
        const oldFilePath = `${profile.address}/${oldFileName}`
        
        console.log('Attempting to delete file:', oldFilePath)
        
        // First, list files to confirm existence
        const { data: files, error: listError } = await supabase.storage
          .from('profile-pictures')
          .list(profile.address)

        if (listError) {
          console.error('Error listing files:', listError)
        } else {
          console.log('Found files:', files)
          
          // Delete all files in the folder except .emptyFolderPlaceholder
          const filesToDelete = files
            .filter(file => file.name !== '.emptyFolderPlaceholder')
            .map(file => `${profile.address}/${file.name}`)
          
          if (filesToDelete.length > 0) {
            const { error: deleteError } = await supabase.storage
              .from('profile-pictures')
              .remove(filesToDelete)
            
            if (deleteError) {
              console.error('Error deleting old profile pictures:', deleteError)
            } else {
              console.log('Successfully deleted old profile pictures')
            }
          }
        }
      }

      // Create a unique file name
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${profile.address}/${fileName}`
      
      console.log('Uploading new file to:', filePath)

      // Upload the new file
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      // Get the public URL
      const { data } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath)

      console.log('New profile picture URL:', data.publicUrl)
      return data.publicUrl
    } catch (error) {
      console.error('Error uploading:', error)
      toast.error('Failed to upload image')
      throw error
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      let updatedProfile = { ...profile }

      if (imageFile) {
        const imageUrl = await uploadImage(imageFile)
        updatedProfile.profile_picture = imageUrl
      }

      onUpdate(updatedProfile)
      onClose()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to update profile')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-800 rounded-lg p-6 w-full max-w-md"
          >
            <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="profilePicture" className="block text-sm font-medium mb-1">
                  Profile Picture
                </label>
                <input
                  type="file"
                  id="profilePicture"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0154fa]"
                  disabled={uploading}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium mb-1">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={profile.username}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0154fa]"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="bio" className="block text-sm font-medium mb-1">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0154fa]"
                ></textarea>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0154fa] rounded-md hover:bg-[#0143d1] transition-colors"
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

