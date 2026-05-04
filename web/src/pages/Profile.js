import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, Edit3, Camera, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, api, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.profilePicture || null);
  const fileInputRef = useRef(null);

  // Update preview URL when user data changes
  React.useEffect(() => {
    if (user?.profilePicture) {
      setPreviewUrl(user.profilePicture);
    }
  }, [user?.profilePicture]);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm({
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
    }
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    watch,
    reset: resetPassword,
  } = useForm();

  const watchNewPassword = watch('newPassword');

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePicture = () => {
    setProfilePicture(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onProfileUpdate = async (data) => {
    try {
      setLoading(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('fullName', data.fullName);
      if (profilePicture) {
        formData.append('profilePicture', profilePicture);
      }

      const response = await api.put('/users/profile', formData);
      
      // Update user context with new profile data
      if (response.data.user) {
        // Update the user context with the new profile data
        // This will trigger a re-render and update the profile picture everywhere
        updateUser(response.data.user);
      }
      
      toast.success('Profile updated successfully!');
      setIsEditing(false); // Close edit mode after successful update
      setProfilePicture(null); // Clear the selected file
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const onPasswordChange = async (data) => {
    try {
      setPasswordLoading(true);
      await api.put('/users/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed successfully!');
      resetPassword();
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="mt-1 text-sm text-slate-400">
          Manage your account information and security settings
        </p>
      </div>

      {/* Profile Information */}
      <div className="card">
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative group">
              <div className="h-16 w-16 bg-blue-500/20 rounded-full flex items-center justify-center overflow-hidden">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Profile" 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-8 w-8 text-blue-400" />
                )}
              </div>
              {isEditing && (
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 bg-slate-700 border-2 border-slate-600 rounded-full p-1.5 shadow-sm hover:bg-slate-600 hover:border-blue-500 transition-colors"
                    title="Change profile picture"
                  >
                    <Camera className="h-3 w-3 text-slate-300 group-hover:text-blue-400" />
                  </button>
                  {previewUrl && (
                    <button
                      onClick={handleRemovePicture}
                      className="absolute -top-1 -right-1 bg-slate-700 border-2 border-red-500/50 rounded-full p-1.5 shadow-sm hover:bg-red-500/20 hover:border-red-500 transition-colors"
                      title="Remove profile picture"
                    >
                      <X className="h-3 w-3 text-red-400" />
                    </button>
                  )}
                </>
              )}
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="absolute -bottom-1 -right-1 bg-slate-700 border-2 border-slate-600 rounded-full p-1.5 shadow-sm hover:bg-slate-600 hover:border-blue-500 transition-colors"
                  title="Edit profile"
                >
                  <Edit3 className="h-3 w-3 text-slate-300 group-hover:text-blue-400" />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-medium text-white">{user?.fullName}</h2>
                {isEditing && (
                  <span className="text-xs text-blue-400 font-medium">Editing</span>
                )}
              </div>
              <p className="text-sm text-slate-400 capitalize">{user?.role?.toLowerCase()}</p>
              <p className="text-xs text-slate-500">
                Member since {formatDate(user?.createdAt)}
              </p>
            </div>
          </div>

          {isEditing && (
            <form onSubmit={handleProfileSubmit(onProfileUpdate)} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-slate-300">
                  Full Name
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    {...registerProfile('fullName', {
                      required: 'Full name is required',
                      minLength: {
                        value: 2,
                        message: 'Full name must be at least 2 characters',
                      },
                    })}
                    type="text"
                    className="input pl-10"
                    placeholder="Enter your full name"
                  />
                </div>
                {profileErrors.fullName && (
                  <p className="mt-1 text-sm text-red-400">{profileErrors.fullName.message}</p>
                )}
              </div>

              <div className="pt-4 flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </div>
                  ) : (
                    'Save Changes'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {!isEditing && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300">
                  Full Name
                </label>
                <div className="mt-1 p-3 bg-slate-700/50 rounded-lg">
                  <p className="text-white">{user?.fullName}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300">
                  Email Address
                </label>
                <div className="mt-1 p-3 bg-slate-700/50 rounded-lg relative">
                  <p className="text-white">{user?.email}</p>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">
                      Locked
                    </div>
                  </div>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Email address cannot be changed for security reasons
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Change Password */}
      <div className="card">
        <div className="p-6">
          <h2 className="text-lg font-medium text-white mb-4">Change Password</h2>
          
          <form onSubmit={handlePasswordSubmit(onPasswordChange)} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-300">
                Current Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  {...registerPassword('currentPassword', {
                    required: 'Current password is required',
                  })}
                  type={showCurrentPassword ? 'text' : 'password'}
                  className="input pl-10 pr-10"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-500" />
                  )}
                </button>
              </div>
              {passwordErrors.currentPassword && (
                <p className="mt-1 text-sm text-red-400">{passwordErrors.currentPassword.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-slate-300">
                New Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  {...registerPassword('newPassword', {
                    required: 'New password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
                    },
                  })}
                  type={showNewPassword ? 'text' : 'password'}
                  className="input pl-10 pr-10"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-500" />
                  )}
                </button>
              </div>
              {passwordErrors.newPassword && (
                <p className="mt-1 text-sm text-red-400">{passwordErrors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300">
                Confirm New Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  {...registerPassword('confirmPassword', {
                    required: 'Please confirm your new password',
                    validate: value => value === watchNewPassword || 'Passwords do not match',
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="input pl-10 pr-10"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-500" />
                  )}
                </button>
              </div>
              {passwordErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">{passwordErrors.confirmPassword.message}</p>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={passwordLoading}
                className="btn btn-primary disabled:opacity-50"
              >
                {passwordLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Changing Password...
                  </div>
                ) : (
                  'Change Password'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Account Information */}
      <div className="card">
        <div className="p-6">
          <h2 className="text-lg font-medium text-white mb-4">Account Information</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-slate-300">Account Type</span>
              <span className="text-sm text-slate-400 capitalize">{user?.role?.toLowerCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-slate-300">Member Since</span>
              <span className="text-sm text-slate-400">{formatDate(user?.createdAt)}</span>
            </div>
            {user?.lastLogin && (
              <div className="flex justify-between">
                <span className="text-sm font-medium text-slate-300">Last Login</span>
                <span className="text-sm text-slate-400">{formatDate(user.lastLogin)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
