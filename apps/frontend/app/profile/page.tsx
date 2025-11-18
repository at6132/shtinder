'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth-store'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { User, Edit3, Save, Camera, Ruler, Upload, X, Star, Trash2 } from 'lucide-react'

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user)
  const updateUser = useAuthStore((state) => state.updateUser)
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get('/users/me')
      return res.data
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.put('/users/update', data)
    },
    onSuccess: (response) => {
      updateUser(response.data)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      alert('Profile updated successfully!')
    },
  })

  const uploadPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('photo', file)
      return api.post('/users/upload-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })

  const deletePhotoMutation = useMutation({
    mutationFn: async (photoId: string) => {
      return api.delete(`/users/photos/${photoId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })

  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [height, setHeight] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (profile) {
      setName(profile.name || '')
      setBio(profile.bio || '')
      setHeight(profile.height?.toString() || '')
    }
  }, [profile])

  const handleSave = () => {
    updateMutation.mutate({
      name,
      bio,
      height: height ? parseInt(height) : undefined,
    })
    setIsEditing(false)
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      await uploadPhotoMutation.mutateAsync(file)
      alert('Photo uploaded successfully!')
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to upload photo')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return
    
    try {
      await deletePhotoMutation.mutateAsync(photoId)
      alert('Photo deleted successfully!')
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete photo')
    }
  }

  const setMainPhotoMutation = useMutation({
    mutationFn: async (photoId: string) => {
      return api.post(`/users/photos/${photoId}/set-main`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      alert('Main photo updated successfully!')
    },
  })

  const handleSetMainPhoto = async (photoId: string) => {
    const photos = profile?.photos || []
    const photoIndex = photos.findIndex((p: any) => p.id === photoId)
    
    if (photoIndex === 0) {
      alert('This is already your main photo!')
      return
    }

    try {
      await setMainPhotoMutation.mutateAsync(photoId)
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to set main photo')
    }
  }

  // Get main photo (first photo) and other photos
  const mainPhoto = profile?.photos?.[0]
  const otherPhotos = profile?.photos?.slice(1) || []

  return (
    <div className="min-h-screen bg-soft-love-gradient p-4 pt-20 md:pt-4 pb-20 md:pb-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-neutral-near-black mb-2 flex items-center gap-2 md:gap-3">
            <User className="w-6 h-6 md:w-10 md:h-10 text-primary-purple" />
            My Profile
          </h1>
          <p className="text-neutral-dark-grey text-sm md:text-base">Manage your profile information</p>
        </div>

        <div className="bg-neutral-white rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-8 space-y-4 md:space-y-6 border border-neutral-light-grey">
          {/* Photos Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-semibold text-neutral-dark-grey flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary-purple" />
                Photos
              </label>
              {isEditing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 px-3 md:px-4 py-2 bg-primary-purple text-white rounded-lg md:rounded-xl font-semibold hover:bg-primary-pink active:bg-primary-pink transition-all disabled:opacity-50 text-sm md:text-base touch-manipulation"
                >
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Uploading...' : 'Upload Photo'}
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            {/* Main Photo */}
            {mainPhoto && (
              <div className="mb-3 md:mb-4">
                <div className="relative aspect-video rounded-lg md:rounded-xl overflow-hidden bg-neutral-light-grey group">
                  <Image src={mainPhoto.url} alt="Main photo" fill className="object-cover" />
                  <div className="absolute top-2 left-2 bg-flame-gradient text-white px-2 md:px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-white" />
                    Main Photo
                  </div>
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 md:group-hover:opacity-100 group-active:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleDeletePhoto(mainPhoto.id)}
                        className="p-2 bg-error text-white rounded-lg hover:bg-red-600 active:bg-red-700 transition-colors touch-manipulation"
                        title="Delete photo"
                        aria-label="Delete photo"
                      >
                        <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Other Photos Grid */}
            {otherPhotos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 md:gap-4 mb-3 md:mb-4">
                {otherPhotos.map((photo: any) => (
                  <div key={photo.id} className="relative aspect-square rounded-lg md:rounded-xl overflow-hidden bg-neutral-light-grey group">
                    <Image src={photo.url} alt="Photo" fill className="object-cover" />
                    {isEditing && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 md:group-hover:opacity-100 group-active:opacity-100 transition-opacity flex items-center justify-center gap-1 md:gap-2">
                        <button
                          onClick={() => handleSetMainPhoto(photo.id)}
                          className="p-1.5 md:p-2 bg-primary-purple text-white rounded-lg hover:bg-primary-pink active:bg-primary-pink transition-colors touch-manipulation"
                          title="Set as main photo"
                          aria-label="Set as main photo"
                        >
                          <Star className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="p-1.5 md:p-2 bg-error text-white rounded-lg hover:bg-red-600 active:bg-red-700 transition-colors touch-manipulation"
                          title="Delete photo"
                          aria-label="Delete photo"
                        >
                          <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {(!profile?.photos || profile.photos.length === 0) && (
              <div className="text-center py-8 md:py-12 border-2 border-dashed border-neutral-light-grey rounded-lg md:rounded-xl">
                <Camera className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 text-neutral-medium-grey opacity-50" />
                <p className="text-sm md:text-base text-neutral-dark-grey mb-3 md:mb-4">No photos yet</p>
                {isEditing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-4 py-2 md:px-6 md:py-2 bg-primary-purple text-white rounded-lg md:rounded-xl font-semibold hover:bg-primary-pink active:bg-primary-pink transition-all disabled:opacity-50 text-sm md:text-base touch-manipulation"
                  >
                    {uploading ? 'Uploading...' : 'Upload Your First Photo'}
                  </button>
                )}
              </div>
            )}

            {/* Upload More Button (when not editing) */}
            {!isEditing && profile?.photos && profile.photos.length > 0 && (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full py-2 border-2 border-dashed border-neutral-light-grey rounded-xl text-neutral-dark-grey hover:border-primary-purple hover:text-primary-purple transition-all"
              >
                Click "Edit Profile" to manage photos
              </button>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-neutral-dark-grey mb-2 flex items-center gap-2">
              <User className="w-5 h-5 text-primary-purple" />
              Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-light-grey rounded-xl focus:ring-2 focus:ring-primary-purple focus:border-primary-purple text-neutral-near-black bg-neutral-light-grey transition-all"
              />
            ) : (
              <div className="px-4 py-3 bg-neutral-light-grey rounded-xl text-neutral-near-black">
                {name || 'Not set'}
              </div>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold text-neutral-dark-grey mb-2 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-primary-purple" />
              Bio
            </label>
            {isEditing ? (
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-neutral-light-grey rounded-xl focus:ring-2 focus:ring-primary-purple focus:border-primary-purple text-neutral-near-black bg-neutral-light-grey transition-all resize-none"
                placeholder="Tell us about yourself..."
              />
            ) : (
              <div className="px-4 py-3 bg-neutral-light-grey rounded-xl text-neutral-near-black min-h-[100px]">
                {bio || 'No bio yet'}
              </div>
            )}
          </div>

          {/* Height */}
          <div>
            <label className="block text-sm font-semibold text-neutral-dark-grey mb-2 flex items-center gap-2">
              <Ruler className="w-5 h-5 text-primary-purple" />
              Height (cm)
            </label>
            {isEditing ? (
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                min="100"
                max="250"
                className="w-full px-4 py-3 border border-neutral-light-grey rounded-xl focus:ring-2 focus:ring-primary-purple focus:border-primary-purple text-neutral-near-black bg-neutral-light-grey transition-all"
                placeholder="e.g. 175"
              />
            ) : (
              <div className="px-4 py-3 bg-neutral-light-grey rounded-xl text-neutral-near-black">
                {height ? `${height} cm` : 'Not set'}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    // Reset to original values
                    if (profile) {
                      setName(profile.name || '')
                      setBio(profile.bio || '')
                      setHeight(profile.height?.toString() || '')
                    }
                  }}
                  className="flex-1 bg-neutral-light-grey text-neutral-dark-grey py-3 rounded-xl font-semibold hover:bg-neutral-medium-grey transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="flex-1 bg-flame-gradient text-white py-3.5 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full bg-primary-purple text-white py-3.5 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                <Edit3 className="w-5 h-5" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
