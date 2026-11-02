import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff, HiOutlineTerminal } from 'react-icons/hi';
import ParticleBackground from '../components/layout/ParticleBackground';
import { playHoverTick, playMechanicalToggle } from '../utils/soundEffects';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    playMechanicalToggle(true);
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Authentication successful. Welcome back.');
    } catch (err) {
      playMechanicalToggle(false);
      const message = err.response?.data?.message || 'Invalid credentials or host unreachable';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-iq-void text-iq-ice flex items-center justify-center relative overflow-hidden py-12 px-4 devices-matrix-grid">
      <ParticleBackground />

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        
        {/* Brand Header */}
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
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            CANDIDATE &amp; MENTOR AUTHENTICATION
          </div>
        </div>

        {/* Chassis Panel */}
        <div className="iq-panel p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-iq-ice/15">
            <div>
              <h2 className="text-sm font-display font-bold text-white uppercase tracking-wider">
                Account Sign-In
              </h2>
              <p className="text-[11px] font-mono text-iq-ice/50 mt-0.5">
                Verify credentials to enter interview console
              </p>
            </div>
            <span className="font-mono text-[10px] text-iq-ice/40">[SEC.TLS.1.3]</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-[11px] font-mono uppercase tracking-wider text-iq-ice/80 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <HiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-iq-ice/40 w-4 h-4" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="candidate@university.edu"
                  className="iq-input pl-10"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-[11px] font-mono uppercase tracking-wider text-iq-ice/80">
                  Password
                </label>
                <button
                  type="button"
                  onMouseEnter={playHoverTick}
                  className="text-[10px] font-mono text-iq-blue hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-iq-ice/40 w-4 h-4" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="iq-input pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  onMouseEnter={playHoverTick}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-iq-ice/40 hover:text-white"
                >
                  {showPassword ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit CTA */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              onMouseEnter={playHoverTick}
              data-sfx="toggle"
              className="w-full py-2.5 rounded-full bg-iq-blue hover:bg-[#005bbb] text-iq-ice font-ui text-xs font-semibold uppercase tracking-wider active:scale-95 transition-all shadow-xl shadow-iq-blue/25 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Authenticating Identity...</span>
                </>
              ) : (
                <>
                  <HiOutlineTerminal className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="pt-4 border-t border-iq-ice/10 text-center font-ui text-xs text-iq-ice/60">
            Need an account?{' '}
            <Link
              to="/register"
              onMouseEnter={playHoverTick}
              className="text-white hover:text-iq-blue font-semibold underline underline-offset-4 ml-1"
            >
              Register Here
            </Link>
          </div>
        </div>

        {/* Telemetry Hardware Stamp */}
        <div className="mt-6 text-center font-mono text-[10px] text-iq-ice/40 select-none">
          SYSTEM: INTERVIEW-IQ PLACEMENT SIMULATION CORE
        </div>

      </div>
    </div>
  );
}
