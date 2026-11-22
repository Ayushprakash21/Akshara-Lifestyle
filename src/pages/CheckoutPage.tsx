import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  Check,
  CreditCard,
  Landmark,
  ShieldCheck,
  Smartphone,
  Truck,
  Wallet,
} from 'lucide-react';
import type { DeliveryMethodId, Order, PaymentMethodId } from '../types/commerce';
import { useCommerce } from '../store/CommerceContext';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import {
  calculateCartTotals,
  checkPincodeServiceability,
  formatINR,
  isValidEmail,
  isValidGSTIN,
  isValidIndianPhone,
  isValidIndianPincode,
} from '../utils/commerceLogic';
import { SafeImage } from '../components/SafeImage';

const INDIAN_STATES = [
  'Maharashtra',
  'Delhi',
  'Karnataka',
  'Telangana',
  'Tamil Nadu',
  'Gujarat',
  'West Bengal',
  'Rajasthan',
  'Uttar Pradesh',
  'Haryana',
  'Kerala',
  'Punjab',
  'Goa',
  'Madhya Pradesh',
  'Odisha',
  'Assam',
];

const STEPS = [
  { id: 1, label: 'Customer' },
  { id: 2, label: 'Shipping' },
  { id: 3, label: 'Delivery' },
  { id: 4, label: 'Payment' },
  { id: 5, label: 'Review' },
  { id: 6, label: 'Confirmed' },
] as const;

export function CheckoutPage() {
  const {
    cart,
    products,
    coupons,
    shippingConfig,
    paymentConfig,
    appliedCouponCode,
    currentUser,
    placeDemoOrder,
  } = useCommerce();

  useDocumentMeta({ title: 'Checkout' });

  const defaultAddr = currentUser?.addresses.find((a) => a.isDefault) ?? currentUser?.addresses[0];

  const [step, setStep] = useState<number>(1);
  const [customerName, setCustomerName] = useState(currentUser?.name ?? '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email ?? '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone ?? '');
  const [customerGstin, setCustomerGstin] = useState(currentUser?.gstin ?? '');

  const [addressLabel, setAddressLabel] = useState(defaultAddr?.label ?? 'Home');
  const [line1, setLine1] = useState(defaultAddr?.line1 ?? '');
  const [line2, setLine2] = useState(defaultAddr?.line2 ?? '');
  const [landmark, setLandmark] = useState(defaultAddr?.landmark ?? '');
  const [city, setCity] = useState(defaultAddr?.city ?? '');
  const [stateName, setStateName] = useState(defaultAddr?.state ?? 'Maharashtra');
  const [pincode, setPincode] = useState(defaultAddr?.pincode ?? '');

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethodId>('standard');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>('upi');
  const [upiId, setUpiId] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const liveTotals = useMemo(
    () =>
      calculateCartTotals(cart, products, coupons, shippingConfig, {
        couponCode: appliedCouponCode || undefined,
        deliveryMethod,
        paymentMethod,
      }),
    [cart, products, coupons, shippingConfig, appliedCouponCode, deliveryMethod, paymentMethod],
  );

  const pinService = useMemo(
    () => (pincode.length === 6 ? checkPincodeServiceability(pincode, true) : null),
    [pincode],
  );

  const codAllowed =
    paymentConfig.codEnabled &&
    liveTotals.total <= shippingConfig.codMaxOrderValue &&
    (pinService?.codAvailable ?? true);

  if (cart.length === 0 && !confirmedOrder) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center">
        <h1 className="font-editorial text-4xl text-[#171717]">Nothing in your bag yet</h1>
        <p className="mt-3 text-sm text-[#85817B]">
          Add items to your shopping bag before starting checkout.
        </p>
        <Link
          to="/shop"
          className="mt-6 inline-block px-6 py-3 bg-[#171717] text-white text-xs tracking-[0.16em] uppercase"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  const validateStep1 = () => {
    if (customerName.trim().length < 2) {
      setError('Please enter your full name.');
      return false;
    }
    if (!isValidEmail(customerEmail)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (!isValidIndianPhone(customerPhone)) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return false;
    }
    if (!isValidGSTIN(customerGstin)) {
      setError('GSTIN format appears invalid (expected 15 alphanumeric characters, e.g. 27AAPFU0939F1ZV).');
      return false;
    }
    setError('');
    return true;
  };

  const validateStep2 = () => {
    if (line1.trim().length < 5) {
      setError('Please enter your street address / flat / building details.');
      return false;
    }
    if (city.trim().length < 2) {
      setError('Please enter your city.');
      return false;
    }
    if (!isValidIndianPincode(pincode)) {
      setError('Please enter a valid 6-digit Indian PIN code.');
      return false;
    }
    setError('');
    return true;
  };

  const validateStep4 = () => {
    if (paymentMethod === 'upi' && upiId.trim() && !upiId.includes('@')) {
      setError('UPI ID should look like name@upi or mobile@okaxis.');
      return false;
    }
    if (paymentMethod === 'cod' && !codAllowed) {
      setError('Cash on Delivery is unavailable for this order value or PIN code.');
      return false;
    }
    setError('');
    return true;
  };

  const handleConfirmOrder = async () => {
    setSubmitting(true);
    setError('');
    try {
      const order = await placeDemoOrder({
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        customerGstin: customerGstin.trim() || undefined,
        shippingAddress: {
          label: addressLabel,
          fullName: customerName.trim(),
          phone: customerPhone.trim(),
          line1: line1.trim(),
          line2: line2.trim() || undefined,
          landmark: landmark.trim() || undefined,
          city: city.trim(),
          state: stateName,
          pincode: pincode.trim(),
        },
        deliveryMethod,
        paymentMethod,
        couponCode: appliedCouponCode || undefined,
      });
      setConfirmedOrder(order);
      setStep(6);
    } catch {
      setError('Unable to complete demo checkout. Please retry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-10 py-10 lg:py-14">
      {/* Explicit Demo Payment Mode Notice */}
      <div className="mb-8 bg-[#171717] text-[#F7F4EE] px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-[#C5A46D] shrink-0" strokeWidth={1.6} />
          <span>
            <strong className="text-[#C5A46D] uppercase tracking-[0.12em]">Demo Checkout Mode:</strong>{' '}
            Razorpay / live payment gateway keys are not configured. Orders placed here are stored locally for demonstration and do not process real bank charges.
          </span>
        </div>
      </div>

      {/* Step Indicator */}
      <ol className="grid grid-cols-3 sm:grid-cols-6 gap-2 pb-8 border-b border-[#E9E1D5]">
        {STEPS.map((s) => {
          const isCurrent = step === s.id;
          const isDone = step > s.id;
          return (
            <li
              key={s.id}
              className={`px-3 py-2.5 border text-xs flex items-center gap-2 ${
                isCurrent
                  ? 'border-[#171717] bg-[#171717] text-white font-medium'
                  : isDone
                    ? 'border-[#C5A46D] bg-white text-[#171717]'
                    : 'border-[#E9E1D5] bg-transparent text-[#85817B]'
              }`}
            >
              <span className="font-mono text-[11px]">{isDone ? '✓' : `0${s.id}`}</span>
              <span className="truncate">{s.label}</span>
            </li>
          );
        })}
      </ol>

      {step === 6 && confirmedOrder ? (
        /* Step 6: Order Confirmation & GST Invoice Summary */
        <div className="mt-10 max-w-3xl mx-auto bg-white border border-[#E9E1D5] p-6 sm:p-10 space-y-8">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 bg-[#171717] text-[#C5A46D] flex items-center justify-center shrink-0">
              <Check className="w-5 h-5" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#9A7A45] font-medium">
                Demo Order Recorded
              </p>
              <h1 className="mt-1 font-editorial text-3xl sm:text-4xl text-[#171717]">
                Order #{confirmedOrder.orderNumber} Confirmed
              </h1>
              <p className="mt-2 text-sm text-[#55524E]">
                Saved locally in Demo Mode. Estimated delivery:{' '}
                <strong className="text-[#171717]">{confirmedOrder.shipment.estimatedDelivery}</strong>{' '}
                via {confirmedOrder.shipment.carrier}.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 pt-6 border-t border-[#E9E1D5] text-sm">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-[#85817B]">
                Shipping Destination
              </p>
              <p className="mt-2 font-medium text-[#171717]">
                {confirmedOrder.shippingAddress.fullName}
              </p>
              <p className="text-[#55524E]">{confirmedOrder.shippingAddress.line1}</p>
              {confirmedOrder.shippingAddress.line2 && (
                <p className="text-[#55524E]">{confirmedOrder.shippingAddress.line2}</p>
              )}
              <p className="text-[#55524E]">
                {confirmedOrder.shippingAddress.city}, {confirmedOrder.shippingAddress.state} –{' '}
                {confirmedOrder.shippingAddress.pincode}
              </p>
              <p className="text-[#85817B] text-xs mt-1">
                +91 {confirmedOrder.customerPhone} · {confirmedOrder.customerEmail}
              </p>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-[#85817B]">
                GST Invoice & Payment Reference
              </p>
              <dl className="mt-2 space-y-1 text-xs">
                <div className="flex justify-between">
                  <dt className="text-[#85817B]">Invoice No.</dt>
                  <dd className="font-mono text-[#171717]">{confirmedOrder.invoiceNumber}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#85817B]">Seller GSTIN</dt>
                  <dd className="font-mono text-[#171717]">{paymentConfig.sellerGstin}</dd>
                </div>
                {confirmedOrder.customerGstin && (
                  <div className="flex justify-between">
                    <dt className="text-[#85817B]">Buyer GSTIN</dt>
                    <dd className="font-mono text-[#171717]">{confirmedOrder.customerGstin}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-[#85817B]">Payment Ref (Demo)</dt>
                  <dd className="font-mono text-[#171717]">{confirmedOrder.payment.referenceId}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#85817B]">AWB Tracking</dt>
                  <dd className="font-mono text-[#171717]">{confirmedOrder.shipment.awbNumber}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="pt-6 border-t border-[#E9E1D5]">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#85817B] mb-3">
              Items Ordered
            </p>
            <div className="divide-y divide-[#E9E1D5]">
              {confirmedOrder.items.map((item) => (
                <div key={item.sku} className="py-3 flex items-center justify-between gap-4 text-sm">
                  <div>
                    <p className="font-medium text-[#171717]">{item.name}</p>
                    <p className="text-xs text-[#85817B]">
                      {item.colorName}
                      {item.size ? ` · ${item.size}` : ''} · Qty {item.quantity} · HSN {item.hsnCode} ({item.gstRate}% GST)
                    </p>
                  </div>
                  <span className="font-semibold tabular-nums text-[#171717]">
                    {formatINR(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-[#E9E1D5] space-y-1.5 text-sm tabular-nums">
              <div className="flex justify-between text-[#85817B]">
                <span>Taxable Value</span>
                <span>{formatINR(confirmedOrder.taxableValue)}</span>
              </div>
              <div className="flex justify-between text-[#85817B]">
                <span>Included GST</span>
                <span>{formatINR(confirmedOrder.gstAmount)}</span>
              </div>
              <div className="flex justify-between text-[#85817B]">
                <span>Shipping + COD</span>
                <span>{formatINR(confirmedOrder.shippingFee + confirmedOrder.codFee)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-[#171717] pt-2">
                <span>Grand Total</span>
                <span>{formatINR(confirmedOrder.total)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/account"
              className="px-6 py-3 bg-[#171717] text-white text-xs tracking-[0.14em] uppercase"
            >
              Track Order in Account
            </Link>
            <Link
              to="/shop"
              className="px-6 py-3 border border-[#171717] text-[#171717] text-xs tracking-[0.14em] uppercase"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-10 grid lg:grid-cols-12 gap-10 items-start">
          {/* Left: Step Form */}
          <div className="lg:col-span-8 bg-white border border-[#E9E1D5] p-6 sm:p-8">
            {error && (
              <div className="mb-6 p-3.5 bg-[#FDF2F2] border border-[#E6B8B8] text-xs text-[#9E2A2B]">
                {error}
              </div>
            )}

            {/* Step 1: Customer Info */}
            {step === 1 && (
              <div className="space-y-5">
                <h1 className="font-editorial text-3xl text-[#171717]">1. Customer Information</h1>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="chk-name" className="block text-xs uppercase tracking-[0.12em] text-[#85817B] mb-1.5">
                      Full Name *
                    </label>
                    <input
                      id="chk-name"
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Meera Deshmukh"
                      className="w-full bg-[#F7F4EE] border border-[#D9D0C2] px-3.5 py-3 text-sm text-[#171717]"
                    />
                  </div>
                  <div>
                    <label htmlFor="chk-phone" className="block text-xs uppercase tracking-[0.12em] text-[#85817B] mb-1.5">
                      Indian Mobile Number (+91) *
                    </label>
                    <input
                      id="chk-phone"
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="w-full bg-[#F7F4EE] border border-[#D9D0C2] px-3.5 py-3 text-sm text-[#171717] tabular-nums"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="chk-email" className="block text-xs uppercase tracking-[0.12em] text-[#85817B] mb-1.5">
                      Email Address *
                    </label>
                    <input
                      id="chk-email"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-[#F7F4EE] border border-[#D9D0C2] px-3.5 py-3 text-sm text-[#171717]"
                    />
                  </div>
                  <div>
                    <label htmlFor="chk-gstin" className="block text-xs uppercase tracking-[0.12em] text-[#85817B] mb-1.5">
                      Business GSTIN (Optional)
                    </label>
                    <input
                      id="chk-gstin"
                      type="text"
                      maxLength={15}
                      value={customerGstin}
                      onChange={(e) => setCustomerGstin(e.target.value.toUpperCase())}
                      placeholder="e.g. 27AAPFU0939F1ZV"
                      className="w-full bg-[#F7F4EE] border border-[#D9D0C2] px-3.5 py-3 text-sm font-mono uppercase text-[#171717]"
                    />
                  </div>
                </div>
                <div className="pt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => validateStep1() && setStep(2)}
                    className="px-7 py-3.5 bg-[#171717] hover:bg-[#0B0B0B] text-white text-xs tracking-[0.16em] uppercase font-medium"
                  >
                    Continue to Shipping
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Shipping Address */}
            {step === 2 && (
              <div className="space-y-5">
                <h1 className="font-editorial text-3xl text-[#171717]">2. Shipping Address</h1>

                {currentUser && currentUser.addresses.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.12em] text-[#85817B]">
                      Use a saved address
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {currentUser.addresses.map((addr) => (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => {
                            setAddressLabel(addr.label);
                            setLine1(addr.line1);
                            setLine2(addr.line2 ?? '');
                            setLandmark(addr.landmark ?? '');
                            setCity(addr.city);
                            setStateName(addr.state);
                            setPincode(addr.pincode);
                          }}
                          className="text-left p-3.5 border border-[#D9D0C2] hover:border-[#171717] bg-[#F7F4EE] text-xs space-y-0.5"
                        >
                          <p className="font-semibold text-[#171717]">{addr.label}</p>
                          <p className="text-[#55524E]">{addr.line1}</p>
                          <p className="text-[#85817B]">
                            {addr.city}, {addr.state} – {addr.pincode}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label htmlFor="chk-line1" className="block text-xs uppercase tracking-[0.12em] text-[#85817B] mb-1.5">
                      Flat / House No., Building, Street *
                    </label>
                    <input
                      id="chk-line1"
                      type="text"
                      value={line1}
                      onChange={(e) => setLine1(e.target.value)}
                      placeholder="e.g. 14B Gulmohar Terrace, Pali Hill"
                      className="w-full bg-[#F7F4EE] border border-[#D9D0C2] px-3.5 py-3 text-sm text-[#171717]"
                    />
                  </div>
                  <div>
                    <label htmlFor="chk-line2" className="block text-xs uppercase tracking-[0.12em] text-[#85817B] mb-1.5">
                      Area / Locality
                    </label>
                    <input
                      id="chk-line2"
                      type="text"
                      value={line2}
                      onChange={(e) => setLine2(e.target.value)}
                      placeholder="e.g. Bandra West"
                      className="w-full bg-[#F7F4EE] border border-[#D9D0C2] px-3.5 py-3 text-sm text-[#171717]"
                    />
                  </div>
                  <div>
                    <label htmlFor="chk-landmark" className="block text-xs uppercase tracking-[0.12em] text-[#85817B] mb-1.5">
                      Landmark
                    </label>
                    <input
                      id="chk-landmark"
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="Optional"
                      className="w-full bg-[#F7F4EE] border border-[#D9D0C2] px-3.5 py-3 text-sm text-[#171717]"
                    />
                  </div>
                  <div>
                    <label htmlFor="chk-pincode" className="block text-xs uppercase tracking-[0.12em] text-[#85817B] mb-1.5">
                      6-Digit PIN Code *
                    </label>
                    <input
                      id="chk-pincode"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/\D/g, '');
                        setPincode(clean);
                        if (clean.length === 6) {
                          const info = checkPincodeServiceability(clean);
                          if (info.serviceable && info.city && !city) setCity(info.city);
                          if (info.serviceable && info.state && INDIAN_STATES.includes(info.state)) {
                            setStateName(info.state);
                          }
                        }
                      }}
                      placeholder="e.g. 400050"
                      className="w-full bg-[#F7F4EE] border border-[#D9D0C2] px-3.5 py-3 text-sm text-[#171717] tabular-nums"
                    />
                  </div>
                  <div>
                    <label htmlFor="chk-city" className="block text-xs uppercase tracking-[0.12em] text-[#85817B] mb-1.5">
                      City *
                    </label>
                    <input
                      id="chk-city"
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Mumbai"
                      className="w-full bg-[#F7F4EE] border border-[#D9D0C2] px-3.5 py-3 text-sm text-[#171717]"
                    />
                  </div>
                  <div>
                    <label htmlFor="chk-state" className="block text-xs uppercase tracking-[0.12em] text-[#85817B] mb-1.5">
                      State *
                    </label>
                    <select
                      id="chk-state"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      className="w-full bg-[#F7F4EE] border border-[#D9D0C2] px-3.5 py-3 text-sm text-[#171717]"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="chk-label" className="block text-xs uppercase tracking-[0.12em] text-[#85817B] mb-1.5">
                      Address Type
                    </label>
                    <select
                      id="chk-label"
                      value={addressLabel}
                      onChange={(e) => setAddressLabel(e.target.value)}
                      className="w-full bg-[#F7F4EE] border border-[#D9D0C2] px-3.5 py-3 text-sm text-[#171717]"
                    >
                      <option value="Home">Home</option>
                      <option value="Office">Office</option>
                      <option value="Studio">Studio</option>
                    </select>
                  </div>
                </div>

                {pinService && (
                  <p className="text-xs text-[#2D6A4F]">
                    {pinService.message} Estimated standard delivery: {pinService.estimatedDateText}.
                  </p>
                )}

                <div className="pt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-5 py-3 border border-[#D9D0C2] text-xs tracking-[0.14em] uppercase text-[#171717]"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => validateStep2() && setStep(3)}
                    className="px-7 py-3.5 bg-[#171717] hover:bg-[#0B0B0B] text-white text-xs tracking-[0.16em] uppercase font-medium"
                  >
                    Continue to Delivery
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Delivery Method */}
            {step === 3 && (
              <div className="space-y-5">
                <h1 className="font-editorial text-3xl text-[#171717]">3. Delivery Method</h1>
                <div className="space-y-3">
                  {(
                    [
                      {
                        id: 'standard' as const,
                        title: 'Standard Insured Courier',
                        eta: pinService?.estimatedDateText ?? '3–5 Business Days',
                        price:
                          liveTotals.subtotal - liveTotals.couponDiscount >=
                          shippingConfig.freeShippingThreshold
                            ? 'Complimentary'
                            : formatINR(shippingConfig.standardFee),
                        note: `Complimentary on orders above ${formatINR(shippingConfig.freeShippingThreshold)}.`,
                      },
                      {
                        id: 'express' as const,
                        title: 'Express Air Delivery',
                        eta: '1–3 Business Days (Metros & Tier 1)',
                        price: formatINR(shippingConfig.expressFee),
                        note: 'Priority dispatch via BlueDart Air with SMS tracking.',
                      },
                      {
                        id: 'priority' as const,
                        title: 'White-Glove Gift & Priority Courier',
                        eta: '1–2 Business Days',
                        price: formatINR(shippingConfig.priorityFee),
                        note: 'Signature ivory linen gift wrapping with handwritten note card.',
                      },
                    ]
                  ).map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-start justify-between gap-4 p-4 border cursor-pointer transition-colors ${
                        deliveryMethod === opt.id
                          ? 'border-[#171717] bg-[#F7F4EE]'
                          : 'border-[#E9E1D5] bg-white hover:border-[#85817B]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="deliveryMethod"
                          checked={deliveryMethod === opt.id}
                          onChange={() => setDeliveryMethod(opt.id)}
                          className="mt-1 accent-[#171717]"
                        />
                        <div>
                          <p className="text-sm font-medium text-[#171717]">{opt.title}</p>
                          <p className="text-xs text-[#9A7A45] mt-0.5">{opt.eta}</p>
                          <p className="text-xs text-[#85817B] mt-1">{opt.note}</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold tabular-nums text-[#171717] shrink-0">
                        {opt.price}
                      </span>
                    </label>
                  ))}
                </div>

                <div className="pt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-5 py-3 border border-[#D9D0C2] text-xs tracking-[0.14em] uppercase text-[#171717]"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="px-7 py-3.5 bg-[#171717] hover:bg-[#0B0B0B] text-white text-xs tracking-[0.16em] uppercase font-medium"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Payment Method (India-First + Explicit Demo Separation) */}
            {step === 4 && (
              <div className="space-y-5">
                <h1 className="font-editorial text-3xl text-[#171717]">4. Payment Method</h1>
                <p className="text-xs text-[#85817B]">
                  Prepared for Razorpay India checkout. Currently running in{' '}
                  <strong className="text-[#171717]">Demo Mode</strong> — no real payment card or UPI debit will occur.
                </p>

                <div className="space-y-3">
                  {[
                    {
                      id: 'upi' as const,
                      label: 'UPI (GPay, PhonePe, Paytm, BHIM)',
                      desc: 'Instant verification via Razorpay UPI Intent (Demo)',
                      icon: Smartphone,
                      enabled: paymentConfig.upiEnabled,
                    },
                    {
                      id: 'card' as const,
                      label: 'Credit / Debit Card (Visa, Mastercard, RuPay)',
                      desc: 'RBI-compliant tokenized checkout via Razorpay (Demo)',
                      icon: CreditCard,
                      enabled: paymentConfig.cardsEnabled,
                    },
                    {
                      id: 'netbanking' as const,
                      label: 'Net Banking (HDFC, ICICI, SBI, Axis & 50+ Banks)',
                      desc: 'Direct bank redirect via Razorpay (Demo)',
                      icon: Landmark,
                      enabled: paymentConfig.netBankingEnabled,
                    },
                    {
                      id: 'wallet' as const,
                      label: 'Digital Wallets (Amazon Pay, Mobikwik, Freecharge)',
                      desc: 'Fast wallet authorization (Demo)',
                      icon: Wallet,
                      enabled: paymentConfig.walletsEnabled,
                    },
                    {
                      id: 'cod' as const,
                      label: `Cash on Delivery (+${formatINR(shippingConfig.codFee)} handling fee)`,
                      desc: codAllowed
                        ? `Pay in cash or UPI at doorstep (eligible up to ${formatINR(shippingConfig.codMaxOrderValue)})`
                        : 'Unavailable for this order value or PIN code',
                      icon: Truck,
                      enabled: codAllowed,
                    },
                  ].map((pm) => {
                    const Icon = pm.icon;
                    return (
                      <label
                        key={pm.id}
                        className={`flex items-start gap-3.5 p-4 border transition-colors ${
                          !pm.enabled
                            ? 'opacity-50 cursor-not-allowed border-[#E9E1D5]'
                            : paymentMethod === pm.id
                              ? 'border-[#171717] bg-[#F7F4EE] cursor-pointer'
                              : 'border-[#E9E1D5] bg-white hover:border-[#85817B] cursor-pointer'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          disabled={!pm.enabled}
                          checked={paymentMethod === pm.id}
                          onChange={() => setPaymentMethod(pm.id)}
                          className="mt-1 accent-[#171717]"
                        />
                        <Icon className="w-4 h-4 text-[#C5A46D] mt-0.5 shrink-0" strokeWidth={1.5} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#171717]">{pm.label}</p>
                          <p className="text-xs text-[#85817B] mt-0.5">{pm.desc}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {paymentMethod === 'upi' && (
                  <div className="pt-2">
                    <label htmlFor="chk-upi" className="block text-xs uppercase tracking-[0.12em] text-[#85817B] mb-1.5">
                      UPI ID (Optional in Demo Mode)
                    </label>
                    <input
                      id="chk-upi"
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="yourname@okhdfcbank"
                      className="w-full sm:w-80 bg-[#F7F4EE] border border-[#D9D0C2] px-3.5 py-2.5 text-sm text-[#171717]"
                    />
                  </div>
                )}

                <div className="pt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-5 py-3 border border-[#D9D0C2] text-xs tracking-[0.14em] uppercase text-[#171717]"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => validateStep4() && setStep(5)}
                    className="px-7 py-3.5 bg-[#171717] hover:bg-[#0B0B0B] text-white text-xs tracking-[0.16em] uppercase font-medium"
                  >
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Final Order Review */}
            {step === 5 && (
              <div className="space-y-6">
                <h1 className="font-editorial text-3xl text-[#171717]">5. Order Review</h1>

                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div className="p-4 bg-[#F7F4EE] border border-[#E9E1D5]">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-[#85817B]">
                      Delivering To
                    </p>
                    <p className="mt-1.5 font-medium text-[#171717]">{customerName}</p>
                    <p className="text-xs text-[#55524E] mt-0.5">
                      {line1}
                      {line2 ? `, ${line2}` : ''}, {city}, {stateName} – {pincode}
                    </p>
                    <p className="text-xs text-[#85817B] mt-1">
                      +91 {customerPhone} · {customerEmail}
                    </p>
                  </div>

                  <div className="p-4 bg-[#F7F4EE] border border-[#E9E1D5]">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-[#85817B]">
                      Method & Payment
                    </p>
                    <p className="mt-1.5 font-medium text-[#171717] capitalize">
                      {deliveryMethod} Delivery
                    </p>
                    <p className="text-xs text-[#55524E] mt-0.5 uppercase">
                      Payment: {paymentMethod} (Demo Mode)
                    </p>
                    {customerGstin && (
                      <p className="text-xs font-mono text-[#85817B] mt-1">
                        Buyer GSTIN: {customerGstin}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-4 border border-[#C5A46D]/60 bg-[#FAF7F0] text-xs text-[#4A4743] flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#9A7A45] shrink-0 mt-0.5" strokeWidth={1.6} />
                  <span>
                    Clicking &ldquo;Place Demo Order&rdquo; records this order locally in your browser session with a simulated reference ID and deducts demo stock. No live payment is processed.
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="px-5 py-3 border border-[#D9D0C2] text-xs tracking-[0.14em] uppercase text-[#171717]"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleConfirmOrder}
                    className="px-8 py-3.5 bg-[#171717] hover:bg-[#0B0B0B] disabled:bg-[#85817B] text-white text-xs tracking-[0.16em] uppercase font-semibold"
                  >
                    {submitting ? 'Recording Demo Order...' : `Place Demo Order · ${formatINR(liveTotals.total)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Persistent Order Summary */}
          <aside className="lg:col-span-4 bg-white border border-[#E9E1D5] p-6 space-y-5">
            <h2 className="font-editorial text-2xl text-[#171717]">Bag Summary</h2>
            <ul className="divide-y divide-[#E9E1D5] max-h-64 overflow-y-auto">
              {cart.map((item) => {
                const product = products.find((p) => p.id === item.productId);
                if (!product) return null;
                const variant =
                  product.variants.find((v) => v.id === item.variantId) ?? product.variants[0];
                const unitPrice = product.price + (variant?.priceDelta ?? 0);
                return (
                  <li key={item.id} className="py-3 first:pt-0 flex items-center gap-3">
                    <SafeImage
                      src={product.images[0]}
                      alt={product.name}
                      className="w-12 h-16 object-cover bg-[#E9E1D5] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#171717] truncate">{product.name}</p>
                      <p className="text-[11px] text-[#85817B]">
                        {variant?.colorName}
                        {variant?.size ? ` · ${variant.size}` : ''} × {item.quantity}
                      </p>
                    </div>
                    <span className="text-xs font-semibold tabular-nums text-[#171717]">
                      {formatINR(unitPrice * item.quantity)}
                    </span>
                  </li>
                );
              })}
            </ul>

            <dl className="space-y-2.5 pt-4 border-t border-[#E9E1D5] text-sm tabular-nums">
              <div className="flex justify-between">
                <dt className="text-[#85817B]">Subtotal (incl. GST)</dt>
                <dd>{formatINR(liveTotals.subtotal)}</dd>
              </div>
              {liveTotals.couponDiscount > 0 && (
                <div className="flex justify-between text-[#9A7A45]">
                  <dt>Coupon ({appliedCouponCode})</dt>
                  <dd>−{formatINR(liveTotals.couponDiscount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-[#85817B]">Shipping</dt>
                <dd>{liveTotals.shippingFee === 0 ? 'Complimentary' : formatINR(liveTotals.shippingFee)}</dd>
              </div>
              {liveTotals.codFee > 0 && (
                <div className="flex justify-between">
                  <dt className="text-[#85817B]">COD Handling Fee</dt>
                  <dd>{formatINR(liveTotals.codFee)}</dd>
                </div>
              )}
              <div className="flex justify-between text-xs text-[#85817B]">
                <dt>Taxable Value + GST</dt>
                <dd>
                  {formatINR(liveTotals.taxableValue)} + {formatINR(liveTotals.gstAmount)}
                </dd>
              </div>
              <div className="pt-3 border-t border-[#E9E1D5] flex justify-between text-base font-semibold text-[#171717]">
                <dt>Payable Total</dt>
                <dd>{formatINR(liveTotals.total)}</dd>
              </div>
            </dl>
          </aside>
        </div>
      )}
    </div>
  );
}
