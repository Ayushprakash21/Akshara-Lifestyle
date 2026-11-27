import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Edit3,
  HelpCircle,
  Home,
  Info,
  Landmark,
  Lock,
  MapPin,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Tag,
  Trash2,
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

const CHECKOUT_STEPS = [
  { id: 1, number: '01', key: 'BAG', label: 'Bag' },
  { id: 2, number: '02', key: 'ADDRESS', label: 'Address' },
  { id: 3, number: '03', key: 'DELIVERY', label: 'Delivery' },
  { id: 4, number: '04', key: 'PAYMENT', label: 'Payment' },
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
    updateCartQuantity,
    removeFromCart,
    saveAddress,
    deleteAddress,
    placeDemoOrder,
  } = useCommerce();

  useDocumentMeta({ title: 'Secure Checkout | AKSHARA LIFESTYLE' });

  // 4-Step checkout progress
  const [step, setStep] = useState<number>(1);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  // Address fields state
  const defaultAddr = useMemo(
    () => currentUser?.addresses.find((a) => a.isDefault) ?? currentUser?.addresses[0],
    [currentUser?.addresses],
  );

  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    defaultAddr?.id ?? (currentUser?.addresses.length ? currentUser.addresses[0].id : 'new'),
  );
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(!currentUser?.addresses.length);

  // Customer Contact Fields
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email ?? '');
  const [customerGstin, setCustomerGstin] = useState(currentUser?.gstin ?? '');

  // Address Form Fields
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

  // Field-level error messages
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Delivery Method
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethodId>('standard');

  // Payment Method
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

  // Submission protection
  const [errorBanner, setErrorBanner] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Synchronize authenticated user profile changes
  useEffect(() => {
    if (currentUser) {
      if (!customerEmail) setCustomerEmail(currentUser.email);
      if (!customerGstin && currentUser.gstin) setCustomerGstin(currentUser.gstin);
      if (!recipientName && currentUser.name) setRecipientName(currentUser.name);
      if (!recipientPhone && currentUser.phone) setRecipientPhone(currentUser.phone);
    }
  }, [currentUser, customerEmail, customerGstin, recipientName, recipientPhone]);

  // Handle saved address selection
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
    setFieldErrors({});
    setErrorBanner('');
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

  // If COD is selected but became unserviceable, switch to UPI
  useEffect(() => {
    if (paymentMethod === 'cod' && !codAllowed) {
      setPaymentMethod('upi');
    }
  }, [codAllowed, paymentMethod]);

  // Early return: Empty Bag
  if (cart.length === 0 && !confirmedOrder) {
    return (
      <div className="min-h-screen bg-[#F7F4EE] flex flex-col justify-between text-[#171717]">
        <header className="py-6 border-b border-[#E8E1D5] bg-[#F7F4EE]">
          <div className="max-w-[1120px] mx-auto px-4 flex items-center justify-between">
            <Link to="/" className="inline-block">
              <BrandLogo variant="dark" layout="horizontal" mobileResponsive size="sm" />
            </Link>
            <div className="flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] text-[#85817B]">
              <Lock className="w-3.5 h-3.5 text-[#C5A46D]" strokeWidth={1.8} />
              <span>256-Bit Encrypted</span>
            </div>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center px-4 py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-12 text-center shadow-[0_16px_40px_rgba(23,23,23,0.05)] border border-[#E8E1D5] space-y-6"
          >
            <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border border-[#E8E1D5] text-[#C5A46D] flex items-center justify-center mx-auto shadow-inner">
              <ShoppingBag className="w-7 h-7" strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#C5A46D] font-medium">
                AKSHARA LIFESTYLE
              </p>
              <h1 className="font-editorial text-3xl sm:text-4xl text-[#171717]">
                Your Shopping Bag is Empty
              </h1>
              <p className="text-sm text-[#85817B] max-w-sm mx-auto leading-relaxed pt-1">
                Your bag holds no pieces. Explore our curated collections to discover elevated fashion, fine jewellery, botanical beauty, and architectural objects.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#171717] hover:bg-[#0B0B0B] text-[#F7F4EE] text-xs uppercase tracking-[0.18em] font-medium transition-all shadow-md hover:shadow-lg"
              >
                <span>Explore Creations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        </div>

        <footer className="py-6 border-t border-[#E8E1D5] text-center text-xs text-[#85817B]">
          <p>© {new Date().getFullYear()} AKSHARA LIFESTYLE. All rights reserved. Delivery included in product prices.</p>
        </footer>
      </div>
    );
  }

  // Step 1 Validation (Bag has items)
  const validateStep1 = () => {
    if (cart.length === 0) {
      setErrorBanner('Your bag is empty.');
      return false;
    }
    setErrorBanner('');
    return true;
  };

  // Step 2 Validation (Address & Contact details)
  const validateStep2 = () => {
    const errors: Record<string, string> = {};

    if (!recipientName.trim() || recipientName.trim().length < 2) {
      errors.recipientName = 'Please enter the recipient full name.';
    }
    if (!isValidIndianPhone(recipientPhone)) {
      errors.recipientPhone = 'Please enter a valid 10-digit Indian mobile number.';
    }
    if (!customerEmail.trim() || !isValidEmail(customerEmail)) {
      errors.customerEmail = 'Please provide a valid email address for delivery updates and tax invoices.';
    }
    if (customerGstin && !isValidGSTIN(customerGstin)) {
      errors.customerGstin = 'GSTIN format is invalid. Expected 15 characters (e.g. 27AAPFU0939F1ZV).';
    }
    if (!line1.trim() || line1.trim().length < 5) {
      errors.line1 = 'Please specify house / flat / building name and number.';
    }
    if (!city.trim() || city.trim().length < 2) {
      errors.city = 'Please enter city / district.';
    }
    if (!isValidIndianPincode(pincode)) {
      errors.pincode = 'Please enter a valid 6-digit Indian PIN code.';
    } else if (pinService && !pinService.serviceable) {
      errors.pincode = pinService.message || 'Delivery is currently unavailable to this PIN code.';
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setErrorBanner('Please review and correct the highlighted fields before proceeding.');
      return false;
    }

    // Persist new address if user selected checkbox
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

    setErrorBanner('');
    return true;
  };

  // Step 3 Validation (Delivery Method)
  const validateStep3 = () => {
    if (!deliveryMethod) {
      setErrorBanner('Please select a delivery method.');
      return false;
    }
    setErrorBanner('');
    return true;
  };

  // Step 4 Validation (Payment Method)
  const validateStep4 = () => {
    const errors: Record<string, string> = {};

    if (paymentMethod === 'upi' && upiId.trim() && !upiId.includes('@')) {
      errors.upiId = 'Please enter a valid UPI VPA address (e.g. name@okhdfcbank).';
    }
    if (paymentMethod === 'card') {
      const cleanCard = cardNumber.replace(/\s/g, '');
      if (cleanCard.length < 15) {
        errors.cardNumber = 'Please enter a valid 16-digit card number.';
      }
      if (!cardExpiry || !cardExpiry.includes('/')) {
        errors.cardExpiry = 'MM/YY required.';
      }
      if (cardCvv.length < 3) {
        errors.cardCvv = 'CVV required.';
      }
    }
    if (paymentMethod === 'cod' && !codAllowed) {
      setErrorBanner('Cash on Delivery is unavailable for this order value or PIN code.');
      return false;
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setErrorBanner('Please check your payment information.');
      return false;
    }

    setErrorBanner('');
    return true;
  };

  // Step Navigation Check
  const handleStepClick = (targetStep: number) => {
    // Only allow going back to completed steps
    if (targetStep < step) {
      setErrorBanner('');
      setStep(targetStep);
    }
  };

  // Apply Coupon
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

  // Final Order Confirmation
  const handlePlaceOrder = async () => {
    if (submitting) return;
    if (!validateStep4()) return;

    setSubmitting(true);
    setErrorBanner('');

    try {
      const order = await placeDemoOrder({
        customerName: recipientName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: recipientPhone.trim(),
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setErrorBanner('Unable to record order. Please verify your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#171717] pb-24 lg:pb-16 selection:bg-[#C5A46D]/20">
      {/* 1. Centred Brand Header */}
      <header className="border-b border-[#E8E1D5]/80 bg-[#F7F4EE]/90 backdrop-blur-md sticky top-0 z-30 transition-all">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 group focus:outline-none"
            aria-label="Return to AKSHARA LIFESTYLE"
          >
            <BrandLogo variant="dark" layout="horizontal" mobileResponsive size="sm" />
          </Link>

          <div className="flex items-center gap-2 sm:gap-3 text-xs uppercase tracking-[0.16em] text-[#85817B]">
            <div className="w-7 h-7 rounded-full bg-white border border-[#E8E1D5] flex items-center justify-center text-[#C5A46D] shadow-sm">
              <Lock className="w-3.5 h-3.5" strokeWidth={1.8} />
            </div>
            <span className="hidden sm:inline font-nav text-[11px] font-medium tracking-[0.2em]">
              256-Bit Encrypted Checkout
            </span>
          </div>
        </div>
      </header>

      {/* 2. ORDER CONFIRMATION VIEW */}
      {confirmedOrder ? (
        <main className="max-w-[1120px] mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-3xl border border-[#E8E1D5] p-6 sm:p-12 shadow-[0_20px_50px_rgba(23,23,23,0.06)] space-y-10"
          >
            {/* Confirmation Header Badge */}
            <div className="text-center space-y-3 pb-8 border-b border-[#E8E1D5]">
              <div className="w-16 h-16 rounded-full bg-[#171717] text-[#C5A46D] flex items-center justify-center mx-auto shadow-md ring-8 ring-[#C5A46D]/15">
                <Check className="w-8 h-8" strokeWidth={2} />
              </div>
              <p className="text-[11px] font-nav uppercase tracking-[0.26em] text-[#C5A46D] font-medium">
                AKSHARA LIFESTYLE · ORDER RECORDED
              </p>
              <h1 className="font-editorial text-3xl sm:text-5xl text-[#171717]">
                Order Confirmed
              </h1>
              <p className="text-sm text-[#6B665F] max-w-lg mx-auto leading-relaxed">
                Thank you, <strong className="text-[#171717]">{confirmedOrder.customerName}</strong>. Your acquisition is confirmed. A receipt and official GST tax invoice have been dispatched to{' '}
                <strong className="text-[#171717]">{confirmedOrder.customerEmail}</strong>.
              </p>
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#FAF8F5] border border-[#E8E1D5] text-xs font-mono text-[#171717]">
                <span>Order No: <strong>{confirmedOrder.orderNumber}</strong></span>
                <span className="text-[#85817B]">·</span>
                <span>AWB: <strong>{confirmedOrder.shipment.awbNumber}</strong></span>
              </div>
            </div>

            {/* Destination & Logistics Grid */}
            <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
              <div className="bg-[#FAF8F5] rounded-2xl p-6 border border-[#E8E1D5] space-y-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#C5A46D] font-nav font-medium">
                  <MapPin className="w-4 h-4" />
                  <span>Delivery Destination</span>
                </div>
                <div className="text-sm text-[#55524E] space-y-1">
                  <p className="font-semibold text-[#171717]">{confirmedOrder.shippingAddress.fullName}</p>
                  <p>{confirmedOrder.shippingAddress.line1}</p>
                  {confirmedOrder.shippingAddress.line2 && <p>{confirmedOrder.shippingAddress.line2}</p>}
                  {confirmedOrder.shippingAddress.landmark && (
                    <p className="text-xs text-[#85817B]">Near {confirmedOrder.shippingAddress.landmark}</p>
                  )}
                  <p className="text-[#171717] font-medium">
                    {confirmedOrder.shippingAddress.city}, {confirmedOrder.shippingAddress.state} –{' '}
                    <span className="font-mono">{confirmedOrder.shippingAddress.pincode}</span>
                  </p>
                  <p className="text-xs text-[#85817B] pt-1">Contact: +91 {confirmedOrder.customerPhone}</p>
                </div>
              </div>

              <div className="bg-[#FAF8F5] rounded-2xl p-6 border border-[#E8E1D5] space-y-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#C5A46D] font-nav font-medium">
                  <Truck className="w-4 h-4" />
                  <span>Logistics & Billing</span>
                </div>
                <dl className="text-xs space-y-2 text-[#55524E]">
                  <div className="flex justify-between">
                    <dt className="text-[#85817B]">Courier Partner</dt>
                    <dd className="font-medium text-[#171717]">{confirmedOrder.shipment.carrier}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#85817B]">Estimated Arrival</dt>
                    <dd className="font-semibold text-[#171717]">{confirmedOrder.shipment.estimatedDelivery}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#85817B]">Payment Mode</dt>
                    <dd className="font-medium uppercase tracking-[0.08em] text-[#171717]">
                      {confirmedOrder.payment.method} ({confirmedOrder.payment.status.replace('_', ' ')})
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#85817B]">GST Tax Invoice</dt>
                    <dd className="font-mono text-[#C5A46D]">{confirmedOrder.invoiceNumber}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Purchased Items List */}
            <div className="space-y-4 pt-4 border-t border-[#E8E1D5]">
              <h3 className="font-nav text-xs uppercase tracking-[0.2em] text-[#85817B] font-medium">
                Purchased Pieces ({confirmedOrder.items.length})
              </h3>
              <div className="divide-y divide-[#E8E1D5]">
                {confirmedOrder.items.map((item) => (
                  <div key={item.sku} className="py-4 flex items-center justify-between gap-4 text-sm">
                    <div className="flex items-center gap-3.5">
                      <SafeImage
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-18 object-cover rounded-xl bg-[#FAF8F5] border border-[#E8E1D5] shrink-0"
                      />
                      <div>
                        <p className="font-medium text-[#171717]">{item.name}</p>
                        <p className="text-xs text-[#85817B] mt-0.5">
                          {item.colorName}
                          {item.size ? ` · ${item.size}` : ''} · Qty {item.quantity} · HSN {item.hsnCode}
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
              <div className="pt-4 border-t border-[#E8E1D5] space-y-2 text-sm tabular-nums text-[#55524E]">
                <div className="flex justify-between text-[#85817B]">
                  <span>Subtotal</span>
                  <span>{formatINR(confirmedOrder.subtotal)}</span>
                </div>
                {confirmedOrder.couponDiscount > 0 && (
                  <div className="flex justify-between text-[#9A7A45] font-medium">
                    <span>Privilege Discount ({confirmedOrder.couponCode})</span>
                    <span>−{formatINR(confirmedOrder.couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#85817B]">
                  <span>Delivery Charges</span>
                  <span className="text-[#171717] font-medium">Included in product price</span>
                </div>
                <div className="flex justify-between text-[#85817B] text-xs">
                  <span>Included Indian GST</span>
                  <span>{formatINR(confirmedOrder.gstAmount)}</span>
                </div>
                {confirmedOrder.codFee > 0 && (
                  <div className="flex justify-between text-[#85817B]">
                    <span>Doorstep Handling Fee</span>
                    <span>{formatINR(confirmedOrder.codFee)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-semibold text-[#171717] pt-3 border-t border-[#E8E1D5]">
                  <span>Total Amount Paid / Payable</span>
                  <span>{formatINR(confirmedOrder.total)}</span>
                </div>
              </div>
            </div>

            {/* Confirmation CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-[#E8E1D5]">
              <Link
                to="/account"
                className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#171717] hover:bg-[#0B0B0B] text-white text-xs uppercase tracking-[0.18em] font-medium transition-all shadow-md"
              >
                <span>Track in Customer Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/shop"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full border border-[#171717] text-[#171717] hover:bg-[#171717] hover:text-white text-xs uppercase tracking-[0.18em] font-medium transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </motion.div>
        </main>
      ) : (
        /* 3. MAIN CENTRED CHECKOUT COMPOSITION (~1050-1150px) */
        <main className="max-w-[1120px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
          {/* Centred Title & Brand Identity */}
          <div className="text-center space-y-2">
            <p className="font-nav text-[11px] uppercase tracking-[0.25em] text-[#C5A46D] font-medium">
              AKSHARA LIFESTYLE · EVERYDAY, ELEVATED.
            </p>
            <h1 className="font-editorial text-3xl sm:text-4xl text-[#171717]">
              Atelier Checkout
            </h1>
          </div>

          {/* 4-STEP BUBBLE PROGRESS INDICATOR */}
          <div className="max-w-2xl mx-auto px-2">
            <div className="relative flex items-center justify-between">
              {/* Connecting Line behind bubbles */}
              <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-[2px] bg-[#E8E1D5] -z-0">
                <div
                  className="h-full bg-[#171717] transition-all duration-500 ease-out"
                  style={{ width: `${((step - 1) / (CHECKOUT_STEPS.length - 1)) * 100}%` }}
                />
              </div>

              {CHECKOUT_STEPS.map((s) => {
                const isCurrent = step === s.id;
                const isDone = step > s.id;
                const isClickable = isDone;

                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleStepClick(s.id)}
                    disabled={!isClickable}
                    className={`relative z-10 flex flex-col items-center group transition-all focus:outline-none ${
                      isClickable ? 'cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    {/* Circular Bubble */}
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-mono text-xs font-semibold transition-all duration-300 shadow-sm ${
                        isCurrent
                          ? 'bg-[#171717] text-[#F7F4EE] ring-4 ring-[#C5A46D]/25 scale-105'
                          : isDone
                            ? 'bg-[#171717] text-[#C5A46D] group-hover:scale-105'
                            : 'bg-[#EDE7DC] text-[#8C857B] border border-[#DDD5C7]'
                      }`}
                    >
                      {isDone ? (
                        <Check className="w-5 h-5 stroke-[2.5]" />
                      ) : (
                        <span>{s.number}</span>
                      )}
                    </div>

                    {/* Step Label */}
                    <span
                      className={`mt-2 font-nav text-[10px] sm:text-[11px] uppercase tracking-[0.18em] font-medium transition-colors ${
                        isCurrent
                          ? 'text-[#171717] font-semibold'
                          : isDone
                            ? 'text-[#6B665F] group-hover:text-[#171717]'
                            : 'text-[#A09A90]'
                      }`}
                    >
                      {s.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Validation Banner (if any) */}
          <AnimatePresence>
            {errorBanner && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="max-w-2xl mx-auto p-4 rounded-2xl bg-[#FDF2F2] border border-[#E6B8B8] text-xs text-[#9E2A2B] flex items-center justify-between gap-3 shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorBanner}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorBanner('')}
                  className="text-[#9E2A2B] hover:opacity-70 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Collapsible Summary Pill */}
          <div className="lg:hidden">
            <button
              type="button"
              onClick={() => setMobileSummaryOpen(!mobileSummaryOpen)}
              className="w-full bg-white rounded-2xl p-4 border border-[#E8E1D5] shadow-sm flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#FAF8F5] border border-[#E8E1D5] flex items-center justify-center text-[#C5A46D]">
                  <ShoppingBag className="w-3.5 h-3.5" />
                </div>
                <span className="font-nav font-medium uppercase tracking-[0.12em] text-[#171717]">
                  {mobileSummaryOpen ? 'Hide' : 'Show'} Order Summary ({cart.length}{' '}
                  {cart.length === 1 ? 'item' : 'items'})
                </span>
                {mobileSummaryOpen ? (
                  <ChevronUp className="w-3.5 h-3.5 text-[#85817B]" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-[#85817B]" />
                )}
              </div>
              <span className="font-semibold text-sm tabular-nums text-[#171717]">
                {formatINR(liveTotals.total)}
              </span>
            </button>

            <AnimatePresence>
              {mobileSummaryOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden bg-white mt-2 rounded-2xl border border-[#E8E1D5] p-4 space-y-4 shadow-sm"
                >
                  <ul className="divide-y divide-[#E8E1D5] max-h-56 overflow-y-auto">
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
                            className="w-10 h-14 object-cover rounded-lg bg-[#FAF8F5] border border-[#E8E1D5] shrink-0"
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

                  <dl className="space-y-1.5 text-xs border-t border-[#E8E1D5] pt-3 tabular-nums">
                    <div className="flex justify-between text-[#85817B]">
                      <span>Subtotal</span>
                      <span>{formatINR(liveTotals.subtotal)}</span>
                    </div>
                    {liveTotals.couponDiscount > 0 && (
                      <div className="flex justify-between text-[#9A7A45] font-medium">
                        <span>Privilege Discount ({appliedCouponCode})</span>
                        <span>−{formatINR(liveTotals.couponDiscount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[#85817B]">
                      <span>Delivery</span>
                      <span className="text-[#171717] font-medium">Included in product price</span>
                    </div>
                    <div className="flex justify-between font-semibold text-sm pt-2 text-[#171717] border-t border-[#E8E1D5]">
                      <span>Total Amount</span>
                      <span>{formatINR(liveTotals.total)}</span>
                    </div>
                  </dl>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CENTRED CHECKOUT FLOATING CARD (Main 2-Column Balanced Composition) */}
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* LEFT / PRIMARY STAGE PANEL (7 Cols) */}
            <div className="lg:col-span-7">
              <AnimatePresence mode="wait">
                {/* 01 — STEP 1: BAG */}
                {step === 1 && (
                  <motion.div
                    key="step-1-bag"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-3xl border border-[#E8E1D5] p-4 sm:p-8 shadow-[0_16px_40px_rgba(23,23,23,0.04)] space-y-6 overflow-hidden min-w-0"
                  >
                    <div className="flex items-center justify-between pb-4 border-b border-[#E8E1D5]">
                      <div>
                        <span className="font-nav text-[10px] uppercase tracking-[0.22em] text-[#C5A46D] font-medium">
                          Step 01
                        </span>
                        <h2 className="font-editorial text-2xl sm:text-3xl text-[#171717]">
                          Review Selected Pieces
                        </h2>
                      </div>
                      <span className="text-xs text-[#85817B] font-mono">
                        {cart.length} {cart.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>

                    {/* Pieces List */}
                    <div className="divide-y divide-[#E8E1D5]">
                      {cart.map((item) => {
                        const product = products.find((p) => p.id === item.productId);
                        if (!product) return null;
                        const variant =
                          product.variants.find((v) => v.id === item.variantId) ?? product.variants[0];
                        const unitPrice = product.price + (variant?.priceDelta ?? 0);

                        return (
                          <div key={item.id} className="py-4 first:pt-0 flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <SafeImage
                                src={product.images[0]}
                                alt={product.name}
                                className="w-16 h-20 object-cover rounded-xl bg-[#FAF8F5] border border-[#E8E1D5] shrink-0"
                              />
                              <div className="space-y-1">
                                <p className="font-nav text-[10px] uppercase tracking-[0.16em] text-[#C5A46D] font-medium">
                                  {product.brandName}
                                </p>
                                <p className="font-medium text-sm text-[#171717]">{product.name}</p>
                                <p className="text-xs text-[#85817B]">
                                  {variant?.colorName}
                                  {variant?.size ? ` · ${variant.size}` : ''}
                                </p>
                                <p className="text-xs font-semibold text-[#171717] tabular-nums pt-1">
                                  {formatINR(unitPrice)}
                                </p>
                              </div>
                            </div>

                            {/* Quantity Controls & Remove */}
                            <div className="flex flex-col items-end gap-2">
                              <div className="flex items-center rounded-full bg-[#FAF8F5] border border-[#E8E1D5] p-0.5">
                                <button
                                  type="button"
                                  onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                  className="w-7 h-7 rounded-full flex items-center justify-center text-[#171717] hover:bg-white transition-colors"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-8 text-center text-xs font-semibold font-mono text-[#171717]">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                  className="w-7 h-7 rounded-full flex items-center justify-center text-[#171717] hover:bg-white transition-colors"
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => removeFromCart(item.id)}
                                className="text-[11px] text-[#85817B] hover:text-[#9E2A2B] flex items-center gap-1 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Step 1 Action Button */}
                    <div className="pt-4 border-t border-[#E8E1D5] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <Link
                        to="/shop"
                        className="inline-flex items-center justify-center gap-2 text-xs uppercase tracking-[0.14em] text-[#85817B] hover:text-[#171717] font-nav font-medium py-3 sm:py-0"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Continue Shopping</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => validateStep1() && setStep(2)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 sm:py-4 rounded-full bg-[#171717] hover:bg-[#0B0B0B] text-white text-xs uppercase tracking-[0.18em] font-medium transition-all shadow-md hover:shadow-lg"
                      >
                        <span>Continue to Address</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* 02 — STEP 2: ADDRESS */}
                {step === 2 && (
                  <motion.div
                    key="step-2-address"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-3xl border border-[#E8E1D5] p-4 sm:p-8 shadow-[0_16px_40px_rgba(23,23,23,0.04)] space-y-6 overflow-hidden min-w-0"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E8E1D5]">
                      <div>
                        <span className="font-nav text-[10px] uppercase tracking-[0.22em] text-[#C5A46D] font-medium">
                          Step 02
                        </span>
                        <h2 className="font-editorial text-2xl sm:text-3xl text-[#171717]">
                          WHERE SHOULD WE DELIVER?
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
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#C5A46D] text-xs font-nav font-medium text-[#171717] hover:bg-[#FAF8F5] transition-all self-start sm:self-auto"
                        >
                          <Plus className="w-3.5 h-3.5 text-[#C5A46D]" />
                          <span>{isAddingNewAddress ? 'Select Saved Address' : 'Add New Address'}</span>
                        </button>
                      )}
                    </div>

                    {/* BUBBLE-STYLE SAVED ADDRESS SELECTION */}
                    {currentUser && currentUser.addresses.length > 0 && !isAddingNewAddress && (
                      <div className="space-y-4">
                        <p className="font-nav text-xs uppercase tracking-[0.14em] text-[#85817B]">
                          Select from your saved addresses:
                        </p>
                        <div className="grid sm:grid-cols-2 gap-4">
                          {currentUser.addresses.map((addr) => {
                            const isSelected = selectedAddressId === addr.id;
                            return (
                              <div
                                key={addr.id}
                                onClick={() => handleSelectSavedAddress(addr)}
                                className={`rounded-2xl p-5 border-2 transition-all cursor-pointer relative space-y-2.5 text-xs ${
                                  isSelected
                                    ? 'border-[#171717] bg-[#FAF8F5] shadow-sm'
                                    : 'border-[#E8E1D5] bg-white hover:border-[#85817B]'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#171717] text-white text-[9px] font-nav uppercase tracking-[0.14em]">
                                    {addr.label}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    {isSelected && (
                                      <span className="w-6 h-6 rounded-full bg-[#171717] text-[#C5A46D] flex items-center justify-center">
                                        <Check className="w-3.5 h-3.5" />
                                      </span>
                                    )}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteAddress(addr.id);
                                      }}
                                      className="text-[#85817B] hover:text-[#9E2A2B] p-1"
                                      title="Delete address"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
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

                          {/* + ADD NEW ADDRESS ROUNDED BUBBLE */}
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingNewAddress(true);
                              setSelectedAddressId('new');
                              setLine1('');
                              setLine2('');
                              setLandmark('');
                              setCity('');
                              setPincode('');
                            }}
                            className="rounded-2xl p-6 border-2 border-dashed border-[#D9D0C2] hover:border-[#171717] bg-[#FAF8F5]/50 hover:bg-[#FAF8F5] transition-all flex flex-col items-center justify-center gap-2 text-center text-xs font-nav font-medium text-[#171717] min-h-[140px]"
                          >
                            <div className="w-10 h-10 rounded-full bg-white border border-[#E8E1D5] flex items-center justify-center text-[#C5A46D] shadow-sm">
                              <Plus className="w-5 h-5" />
                            </div>
                            <span className="tracking-[0.14em] uppercase font-semibold">+ ADD NEW ADDRESS</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ADDRESS ENTRY FORM */}
                    {(isAddingNewAddress || !currentUser?.addresses.length) && (
                      <div className="space-y-4 pt-1">
                        <div className="grid sm:grid-cols-2 gap-4">
                          {/* Recipient Full Name */}
                          <div>
                            <label
                              htmlFor="chk-recip-name"
                              className="block font-nav text-xs uppercase tracking-[0.14em] text-[#6B665F] mb-1.5 font-medium"
                            >
                              Recipient Full Name *
                            </label>
                            <input
                              id="chk-recip-name"
                              type="text"
                              value={recipientName}
                              onChange={(e) => {
                                setRecipientName(e.target.value);
                                if (fieldErrors.recipientName) setFieldErrors({ ...fieldErrors, recipientName: '' });
                              }}
                              placeholder="e.g. Meera Deshmukh"
                              className={`w-full bg-[#FAF8F5] rounded-xl border px-4 py-3 text-sm text-[#171717] transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C5A46D]/30 ${
                                fieldErrors.recipientName ? 'border-[#E6B8B8] bg-[#FDF2F2]' : 'border-[#D9D0C2] focus:border-[#171717]'
                              }`}
                            />
                            {fieldErrors.recipientName && (
                              <p className="mt-1 text-xs text-[#9E2A2B]">{fieldErrors.recipientName}</p>
                            )}
                          </div>

                          {/* Delivery Mobile */}
                          <div>
                            <label
                              htmlFor="chk-recip-phone"
                              className="block font-nav text-xs uppercase tracking-[0.14em] text-[#6B665F] mb-1.5 font-medium"
                            >
                              Mobile Number (with +91) *
                            </label>
                            <div className="flex">
                              <span className="inline-flex items-center px-3.5 bg-[#EDE7DC] border border-r-0 border-[#D9D0C2] rounded-l-xl text-xs font-mono text-[#55524E]">
                                +91
                              </span>
                              <input
                                id="chk-recip-phone"
                                type="tel"
                                inputMode="numeric"
                                maxLength={10}
                                value={recipientPhone}
                                onChange={(e) => {
                                  setRecipientPhone(e.target.value.replace(/\D/g, ''));
                                  if (fieldErrors.recipientPhone) setFieldErrors({ ...fieldErrors, recipientPhone: '' });
                                }}
                                placeholder="9876543210"
                                className={`flex-1 bg-[#FAF8F5] rounded-r-xl border px-4 py-3 text-sm text-[#171717] font-mono transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C5A46D]/30 ${
                                  fieldErrors.recipientPhone ? 'border-[#E6B8B8] bg-[#FDF2F2]' : 'border-[#D9D0C2] focus:border-[#171717]'
                                }`}
                              />
                            </div>
                            {fieldErrors.recipientPhone && (
                              <p className="mt-1 text-xs text-[#9E2A2B]">{fieldErrors.recipientPhone}</p>
                            )}
                          </div>

                          {/* Email for updates */}
                          <div className="sm:col-span-2">
                            <label
                              htmlFor="chk-cust-email"
                              className="block font-nav text-xs uppercase tracking-[0.14em] text-[#6B665F] mb-1.5 font-medium"
                            >
                              Email for Order Updates & Tax Invoices *
                            </label>
                            <input
                              id="chk-cust-email"
                              type="email"
                              value={customerEmail}
                              onChange={(e) => {
                                setCustomerEmail(e.target.value);
                                if (fieldErrors.customerEmail) setFieldErrors({ ...fieldErrors, customerEmail: '' });
                              }}
                              placeholder="you@domain.com"
                              className={`w-full bg-[#FAF8F5] rounded-xl border px-4 py-3 text-sm text-[#171717] transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C5A46D]/30 ${
                                fieldErrors.customerEmail ? 'border-[#E6B8B8] bg-[#FDF2F2]' : 'border-[#D9D0C2] focus:border-[#171717]'
                              }`}
                            />
                            {fieldErrors.customerEmail && (
                              <p className="mt-1 text-xs text-[#9E2A2B]">{fieldErrors.customerEmail}</p>
                            )}
                          </div>

                          {/* House / Flat / Building */}
                          <div className="sm:col-span-2">
                            <label
                              htmlFor="chk-line1"
                              className="block font-nav text-xs uppercase tracking-[0.14em] text-[#6B665F] mb-1.5 font-medium"
                            >
                              House / Flat / Building *
                            </label>
                            <input
                              id="chk-line1"
                              type="text"
                              value={line1}
                              onChange={(e) => {
                                setLine1(e.target.value);
                                if (fieldErrors.line1) setFieldErrors({ ...fieldErrors, line1: '' });
                              }}
                              placeholder="e.g. Flat 402, Signature Towers, Block B"
                              className={`w-full bg-[#FAF8F5] rounded-xl border px-4 py-3 text-sm text-[#171717] transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C5A46D]/30 ${
                                fieldErrors.line1 ? 'border-[#E6B8B8] bg-[#FDF2F2]' : 'border-[#D9D0C2] focus:border-[#171717]'
                              }`}
                            />
                            {fieldErrors.line1 && (
                              <p className="mt-1 text-xs text-[#9E2A2B]">{fieldErrors.line1}</p>
                            )}
                          </div>

                          {/* Street / Area */}
                          <div>
                            <label
                              htmlFor="chk-line2"
                              className="block font-nav text-xs uppercase tracking-[0.14em] text-[#6B665F] mb-1.5 font-medium"
                            >
                              Street / Area
                            </label>
                            <input
                              id="chk-line2"
                              type="text"
                              value={line2}
                              onChange={(e) => setLine2(e.target.value)}
                              placeholder="e.g. Linking Road, Bandra West"
                              className="w-full bg-[#FAF8F5] rounded-xl border border-[#D9D0C2] px-4 py-3 text-sm text-[#171717] transition-all focus:bg-white focus:border-[#171717] focus:outline-none focus:ring-2 focus:ring-[#C5A46D]/30"
                            />
                          </div>

                          {/* Landmark */}
                          <div>
                            <label
                              htmlFor="chk-landmark"
                              className="block font-nav text-xs uppercase tracking-[0.14em] text-[#6B665F] mb-1.5 font-medium"
                            >
                              Landmark (Optional)
                            </label>
                            <input
                              id="chk-landmark"
                              type="text"
                              value={landmark}
                              onChange={(e) => setLandmark(e.target.value)}
                              placeholder="e.g. Opposite Nature's Basket"
                              className="w-full bg-[#FAF8F5] rounded-xl border border-[#D9D0C2] px-4 py-3 text-sm text-[#171717] transition-all focus:bg-white focus:border-[#171717] focus:outline-none focus:ring-2 focus:ring-[#C5A46D]/30"
                            />
                          </div>

                          {/* PIN Code */}
                          <div>
                            <label
                              htmlFor="chk-pincode"
                              className="block font-nav text-xs uppercase tracking-[0.14em] text-[#6B665F] mb-1.5 font-medium"
                            >
                              PIN Code (6 digits) *
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
                                if (fieldErrors.pincode) setFieldErrors({ ...fieldErrors, pincode: '' });
                              }}
                              placeholder="400050"
                              className={`w-full bg-[#FAF8F5] rounded-xl border px-4 py-3 text-sm text-[#171717] font-mono transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C5A46D]/30 ${
                                fieldErrors.pincode ? 'border-[#E6B8B8] bg-[#FDF2F2]' : 'border-[#D9D0C2] focus:border-[#171717]'
                              }`}
                            />
                            {fieldErrors.pincode && (
                              <p className="mt-1 text-xs text-[#9E2A2B]">{fieldErrors.pincode}</p>
                            )}
                          </div>

                          {/* City / District */}
                          <div>
                            <label
                              htmlFor="chk-city"
                              className="block font-nav text-xs uppercase tracking-[0.14em] text-[#6B665F] mb-1.5 font-medium"
                            >
                              City / District *
                            </label>
                            <input
                              id="chk-city"
                              type="text"
                              value={city}
                              onChange={(e) => {
                                setCity(e.target.value);
                                if (fieldErrors.city) setFieldErrors({ ...fieldErrors, city: '' });
                              }}
                              placeholder="Mumbai"
                              className={`w-full bg-[#FAF8F5] rounded-xl border px-4 py-3 text-sm text-[#171717] transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C5A46D]/30 ${
                                fieldErrors.city ? 'border-[#E6B8B8] bg-[#FDF2F2]' : 'border-[#D9D0C2] focus:border-[#171717]'
                              }`}
                            />
                            {fieldErrors.city && (
                              <p className="mt-1 text-xs text-[#9E2A2B]">{fieldErrors.city}</p>
                            )}
                          </div>

                          {/* State */}
                          <div>
                            <label
                              htmlFor="chk-state"
                              className="block font-nav text-xs uppercase tracking-[0.14em] text-[#6B665F] mb-1.5 font-medium"
                            >
                              State *
                            </label>
                            <select
                              id="chk-state"
                              value={stateName}
                              onChange={(e) => setStateName(e.target.value)}
                              className="w-full bg-[#FAF8F5] rounded-xl border border-[#D9D0C2] px-4 py-3 text-sm text-[#171717] transition-all focus:bg-white focus:border-[#171717] focus:outline-none focus:ring-2 focus:ring-[#C5A46D]/30"
                            >
                              {INDIAN_STATES.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Address Type Bubble Pills */}
                          <div>
                            <label className="block font-nav text-xs uppercase tracking-[0.14em] text-[#6B665F] mb-1.5 font-medium">
                              Address Type *
                            </label>
                            <div className="flex gap-2">
                              {(['Home', 'Work', 'Other'] as const).map((type) => (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => setAddressLabel(type)}
                                  className={`flex-1 py-3 rounded-xl border text-xs font-nav uppercase tracking-[0.12em] font-medium transition-all ${
                                    addressLabel === type
                                      ? 'border-[#171717] bg-[#171717] text-white shadow-sm'
                                      : 'border-[#D9D0C2] bg-[#FAF8F5] text-[#55524E] hover:border-[#171717]'
                                  }`}
                                >
                                  {type}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Optional GSTIN */}
                          <div className="sm:col-span-2 pt-1">
                            <label
                              htmlFor="chk-gstin"
                              className="block font-nav text-xs uppercase tracking-[0.14em] text-[#6B665F] mb-1.5 font-medium"
                            >
                              Business GSTIN (Optional for B2B Input Tax Credit)
                            </label>
                            <input
                              id="chk-gstin"
                              type="text"
                              maxLength={15}
                              value={customerGstin}
                              onChange={(e) => setCustomerGstin(e.target.value.toUpperCase())}
                              placeholder="e.g. 27AAPFU0939F1ZV"
                              className="w-full sm:w-80 bg-[#FAF8F5] rounded-xl border border-[#D9D0C2] px-4 py-2.5 text-xs font-mono uppercase text-[#171717] transition-all focus:bg-white focus:border-[#171717] focus:outline-none"
                            />
                            {fieldErrors.customerGstin && (
                              <p className="mt-1 text-xs text-[#9E2A2B]">{fieldErrors.customerGstin}</p>
                            )}
                          </div>
                        </div>

                        {/* PIN Code Serviceability Banner */}
                        {pinService && (
                          <div
                            className={`p-4 rounded-2xl border text-xs leading-relaxed flex items-center gap-3 ${
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

                        {/* Save to Profile options */}
                        {currentUser && (
                          <div className="pt-2 space-y-2 text-xs text-[#55524E]">
                            <label className="flex items-center gap-2.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={saveToAccount}
                                onChange={(e) => setSaveToAccount(e.target.checked)}
                                className="accent-[#171717] w-4 h-4 rounded"
                              />
                              <span>Save this address to my AKSHARA customer account</span>
                            </label>
                            <label className="flex items-center gap-2.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isDefaultAddress}
                                onChange={(e) => setIsDefaultAddress(e.target.checked)}
                                className="accent-[#171717] w-4 h-4 rounded"
                              />
                              <span>Set as my primary delivery address</span>
                            </label>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 2 Actions */}
                    <div className="pt-4 border-t border-[#E8E1D5] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 sm:py-3.5 rounded-full border border-[#D9D0C2] text-xs font-nav uppercase tracking-[0.14em] text-[#171717] hover:border-[#171717] transition-all"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => validateStep2() && setStep(3)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 sm:py-4 rounded-full bg-[#171717] hover:bg-[#0B0B0B] text-white text-xs uppercase tracking-[0.18em] font-medium transition-all shadow-md hover:shadow-lg"
                      >
                        <span>Continue to Delivery</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* 03 — STEP 3: DELIVERY */}
                {step === 3 && (
                  <motion.div
                    key="step-3-delivery"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-3xl border border-[#E8E1D5] p-4 sm:p-8 shadow-[0_16px_40px_rgba(23,23,23,0.04)] space-y-6 overflow-hidden min-w-0"
                  >
                    <div className="pb-4 border-b border-[#E8E1D5]">
                      <span className="font-nav text-[10px] uppercase tracking-[0.22em] text-[#C5A46D] font-medium">
                        Step 03
                      </span>
                      <h2 className="font-editorial text-2xl sm:text-3xl text-[#171717]">
                        SELECT DELIVERY METHOD
                      </h2>
                      <p className="mt-1 text-xs text-[#85817B]">
                        All product prices include all-inclusive pan-India insured courier delivery.
                      </p>
                    </div>

                    {/* Delivery Option Bubble Card */}
                    <div className="space-y-4">
                      <div
                        onClick={() => setDeliveryMethod('standard')}
                        className="rounded-2xl p-5 border-2 border-[#171717] bg-[#FAF8F5] shadow-sm flex items-start gap-4 cursor-pointer relative"
                      >
                        <div className="mt-0.5 w-6 h-6 rounded-full bg-[#171717] text-[#C5A46D] flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>

                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-[#171717]">Standard Delivery</p>
                            <span className="font-nav text-[11px] font-semibold text-[#2D6A4F] bg-[#EAF2ED] px-2.5 py-0.5 rounded-full">
                              INCLUDED
                            </span>
                          </div>
                          <p className="text-xs text-[#C5A46D] font-medium">
                            Estimated Arrival: {pinService?.estimatedDateText ?? '3–5 Business Days'}
                          </p>
                          <p className="text-xs text-[#6B665F] leading-relaxed pt-1">
                            Dispatched via BlueDart Ground / Delhivery Surface with reinforced packaging and complete transit insurance.
                          </p>
                          <p className="text-xs font-medium text-[#171717] pt-1">
                            Delivery is included in the product price.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Trust Highlights */}
                    <div className="rounded-2xl p-4 bg-[#FAF8F5] border border-[#E8E1D5] flex items-center gap-3 text-xs text-[#6B665F]">
                      <ShieldCheck className="w-5 h-5 text-[#C5A46D] shrink-0" />
                      <span>Every shipment is packed under surveillance with security tamper-evident seals.</span>
                    </div>

                    {/* Step 3 Actions */}
                    <div className="pt-4 border-t border-[#E8E1D5] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 sm:py-3.5 rounded-full border border-[#D9D0C2] text-xs font-nav uppercase tracking-[0.14em] text-[#171717] hover:border-[#171717] transition-all"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => validateStep3() && setStep(4)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 sm:py-4 rounded-full bg-[#171717] hover:bg-[#0B0B0B] text-white text-xs uppercase tracking-[0.18em] font-medium transition-all shadow-md hover:shadow-lg"
                      >
                        <span>Continue to Payment</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* 04 — STEP 4: PAYMENT */}
                {step === 4 && (
                  <motion.div
                    key="step-4-payment"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-3xl border border-[#E8E1D5] p-4 sm:p-8 shadow-[0_16px_40px_rgba(23,23,23,0.04)] space-y-6 overflow-hidden min-w-0"
                  >
                    <div className="pb-4 border-b border-[#E8E1D5]">
                      <span className="font-nav text-[10px] uppercase tracking-[0.22em] text-[#C5A46D] font-medium">
                        Step 04
                      </span>
                      <h2 className="font-editorial text-2xl sm:text-3xl text-[#171717]">
                        SELECT PAYMENT METHOD
                      </h2>
                      <p className="mt-1 text-xs text-[#85817B]">
                        Razorpay India gateway demo simulation. Live cards are not charged.
                      </p>
                    </div>

                    {/* Selectable Payment Method Bubbles */}
                    <div className="space-y-3">
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
                          description: 'Encrypted domestic & international card authorization.',
                          icon: CreditCard,
                          enabled: paymentConfig.cardsEnabled,
                        },
                        {
                          id: 'netbanking' as const,
                          title: 'Net Banking (50+ Scheduled Indian Banks)',
                          description: 'Direct banking authorization via your financial institution portal.',
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
                          title: `Cash on Delivery (+${formatINR(shippingConfig.codFee)} handling fee)`,
                          description: codAllowed
                            ? `Pay via cash or UPI QR at doorstep upon verification (eligible up to ${formatINR(shippingConfig.codMaxOrderValue)}).`
                            : 'Unavailable for this order value or PIN code.',
                          icon: Truck,
                          enabled: codAllowed,
                        },
                      ].map((pm) => {
                        const Icon = pm.icon;
                        const isSelected = paymentMethod === pm.id;

                        return (
                          <div
                            key={pm.id}
                            onClick={() => pm.enabled && setPaymentMethod(pm.id)}
                            className={`rounded-2xl border-2 transition-all overflow-hidden ${
                              !pm.enabled
                                ? 'opacity-40 border-[#E8E1D5] bg-[#FAF8F5] cursor-not-allowed'
                                : isSelected
                                  ? 'border-[#171717] bg-[#FAF8F5] shadow-sm'
                                  : 'border-[#E8E1D5] bg-white hover:border-[#85817B] cursor-pointer'
                            }`}
                          >
                            <div className="p-4 sm:p-5 flex items-start gap-4">
                              <div
                                className={`w-6 h-6 rounded-full mt-0.5 flex items-center justify-center transition-all ${
                                  isSelected
                                    ? 'bg-[#171717] text-[#C5A46D]'
                                    : 'border border-[#D9D0C2] bg-white'
                                }`}
                              >
                                {isSelected && <Check className="w-3.5 h-3.5" />}
                              </div>

                              <div className="w-8 h-8 rounded-full bg-white border border-[#E8E1D5] text-[#C5A46D] flex items-center justify-center shrink-0">
                                <Icon className="w-4 h-4" strokeWidth={1.5} />
                              </div>

                              <div className="flex-1 space-y-0.5">
                                <p className="text-sm font-semibold text-[#171717]">{pm.title}</p>
                                <p className="text-xs text-[#85817B] leading-relaxed">{pm.description}</p>
                              </div>
                            </div>

                            {/* Sub-form for selected method */}
                            {isSelected && pm.id === 'upi' && (
                              <div className="px-5 pb-5 pt-1 border-t border-[#E8E1D5] mt-1 space-y-2">
                                <label
                                  htmlFor="chk-upi-id"
                                  className="block font-nav text-xs uppercase tracking-[0.14em] text-[#6B665F] font-medium"
                                >
                                  UPI ID / VPA (Optional for demo simulation)
                                </label>
                                <input
                                  id="chk-upi-id"
                                  type="text"
                                  value={upiId}
                                  onChange={(e) => setUpiId(e.target.value)}
                                  placeholder="e.g. yourname@okhdfcbank"
                                  className="w-full sm:w-80 bg-white rounded-xl border border-[#D9D0C2] px-4 py-2.5 text-xs text-[#171717] focus:border-[#171717] focus:outline-none"
                                />
                                {fieldErrors.upiId && (
                                  <p className="text-xs text-[#9E2A2B]">{fieldErrors.upiId}</p>
                                )}
                              </div>
                            )}

                            {isSelected && pm.id === 'card' && (
                              <div className="px-5 pb-5 pt-3 border-t border-[#E8E1D5] mt-1 grid sm:grid-cols-2 gap-3 text-xs">
                                <div className="sm:col-span-2">
                                  <label className="block font-nav text-[11px] uppercase tracking-[0.14em] text-[#6B665F] mb-1 font-medium">
                                    Card Number (Demo)
                                  </label>
                                  <input
                                    type="text"
                                    maxLength={19}
                                    value={cardNumber}
                                    onChange={(e) =>
                                      setCardNumber(
                                        e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 '),
                                      )
                                    }
                                    placeholder="4532 0123 4567 8910"
                                    className="w-full bg-white rounded-xl border border-[#D9D0C2] px-3.5 py-2.5 font-mono text-sm text-[#171717] focus:border-[#171717] focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block font-nav text-[11px] uppercase tracking-[0.14em] text-[#6B665F] mb-1 font-medium">
                                    Valid Thru (MM/YY)
                                  </label>
                                  <input
                                    type="text"
                                    maxLength={5}
                                    value={cardExpiry}
                                    onChange={(e) => setCardExpiry(e.target.value)}
                                    placeholder="12/28"
                                    className="w-full bg-white rounded-xl border border-[#D9D0C2] px-3.5 py-2.5 font-mono text-sm text-[#171717] focus:border-[#171717] focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block font-nav text-[11px] uppercase tracking-[0.14em] text-[#6B665F] mb-1 font-medium">
                                    CVV
                                  </label>
                                  <input
                                    type="password"
                                    maxLength={4}
                                    value={cardCvv}
                                    onChange={(e) => setCardCvv(e.target.value)}
                                    placeholder="•••"
                                    className="w-full bg-white rounded-xl border border-[#D9D0C2] px-3.5 py-2.5 font-mono text-sm text-[#171717] focus:border-[#171717] focus:outline-none"
                                  />
                                </div>
                              </div>
                            )}

                            {isSelected && pm.id === 'netbanking' && (
                              <div className="px-5 pb-5 pt-3 border-t border-[#E8E1D5] mt-1 space-y-2">
                                <label className="block font-nav text-[11px] uppercase tracking-[0.14em] text-[#6B665F] font-medium">
                                  Select Your Bank
                                </label>
                                <select
                                  value={selectedBank}
                                  onChange={(e) => setSelectedBank(e.target.value)}
                                  className="w-full sm:w-80 bg-white rounded-xl border border-[#D9D0C2] px-3.5 py-2.5 text-xs text-[#171717]"
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
                              <div className="px-5 pb-5 pt-3 border-t border-[#E8E1D5] mt-1 space-y-2">
                                <label className="block font-nav text-[11px] uppercase tracking-[0.14em] text-[#6B665F] font-medium">
                                  Select Digital Wallet
                                </label>
                                <select
                                  value={selectedWallet}
                                  onChange={(e) => setSelectedWallet(e.target.value)}
                                  className="w-full sm:w-80 bg-white rounded-xl border border-[#D9D0C2] px-3.5 py-2.5 text-xs text-[#171717]"
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

                    {/* Step 4 Actions */}
                    <div className="pt-4 border-t border-[#E8E1D5] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 sm:py-3.5 rounded-full border border-[#D9D0C2] text-xs font-nav uppercase tracking-[0.14em] text-[#171717] hover:border-[#171717] transition-all"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back</span>
                      </button>

                      <button
                        type="button"
                        disabled={submitting}
                        onClick={handlePlaceOrder}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-[#171717] hover:bg-[#0B0B0B] disabled:bg-[#85817B] text-white text-xs uppercase tracking-[0.18em] font-semibold transition-all shadow-md hover:shadow-lg"
                      >
                        {submitting ? (
                          <span>Processing Order...</span>
                        ) : (
                          <span>PLACE ORDER — {formatINR(liveTotals.total)}</span>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* RIGHT / BALANCED ORDER SUMMARY CARD (5 Cols) */}
            <aside className="lg:col-span-5 sticky top-28 self-start space-y-6">
              <div className="bg-white rounded-3xl border border-[#E8E1D5] p-6 sm:p-7 shadow-[0_16px_40px_rgba(23,23,23,0.04)] space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#E8E1D5]">
                  <h3 className="font-editorial text-2xl text-[#171717]">Order Summary</h3>
                  <span className="font-mono text-xs text-[#85817B] tabular-nums">
                    {cart.length} {cart.length === 1 ? 'Piece' : 'Pieces'}
                  </span>
                </div>

                {/* Product Thumbnail List */}
                <ul className="divide-y divide-[#E8E1D5] max-h-72 overflow-y-auto pr-1 space-y-1">
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
                          className="w-12 h-16 object-cover rounded-xl bg-[#FAF8F5] border border-[#E8E1D5] shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-nav text-[9px] uppercase tracking-[0.16em] text-[#C5A46D] truncate font-medium">
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

                {/* Coupon Code Entry */}
                <div className="pt-4 border-t border-[#E8E1D5] space-y-2">
                  <span className="font-nav text-[10px] uppercase tracking-[0.16em] text-[#85817B] font-medium block">
                    Privilege / Coupon Code
                  </span>

                  {appliedCouponCode ? (
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF7F0] border border-[#C5A46D]/60 text-xs">
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
                        className="flex-1 bg-[#FAF8F5] rounded-xl border border-[#D9D0C2] px-3.5 py-2.5 text-xs uppercase font-mono text-[#171717] focus:bg-white focus:border-[#171717] focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-[#171717] hover:bg-[#0B0B0B] text-white text-xs font-nav uppercase tracking-[0.14em] font-medium transition-colors"
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

                {/* Financial Ledger */}
                <dl className="space-y-2.5 pt-4 border-t border-[#E8E1D5] text-xs tabular-nums text-[#55524E]">
                  <div className="flex justify-between">
                    <dt className="text-[#85817B]">Product Subtotal</dt>
                    <dd>{formatINR(liveTotals.subtotal)}</dd>
                  </div>
                  {liveTotals.productSavings > 0 && (
                    <div className="flex justify-between text-[#2D6A4F]">
                      <dt>Catalog Savings</dt>
                      <dd>−{formatINR(liveTotals.productSavings)}</dd>
                    </div>
                  )}
                  {liveTotals.couponDiscount > 0 && (
                    <div className="flex justify-between text-[#9A7A45] font-medium">
                      <dt>Privilege Discount ({appliedCouponCode})</dt>
                      <dd>−{formatINR(liveTotals.couponDiscount)}</dd>
                    </div>
                  )}
                  {liveTotals.codFee > 0 && (
                    <div className="flex justify-between">
                      <dt className="text-[#85817B]">Cash on Delivery Fee</dt>
                      <dd>{formatINR(liveTotals.codFee)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between text-[11px] text-[#85817B] pt-1">
                    <dt>Taxable Value + GST</dt>
                    <dd>
                      {formatINR(liveTotals.taxableValue)} + {formatINR(liveTotals.gstAmount)}
                    </dd>
                  </div>
                  <div className="pt-3 border-t border-[#E8E1D5] flex justify-between text-base font-semibold text-[#171717]">
                    <dt>Final Payable Total</dt>
                    <dd className="text-[#171717]">{formatINR(liveTotals.total)}</dd>
                  </div>
                  <p className="text-[11px] text-[#85817B] pt-1 leading-relaxed">
                    Delivery is included in the product price.
                  </p>
                </dl>
              </div>

              {/* Luxury Assurances Bubble */}
              <div className="bg-[#FAF8F5] rounded-3xl border border-[#E8E1D5] p-5 space-y-3 text-xs text-[#55524E]">
                <p className="font-nav text-[10px] uppercase tracking-[0.2em] text-[#C5A46D] font-medium">
                  The AKSHARA Promise
                </p>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#C5A46D] shrink-0 mt-0.5" strokeWidth={1.5} />
                    <span>Direct atelier authenticity guaranteed with serialized tracking.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Truck className="w-4 h-4 text-[#C5A46D] shrink-0 mt-0.5" strokeWidth={1.5} />
                    <span>Insured Pan-India transit included on all orders.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <RotateCcw className="w-4 h-4 text-[#C5A46D] shrink-0 mt-0.5" strokeWidth={1.5} />
                    <span>Complimentary 15-day return privilege with doorstep pickup.</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </main>
      )}
    </div>
  );
}
