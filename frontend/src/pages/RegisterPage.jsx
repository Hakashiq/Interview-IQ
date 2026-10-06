import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff,
  HiOutlineUser, HiOutlinePhone, HiOutlineIdentification, HiOutlineAcademicCap,
  HiOutlineSparkles, HiOutlineCheckCircle, HiOutlineX
} from 'react-icons/hi';
import ParticleBackground from '../components/layout/ParticleBackground';
import api, { getServerBaseUrl } from '../api/axios';

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
          'Content-Type': undefined,
        },
      });
      setIdCardPath(res.data.idCardPath);
      toast.success('Document uploaded successfully ✨');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to upload document. You can still create your account without it.';
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
      { level: 1, text: 'Weak', color: 'bg-rose-500' },
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
    setLoading(true);
    try {
      await register(
        formData.fullName,
        formData.email,
        formData.password,
        formData.phone,
        formData.role,
        idCardPath || null,
        formData.education
      );
      toast.success('Account created! Welcome to InterviewIQ 🚀');
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-porcelain-50 flex items-center justify-center relative overflow-hidden py-12 px-4 selection:bg-blue-100 selection:text-blue-900">
      <ParticleBackground />

      <div className="relative z-10 w-full max-w-lg animate-fade-in">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white font-bold text-base shadow-xs mb-3">
            IQ
          </div>
          <h1 className="text-2xl font-display font-bold text-slate-900 tracking-tight">
            Create an Account
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Join InterviewIQ to practice with AI proctored mock interview sessions
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-7 sm:p-8 shadow-subtle space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Account Role
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'STUDENT' })}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all flex flex-col items-center gap-0.5 ${
                    formData.role === 'STUDENT'
                      ? 'border-blue-600 bg-blue-50/60 text-blue-900 ring-1 ring-blue-600/30'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className="font-bold">Student Candidate</span>
                  <span className="text-[10px] text-slate-400 font-normal">Prepare for placement rounds</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'MENTOR' })}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all flex flex-col items-center gap-0.5 ${
                    formData.role === 'MENTOR'
                      ? 'border-blue-600 bg-blue-50/60 text-blue-900 ring-1 ring-blue-600/30'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className="font-bold">Mentor / Evaluator</span>
                  <span className="text-[10px] text-slate-400 font-normal">Review cohort integrity</span>
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="reg-name" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <HiOutlineUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  id="reg-name"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Alex Morgan"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100/60 outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Email & Phone in 2 Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <HiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    id="reg-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="alex@domain.com"
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100/60 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-phone" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phone (Optional)
                </label>
                <div className="relative">
                  <HiOutlinePhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    id="reg-phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 9876543210"
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100/60 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Education */}
            <div>
              <label htmlFor="reg-education" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Institution & Degree
              </label>
              <div className="relative">
                <HiOutlineAcademicCap className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  id="reg-education"
                  type="text"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  placeholder="e.g. National Institute of Tech, B.Tech CS"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100/60 outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Password & Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="reg-password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 8 characters"
                    className="w-full pl-10 pr-9 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100/60 outline-none transition-all font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <HiOutlineEyeOff className="w-3.5 h-3.5" /> : <HiOutlineEye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="reg-confirm" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    id="reg-confirm"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100/60 outline-none transition-all font-mono"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="flex items-center gap-2 pt-0.5">
                <div className="flex-1 flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        i <= strength.level ? strength.color : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[11px] font-mono text-slate-500">{strength.text}</span>
              </div>
            )}

            {/* ID Card Verification Upload */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Institutional ID Verification ({formData.role === 'MENTOR' ? 'Mentor Credential' : 'Student ID'})
                </label>
                <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Optional</span>
              </div>

              {!idCardPath ? (
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl cursor-pointer bg-slate-50 hover:bg-blue-50/20 transition-all p-3">
                  <div className="flex flex-col items-center justify-center text-center">
                    {uploadingId ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs text-slate-600">Uploading document...</span>
                      </div>
                    ) : (
                      <>
                        <HiOutlineIdentification className="w-5 h-5 text-slate-400 mb-1" />
                        <span className="text-xs font-semibold text-slate-700">Click to upload ID photo or document</span>
                        <span className="text-[10px] text-slate-400">PDF, JPG, PNG or WEBP (Max 10MB)</span>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*,application/pdf,.pdf"
                    onChange={handleIdCardUpload}
                    disabled={uploadingId}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <HiOutlineCheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-emerald-900">
                        {idCardPath.toLowerCase().endsWith('.pdf') ? 'ID Document (PDF) Attached' : 'ID Photo Attached'}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          const fullUrl = getServerBaseUrl() + idCardPath;
                          window.open(fullUrl, '_blank');
                        }}
                        className="text-[11px] text-blue-600 hover:underline font-medium"
                      >
                        Inspect uploaded preview ↗
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIdCardPath('')}
                    className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  >
                    <HiOutlineX className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-xs mt-3"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Registering Account...</span>
                </>
              ) : (
                <>
                  <HiOutlineSparkles className="w-4 h-4" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[11px] text-slate-400 uppercase font-mono">registered already?</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <p className="text-center text-xs text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline font-semibold">
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
