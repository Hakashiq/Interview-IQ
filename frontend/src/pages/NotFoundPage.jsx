import { useNavigate } from 'react-router-dom';
import { HiOutlineHome, HiOutlineArrowLeft } from 'react-icons/hi';
import ParticleBackground from '../components/layout/ParticleBackground';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-porcelain-50 flex items-center justify-center relative overflow-hidden px-4 selection:bg-blue-100 selection:text-blue-900">
      <ParticleBackground />

      <div className="relative z-10 text-center max-w-md w-full animate-fade-in">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-8 shadow-subtle space-y-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 font-mono font-bold text-lg mx-auto flex items-center justify-center">
            404
          </div>

          <h1 className="text-xl font-display font-bold text-slate-900">
            Page Not Found
          </h1>

          <p className="text-xs text-slate-500 leading-relaxed">
            The endpoint or requested view does not exist or has been relocated to a different route.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary text-xs py-2 px-4 inline-flex items-center justify-center gap-1.5 shadow-xs"
            >
              <HiOutlineHome className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
            <button
              onClick={() => navigate(-1)}
              className="btn-secondary text-xs py-2 px-4 inline-flex items-center justify-center gap-1.5 shadow-xs"
            >
              <HiOutlineArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
          </div>
        </div>

        <p className="text-slate-400 text-[11px] mt-6">
          InterviewIQ Studio • 404 Route Resolver
        </p>
      </div>
    </div>
  );
}
