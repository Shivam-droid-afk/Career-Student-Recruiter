import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { User, Github, Linkedin, Code, ExternalLink, GraduationCap, Upload, Save, Eye, Edit3, CheckCircle, AlertCircle, Award, Camera } from 'lucide-react';

const ProfileEditor: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    university: '',
    bio: '',
    github_url: '',
    linkedin_url: '',
    leetcode_url: '',
    gfg_url: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        university: user.university || '',
        bio: user.bio || '',
        github_url: user.github_url || '',
        linkedin_url: user.linkedin_url || '',
        leetcode_url: user.leetcode_url || '',
        gfg_url: user.gfg_url || ''
      });
      if (user.avatar_url) {
        setAvatarPreview(user.avatar_url);
      }
    }
  }, [user]);

  const validateUrl = (url: string, platform: string): boolean => {
    if (!url) return true;
    const patterns: Record<string, RegExp> = {
      github: /^https?:\/\/(www\.)?github\.com\/[\w-]+\/?$/i,
      linkedin: /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i,
      leetcode: /^https?:\/\/(www\.)?leetcode\.com\/[\w-]+\/?$/i,
      gfg: /^https?:\/\/(www\.)?(geeksforgeeks\.org|auth\.geeksforgeeks\.org)\/user\/[\w-]+\/?$/i
    };
    return patterns[platform]?.test(url) || url.includes(platform);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio must be 500 characters or less';
    }

    if (formData.github_url && !validateUrl(formData.github_url, 'github')) {
      newErrors.github_url = 'Please enter a valid GitHub URL';
    }

    if (formData.linkedin_url && !validateUrl(formData.linkedin_url, 'linkedin')) {
      newErrors.linkedin_url = 'Please enter a valid LinkedIn URL';
    }

    if (formData.leetcode_url && !validateUrl(formData.leetcode_url, 'leetcode')) {
      newErrors.leetcode_url = 'Please enter a valid LeetCode URL';
    }

    if (formData.gfg_url && !validateUrl(formData.gfg_url, 'gfg')) {
      newErrors.gfg_url = 'Please enter a valid GeeksforGeeks URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, avatar: 'Image must be less than 5MB' });
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setErrors({ ...errors, avatar: '' });
    }
  };

  const handleSave = async () => {
    if (!validateForm() || !user) return;

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      let avatarUrl = user.avatar_url;

      if (avatarFile) {
        const fileName = `${user.id}/avatar-${Date.now()}.${avatarFile.name.split('.').pop()}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('bridgeup-media')
          .upload(fileName, avatarFile, { upsert: true });

        if (uploadData) {
          const { data: { publicUrl } } = supabase.storage
            .from('bridgeup-media')
            .getPublicUrl(fileName);
          avatarUrl = publicUrl;
        }
      }

      const updateData = {
        full_name: formData.full_name,
        university: formData.university,
        bio: formData.bio,
        github_url: formData.github_url || null,
        linkedin_url: formData.linkedin_url || null,
        leetcode_url: formData.leetcode_url || null,
        gfg_url: formData.gfg_url || null,
        avatar_url: avatarUrl
      };

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id);

      if (!error) {
        await updateUser({ ...updateData, avatar_url: avatarUrl });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const getCreditLevel = (credits: number) => {
    if (credits >= 200) return { label: 'Expert', color: 'bg-purple-500' };
    if (credits >= 100) return { label: 'Advanced', color: 'bg-blue-500' };
    if (credits >= 50) return { label: 'Intermediate', color: 'bg-green-500' };
    return { label: 'Beginner', color: 'bg-slate-400' };
  };

  const creditLevel = getCreditLevel(user?.total_credits || 0);

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Edit Profile</h2>
          <p className="text-slate-500">Update your information and see how recruiters view you</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
              isEditing ? 'bg-slate-100 text-slate-700' : 'bg-purple-100 text-purple-700'
            }`}
          >
            {isEditing ? <Eye className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            {isEditing ? 'Preview' : 'Edit'}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700">
          <CheckCircle className="w-5 h-5" />
          Profile saved successfully!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Edit Form */}
        <div className={`space-y-6 ${!isEditing ? 'hidden lg:block opacity-50 pointer-events-none' : ''}`}>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Basic Information</h3>
            
            {/* Avatar Upload */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-purple-600 text-white text-2xl font-bold">
                      {formData.full_name?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-600 transition-colors">
                  <Camera className="w-4 h-4 text-white" />
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              </div>
              <div>
                <p className="font-medium text-slate-800">Profile Photo</p>
                <p className="text-sm text-slate-500">JPG, PNG up to 5MB</p>
                {errors.avatar && <p className="text-sm text-red-500 mt-1">{errors.avatar}</p>}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.full_name ? 'border-red-300' : 'border-slate-200'
                    }`}
                    placeholder="John Doe"
                  />
                </div>
                {errors.full_name && <p className="text-sm text-red-500 mt-1">{errors.full_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">University</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={formData.university}
                    onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Stanford University"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none ${
                    errors.bio ? 'border-red-300' : 'border-slate-200'
                  }`}
                  placeholder="Tell recruiters about yourself..."
                  rows={4}
                />
                <div className="flex justify-between mt-1">
                  {errors.bio && <p className="text-sm text-red-500">{errors.bio}</p>}
                  <p className={`text-sm ml-auto ${formData.bio.length > 500 ? 'text-red-500' : 'text-slate-400'}`}>
                    {formData.bio.length}/500
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Social Profiles</h3>
            <div className="space-y-4">
              {[
                { key: 'github_url', label: 'GitHub', icon: Github, placeholder: 'https://github.com/username', color: 'text-slate-700' },
                { key: 'linkedin_url', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/username', color: 'text-blue-600' },
                { key: 'leetcode_url', label: 'LeetCode', icon: Code, placeholder: 'https://leetcode.com/username', color: 'text-amber-600' },
                { key: 'gfg_url', label: 'GeeksforGeeks', icon: ExternalLink, placeholder: 'https://auth.geeksforgeeks.org/user/username', color: 'text-green-600' }
              ].map(({ key, label, icon: Icon, placeholder, color }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                  <div className="relative">
                    <Icon className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${color}`} />
                    <input
                      type="url"
                      value={formData[key as keyof typeof formData]}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors[key] ? 'border-red-300' : 'border-slate-200'
                      }`}
                      placeholder={placeholder}
                    />
                  </div>
                  {errors[key] && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors[key]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className={`${isEditing ? 'hidden lg:block' : ''}`}>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 sticky top-6">
            <div className="flex items-center gap-2 mb-4 text-slate-500">
              <Eye className="w-4 h-4" />
              <span className="text-sm font-medium">Recruiter Preview</span>
            </div>

            <div className="text-center mb-6">
              <div className="w-24 h-24 rounded-2xl overflow-hidden mx-auto mb-4">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-purple-600 text-white text-2xl font-bold">
                    {formData.full_name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <h3 className="text-xl font-bold text-slate-800">{formData.full_name || 'Your Name'}</h3>
              {formData.university && (
                <p className="text-slate-500 flex items-center justify-center gap-1 mt-1">
                  <GraduationCap className="w-4 h-4" />
                  {formData.university}
                </p>
              )}
            </div>

            <div className="flex items-center justify-center gap-3 mb-6">
              <div className={`px-4 py-2 rounded-xl text-white font-medium ${creditLevel.color}`}>
                {creditLevel.label}
              </div>
              <div className="flex items-center gap-1 px-4 py-2 bg-amber-100 text-amber-700 rounded-xl">
                <Award className="w-5 h-5" />
                <span className="font-bold">{user?.total_credits || 0}</span>
              </div>
            </div>

            {formData.bio && (
              <p className="text-slate-600 text-sm mb-6 text-center">{formData.bio}</p>
            )}

            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-500 mb-3">Connect</p>
              <div className="grid grid-cols-2 gap-2">
                {formData.github_url && (
                  <a href={formData.github_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors text-sm">
                    <Github className="w-4 h-4" /> GitHub
                  </a>
                )}
                {formData.linkedin_url && (
                  <a href={formData.linkedin_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm">
                    <Linkedin className="w-4 h-4" /> LinkedIn
                  </a>
                )}
                {formData.leetcode_url && (
                  <a href={formData.leetcode_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors text-sm">
                    <Code className="w-4 h-4" /> LeetCode
                  </a>
                )}
                {formData.gfg_url && (
                  <a href={formData.gfg_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-sm">
                    <ExternalLink className="w-4 h-4" /> GFG
                  </a>
                )}
              </div>
              {!formData.github_url && !formData.linkedin_url && !formData.leetcode_url && !formData.gfg_url && (
                <p className="text-slate-400 text-sm text-center py-4">Add social profiles to connect with recruiters</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditor;
