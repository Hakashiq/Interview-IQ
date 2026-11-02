import { useNavigate } from 'react-router-dom';
import { HiOutlineHome, HiOutlineArrowLeft } from 'react-icons/hi';
import ParticleBackground from '../components/layout/ParticleBackground';
import { playHoverTick, playMechanicalToggle } from '../utils/soundEffects';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-iq-void text-iq-ice flex items-center justify-center relative overflow-hidden px-4 devices-matrix-grid selection:bg-iq-blue selection:text-iq-ice">
      <ParticleBackground />

      <div className="relative z-10 text-center max-w-md w-full animate-fade-in">
        <div className="iq-panel p-8 shadow-2xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-iq-blue/15 border border-iq-blue/30 text-iq-blue font-mono font-bold text-lg mx-auto flex items-center justify-center">
            404
          </div>

          <div className="font-mono text-[10px] text-iq-blue uppercase tracking-widest">
            [ENDPOINT NON-EXISTENT]
          </div>

          <h1 className="text-xl font-display font-bold text-white tracking-tight">
            Page Not Found
          </h1>

          <p className="text-xs text-iq-ice/60 font-ui leading-relaxed">
            The requested interview chamber, resource, or view could not be located on this instance.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
            <button
              onClick={() => {
                playMechanicalToggle(true);
                navigate('/dashboard');
              }}
              onMouseEnter={playHoverTick}
              data-sfx="toggle"
              className="iq-button-blue text-xs py-2 px-4 inline-flex items-center justify-center gap-1.5"
            >
              <HiOutlineHome className="w-4 h-4" />
              <span>Control Panel</span>
            </button>
            <button
              onClick={() => {
                playMechanicalToggle(false);
                navigate(-1);
              }}
              onMouseEnter={playHoverTick}
              className="iq-button-void text-xs py-2 px-4 inline-flex items-center justify-center gap-1.5"
            >
              <HiOutlineArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
          </div>
        </div>

        <div className="mt-4 font-mono text-[9px] text-iq-ice/30 uppercase tracking-widest">
          INTERVIEW-IQ // AI PLATFORM v2.4
        </div>
      </div>
    </div>
  );
}
