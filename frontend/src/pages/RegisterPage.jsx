import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff, HiOutlineUser, HiOutlinePhone, HiOutlineIdentification, HiOutlineAcademicCap } from 'react-icons/hi';
import ParticleBackground from '../components/layout/ParticleBackground';
import api from '../api/axios';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', confirmPassword: '', phone: '', role: 'STUDENT', education: ''
  });
  const [idCardPath, setIdCardPath] = useState('');
  const [uploadingId, setUploadingId] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleIdCardUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit');
      return;
    }

    const fileData = new FormData();
    fileData.append('file', file);

    setUploadingId(true);
    try {
      const res = await api.post('/auth/register/id-card', fileData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setIdCardPath(res.data.idCardPath);
      toast.success('ID card uploaded successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to upload ID card';
      toast.error(msg);
      console.error(err);
    } finally {
      setUploadingId(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getPasswordStrength = () => {
    const p = formData.password;
    if (p.length === 0) return { level: 0, text: '', color: '' };
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;

    const levels = [
      { level: 1, text: 'Weak', color: 'bg-red-500' },
      { level: 2, text: 'Fair', color: 'bg-amber-500' },
      { level: 3, text: 'Good', color: 'bg-blue-500' },
      { level: 4, text: 'Strong', color: 'bg-emerald-500' },
    ];
    return levels[score - 1] || levels[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (!idCardPath) {
      toast.error('Please upload your ID card for verification');
      return;
    }

    setLoading(true);
    try {
      await register(formData.fullName, formData.email, formData.password, formData.phone, formData.role, idCardPath, formData.education);
      toast.success('Account created! Welcome! 🚀');
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-10">
      <ParticleBackground />
      {/* Animated background */}
      <div className="absolute inset-0 bg-surface-900 pointer-events-none">
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/3 -left-20 w-72 h-72 bg-primary-600/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      </div>


      <div className="relative z-10 w-full max-w-md mx-4 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-xl shadow-white/5 mb-4 p-3">
            <img src="/favicon.svg" alt="InterviewIQ Logo" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-3xl font-display font-bold gradient-text">Join InterviewIQ</h1>
          <p className="text-gray-400 mt-2">Start your placement preparation journey</p>
        </div>

        {/* Form */}
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">I am signing up as a...</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'STUDENT' })}
                  className={`py-2.5 px-4 rounded-xl border font-semibold text-sm transition-all flex flex-col items-center gap-1
                    ${formData.role === 'STUDENT'
                      ? 'bg-primary-600/20 border-primary-500 text-white shadow-lg shadow-primary-500/10'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200'}`}
                >
                  <span className="text-sm">🎓 Student</span>
                  <span className="text-[10px] opacity-70 font-normal">Prepare for placements</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'MENTOR' })}
                  className={`py-2.5 px-4 rounded-xl border font-semibold text-sm transition-all flex flex-col items-center gap-1
                    ${formData.role === 'MENTOR'
                      ? 'bg-primary-600/20 border-primary-500 text-white shadow-lg shadow-primary-500/10'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200'}`}
                >
                  <span className="text-sm">👨‍🏫 Mentor</span>
                  <span className="text-[10px] opacity-70 font-normal">Conduct mock interviews</span>
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="reg-name" className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
              <div className="relative">
                <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input id="reg-name" type="text" name="fullName" value={formData.fullName}
                  onChange={handleChange} placeholder="John Doe" className="input-field pl-12" required />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <div className="relative">
                <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input id="reg-email" type="email" name="email" value={formData.email}
                  onChange={handleChange} placeholder="you@example.com" className="input-field pl-12" required />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="reg-phone" className="block text-sm font-medium text-gray-300 mb-2">Phone (optional)</label>
              <div className="relative">
                <HiOutlinePhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input id="reg-phone" type="tel" name="phone" value={formData.phone}
                  onChange={handleChange} placeholder="+91 9876543210" className="input-field pl-12" />
              </div>
            </div>

            {/* Education Details */}
            <div>
              <label htmlFor="reg-education" className="block text-sm font-medium text-gray-300 mb-2">Education Details</label>
              <div className="relative">
                <HiOutlineAcademicCap className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  id="reg-education"
                  type="text"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  placeholder="e.g. IIT Delhi, B.Tech in CS"
                  className="input-field pl-12"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input id="reg-password" type={showPassword ? 'text' : 'password'} name="password"
                  value={formData.password} onChange={handleChange} placeholder="Min 8 characters"
                  className="input-field pl-12 pr-12" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                </button>
              </div>
              {/* Password strength */}
              {formData.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength.level ? strength.color : 'bg-white/10'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">{strength.text}</span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="reg-confirm" className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input id="reg-confirm" type="password" name="confirmPassword"
                  value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••"
                  className="input-field pl-12" required />
              </div>
            </div>

            {/* ID Card Verification */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Verify identity with {formData.role === 'MENTOR' ? "Mentor ID / Professional Card" : "Student ID Card"}
              </label>
              
              <div className="relative">
                {!idCardPath ? (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 hover:border-primary-500/50 rounded-xl cursor-pointer bg-white/5 hover:bg-white/10 transition-all p-4">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                      {uploadingId ? (
                        <>
                          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mb-2" />
                          <p className="text-sm text-gray-400">Uploading ID card...</p>
                        </>
                      ) : (
                        <>
                          <HiOutlineIdentification className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-300 font-medium">Click to upload ID card image</p>
                          <p className="text-[10px] text-gray-500 mt-1">PNG, JPG or WEBP (max 10MB)</p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleIdCardUpload}
                      disabled={uploadingId}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-emerald-500/30 bg-emerald-500/5 p-4 flex items-center justify-between gap-3 animate-fade-in">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">ID Card Uploaded</p>
                        <button
                          type="button"
                          onClick={() => {
                            const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
                            const fullUrl = apiBase.replace('/api', '') + idCardPath;
                            window.open(fullUrl, '_blank');
                          }}
                          className="text-xs text-primary-400 hover:text-primary-300 hover:underline transition-colors mt-0.5"
                        >
                          View uploaded image
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIdCardPath('')}
                      className="text-xs text-red-400 hover:text-red-300 font-medium px-2.5 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors border border-red-500/10"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6">
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating account...</>
              ) : 'Create Account'}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-gray-500 uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <p className="text-center text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
