import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Radar, AlertTriangle, CheckCircle2, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import RadarLoader from '../components/RadarLoader';

const STAGES = {
  FORM: 'form',
  PENDING_VERIFICATION: 'pending-verification',
  VERIFYING: 'verifying',
  VERIFIED: 'verified',
  VERIFY_FAILED: 'verify-failed',
};

export default function AuthView() {
  const { login, register, verifyRadarHandshake } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from ?? '/';

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [stage, setStage] = useState(STAGES.FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [leetcodeUsername, setLeetcodeUsername] = useState('');

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setStage(STAGES.FORM);
    setError('');
  };

  const runVerification = async (usernameToVerify) => {
    setStage(STAGES.VERIFYING);
    const result = await verifyRadarHandshake(usernameToVerify);
    if (result.success) {
      setStage(STAGES.VERIFIED);
    } else {
      setError(result.error);
      setStage(STAGES.VERIFY_FAILED);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    const result = await login(username.trim(), password);
    setSubmitting(false);
    if (result.success) {
      navigate(redirectTo, { replace: true });
    } else {
      setError(result.error);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    const result = await register({
      username: username.trim(),
      password,
      leetcodeUsername: leetcodeUsername.trim(),
    });
    setSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }
    // Account created — show instructions to verify
    setStage(STAGES.PENDING_VERIFICATION);
  };

  const goToLoginAfterVerify = () => {
    setMode('login');
    setStage(STAGES.FORM);
    setPassword('');
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md animate-rise">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="relative mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-signal/50 bg-void-panel">
            <Radar size={26} className="text-signal" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-slate-bright">
            Fleet<span className="text-signal">Code</span>
          </h1>
          <p className="eyebrow mt-1">squad radar · grind together, rank together</p>
        </div>

        <div className="hud-panel p-6">
          {stage === STAGES.PENDING_VERIFICATION && (
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <Radar size={32} className="text-signal" />
              <h2 className="text-lg font-semibold text-slate-bright">Verify Your Account</h2>
              <p className="text-sm text-slate-text">
                To confirm this is your LeetCode profile, please go to LeetCode and submit <strong>any</strong> code (a Compile Error is fine) to the problem:
              </p>
              <div className="my-2 rounded-md bg-void p-3 font-mono text-sm text-signal">
                <a 
                  href="https://leetcode.com/problems/find-the-duplicate-number/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline text-signal-glow"
                >
                  find-the-duplicate-number
                </a>
              </div>
              <p className="text-xs text-slate-text">
                The radar will scan for your submission to confirm ownership.
              </p>
              <div className="mt-4 flex w-full gap-2">
                <button
                  onClick={() => runVerification(username.trim())}
                  className="flex-1 rounded-md bg-signal px-4 py-2 text-sm font-semibold text-void transition-colors hover:bg-signal-glow"
                >
                  I have submitted it
                </button>
              </div>
            </div>
          )}

          {stage === STAGES.VERIFYING && <RadarLoader label="Running radar handshake…" />}

          {stage === STAGES.VERIFIED && (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle2 size={36} className="text-terminal" />
              <h2 className="text-lg font-semibold text-slate-bright">LeetCode profile verified</h2>
              <p className="text-sm text-slate-text">
                <span className="font-mono text-terminal">{leetcodeUsername}</span> is on the radar. Log in to
                join the grind.
              </p>
              <button
                onClick={goToLoginAfterVerify}
                className="mt-2 w-full rounded-md bg-signal px-4 py-2 text-sm font-semibold text-void transition-colors hover:bg-signal-glow"
              >
                Continue to login
              </button>
            </div>
          )}

          {stage === STAGES.VERIFY_FAILED && (
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <AlertTriangle size={32} className="text-signal" />
              <h2 className="text-lg font-semibold text-slate-bright">Radar handshake failed</h2>
              <p className="text-sm text-slate-text">{error}</p>
              <p className="text-xs text-slate-text">
                Your account was created — the LeetCode link just couldn't be confirmed.
              </p>
              <div className="mt-2 flex w-full gap-2">
                <button
                  onClick={() => runVerification(username.trim())}
                  className="flex-1 rounded-md border border-signal/50 px-4 py-2 text-sm font-medium text-signal transition-colors hover:bg-signal/10"
                >
                  Retry scan
                </button>
                <button
                  onClick={goToLoginAfterVerify}
                  className="flex-1 rounded-md bg-void-raised px-4 py-2 text-sm font-medium text-slate-bright transition-colors hover:bg-void-border"
                >
                  Skip for now
                </button>
              </div>
            </div>
          )}

          {stage === STAGES.FORM && (
            <>
              <div className="mb-5 flex rounded-md border border-void-border p-1">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded px-3 py-2 text-sm transition-colors ${
                    mode === 'login' ? 'bg-signal text-void font-semibold' : 'text-slate-text hover:text-slate-bright'
                  }`}
                >
                  <LogIn size={15} /> Log in
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded px-3 py-2 text-sm transition-colors ${
                    mode === 'register' ? 'bg-signal text-void font-semibold' : 'text-slate-text hover:text-slate-bright'
                  }`}
                >
                  <UserPlus size={15} /> Register
                </button>
              </div>

              <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="eyebrow" htmlFor="username">Username</label>
                  <input
                    id="username"
                    type="text"
                    required
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="rounded-md border border-void-border bg-void px-3 py-2 font-mono text-sm text-slate-bright focus:border-signal/60"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="eyebrow" htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-md border border-void-border bg-void px-3 py-2 font-mono text-sm text-slate-bright focus:border-signal/60"
                  />
                </div>

                {mode === 'register' && (
                  <div className="flex flex-col gap-1.5">
                    <label className="eyebrow" htmlFor="leetcode-username">LeetCode username</label>
                    <input
                      id="leetcode-username"
                      type="text"
                      required
                      value={leetcodeUsername}
                      onChange={(e) => setLeetcodeUsername(e.target.value)}
                      placeholder="your exact leetcode.com handle"
                      className="rounded-md border border-void-border bg-void px-3 py-2 font-mono text-sm text-slate-bright focus:border-signal/60"
                    />
                  </div>
                )}

                {error && (
                  <div className="flex items-start gap-2 rounded-md border border-signal/40 bg-signal/5 p-2.5 text-xs text-signal-glow">
                    <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-1 flex items-center justify-center gap-2 rounded-md bg-signal px-4 py-2.5 text-sm font-semibold text-void transition-colors hover:bg-signal-glow disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? 'Working…' : mode === 'login' ? 'Log in' : 'Create account'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
