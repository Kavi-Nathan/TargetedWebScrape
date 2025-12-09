import { X, Github, Mail, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { checkPassword, getPasswordStrengthColor, getPasswordStrengthText, type PasswordCheckResult } from '../utils/passwordValidation';

interface AuthModalProps {
  onClose: () => void;
}

export function AuthModal({ onClose }: AuthModalProps) {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithGithub } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordCheckResult, setPasswordCheckResult] = useState<PasswordCheckResult | null>(null);
  const [isCheckingPassword, setIsCheckingPassword] = useState(false);

  const checkPasswordSecurity = useCallback(async (pwd: string) => {
    if (mode === 'signin' || !pwd || pwd.length < 6) {
      setPasswordCheckResult(null);
      return;
    }

    setIsCheckingPassword(true);
    const result = await checkPassword(pwd);
    setPasswordCheckResult(result);
    setIsCheckingPassword(false);
  }, [mode]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (password && mode === 'signup') {
        checkPasswordSecurity(password);
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [password, mode, checkPasswordSecurity]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      if (mode === 'signup') {
        if (passwordCheckResult?.isBreached) {
          setError('This password has been exposed in a data breach. Please choose a different password.');
          setIsLoading(false);
          return;
        }
        if (passwordCheckResult?.isWeak) {
          setError(passwordCheckResult.issues?.join('. ') || 'Password does not meet security requirements.');
          setIsLoading(false);
          return;
        }
        if (!passwordCheckResult && password.length >= 6) {
          setIsCheckingPassword(true);
          const result = await checkPassword(password);
          setPasswordCheckResult(result);
          setIsCheckingPassword(false);

          if (result.isBreached) {
            setError('This password has been exposed in a data breach. Please choose a different password.');
            setIsLoading(false);
            return;
          }
          if (result.isWeak) {
            setError(result.issues?.join('. ') || 'Password does not meet security requirements.');
            setIsLoading(false);
            return;
          }
        }

        await signUpWithEmail(email, password);
        setError('');
        alert('Account created! Please check your email to verify your account, then sign in.');
        setMode('signin');
      } else {
        await signInWithEmail(email, password);
        onClose();
      }
    } catch (err: any) {
      console.error('Email auth error:', err);
      setError(err?.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Google sign in error:', err);
      const errorMessage = err?.message || 'Failed to sign in with Google. Please ensure Google OAuth is configured in Supabase.';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      await signInWithGithub();
    } catch (err: any) {
      console.error('GitHub sign in error:', err);
      const errorMessage = err?.message || 'Failed to sign in with GitHub. Please ensure GitHub OAuth is configured in Supabase.';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Sign In</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-8">
          <p className="text-gray-600 text-center mb-8">
            {mode === 'signin' ? 'Sign in to save your research and access your analysis history' : 'Create an account to get started'}
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-50"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password {mode === 'signup' && <span className="text-xs text-gray-500">(min. 12 characters)</span>}
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={mode === 'signup' ? 12 : 6}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-50"
                placeholder="••••••••"
              />
              {mode === 'signup' && password.length > 0 && (
                <div className="mt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${getPasswordStrengthColor(passwordCheckResult)}`}
                        style={{
                          width: passwordCheckResult
                            ? passwordCheckResult.isBreached
                              ? '100%'
                              : passwordCheckResult.isWeak
                              ? '50%'
                              : '100%'
                            : '25%',
                        }}
                      />
                    </div>
                    {isCheckingPassword ? (
                      <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                    ) : passwordCheckResult?.isBreached ? (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    ) : passwordCheckResult?.isWeak ? (
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                    ) : passwordCheckResult ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : null}
                  </div>
                  <p
                    className={`text-xs ${
                      passwordCheckResult?.isBreached
                        ? 'text-red-600 font-medium'
                        : passwordCheckResult?.isWeak
                        ? 'text-orange-600'
                        : passwordCheckResult
                        ? 'text-green-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {isCheckingPassword ? 'Checking password security...' : getPasswordStrengthText(passwordCheckResult)}
                  </p>
                  {passwordCheckResult?.issues && passwordCheckResult.issues.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {passwordCheckResult.issues.map((issue, idx) => (
                        <li key={idx} className="text-xs text-orange-600 flex items-start gap-1">
                          <span className="mt-0.5">•</span>
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {passwordCheckResult?.isBreached && (
                    <p className="mt-2 text-xs text-red-600 flex items-start gap-1">
                      <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>This password appeared in {passwordCheckResult.breachCount?.toLocaleString()} data breaches. Choose a unique password.</span>
                    </p>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold py-3.5 px-6 rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-sm"
            >
              <Mail className="w-5 h-5" />
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="text-center mb-6">
            <button
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setPasswordCheckResult(null);
                setError('');
              }}
              disabled={isLoading}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-white border-2 border-gray-300 text-gray-700 font-semibold py-3.5 px-6 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

            <button
              onClick={handleGithubSignIn}
              disabled={isLoading}
              className="w-full bg-gray-900 text-white font-semibold py-3.5 px-6 rounded-xl hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-sm"
            >
              <Github className="w-5 h-5" />
              Continue with GitHub
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-8">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
