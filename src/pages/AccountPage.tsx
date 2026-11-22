import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  LogOut,
  MapPin,
  Package,
  RotateCcw,
  Settings,
  Shield,
  Trash2,
  User as UserIcon,
} from 'lucide-react';
import { useCommerce } from '../store/CommerceContext';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { formatINR, isValidGSTIN, isValidIndianPhone, isValidIndianPincode } from '../utils/commerceLogic';
import { ProductCard } from '../components/ProductCard';

type AccountTab = 'profile' | 'orders' | 'addresses' | 'wishlist' | 'returns' | 'settings';

export function AccountPage() {
  const {
    currentUser,
    orders,
    products,
    wishlist,
    returns,
    logout,
    updateProfile,
    saveAddress,
    deleteAddress,
    createReturnRequest,
  } = useCommerce();
  const navigate = useNavigate();
  const [tab, setTab] = useState<AccountTab>('orders');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Profile fields
  const [name, setName] = useState(currentUser?.name ?? '');
  const [phone, setPhone] = useState(currentUser?.phone ?? '');
  const [gstin, setGstin] = useState(currentUser?.gstin ?? '');
  const [profileErr, setProfileErr] = useState('');

  // Address form
  const [addingAddress, setAddingAddress] = useState(false);
  const [addrForm, setAddrForm] = useState({
    label: 'Home',
    fullName: currentUser?.name ?? '',
    phone: currentUser?.phone ?? '',
    line1: '',
    line2: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
    isDefault: true,
  });
  const [addrErr, setAddrErr] = useState('');

  // Return modal state
  const [returnOrderId, setReturnOrderId] = useState<string | null>(null);
  const [returnReason, setReturnReason] = useState('Size or fit preference');
  const [returnResolution, setReturnResolution] = useState<'refund' | 'exchange'>('refund');

  useDocumentMeta({ title: 'My Account' });

  const myOrders = useMemo(
    () =>
      currentUser
        ? orders.filter(
            (o) => o.userId === currentUser.id || o.customerEmail.toLowerCase() === currentUser.email.toLowerCase(),
          )
        : [],
    [orders, currentUser],
  );

  const myReturns = useMemo(
    () => (currentUser ? returns.filter((r) => r.userId === currentUser.id) : []),
    [returns, currentUser],
  );

  const wishlistedProducts = useMemo(
    () => products.filter((p) => wishlist.includes(p.id)),
    [products, wishlist],
  );

  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center space-y-4">
        <h1 className="font-editorial text-4xl text-[#171717]">Sign in to access your account</h1>
        <p className="text-sm text-[#85817B]">
          Track shipments, manage saved Indian addresses, initiate returns, and review your GST invoices.
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <Link
            to="/login"
            className="px-7 py-3 bg-[#171717] text-white text-xs tracking-[0.16em] uppercase"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-7 py-3 border border-[#171717] text-[#171717] text-xs tracking-[0.16em] uppercase"
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidIndianPhone(phone)) {
      setProfileErr('Enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (!isValidGSTIN(gstin)) {
      setProfileErr('Enter a valid 15-character GSTIN or leave blank.');
      return;
    }
    setProfileErr('');
    updateProfile({ name: name.trim(), phone: phone.trim(), gstin: gstin.trim() });
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (addrForm.line1.trim().length < 5 || !addrForm.city.trim()) {
      setAddrErr('Enter complete street address and city.');
      return;
    }
    if (!isValidIndianPincode(addrForm.pincode)) {
      setAddrErr('Enter a valid 6-digit Indian PIN code.');
      return;
    }
    setAddrErr('');
    saveAddress(addrForm);
    setAddingAddress(false);
    setAddrForm({
      label: 'Home',
      fullName: currentUser.name,
      phone: currentUser.phone,
      line1: '',
      line2: '',
      city: '',
      state: 'Maharashtra',
      pincode: '',
      isDefault: false,
    });
  };

  return (
    <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-10 py-10 lg:py-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E9E1D5]">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#C5A46D] font-medium">
            Client Portal
          </p>
          <h1 className="mt-1 font-editorial text-4xl text-[#171717]">{currentUser.name}</h1>
          <p className="text-xs text-[#85817B] mt-1">
            {currentUser.email} · +91 {currentUser.phone}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {currentUser.role !== 'customer' && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#171717] text-[#C5A46D] text-xs tracking-[0.14em] uppercase"
            >
              <Shield className="w-3.5 h-3.5" strokeWidth={1.5} />
              Admin Console
            </Link>
          )}
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-[#D9D0C2] hover:border-[#171717] text-xs tracking-[0.14em] uppercase text-[#171717]"
          >
            <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
            Sign Out
          </button>
        </div>
      </div>

      <div className="mt-8 grid lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Navigation */}
        <nav aria-label="Account sections" className="lg:col-span-3 bg-white border border-[#E9E1D5] divide-y divide-[#E9E1D5]">
          {(
            [
              ['orders', 'Orders & Tracking', Package],
              ['profile', 'Customer Profile', UserIcon],
              ['addresses', 'Saved Addresses', MapPin],
              ['wishlist', `Wishlist (${wishlist.length})`, Heart],
              ['returns', 'Returns & Refunds', RotateCcw],
              ['settings', 'Account Settings', Settings],
            ] as const
          ).map(([key, label, Icon]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`w-full px-5 py-3.5 text-left text-sm flex items-center gap-3 transition-colors ${
                tab === key
                  ? 'bg-[#171717] text-white font-medium'
                  : 'text-[#171717] hover:bg-[#F7F4EE]'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* Active Panel */}
        <div className="lg:col-span-9">
          {tab === 'orders' && (
            <div className="space-y-5">
              <h2 className="font-editorial text-3xl text-[#171717]">Order History & Tracking</h2>
              {myOrders.length === 0 ? (
                <div className="bg-white border border-[#E9E1D5] p-8 text-sm text-[#85817B]">
                  You have not placed any orders yet.{' '}
                  <Link to="/shop" className="text-[#171717] underline">
                    Start shopping
                  </Link>
                </div>
              ) : (
                myOrders.map((order) => {
                  const expanded = selectedOrderId === order.id;
                  return (
                    <article key={order.id} className="bg-white border border-[#E9E1D5] p-6 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E9E1D5]">
                        <div>
                          <p className="font-mono text-sm font-medium text-[#171717]">
                            {order.orderNumber}
                            {order.isDemoOrder ? ' · Demo Order' : ''}
                          </p>
                          <p className="text-xs text-[#85817B] mt-0.5">
                            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN')} · Invoice{' '}
                            <span className="font-mono">{order.invoiceNumber}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs uppercase tracking-[0.14em] font-medium text-[#9A7A45]">
                            {order.status.replace(/_/g, ' ')}
                          </span>
                          <span className="text-base font-semibold tabular-nums text-[#171717]">
                            {formatINR(order.total)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        {order.items.map((item) => (
                          <div key={item.sku} className="flex items-center justify-between text-sm">
                            <div>
                              <Link
                                to={`/product/${item.productSlug}`}
                                className="font-medium text-[#171717] hover:text-[#9A7A45]"
                              >
                                {item.name}
                              </Link>
                              <p className="text-xs text-[#85817B]">
                                {item.colorName}
                                {item.size ? ` · ${item.size}` : ''} × {item.quantity}
                              </p>
                            </div>
                            <span className="tabular-nums font-medium">
                              {formatINR(item.unitPrice * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-3 flex flex-wrap items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedOrderId(expanded ? null : order.id)}
                          className="text-xs tracking-[0.14em] uppercase text-[#171717] underline underline-offset-4"
                        >
                          {expanded ? 'Hide Tracking Timeline' : 'Track Shipment'}
                        </button>
                        {order.status === 'delivered' && (
                          <button
                            type="button"
                            onClick={() => setReturnOrderId(order.id)}
                            className="px-4 py-2 border border-[#171717] text-xs tracking-[0.12em] uppercase text-[#171717] hover:bg-[#171717] hover:text-white transition-colors"
                          >
                            Request Return / Refund
                          </button>
                        )}
                      </div>

                      {expanded && (
                        <div className="pt-4 border-t border-[#E9E1D5] space-y-3">
                          <p className="text-xs text-[#85817B]">
                            Carrier: <strong className="text-[#171717]">{order.shipment.carrier}</strong> · AWB:{' '}
                            <span className="font-mono text-[#171717]">{order.shipment.awbNumber}</span> · ETA:{' '}
                            {order.shipment.estimatedDelivery}
                          </p>
                          <ol className="space-y-2.5 pl-4 border-l border-[#C5A46D]">
                            {order.shipment.events.map((ev, i) => (
                              <li key={i} className="text-xs">
                                <p className="font-medium text-[#171717]">
                                  {ev.status} · {ev.location}
                                </p>
                                <p className="text-[#85817B]">
                                  {ev.timestamp} — {ev.note}
                                </p>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </article>
                  );
                })
              )}

              {/* Return Request Modal inline */}
              {returnOrderId && (
                <div className="bg-white border border-[#171717] p-6 space-y-4">
                  <h3 className="font-editorial text-2xl text-[#171717]">
                    Initiate Return or Exchange
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="ret-reason" className="block text-xs uppercase tracking-[0.12em] text-[#85817B] mb-1">
                        Reason
                      </label>
                      <select
                        id="ret-reason"
                        value={returnReason}
                        onChange={(e) => setReturnReason(e.target.value)}
                        className="w-full bg-[#F7F4EE] border border-[#D9D0C2] px-3 py-2.5 text-sm"
                      >
                        <option>Size or fit preference</option>
                        <option>Item arrived damaged</option>
                        <option>Different from expectation</option>
                        <option>Duplicate order</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="ret-res" className="block text-xs uppercase tracking-[0.12em] text-[#85817B] mb-1">
                        Preferred Resolution
                      </label>
                      <select
                        id="ret-res"
                        value={returnResolution}
                        onChange={(e) => setReturnResolution(e.target.value as 'refund' | 'exchange')}
                        className="w-full bg-[#F7F4EE] border border-[#D9D0C2] px-3 py-2.5 text-sm"
                      >
                        <option value="refund">Original Payment Refund</option>
                        <option value="exchange">Size / Piece Exchange</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        createReturnRequest({
                          orderId: returnOrderId,
                          reason: returnReason,
                          resolution: returnResolution,
                        });
                        setReturnOrderId(null);
                        setTab('returns');
                      }}
                      className="px-6 py-2.5 bg-[#171717] text-white text-xs tracking-[0.14em] uppercase"
                    >
                      Submit Request
                    </button>
                    <button
                      type="button"
                      onClick={() => setReturnOrderId(null)}
                      className="px-5 py-2.5 border border-[#D9D0C2] text-xs uppercase tracking-[0.14em]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="bg-white border border-[#E9E1D5] p-6 sm:p-8 space-y-5 max-w-2xl">
              <h2 className="font-editorial text-3xl text-[#171717]">Customer Profile</h2>
              {profileErr && <p className="text-xs text-[#9E2A2B]">{profileErr}</p>}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="prof-name" className="block text-xs uppercase tracking-[0.12em] text-[#85817B] mb-1.5">
                    Full Name
                  </label>
                  <input
                    id="prof-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#F7F4EE] border border-[#D9D0C2] px-3.5 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="prof-phone" className="block text-xs uppercase tracking-[0.12em] text-[#85817B] mb-1.5">
                    Mobile (+91)
                  </label>
                  <input
                    id="prof-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#F7F4EE] border border-[#D9D0C2] px-3.5 py-2.5 text-sm tabular-nums"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="prof-gstin" className="block text-xs uppercase tracking-[0.12em] text-[#85817B] mb-1.5">
                    Saved GSTIN for Tax Invoices (Optional)
                  </label>
                  <input
                    id="prof-gstin"
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    placeholder="15-character GSTIN"
                    className="w-full bg-[#F7F4EE] border border-[#D9D0C2] px-3.5 py-2.5 text-sm font-mono uppercase"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-[#171717] text-white text-xs tracking-[0.14em] uppercase"
              >
                Save Changes
              </button>
            </form>
          )}

          {tab === 'addresses' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-editorial text-3xl text-[#171717]">Saved Addresses</h2>
                <button
                  type="button"
                  onClick={() => setAddingAddress((v) => !v)}
                  className="px-5 py-2.5 bg-[#171717] text-white text-xs tracking-[0.14em] uppercase"
                >
                  {addingAddress ? 'Close Form' : 'Add Address'}
                </button>
              </div>

              {addingAddress && (
                <form onSubmit={handleAddAddress} className="bg-white border border-[#E9E1D5] p-6 space-y-4">
                  {addrErr && <p className="text-xs text-[#9E2A2B]">{addrErr}</p>}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input
                      placeholder="Label (Home / Office)"
                      value={addrForm.label}
                      onChange={(e) => setAddrForm((p) => ({ ...p, label: e.target.value }))}
                      className="bg-[#F7F4EE] border border-[#D9D0C2] px-3 py-2.5 text-sm"
                    />
                    <input
                      placeholder="Full Name"
                      value={addrForm.fullName}
                      onChange={(e) => setAddrForm((p) => ({ ...p, fullName: e.target.value }))}
                      className="bg-[#F7F4EE] border border-[#D9D0C2] px-3 py-2.5 text-sm"
                    />
                    <input
                      placeholder="Address Line 1"
                      value={addrForm.line1}
                      onChange={(e) => setAddrForm((p) => ({ ...p, line1: e.target.value }))}
                      className="sm:col-span-2 bg-[#F7F4EE] border border-[#D9D0C2] px-3 py-2.5 text-sm"
                    />
                    <input
                      placeholder="City"
                      value={addrForm.city}
                      onChange={(e) => setAddrForm((p) => ({ ...p, city: e.target.value }))}
                      className="bg-[#F7F4EE] border border-[#D9D0C2] px-3 py-2.5 text-sm"
                    />
                    <input
                      placeholder="6-Digit PIN Code"
                      maxLength={6}
                      value={addrForm.pincode}
                      onChange={(e) =>
                        setAddrForm((p) => ({ ...p, pincode: e.target.value.replace(/\D/g, '') }))
                      }
                      className="bg-[#F7F4EE] border border-[#D9D0C2] px-3 py-2.5 text-sm tabular-nums"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#171717] text-white text-xs tracking-[0.14em] uppercase"
                  >
                    Save Address
                  </button>
                </form>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                {currentUser.addresses.map((addr) => (
                  <div key={addr.id} className="bg-white border border-[#E9E1D5] p-5 flex flex-col justify-between gap-4">
                    <div className="text-sm space-y-1">
                      <p className="text-xs uppercase tracking-[0.14em] text-[#C5A46D] font-medium">
                        {addr.label} {addr.isDefault ? '· Default' : ''}
                      </p>
                      <p className="font-medium text-[#171717]">{addr.fullName}</p>
                      <p className="text-[#55524E]">{addr.line1}</p>
                      {addr.line2 && <p className="text-[#55524E]">{addr.line2}</p>}
                      <p className="text-[#55524E]">
                        {addr.city}, {addr.state} – {addr.pincode}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteAddress(addr.id)}
                      className="inline-flex items-center gap-1.5 text-xs text-[#85817B] hover:text-[#9E2A2B] self-start"
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'wishlist' && (
            <div className="space-y-6">
              <h2 className="font-editorial text-3xl text-[#171717]">Saved Wishlist</h2>
              {wishlistedProducts.length === 0 ? (
                <div className="bg-white border border-[#E9E1D5] p-8 text-sm text-[#85817B]">
                  No pieces saved yet. Tap the heart icon on any product to curate your personal wishlist.
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {wishlistedProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'returns' && (
            <div className="space-y-5">
              <h2 className="font-editorial text-3xl text-[#171717]">Returns & Refunds</h2>
              {myReturns.length === 0 ? (
                <div className="bg-white border border-[#E9E1D5] p-8 text-sm text-[#85817B]">
                  No active return requests. Eligible delivered orders can initiate a 14-day return from the Orders tab.
                </div>
              ) : (
                myReturns.map((ret) => (
                  <div key={ret.id} className="bg-white border border-[#E9E1D5] p-5 flex flex-wrap items-center justify-between gap-4 text-sm">
                    <div>
                      <p className="font-mono font-medium text-[#171717]">{ret.orderNumber}</p>
                      <p className="text-xs text-[#85817B] mt-0.5">
                        {ret.reason} · Resolution: {ret.resolution}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.14em] text-[#9A7A45] font-medium">
                        {ret.status.replace('_', ' ')}
                      </p>
                      <p className="font-semibold tabular-nums">{formatINR(ret.refundAmount)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'settings' && (
            <div className="bg-white border border-[#E9E1D5] p-6 sm:p-8 space-y-5 max-w-2xl">
              <h2 className="font-editorial text-3xl text-[#171717]">Account Settings</h2>
              <label className="flex items-center justify-between gap-4 py-3 border-b border-[#E9E1D5] cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-[#171717]">Email Updates & Previews</p>
                  <p className="text-xs text-[#85817B]">Seasonal capsule releases and invoice copies.</p>
                </div>
                <input
                  type="checkbox"
                  checked={currentUser.emailOptIn}
                  onChange={(e) => updateProfile({ emailOptIn: e.target.checked })}
                  className="accent-[#171717] w-4 h-4"
                />
              </label>
              <label className="flex items-center justify-between gap-4 py-3 border-b border-[#E9E1D5] cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-[#171717]">SMS / WhatsApp Delivery Alerts</p>
                  <p className="text-xs text-[#85817B]">Dispatch and doorstep courier notifications.</p>
                </div>
                <input
                  type="checkbox"
                  checked={currentUser.smsOptIn}
                  onChange={(e) => updateProfile({ smsOptIn: e.target.checked })}
                  className="accent-[#171717] w-4 h-4"
                />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
