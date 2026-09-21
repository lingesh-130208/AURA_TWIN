import React, { useState } from 'react';
import { ShieldAlert, Compass, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';
import { UserRole } from '../types/traffic';
import { AuthService } from '../services/authService';

interface LoginPageProps {
  initialRole?: UserRole;
  onLoginSuccess: (role: UserRole) => void;
  onCancel: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  initialRole = 'ADMIN',
  onLoginSuccess,
  onCancel
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [username, setUsername] = useState(initialRole === 'ADMIN' ? 'admin' : 'citizen');
  const [password, setPassword] = useState(initialRole === 'ADMIN' ? '12345678' : 'user123');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
    if (role === 'ADMIN') {
      setUsername('admin');
      setPassword('12345678');
    } else {
      setUsername('citizen');
      setPassword('user123');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    setTimeout(() => {
      const result = AuthService.login(username, password, selectedRole);
      setIsSubmitting(false);

      if (result.success && result.user) {
        onLoginSuccess(result.user.role);
      } else {
        // Section 4 requirement: "Invalid username or password." Do not reveal which field was incorrect.
        setErrorMessage(result.error || 'Invalid username or password.');
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center px-4 py-12 relative">
      {/* Background radial highlight */}
      <div className="absolute w-[500px] h-[500px] bg-cyan-950/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10">
        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-mono text-xl font-bold shadow-lg shadow-cyan-950">
            Ω
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight font-mono">AURA-TWIN</h1>
          <p className="text-xs text-neutral-400">
            Real-Time AI Decision Intelligence for Preventing Traffic Gridlock
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-950 rounded-xl border border-neutral-800 mb-6">
          <button
            type="button"
            id="login-role-admin"
            onClick={() => handleRoleChange('ADMIN')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              selectedRole === 'ADMIN'
                ? 'bg-rose-950 text-rose-200 border border-rose-800 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>TRAFFIC CONTROL</span>
          </button>

          <button
            type="button"
            id="login-role-user"
            onClick={() => handleRoleChange('USER')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              selectedRole === 'USER'
                ? 'bg-cyan-950 text-cyan-200 border border-cyan-800 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>CITIZEN / USER</span>
          </button>
        </div>

        {/* Active Role Indicator */}
        <div className={`p-3 rounded-lg border text-xs mb-5 ${
          selectedRole === 'ADMIN'
            ? 'bg-rose-950/40 border-rose-800/60 text-rose-300'
            : 'bg-cyan-950/40 border-cyan-800/60 text-cyan-300'
        }`}>
          <div className="font-bold font-mono uppercase tracking-wide">
            {selectedRole === 'ADMIN' ? 'AUTHORIZED TRAFFIC CONTROL (AURA COMMAND)' : 'PUBLIC COMMUTER (AURA CITIZEN)'}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">
            {selectedRole === 'ADMIN'
              ? 'Enables hazard forecasts, cascade exploration, What-If simulation, and human intervention controls.'
              : 'Enables interactive maps, route alternatives, future gridlock risk %, and predicted disruption alerts.'}
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 mb-4 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                <User className="w-4 h-4" />
              </div>
              <input
                id="login-username-input"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                placeholder={selectedRole === 'ADMIN' ? 'admin' : 'citizen'}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="login-password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Demo credential hint & Quick Fill */}
          <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800/80 text-[11px] text-neutral-400 flex items-center justify-between">
            <div>
              <span className="text-neutral-500 font-mono">DEMO: </span>
              <strong className="text-neutral-200">
                {selectedRole === 'ADMIN' ? 'admin / 12345678' : 'citizen / user123'}
              </strong>
            </div>
            <button
              type="button"
              onClick={() => {
                if (selectedRole === 'ADMIN') {
                  setUsername('admin');
                  setPassword('12345678');
                } else {
                  setUsername('citizen');
                  setPassword('user123');
                }
              }}
              className="text-cyan-400 hover:text-cyan-300 font-medium underline text-[10px]"
            >
              Autofill
            </button>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm shadow-md flex items-center justify-center space-x-2 transition-all ${
              selectedRole === 'ADMIN'
                ? 'bg-rose-700 hover:bg-rose-600 text-white'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white'
            }`}
          >
            <span>{isSubmitting ? 'Authenticating...' : `Enter ${selectedRole === 'ADMIN' ? 'AURA COMMAND' : 'AURA CITIZEN'}`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-neutral-800 text-center">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-neutral-400 hover:text-neutral-200 underline"
          >
            ← Return to Public Portal
          </button>
        </div>
      </div>
    </div>
  );
};
