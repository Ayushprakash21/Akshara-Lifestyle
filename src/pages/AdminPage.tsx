import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Boxes,
  CreditCard,
  FileEdit,
  FolderTree,
  Image as ImageIcon,
  LayoutDashboard,
  Lock,
  MessageSquare,
  Package,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Truck,
  Users,
} from 'lucide-react';
import { useCommerce } from '../store/CommerceContext';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { BrandLogo } from '../components/BrandLogo';
import { ToastViewport } from '../components/ToastViewport';
import { AdminModuleContent, type AdminModuleKey } from '../features/admin/AdminModules';

const ADMIN_NAV: { key: AdminModuleKey; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }[] = [
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
  const { currentUser, login, logout } = useCommerce();
  const [activeModule, setActiveModule] = useState<AdminModuleKey>('overview');
  const [email, setEmail] = useState('admin@akshara.demo');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  useDocumentMeta({ title: 'Admin Console' });

  const hasAdminAccess =
    currentUser &&
    (currentUser.role === 'admin' ||
      currentUser.role === 'merchandiser' ||
      currentUser.role === 'operations');

  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen bg-[#F7F4EE] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white border border-[#E9E1D5] p-8 space-y-6">
          <div className="flex items-center justify-between">
            <BrandLogo variant="dark" layout="horizontal" />
            <Lock className="w-4 h-4 text-[#C5A46D]" strokeWidth={1.6} />
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#85817B]">
              Role-Protected Operations
            </p>
            <h1 className="mt-1 font-editorial text-3xl text-[#171717]">Admin Console Access</h1>
            <p className="mt-2 text-xs text-[#85817B] leading-relaxed">
              Administrative modules are restricted to authorized AKSHARA roles (Admin, Merchandiser, Operations) and are hidden from customer accounts.
            </p>
          </div>

          {error && (
            <p className="p-3 bg-[#FDF2F2] border border-[#E6B8B8] text-xs text-[#9E2A2B]">
              {error}
            </p>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const res = login(email, password);
              if (!res.ok) {
                setError(res.error ?? 'Authentication failed.');
              } else if (res.user?.role === 'customer') {
                setError('This account has Customer role and cannot access Admin Console.');
              } else {
                setError('');
              }
            }}
            className="space-y-4"
          >
            <div>
              <label htmlFor="adm-email" className="block text-xs uppercase tracking-[0.12em] text-[#85817B] mb-1">
                Staff Email
              </label>
              <input
                id="adm-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F7F4EE] border border-[#D9D0C2] px-3.5 py-2.5 text-sm"
              />
            </div>
            <div>
              <label htmlFor="adm-pass" className="block text-xs uppercase tracking-[0.12em] text-[#85817B] mb-1">
                Password
              </label>
              <input
                id="adm-pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#F7F4EE] border border-[#D9D0C2] px-3.5 py-2.5 text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-[#171717] hover:bg-[#0B0B0B] text-white text-xs tracking-[0.16em] uppercase font-semibold"
            >
              Sign In to Admin Console
            </button>
          </form>

          <div className="pt-4 border-t border-[#E9E1D5] flex items-center justify-between text-xs text-[#85817B]">
            <span>Demo: admin@akshara.demo / admin123</span>
            <Link to="/" className="text-[#171717] underline">
              Back to Store
            </Link>
          </div>
        </div>
        <ToastViewport />
      </div>
    );
  }

  const currentNavItem = ADMIN_NAV.find((n) => n.key === activeModule) ?? ADMIN_NAV[0];

  return (
    <div className="min-h-screen bg-[#F7F4EE] flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="lg:w-64 bg-[#171717] text-[#E9E1D5] flex flex-col shrink-0">
        <div className="h-16 px-5 border-b border-[#2A2825] flex items-center justify-between">
          <Link to="/">
            <BrandLogo variant="light" layout="horizontal" />
          </Link>
        </div>

        <nav aria-label="Admin modules" className="p-3 flex-1 overflow-x-auto lg:overflow-y-auto flex lg:flex-col gap-1">
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
            <button type="button" onClick={logout} className="text-[#85817B] hover:text-white">
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
            <span className="text-[#9A7A45] font-mono uppercase">Demo Mode Storage</span>
            <Link
              to="/"
              className="px-3.5 py-2 border border-[#171717] text-[#171717] uppercase tracking-[0.12em] whitespace-nowrap"
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
