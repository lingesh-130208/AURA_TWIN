import React from 'react';
import { ShieldX, ArrowLeft, Compass } from 'lucide-react';

interface UnauthorizedPageProps {
  onReturnToCitizen: () => void;
  onAdminLogin: () => void;
}

export const UnauthorizedPage: React.FC<UnauthorizedPageProps> = ({
  onReturnToCitizen,
  onAdminLogin
}) => {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center px-4 py-12 text-center">
      <div className="w-full max-w-md bg-neutral-900 border border-rose-900/60 rounded-2xl p-8 shadow-2xl space-y-5">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-950/80 border border-rose-800 flex items-center justify-center text-rose-400">
          <ShieldX className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="text-xs font-mono text-rose-400 font-bold tracking-widest uppercase">
            SECURITY PROTOCOL ENFORCED
          </div>
          <h1 className="text-2xl font-extrabold text-white">ACCESS RESTRICTED</h1>
          <p className="text-sm text-neutral-300">
            You are not authorized to access AURA traffic-control operations.
          </p>
        </div>

        <p className="text-xs text-neutral-400 bg-neutral-950 p-3 rounded-lg border border-neutral-800 font-mono text-left">
          <strong>Restricted Endpoints:</strong> Signal controls, intervention execution, What-If decision simulations, and operational audit logs are reserved strictly for authenticated traffic operations engineers.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            id="unauth-return-citizen-btn"
            onClick={onReturnToCitizen}
            className="flex-1 py-2.5 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center justify-center space-x-2 transition-colors"
          >
            <Compass className="w-4 h-4" />
            <span>Return to Citizen Map</span>
          </button>

          <button
            id="unauth-admin-login-btn"
            onClick={onAdminLogin}
            className="py-2.5 px-4 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Operator Sign In</span>
          </button>
        </div>
      </div>
    </div>
  );
};
