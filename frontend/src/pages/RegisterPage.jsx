import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff,
  HiOutlineUser, HiOutlinePhone, HiOutlineIdentification, HiOutlineAcademicCap,
  HiOutlineSparkles, HiOutlineCheckCircle, HiOutlineX, HiOutlineTerminal
} from 'react-icons/hi';
import ParticleBackground from '../components/layout/ParticleBackground';
import api, { getServerBaseUrl } from '../api/axios';
import { validatePassword, getPasswordStrength } from '../utils/passwordValidator';
import PasswordRequirementsList from '../components/common/PasswordRequirementsList';
import { playHoverTick, playMechanicalToggle } from '../utils/soundEffects';

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
    playMechanicalToggle(true);
    try {
      const res = await api.post('/auth/register/id-card', fileData, {
        headers: {
          'Content-Type': undefined,
        },
      });
      setIdCardPath(res.data.idCardPath);
      toast.success('Document specification attached');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to upload document. You can still initialize without it.';
      toast.error(msg);
      console.error(err);
    } finally {
      setUploadingId(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    playMechanicalToggle(true);

    if (formData.password !== formData.confirmPassword) {
      toast.error('Access keys do not match');
      return;
    }

    const validation = validatePassword(formData.password);
    if (!validation.isValid) {
      toast.error(validation.message);
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
      toast.success('Operator Core Initialized! Welcome aboard.');
    } catch (err) {
      playMechanicalToggle(false);
      const message = err.response?.data?.message || 'Core registration failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen bg-ghost-void text-ghost-ice flex items-center justify-center relative overflow-hidden py-12 px-4 devices-matrix-grid">
      <ParticleBackground />

      <div className="relative z-10 w-full max-w-lg animate-fade-in">
        
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            to="/"
            onMouseEnter={playHoverTick}
            className="inline-flex flex-col items-center group"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-ghost-blue group-hover:bg-[#005bbb] text-white font-mono font-bold text-base shadow-xl shadow-ghost-blue/30 mb-3 transition-all">
              IQ
            </div>
            <h1 className="text-2xl font-display font-bold text-white tracking-tightest group-hover:text-ghost-ice transition-colors">
              GHOST // INTERVIEW-IQ
            </h1>
          </Link>
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-ghost-ice/15 bg-ghost-ice/5 font-mono text-[10px] text-ghost-ice/60 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-ghost-blue animate-pulse" />
            OPERATOR CORE PROVISIONING
          </div>
        </div>

        {/* Chassis Panel */}
        <div className="ghost-panel p-6 sm:p-8 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Role Selection */}
            <div>
              <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-ghost-ice/80 mb-2">
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
                      ? 'border-ghost-blue bg-ghost-blue/20 text-white shadow-sm shadow-ghost-blue/20'
                      : 'border-ghost-ice/15 bg-[#000307] text-ghost-ice/70 hover:border-ghost-ice/30'
                  }`}
                >
                  <span className="font-bold">Student Candidate</span>
                  <span className="text-[10px] font-mono text-ghost-ice/50 normal-case">Placement simulation</span>
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
                      ? 'border-ghost-blue bg-ghost-blue/20 text-white shadow-sm shadow-ghost-blue/20'
                      : 'border-ghost-ice/15 bg-[#000307] text-ghost-ice/70 hover:border-ghost-ice/30'
                  }`}
                >
                  <span className="font-bold">Mentor / Evaluator</span>
                  <span className="text-[10px] font-mono text-ghost-ice/50 normal-case">Cohort telemetry audit</span>
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="reg-name" className="block text-[11px] font-mono uppercase tracking-wider text-ghost-ice/80 mb-1.5">
                Full Operator Name
              </label>
              <div className="relative">
                <HiOutlineUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ghost-ice/40 w-4 h-4" />
                <input
                  id="reg-name"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Alex Chen"
                  className="ghost-input pl-10"
                  required
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="reg-email" className="block text-[11px] font-mono uppercase tracking-wider text-ghost-ice/80 mb-1.5">
                  Identity Email
                </label>
                <div className="relative">
                  <HiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ghost-ice/40 w-4 h-4" />
                  <input
                    id="reg-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="alex@domain.com"
                    className="ghost-input pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-phone" className="block text-[11px] font-mono uppercase tracking-wider text-ghost-ice/80 mb-1.5">
                  Phone (Optional)
                </label>
                <div className="relative">
                  <HiOutlinePhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ghost-ice/40 w-4 h-4" />
                  <input
                    id="reg-phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 555-0199"
                    className="ghost-input pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Education */}
            <div>
              <label htmlFor="reg-education" className="block text-[11px] font-mono uppercase tracking-wider text-ghost-ice/80 mb-1.5">
                Institution &amp; Degree Program
              </label>
              <div className="relative">
                <HiOutlineAcademicCap className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ghost-ice/40 w-4 h-4" />
                <input
                  id="reg-education"
                  type="text"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  placeholder="e.g. Stanford University, B.S. Computer Science"
                  className="ghost-input pl-10"
                  required
                />
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="reg-password" className="block text-[11px] font-mono uppercase tracking-wider text-ghost-ice/80 mb-1.5">
                  Access Key
                </label>
                <div className="relative">
                  <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ghost-ice/40 w-4 h-4" />
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 8 chars"
                    className="ghost-input pl-10 pr-9 font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    onMouseEnter={playHoverTick}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ghost-ice/40 hover:text-white"
                  >
                    {showPassword ? <HiOutlineEyeOff className="w-3.5 h-3.5" /> : <HiOutlineEye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="reg-confirm" className="block text-[11px] font-mono uppercase tracking-wider text-ghost-ice/80 mb-1.5">
                  Confirm Key
                </label>
                <div className="relative">
                  <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ghost-ice/40 w-4 h-4" />
                  <input
                    id="reg-confirm"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="ghost-input pl-10 font-mono"
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
                          i <= strength.score ? 'bg-ghost-blue' : 'bg-ghost-ice/15'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-ghost-ice/60">{strength.text}</span>
                </div>
                <PasswordRequirementsList password={formData.password} />
              </div>
            )}

            {/* ID Document Specification */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-ghost-ice/80">
                  Institutional Credential ({formData.role === 'MENTOR' ? 'Mentor Spec' : 'Student ID'})
                </label>
                <span className="text-[10px] font-mono text-ghost-ice/40 border border-ghost-ice/15 px-1.5 py-0.5 rounded">
                  OPTIONAL
                </span>
              </div>

              {!idCardPath ? (
                <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-ghost-ice/25 hover:border-ghost-blue rounded-xl cursor-pointer bg-[#000307]/70 hover:bg-ghost-ice/5 transition-all p-3">
                  <div className="flex flex-col items-center justify-center text-center">
                    {uploadingId ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-ghost-blue border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-mono text-ghost-ice/70">Uploading specification document...</span>
                      </div>
                    ) : (
                      <>
                        <HiOutlineIdentification className="w-5 h-5 text-ghost-ice/40 mb-1" />
                        <span className="text-xs font-ui font-semibold text-ghost-ice">
                          Attach verification photo or PDF
                        </span>
                        <span className="text-[10px] font-mono text-ghost-ice/40">
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
                        className="text-[10px] font-mono text-ghost-blue hover:underline"
                      >
                        Inspect uploaded preview ↗
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIdCardPath('')}
                    onMouseEnter={playHoverTick}
                    className="p-1 rounded-md text-ghost-ice/40 hover:text-red-400 hover:bg-ghost-alert/10"
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
              className="w-full py-2.5 rounded-full bg-ghost-blue hover:bg-[#005bbb] text-ghost-ice font-ui text-xs font-semibold uppercase tracking-wider active:scale-95 transition-all shadow-xl shadow-ghost-blue/25 disabled:opacity-50 flex items-center justify-center gap-2 mt-3"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Provisioning Operator Account...</span>
                </>
              ) : (
                <>
                  <HiOutlineTerminal className="w-4 h-4" />
                  <span>Initialize Operator Core</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex-1 h-px bg-ghost-ice/15" />
            <span className="text-[10px] text-ghost-ice/40 uppercase font-mono tracking-widest">
              EXISTING OPERATOR?
            </span>
            <div className="flex-1 h-px bg-ghost-ice/15" />
          </div>

          <p className="text-center font-ui text-xs text-ghost-ice/60">
            Already have an active core?{' '}
            <Link
              to="/login"
              onMouseEnter={playHoverTick}
              className="text-white hover:text-ghost-blue font-semibold underline underline-offset-4 ml-1"
            >
              Authenticate here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
