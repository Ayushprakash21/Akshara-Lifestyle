import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Boxes,
  CheckCircle2,
  CreditCard,
  Eye,
  EyeOff,
  FileEdit,
  FolderTree,
  Image as ImageIcon,
  KeyRound,
  LayoutDashboard,
  Loader2,
  Lock,
  LogOut,
  MessageSquare,
  Package,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Truck,
  Users,
  X,
} from 'lucide-react';
import { useCommerce } from '../store/CommerceContext';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { BrandLogo } from '../components/BrandLogo';
import { ToastViewport } from '../components/ToastViewport';
import { AdminModuleContent, type AdminModuleKey } from '../features/admin/AdminModules';

const ADMIN_NAV: {
  key: AdminModuleKey;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}[] = [
  { key: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard },
  { key: 'products', label: 'Products', icon: ShoppingBag },
  { key: 'categories', label: 'Categories', icon: FolderTree },
  { key: 'inventory', label: 'Inventory', icon: Boxes },
  { key: 'orders', label: 'Orders', icon: Package },
  { key: 'customers', label: 'Customers', icon: Users },
  { key: 'coupons', label: 'Discounts & Coupons', icon: Tag },
  { key: 'banners', label: 'Promotional Banners', icon: ImageIcon },
  { key: 'homepage', label: 'Homepage CMS', icon: FileEdit },
  { key: 'reviews', label: 'Reviews Moderation', icon: MessageSquare },
  { key: 'returns', label: 'Returns & Refunds', icon: RotateCcw },
  { key: 'shipping', label: 'Shipping Rules', icon: Truck },
  { key: 'payments', label: 'Payments & GST', icon: CreditCard },
  { key: 'analytics', label: 'Sales Analytics', icon: BarChart3 },
  { key: 'roles', label: 'Users & Roles', icon: ShieldCheck },
];

export function AdminPage() {
  const {
    currentUser,
    login,
    logout,
    requestPasswordReset,
    changePassword,
    isFirebaseLive,
  } = useCommerce();

  const [activeModule, setActiveModule] = useState<AdminModuleKey>('overview');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState<{ ok?: boolean; message?: string } | null>(null);
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);

  // Mandatory initial password update state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordUpdateError, setPasswordUpdateError] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useDocumentMeta({ title: 'Administrator Sign In | AKSHARA LIFESTYLE' });

  const hasAdminAccess =
    currentUser &&
    (currentUser.role === 'super_admin' ||
      currentUser.role === 'admin' ||
      currentUser.role === 'product_manager' ||
      currentUser.role === 'order_manager' ||
      currentUser.role === 'merchandiser' ||
      currentUser.role === 'operations');

  // Handle Administrator Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please provide both administrative email and password.');
      return;
    }

    setIsSubmitting(true);
    const res = await login(email, password);
    setIsSubmitting(false);

    if (!res.ok) {
      setError(res.error ?? 'Invalid credentials. Please verify your administrative email and password.');
      return;
    }

    if (res.user?.role === 'customer') {
      setError('Access Denied: This account holds Customer privileges and cannot access the AKSHARA operational console.');
    }
  };

  // Handle Forgot Password Submit
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotStatus(null);
    if (!forgotEmail.trim()) {
      setForgotStatus({ ok: false, message: 'Please enter your administrator email address.' });
      return;
    }

    setIsForgotSubmitting(true);
    const res = await requestPasswordReset(forgotEmail.trim());
    setIsForgotSubmitting(false);

    if (res.ok) {
      setForgotStatus({
        ok: true,
        message: 'Password reset dispatch initiated. If an authorized staff account exists for this address, instructions have been transmitted.',
      });
    } else {
      setForgotStatus({ ok: false, message: res.error || 'Failed to dispatch password recovery instructions.' });
    }
  };

  // Handle Mandatory Password Change Submit
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordUpdateError('');

    if (newPassword.length < 8) {
      setPasswordUpdateError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordUpdateError('New passwords do not match. Please re-enter.');
      return;
    }

    setIsUpdatingPassword(true);
    const res = await changePassword(newPassword);
    setIsUpdatingPassword(false);

    if (!res.ok) {
      setPasswordUpdateError(res.error || 'Unable to update password. Please try again.');
    } else {
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  // =========================================================================
  // SCENARIO 1: Visitor is authenticated as a CUSTOMER -> DENY ACCESS
  // =========================================================================
  if (currentUser && !hasAdminAccess) {
    return (
      <div className="min-h-screen bg-[#0C0B0A] text-[#F8F6F1] flex items-center justify-center px-4 py-16 selection:bg-[#C5A46D] selection:text-[#0B0B0B]">
        <div className="max-w-md w-full bg-[#161514] border border-[#2B2824] p-8 sm:p-10 text-center space-y-6 shadow-2xl">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#251A18] border border-[#7A2D30] flex items-center justify-center text-[#E07A5F]">
            <ShieldAlert className="w-7 h-7" strokeWidth={1.5} />
          </div>

          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#E07A5F]">
              403 · Unauthorized Role
            </p>
            <h1 className="mt-2 font-editorial text-3xl sm:text-4xl text-[#F8F6F1]">
              Access Denied
            </h1>
            <p className="mt-3 text-xs text-[#A8A39C] leading-relaxed">
              You are currently signed in as <strong className="text-[#F8F6F1]">{currentUser.email}</strong> with customer privileges. Access to the AKSHARA operational console is strictly restricted to verified administrative personnel.
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <button
              type="button"
              onClick={logout}
              className="w-full py-3.5 bg-[#C5A46D] hover:bg-[#D4AF37] text-[#0B0B0B] text-xs uppercase tracking-[0.18em] font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out & Switch Account</span>
            </button>
            <Link
              to="/"
              className="w-full py-3 border border-[#38342E] hover:border-[#85817B] text-xs uppercase tracking-[0.16em] text-[#C9C3BA] hover:text-white transition-colors block text-center"
            >
              Return to Storefront
            </Link>
          </div>

          <p className="text-[10px] text-[#6E6961] font-mono">
            Security Event Logged · Timestamp {new Date().toLocaleTimeString()}
          </p>
        </div>
        <ToastViewport />
      </div>
    );
  }

  // =========================================================================
  // SCENARIO 2: Visitor is NOT authenticated -> LUXURY ADMIN LOGIN SCREEN
  // =========================================================================
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0C0B0A] text-[#F8F6F1] flex flex-col justify-between px-4 py-10 sm:py-16 selection:bg-[#C5A46D] selection:text-[#0B0B0B]">
        {/* Subtle Luxury Top Bar */}
        <header className="max-w-5xl mx-auto w-full flex items-center justify-between pb-6 border-b border-[#211F1C]">
          <BrandLogo variant="light" layout="horizontal" />
          <div className="flex items-center gap-2 text-[10px] font-mono text-[#85817B] uppercase tracking-[0.16em]">
            <Lock className="w-3.5 h-3.5 text-[#C5A46D]" strokeWidth={1.5} />
            <span className="hidden sm:inline">256-Bit Encrypted Admin Portal</span>
          </div>
        </header>

        {/* Center Admin Login Card */}
        <main className="max-w-md w-full mx-auto my-auto py-8">
          <div className="bg-[#141312] border border-[#262320] p-8 sm:p-10 space-y-7 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
            {/* Header / Brand */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase font-mono tracking-[0.22em] text-[#C5A46D]">
                Restricted Operational Console
              </p>
              <h1 className="font-editorial text-3xl sm:text-4xl text-[#F8F6F1]">
                Administrator Sign In
              </h1>
              <p className="text-xs text-[#8A857D] leading-relaxed">
                Authorized personnel access only. Please authenticate with your staff email and credentials.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div
                role="alert"
                className="p-4 bg-[#231415] border border-[#6E2A2E] text-xs text-[#F5A5A8] space-y-1"
              >
                <div className="flex items-center gap-2 font-medium">
                  <ShieldAlert className="w-4 h-4 text-[#E07A5F] shrink-0" />
                  <span>Authentication Denied</span>
                </div>
                <p className="text-[11px] text-[#D89497] pl-6">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-[11px] uppercase tracking-[0.14em] text-[#A8A39C] mb-1.5"
                >
                  Email Address
                </label>
                <input
                  id="admin-email"
                  type="text"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. akshara@admin"
                  className="w-full bg-[#1C1A18] border border-[#332F2A] focus:border-[#C5A46D] focus:outline-none px-4 py-3 text-sm text-[#F8F6F1] placeholder:text-[#5E5952] transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="admin-password"
                    className="block text-[11px] uppercase tracking-[0.14em] text-[#A8A39C]"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotModalOpen(true);
                      setForgotEmail(email);
                      setForgotStatus(null);
                    }}
                    className="text-[11px] text-[#C5A46D] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter administrative password"
                    className="w-full bg-[#1C1A18] border border-[#332F2A] focus:border-[#C5A46D] focus:outline-none px-4 py-3 pr-11 text-sm text-[#F8F6F1] placeholder:text-[#5E5952] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#85817B] hover:text-[#F8F6F1] transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" strokeWidth={1.5} />
                    ) : (
                      <Eye className="w-4 h-4" strokeWidth={1.5} />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-[#C5A46D] hover:bg-[#D4AF37] disabled:opacity-50 text-[#0B0B0B] text-xs uppercase tracking-[0.2em] font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>AUTHENTICATING...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" strokeWidth={1.75} />
                      <span>SECURE LOGIN</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Bottom Security Information */}
            <div className="pt-4 border-t border-[#23201C] flex items-center justify-between text-[11px] text-[#6E6961]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C5A46D]" />
                RBAC & Security Rules Protected
              </span>
              <span className="font-mono text-[#85817B]">
                {isFirebaseLive ? 'Cloud Firebase' : 'Secure Demo Mode'}
              </span>
            </div>
          </div>
        </main>

        {/* Minimal Footer */}
        <footer className="max-w-5xl mx-auto w-full pt-6 border-t border-[#211F1C] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#6E6961] gap-2">
          <p>© {new Date().getFullYear()} AKSHARA LIFESTYLE PRIVATE LIMITED. Operational Console.</p>
          <p className="font-mono text-[10px] text-[#4F4B45]">
            Strictly Private & Confidential
          </p>
        </footer>

        {/* Forgot Password Modal */}
        {isForgotModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0B0B]/85 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="forgot-title"
          >
            <div className="max-w-md w-full bg-[#161514] border border-[#2B2824] p-6 sm:p-8 space-y-5 text-[#F8F6F1]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#C5A46D]">
                  <KeyRound className="w-4 h-4" />
                  <span className="text-[10px] uppercase tracking-[0.2em] font-mono">
                    Password Recovery
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="text-[#85817B] hover:text-white p-1"
                  aria-label="Close dialog"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h2 id="forgot-title" className="font-editorial text-2xl text-[#F8F6F1]">
                  Reset Administrator Password
                </h2>
                <p className="mt-1.5 text-xs text-[#A8A39C] leading-relaxed">
                  Enter your registered administrator email address to trigger secure reset instructions via Firebase Authentication.
                </p>
              </div>

              {forgotStatus && (
                <div
                  className={`p-3 text-xs border ${
                    forgotStatus.ok
                      ? 'bg-[#18261F] border-[#2D6A4F] text-[#95D5B2]'
                      : 'bg-[#261617] border-[#7A2D30] text-[#F5A5A8]'
                  }`}
                >
                  {forgotStatus.message}
                </div>
              )}

              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="forgot-email"
                    className="block text-[11px] uppercase tracking-[0.14em] text-[#A8A39C] mb-1"
                  >
                    Staff Email
                  </label>
                  <input
                    id="forgot-email"
                    type="text"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="e.g. akshara@admin"
                    className="w-full bg-[#1C1A18] border border-[#332F2A] px-3.5 py-2.5 text-sm text-[#F8F6F1] focus:border-[#C5A46D] focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="px-4 py-2.5 border border-[#38342E] text-xs uppercase tracking-[0.14em] text-[#C9C3BA] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isForgotSubmitting}
                    className="px-5 py-2.5 bg-[#C5A46D] hover:bg-[#D4AF37] text-[#0B0B0B] text-xs uppercase tracking-[0.16em] font-semibold disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {isForgotSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>SENDING...</span>
                      </>
                    ) : (
                      <span>SEND RECOVERY LINK</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <ToastViewport />
      </div>
    );
  }

  // =========================================================================
  // SCENARIO 3: Authorized Administrator Signed In
  // (Check for mandatory initial temporary password update first)
  // =========================================================================
  if (currentUser.mustChangePassword) {
    return (
      <div className="min-h-screen bg-[#0C0B0A] text-[#F8F6F1] flex items-center justify-center px-4 py-16 selection:bg-[#C5A46D] selection:text-[#0B0B0B]">
        <div className="max-w-md w-full bg-[#141312] border border-[#2E2A25] p-8 sm:p-10 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <BrandLogo variant="light" layout="horizontal" />
            <KeyRound className="w-5 h-5 text-[#C5A46D]" />
          </div>

          <div>
            <p className="text-[10px] uppercase font-mono tracking-[0.2em] text-[#C5A46D]">
              Security Compliance Policy
            </p>
            <h1 className="mt-1 font-editorial text-2xl sm:text-3xl text-[#F8F6F1]">
              Mandatory Password Update
            </h1>
            <p className="mt-2 text-xs text-[#A8A39C] leading-relaxed">
              Your administrator account (<strong className="text-white">{currentUser.email}</strong>) is currently configured with a temporary initial credential. You must establish a secure permanent password before accessing customer data or operational tools.
            </p>
          </div>

          {passwordUpdateError && (
            <p className="p-3 bg-[#261617] border border-[#7A2D30] text-xs text-[#F5A5A8]">
              {passwordUpdateError}
            </p>
          )}

          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div>
              <label
                htmlFor="new-admin-pass"
                className="block text-[11px] uppercase tracking-[0.12em] text-[#A8A39C] mb-1"
              >
                New Permanent Password (min. 8 characters)
              </label>
              <input
                id="new-admin-pass"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Choose a strong password"
                className="w-full bg-[#1C1A18] border border-[#332F2A] px-3.5 py-2.5 text-sm text-[#F8F6F1] focus:border-[#C5A46D] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="confirm-admin-pass"
                className="block text-[11px] uppercase tracking-[0.12em] text-[#A8A39C] mb-1"
              >
                Confirm New Password
              </label>
              <input
                id="confirm-admin-pass"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full bg-[#1C1A18] border border-[#332F2A] px-3.5 py-2.5 text-sm text-[#F8F6F1] focus:border-[#C5A46D] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="w-full py-3.5 bg-[#C5A46D] hover:bg-[#D4AF37] disabled:opacity-50 text-[#0B0B0B] text-xs uppercase tracking-[0.18em] font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {isUpdatingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>UPDATING CREDENTIALS...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>UPDATE & ENTER DASHBOARD</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-3 border-t border-[#23201C] flex justify-between items-center text-xs text-[#85817B]">
            <span>Require assistance?</span>
            <button type="button" onClick={logout} className="text-[#C5A46D] hover:underline">
              Sign Out
            </button>
          </div>
        </div>
        <ToastViewport />
      </div>
    );
  }

  // =========================================================================
  // SCENARIO 4: Full Administrator Dashboard
  // =========================================================================
  const currentNavItem = ADMIN_NAV.find((n) => n.key === activeModule) ?? ADMIN_NAV[0];

  return (
    <div className="min-h-screen bg-[#F7F4EE] flex flex-col lg:flex-row text-[#171717]">
      {/* Sidebar */}
      <aside className="lg:w-64 bg-[#171717] text-[#E9E1D5] flex flex-col shrink-0">
        <div className="h-16 px-5 border-b border-[#2A2825] flex items-center justify-between">
          <BrandLogo variant="light" layout="horizontal" />
        </div>

        <nav
          aria-label="Admin modules"
          className="p-3 flex-1 overflow-x-auto lg:overflow-y-auto flex lg:flex-col gap-1"
        >
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon;
            const active = activeModule === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveModule(item.key)}
                className={`px-3.5 py-2.5 text-left text-xs flex items-center gap-2.5 transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#C5A46D] text-[#0B0B0B] font-semibold'
                    : 'text-[#C9C3BA] hover:bg-[#24221F] hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="hidden lg:block p-4 border-t border-[#2A2825] text-xs space-y-2">
          <p className="text-[#A8A39C]">
            Signed in as <strong className="text-white">{currentUser.name}</strong> ({currentUser.role})
          </p>
          <div className="flex items-center justify-between pt-1">
            <Link to="/" className="text-[#C5A46D] hover:underline">
              View Storefront
            </Link>
            <button
              type="button"
              onClick={logout}
              className="text-[#85817B] hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 bg-white border-b border-[#E9E1D5] px-6 flex items-center justify-between gap-4">
          <div className="text-xs text-[#85817B] flex items-center gap-2">
            <span>Admin Console</span>
            <span>/</span>
            <span className="text-[#171717] font-medium">{currentNavItem.label}</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-[#9A7A45] font-mono uppercase">
              {isFirebaseLive ? 'Firebase Firestore Live' : 'Demo Mode Storage'}
            </span>
            <Link
              to="/"
              className="px-3.5 py-2 border border-[#171717] text-[#171717] uppercase tracking-[0.12em] hover:bg-[#F7F4EE] whitespace-nowrap transition-colors"
            >
              Storefront
            </Link>
          </div>
        </header>

        <main className="p-6 lg:p-8 flex-1 overflow-y-auto">
          <AdminModuleContent activeModule={activeModule} />
        </main>
      </div>
      <ToastViewport />
    </div>
  );
}
