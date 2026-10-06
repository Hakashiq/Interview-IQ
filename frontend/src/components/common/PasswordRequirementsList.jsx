import { HiCheck, HiMinus } from 'react-icons/hi';
import { getPasswordRequirements } from '../../utils/passwordValidator';

export default function PasswordRequirementsList({ password = '', showOnlyWhenTyping = false }) {
  if (showOnlyWhenTyping && !password) return null;

  const requirements = getPasswordRequirements(password);

  return (
    <div className="pt-1.5 pb-0.5 space-y-1">
      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
        Password requirements:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1">
        {requirements.map((req) => (
          <div
            key={req.id}
            className={`flex items-center gap-1.5 text-[11px] transition-colors ${
              req.met ? 'text-emerald-600 font-medium' : 'text-slate-400'
            }`}
          >
            <span
              className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] transition-colors ${
                req.met
                  ? 'bg-emerald-100 text-emerald-700 font-bold'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {req.met ? <HiCheck className="w-2.5 h-2.5" /> : <HiMinus className="w-2 h-2" />}
            </span>
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
