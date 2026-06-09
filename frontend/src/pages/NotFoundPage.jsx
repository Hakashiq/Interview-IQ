import { useNavigate } from 'react-router-dom';
import { HiOutlineHome, HiOutlineArrowRight } from 'react-icons/hi';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center relative overflow-hidden px-4">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />

        {/* Decorative grid dots */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center animate-fade-in">
        {/* Large 404 Text */}
        <h1 className="text-[10rem] sm:text-[14rem] font-display font-extrabold leading-none gradient-text select-none mb-2">
          404
        </h1>

        {/* Glass Card */}
        <div className="glass-card p-8 max-w-md mx-auto -mt-8">
          <h2 className="text-2xl font-display font-bold text-white mb-3">
            Oops! Page not found
          </h2>
          <p className="text-gray-400 mb-8 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Let&apos;s get you back on track.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary inline-flex items-center justify-center gap-2"
            >
              <HiOutlineHome className="w-5 h-5" />
              Back to Dashboard
            </button>
            <button
              onClick={() => navigate(-1)}
              className="btn-secondary inline-flex items-center justify-center gap-2"
            >
              <HiOutlineArrowRight className="w-5 h-5 rotate-180" />
              Go Back
            </button>
          </div>
        </div>

        {/* Subtle footer text */}
        <p className="text-gray-600 text-sm mt-8">
          InterviewIQ — AI-Powered Mock Interviews
        </p>
      </div>
    </div>
  );
}
