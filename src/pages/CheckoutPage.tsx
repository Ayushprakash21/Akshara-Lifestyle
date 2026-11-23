import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Edit2,
  HelpCircle,
  Home,
  Info,
  Landmark,
  Lock,
  MapPin,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Tag,
  Truck,
  UserCheck,
  Wallet,
  X,
} from 'lucide-react';
import type { Address, DeliveryMethodId, Order, PaymentMethodId } from '../types/commerce';
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
import { BrandLogo } from '../components/BrandLogo';

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

const STEPS = [
  { id: 1, name: 'Customer', label: 'Contact Details' },
  { id: 2, name: 'Address', label: 'Delivery Destination' },
  { id: 3, name: 'Delivery', label: 'Courier & Speed' },
  { id: 4, name: 'Payment', label: 'Payment Method' },
  { id: 5, name: 'Review', label: 'Final Review' },
] as const;

export function CheckoutPage() {
  const navigate = useNavigate();
  const {
    cart,
    products,
    coupons,
    shippingConfig,
    paymentConfig,
    appliedCouponCode,
    currentUser,
    applyCoupon,
    removeCoupon,
    saveAddress,
    placeDemoOrder,
  } = useCommerce();

  useDocumentMeta({ title: 'Secure Checkout' });

  // Navigation and active step
  const [step, setStep] = useState<number>(1);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  // Step 1: Customer Information
  const [customerName, setCustomerName] = useState(currentUser?.name ?? '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email ?? '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone ?? '');
  const [customerGstin, setCustomerGstin] = useState(currentUser?.gstin ?? '');

  // Step 2: Delivery Address
  const defaultAddr = useMemo(
    () => currentUser?.addresses.find((a) => a.isDefault) ?? currentUser?.addresses[0],
    [currentUser?.addresses],
  );

  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    defaultAddr?.id ?? (currentUser?.addresses.length ? currentUser.addresses[0].id : 'new'),
  );
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(!currentUser?.addresses.length);

  // Address Fields
  const [recipientName, setRecipientName] = useState(defaultAddr?.fullName ?? currentUser?.name ?? '');
  const [recipientPhone, setRecipientPhone] = useState(defaultAddr?.phone ?? currentUser?.phone ?? '');
  const [addressLabel, setAddressLabel] = useState<'Home' | 'Work' | 'Other'>(
    (defaultAddr?.label as 'Home' | 'Work' | 'Other') ?? 'Home',
  );
  const [line1, setLine1] = useState(defaultAddr?.line1 ?? '');
  const [line2, setLine2] = useState(defaultAddr?.line2 ?? '');
  const [landmark, setLandmark] = useState(defaultAddr?.landmark ?? '');
  const [city, setCity] = useState(defaultAddr?.city ?? '');
  const [stateName, setStateName] = useState(defaultAddr?.state ?? 'Maharashtra');
  const [pincode, setPincode] = useState(defaultAddr?.pincode ?? '');
  const [saveToAccount, setSaveToAccount] = useState(true);
  const [isDefaultAddress, setIsDefaultAddress] = useState(false);

  // Step 3: Delivery Method
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethodId>('standard');

  // Step 4: Payment Method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [selectedWallet, setSelectedWallet] = useState('Amazon Pay');

  // Coupon state inside checkout
  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ text: string; error: boolean } | null>(null);

  // Order state & submission protection
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Synchronize authenticated user profile changes
  useEffect(() => {
    if (currentUser) {
      if (!customerName) setCustomerName(currentUser.name);
      if (!customerEmail) setCustomerEmail(currentUser.email);
      if (!customerPhone) setCustomerPhone(currentUser.phone);
      if (!customerGstin && currentUser.gstin) setCustomerGstin(currentUser.gstin);
      if (!recipientName) setRecipientName(currentUser.name);
      if (!recipientPhone) setRecipientPhone(currentUser.phone);
    }
  }, [currentUser, customerName, customerEmail, customerPhone, customerGstin, recipientName, recipientPhone]);

  // Handle address card selection
  const handleSelectSavedAddress = (addr: Address) => {
    setSelectedAddressId(addr.id);
    setIsAddingNewAddress(false);
    setRecipientName(addr.fullName);
    setRecipientPhone(addr.phone);
    setAddressLabel((addr.label as 'Home' | 'Work' | 'Other') || 'Home');
    setLine1(addr.line1);
    setLine2(addr.line2 ?? '');
    setLandmark(addr.landmark ?? '');
    setCity(addr.city);
    setStateName(addr.state);
    setPincode(addr.pincode);
    setError('');
  };

  // Live dynamic totals calculation
  const liveTotals = useMemo(
    () =>
      calculateCartTotals(cart, products, coupons, shippingConfig, {
        couponCode: appliedCouponCode || undefined,
        deliveryMethod,
        paymentMethod,
      }),
    [cart, products, coupons, shippingConfig, appliedCouponCode, deliveryMethod, paymentMethod],
  );

  // Dynamic PIN code serviceability evaluation
  const pinService = useMemo(
    () => (pincode.length === 6 ? checkPincodeServiceability(pincode, true) : null),
    [pincode],
  );

  const codAllowed =
    paymentConfig.codEnabled &&
    liveTotals.total <= shippingConfig.codMaxOrderValue &&
    (pinService?.codAvailable ?? true);

  // If COD is currently selected but became unserviceable, switch to UPI
  useEffect(() => {
    if (paymentMethod === 'cod' && !codAllowed) {
      setPaymentMethod('upi');
    }
  }, [codAllowed, paymentMethod]);

  // Early return: Empty Bag
  if (cart.length === 0 && !confirmedOrder) {
    return (
      <div className="min-h-[70vh] bg-[#F8F6F1] flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-[#E9E1D5]/60 border border-[#D9D0C2] text-[#85817B] flex items-center justify-center mx-auto">
            <ShoppingBag className="w-7 h-7 text-[#C5A46D]" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="font-editorial text-3xl sm:text-4xl text-[#171717]">Your Bag is Empty</h1>
            <p className="mt-2 text-sm text-[#85817B] max-w-sm mx-auto leading-relaxed">
              Your shopping bag currently carries no pieces. Explore our curated collections to select everyday essentials and elevated objects.
            </p>
          </div>
          <div>
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#171717] hover:bg-[#0B0B0B] text-[#F8F6F1] text-xs uppercase tracking-[0.18em] font-medium transition-colors"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Validation functions
  const validateStep1 = () => {
    if (customerName.trim().length < 2) {
      setError('Please enter your full name.');
      return false;
    }
    if (!isValidEmail(customerEmail)) {
      setError('Please provide a valid email address for delivery updates.');
      return false;
    }
    if (!isValidIndianPhone(customerPhone)) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return false;
    }
    if (customerGstin && !isValidGSTIN(customerGstin)) {
      setError('GSTIN format is invalid. Expected 15 characters, e.g. 27AAPFU0939F1ZV.');
      return false;
    }
    setError('');
    return true;
  };

  const validateStep2 = () => {
    if (recipientName.trim().length < 2) {
      setError('Please enter the recipient full name.');
      return false;
    }
    if (!isValidIndianPhone(recipientPhone)) {
      setError('Please enter a valid 10-digit mobile number for the delivery destination.');
      return false;
    }
    if (line1.trim().length < 5) {
      setError('Please enter full house/flat number, building, and street details.');
      return false;
    }
    if (city.trim().length < 2) {
      setError('Please enter city name.');
      return false;
    }
    if (!isValidIndianPincode(pincode)) {
      setError('Please enter a valid 6-digit Indian PIN code.');
      return false;
    }
    if (pinService && !pinService.serviceable) {
      setError(pinService.message || 'The specified PIN code is not currently serviceable.');
      return false;
    }

    // Persist new address to customer profile if requested
    if (currentUser && isAddingNewAddress && saveToAccount) {
      saveAddress({
        fullName: recipientName.trim(),
        phone: recipientPhone.trim(),
        label: addressLabel,
        line1: line1.trim(),
        line2: line2.trim() || undefined,
        landmark: landmark.trim() || undefined,
        city: city.trim(),
        state: stateName,
        pincode: pincode.trim(),
        isDefault: isDefaultAddress,
      });
    }

    setError('');
    return true;
  };

  const validateStep4 = () => {
    if (paymentMethod === 'upi' && upiId.trim() && !upiId.includes('@')) {
      setError('Please enter a valid UPI ID (e.g. name@okhdfcbank or 9876543210@upi).');
      return false;
    }
    if (paymentMethod === 'cod' && !codAllowed) {
      setError('Cash on Delivery is unavailable for this order value or PIN code.');
      return false;
    }
    setError('');
    return true;
  };

  // Handle Coupon Application inside Checkout
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput.trim());
    setCouponMessage({ text: res.message, error: !res.ok });
    if (res.ok) setCouponInput('');
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponMessage(null);
  };

  // Final Order Placement
  const handleConfirmOrder = async () => {
    if (submitting) return;
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
          fullName: recipientName.trim(),
          phone: recipientPhone.trim(),
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setError('Unable to record order. Please verify your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F1] text-[#171717] pb-28 lg:pb-16">
      {/* 1. Minimal Luxury Checkout Header */}
      <header className="bg-[#F8F6F1] border-b border-[#E9E1D5] sticky top-0 z-30">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C5A46D]"
            aria-label="Return to store"
          >
            <BrandLogo variant="dark" layout="horizontal" mobileResponsive size="sm" />
          </Link>

          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#85817B]">
            <Lock className="w-3.5 h-3.5 text-[#C5A46D]" strokeWidth={1.8} />
            <span className="hidden sm:inline">256-Bit Encrypted Checkout</span>
            <span className="sm:hidden">Encrypted</span>
          </div>
        </div>
      </header>

      {/* 2. Order Confirmation View (Step 6) */}
      {step === 6 && confirmedOrder ? (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-12 lg:py-16">
          <div className="bg-white border border-[#E9E1D5] p-6 sm:p-10 lg:p-12 space-y-10">
            {/* Header Badge & Title */}
            <div className="flex items-start gap-4 pb-8 border-b border-[#E9E1D5]">
              <div className="w-12 h-12 bg-[#171717] text-[#C5A46D] flex items-center justify-center shrink-0">
                <Check className="w-6 h-6" strokeWidth={1.8} />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A46D] font-medium">
                  ORDER RECORDED · AKSHARA LIFESTYLE
                </span>
                <h1 className="font-editorial text-3xl sm:text-4xl text-[#171717]">
                  Order #{confirmedOrder.orderNumber} Confirmed
                </h1>
                <p className="text-xs sm:text-sm text-[#55524E] leading-relaxed">
                  Thank you, <strong className="text-[#171717]">{confirmedOrder.customerName}</strong>. A confirmation and GST tax invoice have been dispatched to{' '}
                  <strong className="text-[#171717]">{confirmedOrder.customerEmail}</strong>.
                </p>
              </div>
            </div>

            {/* Delivery & Tracking Meta Grid */}
            <div className="grid sm:grid-cols-2 gap-8 text-sm">
              <div className="space-y-3">
                <h3 className="text-[11px] uppercase tracking-[0.2em] text-[#85817B] font-medium">
                  Delivery Destination
                </h3>
                <div className="space-y-1 text-[#55524E]">
                  <p className="font-semibold text-[#171717]">
                    {confirmedOrder.shippingAddress.fullName}
                  </p>
                  <p>{confirmedOrder.shippingAddress.line1}</p>
                  {confirmedOrder.shippingAddress.line2 && (
                    <p>{confirmedOrder.shippingAddress.line2}</p>
                  )}
                  {confirmedOrder.shippingAddress.landmark && (
                    <p className="text-xs text-[#85817B]">Near {confirmedOrder.shippingAddress.landmark}</p>
                  )}
                  <p>
                    {confirmedOrder.shippingAddress.city}, {confirmedOrder.shippingAddress.state} –{' '}
                    <span className="font-mono">{confirmedOrder.shippingAddress.pincode}</span>
                  </p>
                  <p className="text-xs text-[#85817B] pt-1">
                    Mobile: +91 {confirmedOrder.customerPhone}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-[11px] uppercase tracking-[0.2em] text-[#85817B] font-medium">
                  Logistics & Invoicing
                </h3>
                <dl className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-[#85817B]">Courier Partner</dt>
                    <dd className="font-medium text-[#171717]">{confirmedOrder.shipment.carrier}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#85817B]">Estimated Delivery</dt>
                    <dd className="font-semibold text-[#171717]">
                      {confirmedOrder.shipment.estimatedDelivery}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#85817B]">AWB Tracking No.</dt>
                    <dd className="font-mono text-[#C5A46D]">{confirmedOrder.shipment.awbNumber}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#85817B]">Tax Invoice No.</dt>
                    <dd className="font-mono text-[#171717]">{confirmedOrder.invoiceNumber}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#85817B]">Payment Status</dt>
                    <dd className="font-medium uppercase tracking-[0.1em] text-[#9A7A45]">
                      {confirmedOrder.payment.status.replace('_', ' ')}
                    </dd>
                  </div>
                  {confirmedOrder.customerGstin && (
                    <div className="flex justify-between">
                      <dt className="text-[#85817B]">Buyer GSTIN</dt>
                      <dd className="font-mono text-[#171717]">{confirmedOrder.customerGstin}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* Ordered Pieces Table */}
            <div className="space-y-4 pt-6 border-t border-[#E9E1D5]">
              <h3 className="text-[11px] uppercase tracking-[0.2em] text-[#85817B] font-medium">
                Purchased Pieces
              </h3>
              <div className="divide-y divide-[#E9E1D5]">
                {confirmedOrder.items.map((item) => (
                  <div key={item.sku} className="py-4 flex items-center justify-between gap-4 text-sm">
                    <div className="flex items-center gap-3.5">
                      <SafeImage
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-16 object-cover bg-[#E9E1D5] shrink-0 border border-[#E9E1D5]"
                      />
                      <div>
                        <p className="font-medium text-[#171717]">{item.name}</p>
                        <p className="text-xs text-[#85817B]">
                          {item.colorName}
                          {item.size ? ` · ${item.size}` : ''} · Qty {item.quantity} · HSN {item.hsnCode} ({item.gstRate}% GST)
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold tabular-nums text-[#171717]">
                      {formatINR(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Financial Ledger */}
              <div className="pt-4 border-t border-[#E9E1D5] space-y-2 text-sm tabular-nums">
                <div className="flex justify-between text-[#85817B]">
                  <span>Subtotal</span>
                  <span>{formatINR(confirmedOrder.subtotal)}</span>
                </div>
                {confirmedOrder.couponDiscount > 0 && (
                  <div className="flex justify-between text-[#9A7A45]">
                    <span>Privilege Discount ({confirmedOrder.couponCode})</span>
                    <span>−{formatINR(confirmedOrder.couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#85817B]">
                  <span>Taxable Value</span>
                  <span>{formatINR(confirmedOrder.taxableValue)}</span>
                </div>
                <div className="flex justify-between text-[#85817B]">
                  <span>Included GST</span>
                  <span>{formatINR(confirmedOrder.gstAmount)}</span>
                </div>
                {confirmedOrder.codFee > 0 && (
                  <div className="flex justify-between text-[#85817B]">
                    <span>Doorstep Handling Fee</span>
                    <span>{formatINR(confirmedOrder.codFee)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-semibold text-[#171717] pt-3 border-t border-[#E9E1D5]">
                  <span>Grand Total Paid / Payable</span>
                  <span className="text-[#171717]">{formatINR(confirmedOrder.total)}</span>
                </div>
                <p className="text-[11px] text-[#85817B] pt-1">
                  Delivery is included in the product price.
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-[#E9E1D5]">
              <Link
                to="/account"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#171717] hover:bg-[#0B0B0B] text-white text-xs uppercase tracking-[0.18em] font-medium transition-colors"
              >
                <span>Track in My Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/shop"
                className="inline-flex items-center justify-center px-8 py-4 border border-[#171717] text-[#171717] hover:bg-[#171717] hover:text-white text-xs uppercase tracking-[0.18em] font-medium transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </main>
      ) : (
        /* 3. Main Two-Column Luxury Checkout Workspace */
        <main className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
          {/* Mobile Collapsible Order Summary Bar */}
          <div className="lg:hidden mb-6 bg-white border border-[#E9E1D5]">
            <button
              type="button"
              onClick={() => setMobileSummaryOpen(!mobileSummaryOpen)}
              className="w-full px-4 py-3.5 flex items-center justify-between text-xs text-[#171717]"
              aria-expanded={mobileSummaryOpen}
            >
              <div className="flex items-center gap-2 font-medium">
                <ShoppingBag className="w-4 h-4 text-[#C5A46D]" strokeWidth={1.5} />
                <span>
                  {mobileSummaryOpen ? 'Hide' : 'Show'} Order Summary ({cart.length}{' '}
                  {cart.length === 1 ? 'item' : 'items'})
                </span>
                {mobileSummaryOpen ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </div>
              <span className="font-semibold text-sm tabular-nums">{formatINR(liveTotals.total)}</span>
            </button>

            {mobileSummaryOpen && (
              <div className="px-4 pb-4 pt-2 border-t border-[#E9E1D5] space-y-4">
                <ul className="divide-y divide-[#E9E1D5] max-h-56 overflow-y-auto">
                  {cart.map((item) => {
                    const product = products.find((p) => p.id === item.productId);
                    if (!product) return null;
                    const variant =
                      product.variants.find((v) => v.id === item.variantId) ?? product.variants[0];
                    const unitPrice = product.price + (variant?.priceDelta ?? 0);
                    return (
                      <li key={item.id} className="py-2.5 flex items-center gap-3 text-xs">
                        <SafeImage
                          src={product.images[0]}
                          alt={product.name}
                          className="w-10 h-14 object-cover bg-[#E9E1D5] shrink-0 border border-[#E9E1D5]"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[#171717] truncate">{product.name}</p>
                          <p className="text-[#85817B] text-[11px]">
                            {variant?.colorName} {variant?.size ? `· ${variant.size}` : ''} × {item.quantity}
                          </p>
                        </div>
                        <span className="font-semibold tabular-nums text-[#171717]">
                          {formatINR(unitPrice * item.quantity)}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                <dl className="space-y-1.5 text-xs border-t border-[#E9E1D5] pt-3 tabular-nums">
                  <div className="flex justify-between text-[#85817B]">
                    <span>Subtotal</span>
                    <span>{formatINR(liveTotals.subtotal)}</span>
                  </div>
                  {liveTotals.couponDiscount > 0 && (
                    <div className="flex justify-between text-[#9A7A45]">
                      <span>Coupon Discount</span>
                      <span>−{formatINR(liveTotals.couponDiscount)}</span>
                    </div>
                  )}
                  {liveTotals.codFee > 0 && (
                    <div className="flex justify-between text-[#85817B]">
                      <span>Doorstep Handling Fee</span>
                      <span>{formatINR(liveTotals.codFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-sm pt-2 text-[#171717]">
                    <span>Total Amount</span>
                    <span>{formatINR(liveTotals.total)}</span>
                  </div>
                  <p className="text-[11px] text-[#85817B] pt-1">
                    Delivery is included in the product price.
                  </p>
                </dl>
              </div>
            )}
          </div>

          {/* Checkout Progress Stepper (Desktop) */}
          <div className="mb-10">
            {/* Desktop 5-Step Stepper */}
            <ol className="hidden sm:grid sm:grid-cols-5 gap-3 pb-6 border-b border-[#E9E1D5]">
              {STEPS.map((s) => {
                const isCurrent = step === s.id;
                const isDone = step > s.id;
                return (
                  <li key={s.id} className="relative">
                    <button
                      type="button"
                      disabled={!isDone && !isCurrent}
                      onClick={() => isDone && setStep(s.id)}
                      className={`w-full text-left p-3 border transition-all ${
                        isCurrent
                          ? 'border-[#171717] bg-[#171717] text-[#F8F6F1]'
                          : isDone
                            ? 'border-[#C5A46D] bg-white text-[#171717] hover:border-[#171717] cursor-pointer'
                            : 'border-[#E9E1D5] bg-transparent text-[#85817B] opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] tracking-wider uppercase">
                          {isDone ? '✓ COMPLETED' : `STEP 0${s.id}`}
                        </span>
                        {isDone && <span className="text-[10px] text-[#C5A46D] underline">Edit</span>}
                      </div>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] truncate">
                        {s.name}
                      </p>
                      <p className="text-[11px] text-[#85817B] truncate">{s.label}</p>
                    </button>
                  </li>
                );
              })}
            </ol>

            {/* Mobile Progress Bar */}
            <div className="sm:hidden space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#C5A46D]">
                  Step 0{step} of 05
                </span>
                <span className="font-medium uppercase tracking-[0.14em] text-[#171717]">
                  {STEPS[step - 1]?.name}
                </span>
              </div>
              <div className="w-full h-1 bg-[#E9E1D5] overflow-hidden">
                <div
                  className="h-full bg-[#171717] transition-all duration-300"
                  style={{ width: `${(step / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* LEFT COLUMN: Checkout Stages (~65%) */}
            <div className="lg:col-span-8 space-y-8">
              {/* Validation / Error banner */}
              {error && (
                <div className="p-4 bg-[#FDF2F2] border border-[#E6B8B8] text-xs text-[#9E2A2B] flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* STEP 1: Customer Information */}
              {step === 1 && (
                <section className="bg-white border border-[#E9E1D5] p-6 sm:p-8 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E9E1D5]">
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-[#C5A46D] font-medium">
                        Stage 01
                      </span>
                      <h2 className="font-editorial text-2xl sm:text-3xl text-[#171717]">
                        Customer Information
                      </h2>
                    </div>
                    {currentUser ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F8F6F1] border border-[#E9E1D5] text-xs text-[#171717]">
                        <UserCheck className="w-3.5 h-3.5 text-[#2D6A4F]" />
                        <span>Signed in as {currentUser.name}</span>
                      </div>
                    ) : (
                      <p className="text-xs text-[#85817B]">
                        Already registered?{' '}
                        <Link to="/login" className="text-[#171717] underline hover:text-[#C5A46D]">
                          Sign In
                        </Link>
                      </p>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="chk-cust-name" className="block text-xs uppercase tracking-[0.14em] text-[#85817B] mb-2 font-medium">
                        Full Name *
                      </label>
                      <input
                        id="chk-cust-name"
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Meera Deshmukh"
                        className="w-full bg-[#F8F6F1] border border-[#D9D0C2] px-4 py-3 text-sm text-[#171717] focus:border-[#171717] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="chk-cust-phone" className="block text-xs uppercase tracking-[0.14em] text-[#85817B] mb-2 font-medium">
                        Indian Mobile Number *
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 bg-[#E9E1D5]/60 border border-r-0 border-[#D9D0C2] text-xs font-mono text-[#55524E]">
                          +91
                        </span>
                        <input
                          id="chk-cust-phone"
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="9876543210"
                          className="flex-1 bg-[#F8F6F1] border border-[#D9D0C2] px-4 py-3 text-sm text-[#171717] focus:border-[#171717] focus:outline-none tabular-nums"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="chk-cust-email" className="block text-xs uppercase tracking-[0.14em] text-[#85817B] mb-2 font-medium">
                        Email Address for Order Updates *
                      </label>
                      <input
                        id="chk-cust-email"
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-[#F8F6F1] border border-[#D9D0C2] px-4 py-3 text-sm text-[#171717] focus:border-[#171717] focus:outline-none"
                      />
                      <p className="mt-1 text-[11px] text-[#85817B]">
                        GST invoice, dispatch notifications, and BlueDart tracking will be transmitted here.
                      </p>
                    </div>

                    <div className="sm:col-span-2 pt-2">
                      <label htmlFor="chk-cust-gstin" className="block text-xs uppercase tracking-[0.14em] text-[#85817B] mb-2 font-medium">
                        Business GSTIN (Optional for B2B Input Tax Credit)
                      </label>
                      <input
                        id="chk-cust-gstin"
                        type="text"
                        maxLength={15}
                        value={customerGstin}
                        onChange={(e) => setCustomerGstin(e.target.value.toUpperCase())}
                        placeholder="e.g. 27AAPFU0939F1ZV"
                        className="w-full sm:w-80 bg-[#F8F6F1] border border-[#D9D0C2] px-4 py-2.5 text-xs font-mono uppercase text-[#171717] focus:border-[#171717] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => validateStep1() && setStep(2)}
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#171717] hover:bg-[#0B0B0B] text-white text-xs uppercase tracking-[0.18em] font-medium transition-colors"
                    >
                      <span>Continue to Delivery Address</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </section>
              )}

              {/* STEP 2: Delivery Address */}
              {step === 2 && (
                <section className="bg-white border border-[#E9E1D5] p-6 sm:p-8 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E9E1D5]">
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-[#C5A46D] font-medium">
                        Stage 02
                      </span>
                      <h2 className="font-editorial text-2xl sm:text-3xl text-[#171717]">
                        Delivery Destination
                      </h2>
                    </div>
                    {currentUser && currentUser.addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingNewAddress(!isAddingNewAddress);
                          if (!isAddingNewAddress) {
                            setSelectedAddressId('new');
                            setLine1('');
                            setLine2('');
                            setLandmark('');
                            setCity('');
                            setPincode('');
                          }
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#C5A46D] hover:text-[#9A7A45] underline uppercase tracking-[0.12em]"
                      >
                        {isAddingNewAddress ? 'Choose Saved Address' : '+ Add New Address'}
                      </button>
                    )}
                  </div>

                  {/* Saved Address Cards Selection */}
                  {currentUser && currentUser.addresses.length > 0 && !isAddingNewAddress && (
                    <div className="space-y-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-[#85817B]">
                        Select from your saved addresses:
                      </p>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {currentUser.addresses.map((addr) => {
                          const isSelected = selectedAddressId === addr.id;
                          return (
                            <div
                              key={addr.id}
                              onClick={() => handleSelectSavedAddress(addr)}
                              className={`p-4 border transition-all cursor-pointer relative text-xs space-y-2 ${
                                isSelected
                                  ? 'border-[#171717] bg-[#F8F6F1] shadow-sm'
                                  : 'border-[#E9E1D5] bg-white hover:border-[#85817B]'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="inline-block px-2 py-0.5 bg-[#171717] text-white text-[9px] uppercase tracking-[0.14em]">
                                  {addr.label}
                                </span>
                                {isSelected && (
                                  <span className="w-5 h-5 rounded-full bg-[#171717] text-[#C5A46D] flex items-center justify-center">
                                    <Check className="w-3 h-3" />
                                  </span>
                                )}
                              </div>
                              <p className="font-semibold text-sm text-[#171717]">{addr.fullName}</p>
                              <p className="text-[#55524E] leading-relaxed">
                                {addr.line1}
                                {addr.line2 ? `, ${addr.line2}` : ''}
                              </p>
                              {addr.landmark && (
                                <p className="text-[11px] text-[#85817B]">Near {addr.landmark}</p>
                              )}
                              <p className="text-[#171717] font-medium">
                                {addr.city}, {addr.state} – <span className="font-mono">{addr.pincode}</span>
                              </p>
                              <p className="text-[11px] text-[#85817B]">Phone: +91 {addr.phone}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Address Entry Form (when adding new or guest checkout) */}
                  {(isAddingNewAddress || !currentUser?.addresses.length) && (
                    <div className="space-y-5 pt-2">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="chk-recip-name" className="block text-xs uppercase tracking-[0.14em] text-[#85817B] mb-2 font-medium">
                            Recipient Full Name *
                          </label>
                          <input
                            id="chk-recip-name"
                            type="text"
                            value={recipientName}
                            onChange={(e) => setRecipientName(e.target.value)}
                            placeholder="Recipient name"
                            className="w-full bg-[#F8F6F1] border border-[#D9D0C2] px-4 py-3 text-sm text-[#171717] focus:border-[#171717] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label htmlFor="chk-recip-phone" className="block text-xs uppercase tracking-[0.14em] text-[#85817B] mb-2 font-medium">
                            Delivery Contact Mobile *
                          </label>
                          <div className="flex">
                            <span className="inline-flex items-center px-3 bg-[#E9E1D5]/60 border border-r-0 border-[#D9D0C2] text-xs font-mono text-[#55524E]">
                              +91
                            </span>
                            <input
                              id="chk-recip-phone"
                              type="tel"
                              maxLength={10}
                              value={recipientPhone}
                              onChange={(e) => setRecipientPhone(e.target.value.replace(/\D/g, ''))}
                              placeholder="10-digit mobile number"
                              className="flex-1 bg-[#F8F6F1] border border-[#D9D0C2] px-4 py-3 text-sm text-[#171717] focus:border-[#171717] focus:outline-none tabular-nums"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <label htmlFor="chk-line1" className="block text-xs uppercase tracking-[0.14em] text-[#85817B] mb-2 font-medium">
                            Flat / House No., Apartment, Wing, Building *
                          </label>
                          <input
                            id="chk-line1"
                            type="text"
                            value={line1}
                            onChange={(e) => setLine1(e.target.value)}
                            placeholder="e.g. Penthouse 18B, The Gulmohar Residences"
                            className="w-full bg-[#F8F6F1] border border-[#D9D0C2] px-4 py-3 text-sm text-[#171717] focus:border-[#171717] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label htmlFor="chk-line2" className="block text-xs uppercase tracking-[0.14em] text-[#85817B] mb-2 font-medium">
                            Street, Road, Colony / Sector
                          </label>
                          <input
                            id="chk-line2"
                            type="text"
                            value={line2}
                            onChange={(e) => setLine2(e.target.value)}
                            placeholder="e.g. 14th Road, Khar West"
                            className="w-full bg-[#F8F6F1] border border-[#D9D0C2] px-4 py-3 text-sm text-[#171717] focus:border-[#171717] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label htmlFor="chk-landmark" className="block text-xs uppercase tracking-[0.14em] text-[#85817B] mb-2 font-medium">
                            Landmark (Optional)
                          </label>
                          <input
                            id="chk-landmark"
                            type="text"
                            value={landmark}
                            onChange={(e) => setLandmark(e.target.value)}
                            placeholder="e.g. Near Olive Bar & Kitchen"
                            className="w-full bg-[#F8F6F1] border border-[#D9D0C2] px-4 py-3 text-sm text-[#171717] focus:border-[#171717] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label htmlFor="chk-pincode" className="block text-xs uppercase tracking-[0.14em] text-[#85817B] mb-2 font-medium">
                            6-Digit Indian PIN Code *
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
                            placeholder="400052"
                            className="w-full bg-[#F8F6F1] border border-[#D9D0C2] px-4 py-3 text-sm text-[#171717] focus:border-[#171717] focus:outline-none font-mono"
                          />
                        </div>

                        <div>
                          <label htmlFor="chk-city" className="block text-xs uppercase tracking-[0.14em] text-[#85817B] mb-2 font-medium">
                            City / District *
                          </label>
                          <input
                            id="chk-city"
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Mumbai"
                            className="w-full bg-[#F8F6F1] border border-[#D9D0C2] px-4 py-3 text-sm text-[#171717] focus:border-[#171717] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label htmlFor="chk-state" className="block text-xs uppercase tracking-[0.14em] text-[#85817B] mb-2 font-medium">
                            State / Union Territory *
                          </label>
                          <select
                            id="chk-state"
                            value={stateName}
                            onChange={(e) => setStateName(e.target.value)}
                            className="w-full bg-[#F8F6F1] border border-[#D9D0C2] px-4 py-3 text-sm text-[#171717] focus:border-[#171717] focus:outline-none"
                          >
                            {INDIAN_STATES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label htmlFor="chk-addr-type" className="block text-xs uppercase tracking-[0.14em] text-[#85817B] mb-2 font-medium">
                            Address Type *
                          </label>
                          <select
                            id="chk-addr-type"
                            value={addressLabel}
                            onChange={(e) => setAddressLabel(e.target.value as 'Home' | 'Work' | 'Other')}
                            className="w-full bg-[#F8F6F1] border border-[#D9D0C2] px-4 py-3 text-sm text-[#171717] focus:border-[#171717] focus:outline-none"
                          >
                            <option value="Home">Home (Personal Residence)</option>
                            <option value="Work">Work / Studio / Office</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      {/* PIN Code Serviceability Banner */}
                      {pinService && (
                        <div
                          className={`p-3.5 border text-xs leading-relaxed flex items-center gap-2.5 ${
                            pinService.serviceable
                              ? 'bg-[#F2F7F4] border-[#C3DCCF] text-[#1E523A]'
                              : 'bg-[#FDF2F2] border-[#E6B8B8] text-[#9E2A2B]'
                          }`}
                        >
                          <MapPin className="w-4 h-4 shrink-0" />
                          <span>
                            {pinService.message}
                            {pinService.serviceable && (
                              <>
                                {' '}· Estimated Arrival:{' '}
                                <strong className="font-semibold">{pinService.estimatedDateText}</strong>
                                {' '}· Cash on Delivery:{' '}
                                <strong className="font-semibold">
                                  {pinService.codAvailable ? 'Available' : 'Prepaid Only'}
                                </strong>
                              </>
                            )}
                          </span>
                        </div>
                      )}

                      {/* Persistence Controls */}
                      {currentUser && (
                        <div className="pt-2 space-y-2 text-xs text-[#55524E]">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={saveToAccount}
                              onChange={(e) => setSaveToAccount(e.target.checked)}
                              className="accent-[#171717] w-4 h-4"
                            />
                            <span>Save this address to my AKSHARA customer account</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isDefaultAddress}
                              onChange={(e) => setIsDefaultAddress(e.target.checked)}
                              className="accent-[#171717] w-4 h-4"
                            />
                            <span>Make this my primary delivery address</span>
                          </label>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 2 Actions */}
                  <div className="pt-4 flex items-center justify-between border-t border-[#E9E1D5]">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="inline-flex items-center gap-2 px-6 py-3.5 border border-[#D9D0C2] text-xs uppercase tracking-[0.14em] text-[#171717] hover:border-[#171717]"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => validateStep2() && setStep(3)}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-[#171717] hover:bg-[#0B0B0B] text-white text-xs uppercase tracking-[0.18em] font-medium transition-colors"
                    >
                      <span>Continue to Delivery Method</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </section>
              )}

              {/* STEP 3: Delivery Method */}
              {step === 3 && (
                <section className="bg-white border border-[#E9E1D5] p-6 sm:p-8 space-y-6">
                  <div className="pb-4 border-b border-[#E9E1D5]">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#C5A46D] font-medium">
                      Stage 03
                    </span>
                    <h2 className="font-editorial text-2xl sm:text-3xl text-[#171717]">
                      Delivery Method
                    </h2>
                    <p className="mt-1 text-xs text-[#85817B]">
                      Every dispatch is packaged in tamper-evident reinforced boxes with full transit insurance.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4 p-5 border border-[#171717] bg-[#F8F6F1] shadow-sm">
                      <div className="flex items-start gap-3.5">
                        <div className="mt-1 w-4 h-4 rounded-full border-2 border-[#171717] flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-[#171717]" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-[#171717]">Standard Delivery</p>
                          <p className="text-xs text-[#C5A46D] font-medium">
                            Estimated Arrival: {pinService?.estimatedDateText ?? '3–5 Business Days'}
                          </p>
                          <p className="text-[11px] text-[#85817B]">
                            BlueDart Ground / Delhivery Surface · Insured pan-India courier transit.
                          </p>
                          <p className="text-xs font-medium text-[#171717] pt-1">
                            Delivery is included in the product price.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-[#E9E1D5]">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="inline-flex items-center gap-2 px-6 py-3.5 border border-[#D9D0C2] text-xs uppercase tracking-[0.14em] text-[#171717] hover:border-[#171717]"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-[#171717] hover:bg-[#0B0B0B] text-white text-xs uppercase tracking-[0.18em] font-medium transition-colors"
                    >
                      <span>Continue to Payment</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </section>
              )}

              {/* STEP 4: Payment Method */}
              {step === 4 && (
                <section className="bg-white border border-[#E9E1D5] p-6 sm:p-8 space-y-6">
                  <div className="pb-4 border-b border-[#E9E1D5]">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#C5A46D] font-medium">
                      Stage 04
                    </span>
                    <h2 className="font-editorial text-2xl sm:text-3xl text-[#171717]">
                      Choose Payment Method
                    </h2>
                    <p className="mt-1 text-xs text-[#85817B]">
                      Prepared for Razorpay India gateway. Currently operating in{' '}
                      <strong className="text-[#171717]">Demo Architecture</strong> — live cards will not be charged.
                    </p>
                  </div>

                  {/* Payment Method Cards */}
                  <div className="space-y-4">
                    {[
                      {
                        id: 'upi' as const,
                        title: 'UPI (Google Pay, PhonePe, Paytm, BHIM)',
                        description: 'Instant zero-fee transfer via UPI QR or Virtual Payment Address (VPA).',
                        icon: Smartphone,
                        enabled: paymentConfig.upiEnabled,
                      },
                      {
                        id: 'card' as const,
                        title: 'Credit / Debit Card (Visa, Mastercard, RuPay, Amex)',
                        description: 'Encrypted, RBI tokenization compliant domestic and international cards.',
                        icon: CreditCard,
                        enabled: paymentConfig.cardsEnabled,
                      },
                      {
                        id: 'netbanking' as const,
                        title: 'Net Banking (50+ Scheduled Indian Banks)',
                        description: 'Direct corporate and retail banking authorization via trusted portals.',
                        icon: Landmark,
                        enabled: paymentConfig.netBankingEnabled,
                      },
                      {
                        id: 'wallet' as const,
                        title: 'Digital Wallets (Amazon Pay, Mobikwik)',
                        description: 'Instant authorization using connected digital balances.',
                        icon: Wallet,
                        enabled: paymentConfig.walletsEnabled,
                      },
                      {
                        id: 'cod' as const,
                        title: `Cash on Delivery (+${formatINR(shippingConfig.codFee)} Handling Fee)`,
                        description: codAllowed
                          ? `Pay via cash or UPI QR at doorstep upon verification (eligible up to ${formatINR(shippingConfig.codMaxOrderValue)}).`
                          : 'Unavailable for this order value or PIN code serviceability.',
                        icon: Truck,
                        enabled: codAllowed,
                      },
                    ].map((pm) => {
                      const Icon = pm.icon;
                      const isSelected = paymentMethod === pm.id;
                      return (
                        <div
                          key={pm.id}
                          className={`border transition-all ${
                            !pm.enabled
                              ? 'opacity-40 border-[#E9E1D5] bg-[#FAF8F5] cursor-not-allowed'
                              : isSelected
                                ? 'border-[#171717] bg-[#F8F6F1] shadow-sm'
                                : 'border-[#E9E1D5] bg-white hover:border-[#85817B] cursor-pointer'
                          }`}
                        >
                          <label className="flex items-start gap-4 p-5 cursor-pointer">
                            <input
                              type="radio"
                              name="paymentMethod"
                              disabled={!pm.enabled}
                              checked={isSelected}
                              onChange={() => setPaymentMethod(pm.id)}
                              className="mt-1 accent-[#171717]"
                            />
                            <div className="w-8 h-8 rounded-full bg-white border border-[#E9E1D5] text-[#C5A46D] flex items-center justify-center shrink-0">
                              <Icon className="w-4 h-4" strokeWidth={1.5} />
                            </div>
                            <div className="flex-1 space-y-0.5">
                              <p className="text-sm font-semibold text-[#171717]">{pm.title}</p>
                              <p className="text-xs text-[#85817B]">{pm.description}</p>
                            </div>
                          </label>

                          {/* Dynamic Sub-form for Selected Payment Mode */}
                          {isSelected && pm.id === 'upi' && (
                            <div className="px-5 pb-5 pt-1 border-t border-[#E9E1D5] mt-2 space-y-2">
                              <label htmlFor="chk-upi-id" className="block text-xs uppercase tracking-[0.14em] text-[#85817B] font-medium">
                                UPI ID / VPA (Optional in Demo Mode)
                              </label>
                              <input
                                id="chk-upi-id"
                                type="text"
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                                placeholder="e.g. yourname@okhdfcbank"
                                className="w-full sm:w-80 bg-white border border-[#D9D0C2] px-4 py-2.5 text-xs text-[#171717] focus:border-[#171717] focus:outline-none"
                              />
                            </div>
                          )}

                          {isSelected && pm.id === 'card' && (
                            <div className="px-5 pb-5 pt-3 border-t border-[#E9E1D5] mt-2 grid sm:grid-cols-2 gap-3 text-xs">
                              <div className="sm:col-span-2">
                                <label className="block text-[11px] uppercase tracking-[0.14em] text-[#85817B] mb-1 font-medium">
                                  Card Number (Demo)
                                </label>
                                <input
                                  type="text"
                                  maxLength={19}
                                  value={cardNumber}
                                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 '))}
                                  placeholder="4532 0123 4567 8910"
                                  className="w-full bg-white border border-[#D9D0C2] px-3.5 py-2.5 font-mono text-sm text-[#171717] focus:border-[#171717] focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] uppercase tracking-[0.14em] text-[#85817B] mb-1 font-medium">
                                  Valid Thru (MM/YY)
                                </label>
                                <input
                                  type="text"
                                  maxLength={5}
                                  value={cardExpiry}
                                  onChange={(e) => setCardExpiry(e.target.value)}
                                  placeholder="12/28"
                                  className="w-full bg-white border border-[#D9D0C2] px-3.5 py-2.5 font-mono text-sm text-[#171717] focus:border-[#171717] focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] uppercase tracking-[0.14em] text-[#85817B] mb-1 font-medium">
                                  CVV / CVC
                                </label>
                                <input
                                  type="password"
                                  maxLength={4}
                                  value={cardCvv}
                                  onChange={(e) => setCardCvv(e.target.value)}
                                  placeholder="•••"
                                  className="w-full bg-white border border-[#D9D0C2] px-3.5 py-2.5 font-mono text-sm text-[#171717] focus:border-[#171717] focus:outline-none"
                                />
                              </div>
                            </div>
                          )}

                          {isSelected && pm.id === 'netbanking' && (
                            <div className="px-5 pb-5 pt-3 border-t border-[#E9E1D5] mt-2 space-y-2">
                              <label className="block text-[11px] uppercase tracking-[0.14em] text-[#85817B] font-medium">
                                Select Your Bank
                              </label>
                              <select
                                value={selectedBank}
                                onChange={(e) => setSelectedBank(e.target.value)}
                                className="w-full sm:w-80 bg-white border border-[#D9D0C2] px-3.5 py-2.5 text-xs text-[#171717]"
                              >
                                <option value="HDFC Bank">HDFC Bank</option>
                                <option value="ICICI Bank">ICICI Bank</option>
                                <option value="State Bank of India">State Bank of India</option>
                                <option value="Axis Bank">Axis Bank</option>
                                <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                              </select>
                            </div>
                          )}

                          {isSelected && pm.id === 'wallet' && (
                            <div className="px-5 pb-5 pt-3 border-t border-[#E9E1D5] mt-2 space-y-2">
                              <label className="block text-[11px] uppercase tracking-[0.14em] text-[#85817B] font-medium">
                                Select Wallet Provider
                              </label>
                              <select
                                value={selectedWallet}
                                onChange={(e) => setSelectedWallet(e.target.value)}
                                className="w-full sm:w-80 bg-white border border-[#D9D0C2] px-3.5 py-2.5 text-xs text-[#171717]"
                              >
                                <option value="Amazon Pay">Amazon Pay</option>
                                <option value="Mobikwik">Mobikwik</option>
                                <option value="Airtel Money">Airtel Money</option>
                              </select>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-[#E9E1D5]">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="inline-flex items-center gap-2 px-6 py-3.5 border border-[#D9D0C2] text-xs uppercase tracking-[0.14em] text-[#171717] hover:border-[#171717]"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => validateStep4() && setStep(5)}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-[#171717] hover:bg-[#0B0B0B] text-white text-xs uppercase tracking-[0.18em] font-medium transition-colors"
                    >
                      <span>Review Final Order</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </section>
              )}

              {/* STEP 5: Final Order Review Screen */}
              {step === 5 && (
                <section className="bg-white border border-[#E9E1D5] p-6 sm:p-8 space-y-8">
                  <div className="pb-4 border-b border-[#E9E1D5]">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#C5A46D] font-medium">
                      Stage 05
                    </span>
                    <h2 className="font-editorial text-2xl sm:text-3xl text-[#171717]">
                      Review & Authorize Order
                    </h2>
                    <p className="mt-1 text-xs text-[#85817B]">
                      Please verify all dispatch and ledger details before placing your order.
                    </p>
                  </div>

                  {/* Order Spec Snapshot Grid */}
                  <div className="grid sm:grid-cols-3 gap-4 text-xs">
                    {/* Destination Box */}
                    <div className="p-4 bg-[#F8F6F1] border border-[#E9E1D5] space-y-1.5 relative">
                      <div className="flex items-center justify-between text-[#85817B]">
                        <span className="font-mono text-[10px] uppercase tracking-[0.14em]">Destination</span>
                        <button
                          type="button"
                          onClick={() => setStep(2)}
                          className="text-[#C5A46D] hover:underline"
                        >
                          Change
                        </button>
                      </div>
                      <p className="font-semibold text-[#171717]">{recipientName}</p>
                      <p className="text-[#55524E] leading-relaxed">
                        {line1}, {city}, {stateName} – {pincode}
                      </p>
                      <p className="text-[#85817B] pt-1">+91 {recipientPhone}</p>
                    </div>

                    {/* Shipping Method Box */}
                    <div className="p-4 bg-[#F8F6F1] border border-[#E9E1D5] space-y-1.5 relative">
                      <div className="flex items-center justify-between text-[#85817B]">
                        <span className="font-mono text-[10px] uppercase tracking-[0.14em]">Delivery Method</span>
                        <button
                          type="button"
                          onClick={() => setStep(3)}
                          className="text-[#C5A46D] hover:underline"
                        >
                          View
                        </button>
                      </div>
                      <p className="font-semibold text-[#171717]">Standard Delivery</p>
                      <p className="text-[#C5A46D]">{pinService?.estimatedDateText ?? '3–5 Business Days'}</p>
                      <p className="text-xs text-[#85817B]">
                        Delivery is included in the product price.
                      </p>
                    </div>

                    {/* Payment Mode Box */}
                    <div className="p-4 bg-[#F8F6F1] border border-[#E9E1D5] space-y-1.5 relative">
                      <div className="flex items-center justify-between text-[#85817B]">
                        <span className="font-mono text-[10px] uppercase tracking-[0.14em]">Payment</span>
                        <button
                          type="button"
                          onClick={() => setStep(4)}
                          className="text-[#C5A46D] hover:underline"
                        >
                          Change
                        </button>
                      </div>
                      <p className="font-semibold text-[#171717] uppercase">{paymentMethod}</p>
                      <p className="text-[#85817B]">
                        {paymentMethod === 'cod' ? 'Pay upon delivery' : 'Demo Authorization'}
                      </p>
                      <p className="text-[10px] text-[#9A7A45] font-mono">Status: Pending Record</p>
                    </div>
                  </div>

                  {/* Items List in Review */}
                  <div className="space-y-4 pt-2">
                    <h3 className="text-xs uppercase tracking-[0.16em] text-[#85817B] font-medium">
                      Order Items ({cart.length})
                    </h3>
                    <div className="divide-y divide-[#E9E1D5]">
                      {cart.map((item) => {
                        const product = products.find((p) => p.id === item.productId);
                        if (!product) return null;
                        const variant =
                          product.variants.find((v) => v.id === item.variantId) ?? product.variants[0];
                        const unitPrice = product.price + (variant?.priceDelta ?? 0);
                        return (
                          <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <SafeImage
                                src={product.images[0]}
                                alt={product.name}
                                className="w-14 h-18 object-cover bg-[#E9E1D5] border border-[#E9E1D5] shrink-0"
                              />
                              <div className="space-y-0.5">
                                <p className="text-[10px] uppercase tracking-[0.16em] text-[#C5A46D] font-medium">
                                  {product.brandName}
                                </p>
                                <p className="text-sm font-medium text-[#171717]">{product.name}</p>
                                <p className="text-xs text-[#85817B]">
                                  {variant?.colorName}
                                  {variant?.size ? ` · ${variant.size}` : ''} × {item.quantity} · HSN {product.hsnCode} ({product.gstRate}% GST)
                                </p>
                              </div>
                            </div>
                            <span className="font-semibold text-sm tabular-nums text-[#171717]">
                              {formatINR(unitPrice * item.quantity)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Trust Callout */}
                  <div className="p-4 bg-[#FAF7F0] border border-[#C5A46D]/60 text-xs text-[#4A4743] flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-[#C5A46D] shrink-0 mt-0.5" strokeWidth={1.5} />
                    <div className="space-y-1">
                      <p className="font-medium text-[#171717]">
                        Authentic Luxury & Secure Transaction Policy
                      </p>
                      <p className="text-[#55524E] leading-relaxed">
                        Every order includes tamper-evident sealed packaging, complimentary transit insurance, and a comprehensive 15-day return privilege. Razorpay is deferred; this order will be saved in your session with an official demo GST invoice.
                      </p>
                    </div>
                  </div>

                  {/* Review Actions */}
                  <div className="pt-4 flex items-center justify-between border-t border-[#E9E1D5]">
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      className="inline-flex items-center gap-2 px-6 py-3.5 border border-[#D9D0C2] text-xs uppercase tracking-[0.14em] text-[#171717] hover:border-[#171717]"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Payment</span>
                    </button>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={handleConfirmOrder}
                      className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-[#171717] hover:bg-[#0B0B0B] disabled:bg-[#85817B] text-white text-xs uppercase tracking-[0.18em] font-semibold transition-all shadow-sm"
                    >
                      {submitting ? (
                        <span>Processing Order...</span>
                      ) : (
                        <span>PLACE ORDER — {formatINR(liveTotals.total)}</span>
                      )}
                    </button>
                  </div>
                </section>
              )}
            </div>

            {/* RIGHT COLUMN: Sticky Order Summary (~35%) */}
            <aside className="lg:col-span-4 sticky top-24 self-start space-y-6">
              <div className="bg-white border border-[#E9E1D5] p-6 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#E9E1D5]">
                  <h3 className="font-editorial text-2xl text-[#171717]">Order Summary</h3>
                  <span className="text-xs text-[#85817B] tabular-nums">
                    {cart.length} {cart.length === 1 ? 'Piece' : 'Pieces'}
                  </span>
                </div>

                {/* Product Thumbnails List */}
                <ul className="divide-y divide-[#E9E1D5] max-h-72 overflow-y-auto pr-1 space-y-1">
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
                          className="w-14 h-18 object-cover bg-[#E9E1D5] border border-[#E9E1D5] shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] uppercase tracking-[0.14em] text-[#C5A46D] truncate">
                            {product.brandName}
                          </p>
                          <p className="text-xs font-medium text-[#171717] truncate">{product.name}</p>
                          <p className="text-[11px] text-[#85817B] mt-0.5">
                            {variant?.colorName}
                            {variant?.size ? ` · ${variant.size}` : ''} · Qty {item.quantity}
                          </p>
                        </div>
                        <span className="text-xs font-semibold tabular-nums text-[#171717]">
                          {formatINR(unitPrice * item.quantity)}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {/* Coupon Code Entry Form */}
                <div className="pt-4 border-t border-[#E9E1D5] space-y-2">
                  <span className="text-[10px] uppercase tracking-[0.16em] text-[#85817B] font-medium block">
                    Promo / Atelier Privilege Code
                  </span>
                  {appliedCouponCode ? (
                    <div className="flex items-center justify-between p-2.5 bg-[#FAF7F0] border border-[#C5A46D]/60 text-xs">
                      <div className="flex items-center gap-2 text-[#9A7A45] font-medium">
                        <Tag className="w-3.5 h-3.5" />
                        <span>{appliedCouponCode} Applied</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-xs text-[#85817B] hover:text-[#9E2A2B] underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="e.g. AKSHARA10"
                        className="flex-1 bg-[#F8F6F1] border border-[#D9D0C2] px-3 py-2 text-xs uppercase font-mono text-[#171717] focus:border-[#171717] focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#171717] hover:bg-[#0B0B0B] text-white text-xs uppercase tracking-[0.12em] font-medium transition-colors"
                      >
                        Apply
                      </button>
                    </form>
                  )}
                  {couponMessage && (
                    <p
                      className={`text-[11px] leading-tight ${
                        couponMessage.error ? 'text-[#9E2A2B]' : 'text-[#2D6A4F]'
                      }`}
                    >
                      {couponMessage.text}
                    </p>
                  )}
                </div>

                {/* Ledger Breakdown */}
                <dl className="space-y-2.5 pt-4 border-t border-[#E9E1D5] text-xs tabular-nums text-[#55524E]">
                  <div className="flex justify-between">
                    <dt className="text-[#85817B]">Bag Subtotal (MRP/List)</dt>
                    <dd>{formatINR(liveTotals.mrpTotal)}</dd>
                  </div>
                  {liveTotals.productSavings > 0 && (
                    <div className="flex justify-between text-[#2D6A4F]">
                      <dt>Catalog Privilege Savings</dt>
                      <dd>−{formatINR(liveTotals.productSavings)}</dd>
                    </div>
                  )}
                  {liveTotals.couponDiscount > 0 && (
                    <div className="flex justify-between text-[#9A7A45] font-medium">
                      <dt>Privilege Coupon ({appliedCouponCode})</dt>
                      <dd>−{formatINR(liveTotals.couponDiscount)}</dd>
                    </div>
                  )}
                  {liveTotals.codFee > 0 && (
                    <div className="flex justify-between">
                      <dt className="text-[#85817B]">Cash on Delivery Handling</dt>
                      <dd>{formatINR(liveTotals.codFee)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between text-[11px] text-[#85817B] pt-1">
                    <dt>Taxable Value + GST</dt>
                    <dd>
                      {formatINR(liveTotals.taxableValue)} + {formatINR(liveTotals.gstAmount)}
                    </dd>
                  </div>
                  <div className="pt-3 border-t border-[#E9E1D5] flex justify-between text-base font-semibold text-[#171717]">
                    <dt>Total Payable</dt>
                    <dd className="text-[#171717]">{formatINR(liveTotals.total)}</dd>
                  </div>
                  <p className="text-[11px] text-[#85817B] pt-1">
                    Delivery is included in the product price.
                  </p>
                </dl>
              </div>

              {/* Luxury Trust Assurances Card */}
              <div className="bg-[#FAF8F5] border border-[#E9E1D5] p-5 space-y-3.5 text-xs text-[#55524E]">
                <p className="font-editorial text-base text-[#171717] uppercase tracking-wide">
                  The AKSHARA Assurance
                </p>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#C5A46D] shrink-0 mt-0.5" strokeWidth={1.5} />
                    <span>100% Authentic Creations directly from registered master ateliers.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Truck className="w-4 h-4 text-[#C5A46D] shrink-0 mt-0.5" strokeWidth={1.5} />
                    <span>All-inclusive pan-India insured courier delivery on every order.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <RotateCcw className="w-4 h-4 text-[#C5A46D] shrink-0 mt-0.5" strokeWidth={1.5} />
                    <span>15-day return privilege with complimentary doorstep courier pickup.</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </main>
      )}

      {/* 4. Mobile Sticky Bottom Checkout Action Bar */}
      {step < 6 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E9E1D5] p-4 shadow-lg">
          <div className="max-w-md mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.14em] text-[#85817B]">Total Payable</p>
              <p className="text-base font-semibold text-[#171717] tabular-nums">
                {formatINR(liveTotals.total)}
              </p>
            </div>
            {step === 1 && (
              <button
                type="button"
                onClick={() => validateStep1() && setStep(2)}
                className="flex-1 py-3 bg-[#171717] text-white text-xs uppercase tracking-[0.16em] font-medium"
              >
                Proceed to Address
              </button>
            )}
            {step === 2 && (
              <button
                type="button"
                onClick={() => validateStep2() && setStep(3)}
                className="flex-1 py-3 bg-[#171717] text-white text-xs uppercase tracking-[0.16em] font-medium"
              >
                Proceed to Delivery
              </button>
            )}
            {step === 3 && (
              <button
                type="button"
                onClick={() => setStep(4)}
                className="flex-1 py-3 bg-[#171717] text-white text-xs uppercase tracking-[0.16em] font-medium"
              >
                Proceed to Payment
              </button>
            )}
            {step === 4 && (
              <button
                type="button"
                onClick={() => validateStep4() && setStep(5)}
                className="flex-1 py-3 bg-[#171717] text-white text-xs uppercase tracking-[0.16em] font-medium"
              >
                Review Order
              </button>
            )}
            {step === 5 && (
              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirmOrder}
                className="flex-1 py-3 bg-[#171717] disabled:bg-[#85817B] text-white text-xs uppercase tracking-[0.16em] font-semibold"
              >
                {submitting ? 'Placing Order...' : `PLACE ORDER`}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
