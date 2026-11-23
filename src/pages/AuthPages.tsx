import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCommerce } from '../store/CommerceContext';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { isValidEmail, isValidIndianPhone } from '../utils/commerceLogic';
import { BrandLogo } from '../components/BrandLogo';

export function LoginPage() {
  const { login, loginWithGoogle, pushToast, isFirebaseLive } = useCommerce();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useDocumentMeta({ title: 'Sign In | AKSHARA LIFESTYLE' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    const res = await login(email, password);
    setIsSubmitting(false);

    if (!res.ok) {
      setError(res.error ?? 'Unable to sign in.');
      return;
    }
    navigate('/account');
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16 lg:py-24">
      <div className="bg-white border border-[#E9E1D5] p-8 space-y-6">
        <div className="text-center">
          <BrandLogo variant="dark" layout="stacked" className="mx-auto mb-3" />
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#C5A46D] font-medium">
            AKSHARA Account
          </p>
          <h1 className="mt-2 font-editorial text-4xl text-[#171717]">Sign In</h1>
        </div>

        {error && (
          <div className="p-3 bg-[#FDF2F2] border border-[#E6B8B8] text-xs text-[#9E2A2B]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-xs uppercase tracking-[0.12em] text-[#85817B] mb-1.5">
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full bg-[#F7F4EE] border border-[#D9D0C2] px-3.5 py-3 text-sm text-[#171717]"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="login-password" className="text-xs uppercase tracking-[0.12em] text-[#85817B]">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs text-[#85817B] hover:text-[#171717] underline">
                Forgot password?
              </Link>
            </div>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
              className="w-full bg-[#F7F4EE] border border-[#D9D0C2] px-3.5 py-3 text-sm text-[#171717]"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-[#171717] hover:bg-[#0B0B0B] text-white text-xs tracking-[0.16em] uppercase font-semibold transition-colors disabled:opacity-60"
          >
            {isSubmitting ? 'Verifying...' : 'Sign In'}
          </button>
        </form>

        {/* Google Sign-In Readiness */}
        <button
          type="button"
          onClick={async () => {
            if (isFirebaseLive) {
              const res = await loginWithGoogle();
              if (res.ok) {
                navigate('/account');
              } else if (res.error) {
                setError(res.error);
              }
            } else {
              pushToast(
                'Google Sign-In Readiness',
                'Firebase Auth Google provider is prepared. Connect live credentials in .env to enable instant Google login.',
              );
            }
          }}
          className="w-full py-3 border border-[#D9D0C2] hover:border-[#171717] text-xs tracking-[0.12em] uppercase text-[#171717] transition-colors flex items-center justify-center gap-2"
        >
          <span>Continue with Google</span>
          {!isFirebaseLive && (
            <span className="text-[10px] text-[#C5A46D] font-mono">(Ready)</span>
          )}
        </button>

        {/* Demo Mode Quick Access */}
        <div className="pt-5 border-t border-[#E9E1D5] space-y-2.5">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#85817B]">
            Demo Environment Quick Sign-In
          </p>
          <button
            type="button"
            onClick={async () => {
              const res = await login('meera@akshara.demo', 'akshara123');
              if (res.ok) navigate('/account');
            }}
            className="w-full py-2.5 px-3 bg-[#F7F4EE] border border-[#D9D0C2] hover:border-[#171717] text-xs text-[#171717] font-medium transition-colors"
          >
            Demo Customer Account
          </button>
        </div>

        <p className="text-center text-xs text-[#85817B]">
          New to AKSHARA LIFESTYLE?{' '}
          <Link to="/register" className="text-[#171717] font-medium underline underline-offset-4">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const { register } = useCommerce();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useDocumentMeta({ title: 'Create Account | AKSHARA LIFESTYLE' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!isValidIndianPhone(phone)) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (password.trim().length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    const res = await register({ name, email, phone, password });
    setIsSubmitting(false);

    if (!res.ok) {
      setError(res.error ?? 'Unable to create account.');
      return;
    }
    navigate('/account');
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16 lg:py-24">
      <div className="bg-white border border-[#E9E1D5] p-8 space-y-6">
        <div className="text-center">
          <BrandLogo variant="dark" layout="stacked" className="mx-auto mb-3" />
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#C5A46D] font-medium">
            Join AKSHARA
          </p>
          <h1 className="mt-2 font-editorial text-4xl text-[#171717]">Create Account</h1>
        </div>

        {error && (
          <div className="p-3 bg-[#FDF2F2] border border-[#E6B8B8] text-xs text-[#9E2A2B]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="reg-name" className="block text-xs uppercase tracking-[0.12em] text-[#85817B] mb-1.5">
              Full Name
            </label>
            <input
              id="reg-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-[#F7F4EE] border border-[#D9D0C2] px-3.5 py-3 text-sm"
            />
          </div>
          <div>
            <label htmlFor="reg-email" className="block text-xs uppercase tracking-[0.12em] text-[#85817B] mb-1.5">
              Email Address
            </label>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#F7F4EE] border border-[#D9D0C2] px-3.5 py-3 text-sm"
            />
          </div>
          <div>
            <label htmlFor="reg-phone" className="block text-xs uppercase tracking-[0.12em] text-[#85817B] mb-1.5">
              Indian Mobile Number (+91)
            </label>
            <input
              id="reg-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit mobile number"
              required
              className="w-full bg-[#F7F4EE] border border-[#D9D0C2] px-3.5 py-3 text-sm tabular-nums"
            />
          </div>
          <div>
            <label htmlFor="reg-pass" className="block text-xs uppercase tracking-[0.12em] text-[#85817B] mb-1.5">
              Password
            </label>
            <input
              id="reg-pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
              className="w-full bg-[#F7F4EE] border border-[#D9D0C2] px-3.5 py-3 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-[#171717] hover:bg-[#0B0B0B] text-white text-xs tracking-[0.16em] uppercase font-semibold disabled:opacity-60"
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-xs text-[#85817B]">
          Already registered?{' '}
          <Link to="/login" className="text-[#171717] font-medium underline underline-offset-4">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export function ForgotPasswordPage() {
  const { requestPasswordReset, isFirebaseLive } = useCommerce();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useDocumentMeta({ title: 'Reset Password | AKSHARA LIFESTYLE' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setError('Enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    if (isFirebaseLive) {
      const res = await requestPasswordReset(email);
      setIsSubmitting(false);
      if (!res.ok) {
        setError(res.error || 'Failed to dispatch password recovery email.');
        return;
      }
    } else {
      setIsSubmitting(false);
    }

    setSent(true);
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-20">
      <div className="bg-white border border-[#E9E1D5] p-8 space-y-5">
        <div className="text-center pb-2">
          <BrandLogo variant="dark" layout="stacked" className="mx-auto mb-3" />
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#C5A46D] font-medium">
            Account Recovery
          </p>
          <h1 className="mt-2 font-editorial text-3xl text-[#171717]">Reset Password</h1>
        </div>

        {sent ? (
          <div className="space-y-4 text-sm text-[#55524E]">
            <p>
              {isFirebaseLive
                ? 'A password recovery link has been dispatched to '
                : 'In production with Firebase Auth connected, a password recovery link is dispatched to '}
              <strong className="text-[#171717]">{email}</strong>.
            </p>
            <Link
              to="/login"
              className="inline-block px-6 py-3 bg-[#171717] text-white text-xs tracking-[0.14em] uppercase"
            >
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-[#85817B]">
              Enter your registered email to receive recovery instructions.
            </p>
            {error && <p className="text-xs text-[#9E2A2B]">{error}</p>}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              aria-label="Email address"
              required
              className="w-full bg-[#F7F4EE] border border-[#D9D0C2] px-3.5 py-3 text-sm"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#171717] text-white text-xs tracking-[0.16em] uppercase disabled:opacity-60"
            >
              {isSubmitting ? 'Sending Request...' : 'Request Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
