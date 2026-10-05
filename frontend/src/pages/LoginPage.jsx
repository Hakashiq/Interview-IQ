import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff, HiOutlineSparkles } from 'react-icons/hi';
import ParticleBackground from '../components/layout/ParticleBackground';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back! ✨');
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid email or password';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-porcelain-50 flex items-center justify-center relative overflow-hidden py-12 px-4 selection:bg-blue-100 selection:text-blue-900">
      <ParticleBackground />

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        
        {/* Brand Mark */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white font-bold text-base shadow-xs mb-3">
            IQ
          </div>
          <h1 className="text-2xl font-display font-bold text-slate-900 tracking-tight">
            InterviewIQ
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Sign in to your adaptive placement simulation workspace
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-7 sm:p-8 shadow-subtle space-y-6">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Welcome Back</h2>
            <p className="text-xs text-slate-500 mt-0.5">Enter your verified email and security credentials</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <HiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="candidate@university.edu"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100/60 outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <button type="button" className="text-[11px] text-blue-600 hover:underline font-medium">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100/60 outline-none transition-all font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-xs mt-2"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <HiOutlineSparkles className="w-4 h-4" />
                  <span>Sign In to Studio</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[11px] text-slate-400 uppercase font-mono">new candidate?</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Registration Redirect */}
          <p className="text-center text-xs text-slate-600">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:underline font-semibold">
              Create an account
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-400 text-[11px] mt-6">
          InterviewIQ Studio • Enterprise Placement Assurance
        </p>
      </div>
    </div>
  );
}
