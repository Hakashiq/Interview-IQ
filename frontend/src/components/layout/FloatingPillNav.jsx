import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { playMechanicalToggle, playHoverTick, toggleAudio, isAudioEnabled } from '../../utils/soundEffects';
import { HiOutlineVolumeUp, HiOutlineVolumeOff, HiOutlineMenu, HiOutlineX } from 'react-icons/hi';

export function FloatingPillNav({ onOpenCart }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [soundOn, setSoundOn] = useState(isAudioEnabled());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSoundToggle = (e) => {
    e.stopPropagation();
    const next = toggleAudio();
    setSoundOn(next);
    playMechanicalToggle(next);
  };

  const handleMobileToggle = () => {
    const next = !mobileMenuOpen;
    setMobileMenuOpen(next);
    playMechanicalToggle(next);
  };

  return (
    <header className="fixed top-5 inset-x-0 z-50 flex flex-col items-center px-4 pointer-events-none">
      <nav className="pointer-events-auto flex items-center gap-4 sm:gap-6 px-4 sm:px-6 py-2.5 rounded-full bg-iq-void/85 backdrop-blur-md border border-iq-ice/15 shadow-2xl">
        {/* Brand Emblem */}
        <Link
          to="/"
          onMouseEnter={playHoverTick}
          className="flex items-center gap-2.5 font-display font-semibold tracking-tight text-white hover:text-iq-ice transition-colors"
        >
          <div className="w-6 h-6 rounded bg-iq-blue flex items-center justify-center text-white font-mono text-[11px] font-bold shadow-md shadow-iq-blue/30">
            IQ
          </div>
          <span className="text-sm font-display tracking-tightest">INTERVIEW-IQ</span>
          <span className="hidden sm:inline-block text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border border-iq-ice/20 bg-iq-ice/5 text-iq-ice/70">
            AI ENGINE
          </span>
        </Link>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-6 text-xs font-ui uppercase tracking-wider text-iq-ice/70">
          <a
            href="#core"
            onMouseEnter={playHoverTick}
            className="hover:text-white transition-colors"
          >
            Overview
          </a>
          <a
            href="#specifications"
            onMouseEnter={playHoverTick}
            className="hover:text-white transition-colors"
          >
            Specifications
          </a>
          <a
            href="#tracks"
            onMouseEnter={playHoverTick}
            className="hover:text-white transition-colors"
          >
            Tracks
          </a>
          <a
            href="#telemetry"
            onMouseEnter={playHoverTick}
            className="hover:text-white transition-colors"
          >
            Proctoring
          </a>
          <a
            href="#faq"
            onMouseEnter={playHoverTick}
            className="hover:text-white transition-colors"
          >
            FAQ
          </a>
        </div>

        {/* Audio Haptic Procedural Sound Toggle */}
        <button
          onClick={handleSoundToggle}
          onMouseEnter={playHoverTick}
          data-sfx="toggle"
          title={soundOn ? 'Audio Haptics Active (Procedural 7kHz Filtered)' : 'Audio Haptics Muted'}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-iq-ice/15 text-iq-ice/80 hover:text-white hover:border-iq-ice/30 text-[11px] font-mono transition-all"
        >
          {soundOn ? (
            <>
              <HiOutlineVolumeUp className="w-3.5 h-3.5 text-iq-blue" />
              <span className="hidden sm:inline text-[9px] uppercase tracking-wider text-iq-ice/60">SFX</span>
            </>
          ) : (
            <>
              <HiOutlineVolumeOff className="w-3.5 h-3.5 text-iq-ice/40" />
              <span className="hidden sm:inline text-[9px] uppercase tracking-wider text-iq-ice/40">MUTED</span>
            </>
          )}
        </button>

        {/* Action Button: Pill */}
        {user ? (
          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              onMouseEnter={playHoverTick}
              data-sfx="toggle"
              className="px-3.5 py-1.5 rounded-full bg-iq-blue hover:bg-[#005bbb] text-iq-ice font-ui text-xs font-semibold uppercase tracking-wider active:scale-95 transition-all shadow-lg shadow-iq-blue/20"
            >
              Control Panel
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              onMouseEnter={playHoverTick}
              className="hidden sm:inline-block px-3 py-1.5 text-iq-ice/80 hover:text-white font-ui text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              onMouseEnter={playHoverTick}
              data-sfx="toggle"
              className="px-3.5 py-1.5 rounded-full bg-iq-blue hover:bg-[#005bbb] text-iq-ice font-ui text-xs font-semibold uppercase tracking-wider active:scale-95 transition-all shadow-lg shadow-iq-blue/20"
            >
              Get Started
            </Link>
          </div>
        )}

        {/* Mobile Hamburger */}
        <button
          onClick={handleMobileToggle}
          data-sfx="toggle"
          className="md:hidden p-1 text-iq-ice/80 hover:text-white focus:outline-none"
        >
          {mobileMenuOpen ? <HiOutlineX className="w-5 h-5" /> : <HiOutlineMenu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto mt-2 w-full max-w-sm rounded-2xl bg-iq-void/95 backdrop-blur-xl border border-iq-ice/15 p-4 shadow-2xl flex flex-col gap-3 font-ui text-xs uppercase tracking-wider">
          <a
            href="#core"
            onClick={() => setMobileMenuOpen(false)}
            className="px-3 py-2 text-iq-ice/80 hover:text-white hover:bg-iq-ice/5 rounded-lg"
          >
            Overview
          </a>
          <a
            href="#specifications"
            onClick={() => setMobileMenuOpen(false)}
            className="px-3 py-2 text-iq-ice/80 hover:text-white hover:bg-iq-ice/5 rounded-lg"
          >
            Technical Specifications
          </a>
          <a
            href="#tracks"
            onClick={() => setMobileMenuOpen(false)}
            className="px-3 py-2 text-iq-ice/80 hover:text-white hover:bg-iq-ice/5 rounded-lg"
          >
            Interview Tracks
          </a>
          <a
            href="#telemetry"
            onClick={() => setMobileMenuOpen(false)}
            className="px-3 py-2 text-iq-ice/80 hover:text-white hover:bg-iq-ice/5 rounded-lg"
          >
            Vision Proctoring
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="px-3 py-2 text-iq-ice/80 hover:text-white hover:bg-iq-ice/5 rounded-lg"
          >
            Frequently Asked Questions
          </a>
          <div className="pt-2 border-t border-iq-ice/10 flex flex-col gap-2">
            {!user ? (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-iq-ice/80 hover:text-white"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 rounded-full bg-iq-blue text-iq-ice font-semibold"
                >
                  Get Started Free
                </Link>
              </>
            ) : (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 rounded-full bg-iq-blue text-iq-ice font-semibold"
              >
                Go to Control Panel
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default FloatingPillNav;
