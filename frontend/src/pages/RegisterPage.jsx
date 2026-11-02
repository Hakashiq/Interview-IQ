import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { getServerBaseUrl } from '../api/axios';
import toast from 'react-hot-toast';
import {
  HiOutlineUser, HiOutlineMail, HiOutlinePhone, HiOutlineLockClosed,
  HiOutlineAcademicCap, HiOutlineIdentification, HiOutlineCheckCircle,
  HiOutlineX, HiOutlineEye, HiOutlineEyeOff, HiOutlineTerminal
} from 'react-icons/hi';
import ParticleBackground from '../components/layout/ParticleBackground';
import { playHoverTick, playMechanicalToggle } from '../utils/soundEffects';

function PasswordRequirementsList({ password }) {
  const requirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { label: 'One number', met: /\d/.test(password) },
    { label: 'One special character (!@#$%^&*)', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-2 text-[10px] font-mono">
      {requirements.map((req, idx) => (
        <div key={idx} className="flex items-center gap-1.5">
          <span className={req.met ? 'text-emerald-400' : 'text-iq-ice/30'}>
            {req.met ? '✓' : '○'}
          </span>
          <span className={req.met ? 'text-iq-ice/90' : 'text-iq-ice/40'}>
            {req.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT',
    phone: '',
    education: '',
  });

  const [idCardPath, setIdCardPath] = useState('');
  const [uploadingId, setUploadingId] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleIdCardUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Document file size must be less than 10MB');
      return;
    }

    const data = new FormData();
    data.append('file', file);
    setUploadingId(true);

    try {
      const res = await api.post('/upload/id-card', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setIdCardPath(res.data.filePath);
      toast.success('Document uploaded successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload verification document');
    } finally {
      setUploadingId(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    playMechanicalToggle(true);

    if (formData.password !== formData.confirmPassword) {
      toast.error('Access keys do not match');
      return;
    }

    setLoading(true);
    try {
      await register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
        education: formData.education,
        idCardPath: idCardPath || null,
      });

      toast.success('Account provisioned successfully');
      navigate('/dashboard');
    } catch (err) {
      playMechanicalToggle(false);
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { text: 'WEAK', score: 1 };
    if (score === 2) return { text: 'MODERATE', score: 2 };
    if (score === 3) return { text: 'STRONG', score: 3 };
    return { text: 'OPTIMAL', score: 4 };
  };

  const strength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen bg-iq-void text-iq-ice flex items-center justify-center relative overflow-hidden py-12 px-4 devices-matrix-grid">
      <ParticleBackground />

      <div className="relative z-10 w-full max-w-lg animate-fade-in">
        
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            to="/"
            onMouseEnter={playHoverTick}
            className="inline-flex flex-col items-center group"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-iq-blue group-hover:bg-[#005bbb] text-white font-mono font-bold text-base shadow-xl shadow-iq-blue/30 mb-3 transition-all">
              IQ
            </div>
            <h1 className="text-2xl font-display font-bold text-white tracking-tightest group-hover:text-iq-ice transition-colors">
              INTERVIEW-IQ
            </h1>
          </Link>
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-iq-ice/15 bg-iq-ice/5 font-mono text-[10px] text-iq-ice/60 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-iq-blue animate-pulse" />
            CREATE ACCOUNT
          </div>
        </div>

        {/* Chassis Panel */}
        <div className="iq-panel p-6 sm:p-8 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Role Selection */}
            <div>
              <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-iq-ice/80 mb-2">
                Operational Role Assignment
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, role: 'STUDENT' });
                    playMechanicalToggle(true);
                  }}
                  onMouseEnter={playHoverTick}
                  data-sfx="toggle"
                  className={`py-2.5 px-3 rounded-xl border text-xs font-ui uppercase tracking-wider transition-all flex flex-col items-center gap-0.5 ${
                    formData.role === 'STUDENT'
                      ? 'border-iq-blue bg-iq-blue/20 text-white shadow-sm shadow-iq-blue/20'
                      : 'border-iq-ice/15 bg-[#000307] text-iq-ice/70 hover:border-iq-ice/30'
                  }`}
                >
                  <span className="font-bold">Student Candidate</span>
                  <span className="text-[10px] font-mono text-iq-ice/50 normal-case">Placement simulation</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, role: 'MENTOR' });
                    playMechanicalToggle(true);
                  }}
                  onMouseEnter={playHoverTick}
                  data-sfx="toggle"
                  className={`py-2.5 px-3 rounded-xl border text-xs font-ui uppercase tracking-wider transition-all flex flex-col items-center gap-0.5 ${
                    formData.role === 'MENTOR'
                      ? 'border-iq-blue bg-iq-blue/20 text-white shadow-sm shadow-iq-blue/20'
                      : 'border-iq-ice/15 bg-[#000307] text-iq-ice/70 hover:border-iq-ice/30'
                  }`}
                >
                  <span className="font-bold">Mentor / Evaluator</span>
                  <span className="text-[10px] font-mono text-iq-ice/50 normal-case">Cohort telemetry audit</span>
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="reg-name" className="block text-[11px] font-mono uppercase tracking-wider text-iq-ice/80 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <HiOutlineUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-iq-ice/40 w-4 h-4" />
                <input
                  id="reg-name"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Alex Chen"
                  className="iq-input pl-10"
                  required
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="reg-email" className="block text-[11px] font-mono uppercase tracking-wider text-iq-ice/80 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <HiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-iq-ice/40 w-4 h-4" />
                  <input
                    id="reg-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="alex@domain.com"
                    className="iq-input pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-phone" className="block text-[11px] font-mono uppercase tracking-wider text-iq-ice/80 mb-1.5">
                  Phone (Optional)
                </label>
                <div className="relative">
                  <HiOutlinePhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-iq-ice/40 w-4 h-4" />
                  <input
                    id="reg-phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 555-0199"
                    className="iq-input pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Education */}
            <div>
              <label htmlFor="reg-education" className="block text-[11px] font-mono uppercase tracking-wider text-iq-ice/80 mb-1.5">
                Institution &amp; Degree Program
              </label>
              <div className="relative">
                <HiOutlineAcademicCap className="absolute left-3.5 top-1/2 -translate-y-1/2 text-iq-ice/40 w-4 h-4" />
                <input
                  id="reg-education"
                  type="text"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  placeholder="e.g. Stanford University, B.S. Computer Science"
                  className="iq-input pl-10"
                  required
                />
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="reg-password" className="block text-[11px] font-mono uppercase tracking-wider text-iq-ice/80 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-iq-ice/40 w-4 h-4" />
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 8 chars"
                    className="iq-input pl-10 pr-9 font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    onMouseEnter={playHoverTick}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-iq-ice/40 hover:text-white"
                  >
                    {showPassword ? <HiOutlineEyeOff className="w-3.5 h-3.5" /> : <HiOutlineEye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="reg-confirm" className="block text-[11px] font-mono uppercase tracking-wider text-iq-ice/80 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-iq-ice/40 w-4 h-4" />
                  <input
                    id="reg-confirm"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="iq-input pl-10 font-mono"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength.score ? 'bg-iq-blue' : 'bg-iq-ice/15'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-iq-ice/60">{strength.text}</span>
                </div>
                <PasswordRequirementsList password={formData.password} />
              </div>
            )}

            {/* ID Document Specification */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-iq-ice/80">
                  Verification Document ({formData.role === 'MENTOR' ? 'Mentor Credential' : 'Student ID'})
                </label>
                <span className="text-[10px] font-mono text-iq-ice/40 border border-iq-ice/15 px-1.5 py-0.5 rounded">
                  OPTIONAL
                </span>
              </div>

              {!idCardPath ? (
                <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-iq-ice/25 hover:border-iq-blue rounded-xl cursor-pointer bg-[#000307]/70 hover:bg-iq-ice/5 transition-all p-3">
                  <div className="flex flex-col items-center justify-center text-center">
                    {uploadingId ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-iq-blue border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-mono text-iq-ice/70">Uploading document...</span>
                      </div>
                    ) : (
                      <>
                        <HiOutlineIdentification className="w-5 h-5 text-iq-ice/40 mb-1" />
                        <span className="text-xs font-ui font-semibold text-iq-ice">
                          Attach verification photo or PDF
                        </span>
                        <span className="text-[10px] font-mono text-iq-ice/40">
                          PDF, JPG, PNG or WEBP (Max 10MB)
                        </span>
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
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <HiOutlineCheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-mono font-semibold text-emerald-300">
                        {idCardPath.toLowerCase().endsWith('.pdf') ? 'ID Document (PDF) Attached' : 'ID Photo Attached'}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          const fullUrl = getServerBaseUrl() + idCardPath;
                          window.open(fullUrl, '_blank');
                        }}
                        className="text-[10px] font-mono text-iq-blue hover:underline"
                      >
                        Inspect uploaded preview ↗
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIdCardPath('')}
                    onMouseEnter={playHoverTick}
                    className="p-1 rounded-md text-iq-ice/40 hover:text-red-400 hover:bg-iq-alert/10"
                  >
                    <HiOutlineX className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Submit CTA */}
            <button
              id="register-submit-btn"
              type="submit"
              disabled={loading}
              onMouseEnter={playHoverTick}
              data-sfx="toggle"
              className="w-full py-2.5 rounded-full bg-iq-blue hover:bg-[#005bbb] text-iq-ice font-ui text-xs font-semibold uppercase tracking-wider active:scale-95 transition-all shadow-xl shadow-iq-blue/25 disabled:opacity-50 flex items-center justify-center gap-2 mt-3"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <HiOutlineTerminal className="w-4 h-4" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex-1 h-px bg-iq-ice/15" />
            <span className="text-[10px] text-iq-ice/40 uppercase font-mono tracking-widest">
              ALREADY REGISTERED?
            </span>
            <div className="flex-1 h-px bg-iq-ice/15" />
          </div>

          <p className="text-center font-ui text-xs text-iq-ice/60">
            Already have an active account?{' '}
            <Link
              to="/login"
              onMouseEnter={playHoverTick}
              className="text-white hover:text-iq-blue font-semibold underline underline-offset-4 ml-1"
            >
              Sign In Here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
