import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../../contexts/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, Edit3, Camera, X, UserCircle, Award, Clock } from 'lucide-react';
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
  const [statistics, setStatistics] = useState({ completed: 0, responseRate: 0, pending: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const fileInputRef = useRef(null);

  // Update preview URL when user data changes
  React.useEffect(() => {
    if (user?.profilePicture) {
      setPreviewUrl(user.profilePicture);
    }
  }, [user?.profilePicture]);

  // Fetch user statistics
  React.useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setStatsLoading(true);
        const response = await api.get('/users/statistics');
        setStatistics(response.data);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    if (user) {
      fetchStatistics();
    }
  }, [user, api]);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      department: user?.department || '',
      studentId: user?.studentId || '',
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
      const fullName = `${data.firstName} ${data.lastName}`;
      formData.append('fullName', fullName);
      formData.append('firstName', data.firstName);
      formData.append('lastName', data.lastName);
      formData.append('phone', data.phone || '');
      formData.append('bio', data.bio || '');
      formData.append('department', data.department || '');
      if (profilePicture) {
        formData.append('profilePicture', profilePicture);
      }

      const response = await api.put('/users/profile', formData);
      
      // Update user context with new profile data
      if (response.data.user) {
        updateUser(response.data.user);
      }
      
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      setProfilePicture(null);
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
      <div className="flex items-center space-x-3">
        <UserCircle className="h-8 w-8 text-blue-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">My Profile</h1>
          <p className="text-sm text-slate-400">
            Manage your account information, security settings, and preferences.
          </p>
        </div>
      </div>

      {/* Student Profile Card */}
      <div className="card">
        <div className="p-6">
          <div className="flex items-start space-x-6">
            {/* Avatar Section */}
            <div className="relative group">
              <div className="h-24 w-24 bg-blue-500/20 rounded-lg flex items-center justify-center overflow-hidden">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Profile" 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <span className="text-2xl font-bold text-blue-400">
                      {user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'JS'}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 bg-slate-700 border-2 border-slate-600 rounded-full p-1.5 shadow-sm hover:bg-slate-600 hover:border-blue-500 transition-colors"
                title="Change profile picture"
              >
                <Camera className="h-3 w-3 text-slate-300 group-hover:text-blue-400" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-xl font-bold text-white">{user?.fullName || 'Juan Santos'}</h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student'}
                </span>
              </div>
              
              <div className="space-y-1 text-sm text-slate-400 mb-4">
                <p>{user?.email || 'juan.santos@university.edu'}</p>
                <p>Joined {user?.createdAt ? formatDate(user.createdAt) : 'January 1, 2024'}</p>
                <p>ID: {user?.studentId || '2021-10342'}</p>
              </div>

              {/* Statistics */}
              <div className="flex space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {statsLoading ? '-' : statistics.completed}
                  </div>
                  <div className="text-xs text-slate-400">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-400">
                    {statsLoading ? '-' : `${statistics.responseRate}%`}
                  </div>
                  <div className="text-xs text-slate-400">Response Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">
                    {statsLoading ? '-' : statistics.pending}
                  </div>
                  <div className="text-xs text-slate-400">Pending</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="card">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <User className="h-5 w-5 text-blue-400" />
              <h2 className="text-lg font-medium text-white">Personal Information</h2>
            </div>
            
            <form onSubmit={handleProfileSubmit(onProfileUpdate)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    FIRST NAME
                  </label>
                  <input
                    {...registerProfile('firstName', {
                      required: 'First name is required',
                    })}
                    type="text"
                    className="input"
                    placeholder="Juan"
                  />
                  {profileErrors.firstName && (
                    <p className="mt-1 text-sm text-red-400">{profileErrors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    LAST NAME
                  </label>
                  <input
                    {...registerProfile('lastName', {
                      required: 'Last name is required',
                    })}
                    type="text"
                    className="input"
                    placeholder="Santos"
                  />
                  {profileErrors.lastName && (
                    <p className="mt-1 text-sm text-red-400">{profileErrors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  EMAIL ADDRESS
                </label>
                <div className="relative">
                  <input
                    value={user?.email || 'juan.santos@university.edu'}
                    type="email"
                    className="input pr-20"
                    disabled
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <div className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">
                      Locked
                    </div>
                  </div>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Managed by your institution - cannot be changed.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  STUDENT ID
                </label>
                <div className="relative">
                  <input
                    value={user?.studentId || '2021-10342'}
                    type="text"
                    className="input pr-20"
                    disabled
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <div className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">
                      Locked
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    PHONE NUMBER
                  </label>
                  <input
                    {...registerProfile('phone')}
                    type="tel"
                    className="input"
                    placeholder="+1 (555) 000-0000"
                  />
                  {profileErrors.phone && (
                    <p className="mt-1 text-sm text-red-400">{profileErrors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    DEPARTMENT
                  </label>
                  <input
                    {...registerProfile('department')}
                    type="text"
                    className="input"
                    placeholder="e.g., Computer Science"
                  />
                  {profileErrors.department && (
                    <p className="mt-1 text-sm text-red-400">{profileErrors.department.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  BIO
                </label>
                <textarea
                  {...registerProfile('bio')}
                  className="input resize-none"
                  placeholder="Tell us about yourself..."
                  rows="3"
                />
                {profileErrors.bio && (
                  <p className="mt-1 text-sm text-red-400">{profileErrors.bio.message}</p>
                )}
              </div>


              <div className="pt-4 border-t border-slate-700">
                <p className="text-xs text-slate-400 mb-4">Changes apply immediately.</p>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-blue-600 text-white hover:bg-blue-700 px-4 py-2"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </div>
                  ) : (
                    <>
                      <Award className="h-4 w-4 mr-2" />
                      Update Profile
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Change Password */}
        <div className="card">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Lock className="h-5 w-5 text-blue-400" />
              <h2 className="text-lg font-medium text-white">Change Password</h2>
            </div>
            
            <form onSubmit={handlePasswordSubmit(onPasswordChange)} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  CURRENT PASSWORD
                </label>
                <div className="relative">
                  <input
                    {...registerPassword('currentPassword', {
                      required: 'Current password is required',
                    })}
                    type={showCurrentPassword ? 'text' : 'password'}
                    className="input pr-10"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4 text-slate-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-500" />
                    )}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="mt-1 text-sm text-red-400">{passwordErrors.currentPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  NEW PASSWORD
                </label>
                <div className="relative">
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
                    className="input pr-10"
                    placeholder="Minimum 8 characters"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 text-slate-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-500" />
                    )}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-sm text-red-400">{passwordErrors.newPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  CONFIRM NEW PASSWORD
                </label>
                <div className="relative">
                  <input
                    {...registerPassword('confirmPassword', {
                      required: 'Please confirm your new password',
                      validate: value => value === watchNewPassword || 'Passwords do not match',
                    })}
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="input pr-10"
                    placeholder="Re-enter new password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-slate-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-500" />
                    )}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>

              {/* Password Requirements */}
              <div className="bg-slate-700/50 rounded-lg p-3 space-y-1">
                <p className="text-xs font-medium text-slate-300 mb-2">Password Requirements:</p>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className="h-1 w-1 bg-slate-400 rounded-full"></div>
                    <p className="text-xs text-slate-400">At least 8 characters</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-1 w-1 bg-slate-400 rounded-full"></div>
                    <p className="text-xs text-slate-400">One uppercase letter</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-1 w-1 bg-slate-400 rounded-full"></div>
                    <p className="text-xs text-slate-400">One number</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-1 w-1 bg-slate-400 rounded-full"></div>
                    <p className="text-xs text-slate-400">One special character</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <p className="text-xs text-slate-400 mb-4">Password is encrypted and secure.</p>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-blue-600 text-white hover:bg-blue-700 px-4 py-2"
                >
                  {passwordLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Changing...
                    </div>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Change Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
