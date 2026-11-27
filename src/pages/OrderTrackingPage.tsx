import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Check,
  Copy,
  MapPin,
  Package,
  RotateCcw,
  Search,
  Truck,
} from 'lucide-react';
import { useCommerce } from '../store/CommerceContext';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import {
  formatINR,
  getOrderProgressInfo,
  lookupGuestOrder,
  ORDER_FULFILLMENT_STAGES,
} from '../utils/commerceLogic';
import type { Order } from '../types/commerce';

const DELIVERY_METHOD_LABELS: Record<Order['deliveryMethod'], string> = {
  standard: 'Standard Insured Courier',
  express: 'Express Air Courier',
  priority: 'Priority White-Glove Delivery',
};

export function OrderTrackingPage() {
  const { orders, pushToast } = useCommerce();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialOrderParam = searchParams.get('order') ?? '';
  const initialEmailParam = searchParams.get('email') ?? '';

  const [orderIdInput, setOrderIdInput] = useState(initialOrderParam);
  const [emailInput, setEmailInput] = useState(initialEmailParam);
  const [trackedOrderId, setTrackedOrderId] = useState<string | null>(() => {
    if (initialOrderParam && initialEmailParam) {
      const res = lookupGuestOrder(orders, initialOrderParam, initialEmailParam);
      return res.ok && res.order ? res.order.id : null;
    }
    return null;
  });
  const [errorField, setErrorField] = useState<'orderId' | 'email' | 'lookup' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedAwb, setCopiedAwb] = useState(false);

  useDocumentMeta({
    title: 'Track Your Order',
    description:
      'Enter your AKSHARA LIFESTYLE order ID and checkout email to view real-time shipment status, courier milestones, and delivery estimates.',
  });

  // Keep deep-linked query parameters synchronized if navigated while mounted
  useEffect(() => {
    const qOrder = searchParams.get('order');
    const qEmail = searchParams.get('email');
    if (qOrder && qEmail) {
      setOrderIdInput(qOrder);
      setEmailInput(qEmail);
      const res = lookupGuestOrder(orders, qOrder, qEmail);
      if (res.ok && res.order) {
        setTrackedOrderId(res.order.id);
        setErrorField(null);
        setErrorMessage('');
      }
    }
  }, [searchParams, orders]);

  // Always read the live order object from context so Admin status updates appear immediately
  const trackedOrder = useMemo(
    () => (trackedOrderId ? orders.find((o) => o.id === trackedOrderId) ?? null : null),
    [orders, trackedOrderId],
  );

  const sampleOrders = useMemo(() => orders.slice(0, 2), [orders]);

  const executeLookup = (rawOrderId: string, rawEmail: string) => {
    const res = lookupGuestOrder(orders, rawOrderId, rawEmail);
    if (!res.ok || !res.order) {
      setTrackedOrderId(null);
      setErrorField(res.field ?? 'lookup');
      setErrorMessage(res.error ?? 'Unable to locate your order.');
      return;
    }

    setErrorField(null);
    setErrorMessage('');
    setTrackedOrderId(res.order.id);
    setSearchParams(
      { order: res.order.orderNumber, email: res.order.customerEmail },
      { replace: true },
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeLookup(orderIdInput, emailInput);
  };

  const handleReset = () => {
    setTrackedOrderId(null);
    setOrderIdInput('');
    setEmailInput('');
    setErrorField(null);
    setErrorMessage('');
    setSearchParams({}, { replace: true });
  };

  const handleCopyAwb = async (awb: string) => {
    try {
      await navigator.clipboard.writeText(awb);
      setCopiedAwb(true);
      pushToast('AWB number copied', `${awb} copied to clipboard.`, 'success');
      window.setTimeout(() => setCopiedAwb(false), 2400);
    } catch {
      pushToast('AWB Tracking Number', awb);
    }
  };

  const progress = trackedOrder ? getOrderProgressInfo(trackedOrder.status) : null;
  const reverseEvents = trackedOrder ? [...trackedOrder.shipment.events].reverse() : [];

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 py-10 lg:py-16">
      {/* Page Header */}
      <div className="max-w-2xl space-y-3">
        <p className="text-[11px] uppercase tracking-[0.24em] text-[#C5A46D] font-medium">
          Guest Shipment Lookup
        </p>
        <h1 className="font-editorial text-4xl sm:text-5xl text-[#171717] font-light tracking-[0.01em]">
          Track Your Order
        </h1>
        <p className="text-sm text-[#635F5A] leading-relaxed">
          Enter the Order ID from your confirmation email along with your email address to check your current dispatch milestone, courier details, and estimated delivery window.
        </p>
      </div>

      {/* Lookup Form Card */}
      <section
        aria-label="Order lookup form"
        className="mt-8 bg-white border border-[#E9E1D5] p-6 sm:p-8"
      >
        <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-5">
            <label
              htmlFor="track-order-id"
              className="block text-[11px] uppercase tracking-[0.16em] text-[#635F5A] font-medium mb-2"
            >
              Order ID
            </label>
            <input
              id="track-order-id"
              name="orderId"
              type="text"
              autoComplete="off"
              value={orderIdInput}
              onChange={(e) => {
                setOrderIdInput(e.target.value);
                if (errorMessage) {
                  setErrorMessage('');
                  setErrorField(null);
                }
              }}
              placeholder="e.g. AKS-2611-1002"
              aria-invalid={errorField === 'orderId' || errorField === 'lookup'}
              aria-describedby={errorMessage ? 'track-order-error' : undefined}
              className="w-full bg-[#FBF9F5] border border-[#DDD4C6] px-4 py-3 text-sm text-[#171717] font-mono placeholder:font-sans placeholder:text-[#85817B] focus:border-[#171717] focus:bg-white focus:outline-none transition-colors"
            />
          </div>

          <div className="md:col-span-5">
            <label
              htmlFor="track-order-email"
              className="block text-[11px] uppercase tracking-[0.16em] text-[#635F5A] font-medium mb-2"
            >
              Email Address
            </label>
            <input
              id="track-order-email"
              name="email"
              type="email"
              autoComplete="email"
              value={emailInput}
              onChange={(e) => {
                setEmailInput(e.target.value);
                if (errorMessage) {
                  setErrorMessage('');
                  setErrorField(null);
                }
              }}
              placeholder="name@example.com"
              aria-invalid={errorField === 'email' || errorField === 'lookup'}
              aria-describedby={errorMessage ? 'track-order-error' : undefined}
              className="w-full bg-[#FBF9F5] border border-[#DDD4C6] px-4 py-3 text-sm text-[#171717] placeholder:text-[#85817B] focus:border-[#171717] focus:bg-white focus:outline-none transition-colors"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full py-3.5 px-5 bg-[#171717] hover:bg-[#0B0B0B] text-[#F7F4EE] text-xs uppercase tracking-[0.16em] font-medium inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-[#C5A46D]" strokeWidth={1.6} aria-hidden="true" />
              Track Order
            </button>
          </div>
        </form>

        {errorMessage && (
          <div
            id="track-order-error"
            role="alert"
            className="mt-4 flex items-start gap-2.5 px-4 py-3 bg-[#FDF4F4] border border-[#EBCBCB] text-xs text-[#8E2A2A]"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.6} aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Quick sample order preview links for effortless guest testing */}
        {sampleOrders.length > 0 && (
          <div className="mt-5 pt-4 border-t border-[#EFEAE1] flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#85817B]">
            <span className="uppercase tracking-[0.14em] text-[10px] text-[#635F5A]">
              Demo Orders:
            </span>
            {sampleOrders.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => {
                  setOrderIdInput(sample.orderNumber);
                  setEmailInput(sample.customerEmail);
                  executeLookup(sample.orderNumber, sample.customerEmail);
                }}
                className="text-[#171717] hover:text-[#9A7A45] underline underline-offset-4 transition-colors cursor-pointer"
              >
                <span className="font-mono">{sample.orderNumber}</span>{' '}
                <span className="text-[#85817B]">
                  ({sample.status.replace(/_/g, ' ')})
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Shipment Status Results */}
      {trackedOrder && progress && (
        <section
          aria-labelledby="shipment-status-heading"
          className="mt-8 space-y-6"
        >
          {/* Summary Banner + 5-Stage Fulfillment Progress */}
          <div className="bg-white border border-[#E9E1D5] p-6 sm:p-8 space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-[#E9E1D5]">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-[#9A7A45] font-semibold">
                    <Truck className="w-3.5 h-3.5" strokeWidth={1.6} aria-hidden="true" />
                    {progress.label}
                  </span>
                  {trackedOrder.isDemoOrder && (
                    <span className="text-[10px] uppercase tracking-[0.14em] text-[#85817B] border border-[#E9E1D5] px-2 py-0.5">
                      Demo Shipment
                    </span>
                  )}
                </div>

                <h2
                  id="shipment-status-heading"
                  className="font-editorial text-3xl text-[#171717]"
                >
                  Order <span className="font-mono text-2xl sm:text-[26px]">{trackedOrder.orderNumber}</span>
                </h2>
                <p className="text-sm text-[#635F5A] max-w-2xl">{progress.summary}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-x-8 gap-y-3 text-xs shrink-0 bg-[#FBF9F5] border border-[#EFEAE1] p-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#85817B]">
                    {trackedOrder.status === 'delivered' ? 'Delivered' : 'Estimated Delivery'}
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#171717]">
                    {trackedOrder.shipment.estimatedDelivery}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#85817B]">
                    Order Date
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#171717]">
                    {new Date(trackedOrder.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="col-span-2 sm:col-span-1 lg:col-span-2 pt-2 border-t border-[#EAE2D6]">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#85817B]">
                    Courier &amp; AWB
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="text-[#171717] font-medium">
                      {trackedOrder.shipment.carrier}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyAwb(trackedOrder.shipment.awbNumber)}
                      aria-label={`Copy AWB tracking number ${trackedOrder.shipment.awbNumber}`}
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white border border-[#DDD4C6] hover:border-[#171717] font-mono text-[11px] text-[#171717] transition-colors cursor-pointer"
                    >
                      {trackedOrder.shipment.awbNumber}
                      {copiedAwb ? (
                        <Check className="w-3 h-3 text-[#9A7A45]" strokeWidth={1.8} aria-hidden="true" />
                      ) : (
                        <Copy className="w-3 h-3 text-[#85817B]" strokeWidth={1.6} aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 5-Stage Visual Fulfillment Stepper */}
            {trackedOrder.status === 'cancelled' ? (
              <div className="px-4 py-3.5 bg-[#FDF4F4] border border-[#EBCBCB] text-sm text-[#8E2A2A] flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={1.6} aria-hidden="true" />
                <span>
                  This order was cancelled. If payment was captured, refunds are processed back to the original payment method within 5–7 business days.
                </span>
              </div>
            ) : (
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#85817B] mb-5">
                  Fulfillment Progress
                </p>
                <ol
                  aria-label="Shipment milestones"
                  className="grid grid-cols-1 sm:grid-cols-5 gap-4 sm:gap-2"
                >
                  {ORDER_FULFILLMENT_STAGES.map((stage, idx) => {
                    const completed = idx < progress.activeStageIndex;
                    const current = idx === progress.activeStageIndex;
                    const active = completed || current;
                    return (
                      <li
                        key={stage.key}
                        aria-current={current ? 'step' : undefined}
                        className="relative flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2.5"
                      >
                        {/* Horizontal connector on sm+ */}
                        {idx < ORDER_FULFILLMENT_STAGES.length - 1 && (
                          <div
                            aria-hidden="true"
                            className={`hidden sm:block absolute top-3.5 left-7 right-0 h-[1.5px] ${
                              idx < progress.activeStageIndex ? 'bg-[#C5A46D]' : 'bg-[#E9E1D5]'
                            }`}
                          />
                        )}
                        <span
                          className={`relative z-10 w-7 h-7 shrink-0 flex items-center justify-center text-xs font-medium border transition-colors ${
                            completed
                              ? 'bg-[#171717] border-[#171717] text-[#C5A46D]'
                              : current
                                ? 'bg-[#C5A46D] border-[#C5A46D] text-[#0B0B0B]'
                                : 'bg-white border-[#D9D0C2] text-[#85817B]'
                          }`}
                        >
                          {completed ? (
                            <Check className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
                          ) : (
                            idx + 1
                          )}
                        </span>
                        <div className="min-w-0">
                          <p
                            className={`text-xs tracking-[0.04em] ${
                              active ? 'text-[#171717] font-medium' : 'text-[#85817B]'
                            }`}
                          >
                            {stage.label}
                          </p>
                          {current && (
                            <p className="text-[10px] uppercase tracking-[0.14em] text-[#9A7A45] mt-0.5">
                              Current Stage
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>

                {trackedOrder.status === 'return_requested' && (
                  <div className="mt-6 px-4 py-3 bg-[#FBF7EE] border border-[#E4D5B7] text-xs text-[#6E5322] flex items-center gap-2.5">
                    <RotateCcw className="w-4 h-4 shrink-0" strokeWidth={1.6} aria-hidden="true" />
                    <span>
                      Return or exchange request is currently under review by our Client Care team.
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Two-Column Detail Grid: Timeline & Order Contents */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Shipment Activity Timeline */}
            <div className="lg:col-span-7 bg-white border border-[#E9E1D5] p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#E9E1D5]">
                <h3 className="font-editorial text-2xl text-[#171717]">Shipment Activity</h3>
                <span className="text-xs text-[#85817B]">
                  {reverseEvents.length} {reverseEvents.length === 1 ? 'update' : 'updates'}
                </span>
              </div>

              {reverseEvents.length === 0 ? (
                <p className="mt-6 text-sm text-[#85817B]">
                  Courier scan updates will appear here once the parcel is handed over to the carrier.
                </p>
              ) : (
                <ol className="mt-6 space-y-6">
                  {reverseEvents.map((event, idx) => {
                    const isLatest = idx === 0;
                    return (
                      <li key={`${event.timestamp}-${idx}`} className="relative pl-7">
                        {idx < reverseEvents.length - 1 && (
                          <span
                            aria-hidden="true"
                            className="absolute left-[7px] top-4 -bottom-6 w-px bg-[#E9E1D5]"
                          />
                        )}
                        <span
                          aria-hidden="true"
                          className={`absolute left-0 top-1.5 w-[15px] h-[15px] border-2 ${
                            isLatest
                              ? 'bg-[#C5A46D] border-[#171717]'
                              : 'bg-white border-[#C9C1B4]'
                          }`}
                        />
                        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                          <p
                            className={`text-sm ${
                              isLatest ? 'font-semibold text-[#171717]' : 'font-medium text-[#44423F]'
                            }`}
                          >
                            {event.status}
                          </p>
                          <p className="text-xs text-[#85817B] tabular-nums">{event.timestamp}</p>
                        </div>
                        <p className="mt-0.5 text-xs text-[#635F5A] inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#C5A46D]" strokeWidth={1.6} aria-hidden="true" />
                          {event.location}
                        </p>
                        {event.note && (
                          <p className="mt-1 text-xs text-[#85817B] leading-relaxed">
                            {event.note}
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>

            {/* Delivery Destination & Items in Parcel */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-[#E9E1D5] p-6 space-y-4">
                <h3 className="text-[11px] uppercase tracking-[0.2em] text-[#9A7A45] font-medium">
                  Delivery Destination
                </h3>
                <div className="text-sm text-[#171717] space-y-1">
                  <p className="font-medium">{trackedOrder.shippingAddress.fullName}</p>
                  <p className="text-[#635F5A]">
                    {trackedOrder.shippingAddress.city}, {trackedOrder.shippingAddress.state} —{' '}
                    <span className="font-mono">{trackedOrder.shippingAddress.pincode}</span>
                  </p>
                  <p className="text-xs text-[#85817B] pt-1">
                    {DELIVERY_METHOD_LABELS[trackedOrder.deliveryMethod]}
                  </p>
                </div>
              </div>

              <div className="bg-white border border-[#E9E1D5] p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E9E1D5]">
                  <h3 className="text-[11px] uppercase tracking-[0.2em] text-[#9A7A45] font-medium inline-flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" strokeWidth={1.6} aria-hidden="true" />
                    Items in Shipment ({trackedOrder.items.reduce((sum, i) => sum + i.quantity, 0)})
                  </h3>
                  <span className="text-sm font-semibold text-[#171717] tabular-nums">
                    {formatINR(trackedOrder.total)}
                  </span>
                </div>

                <ul className="divide-y divide-[#F0EAE0]">
                  {trackedOrder.items.map((item) => (
                    <li key={item.sku} className="py-3 first:pt-0 last:pb-0 flex gap-3.5 items-center">
                      <Link
                        to={`/product/${item.productSlug}`}
                        className="w-14 h-16 shrink-0 bg-[#F7F4EE] border border-[#E9E1D5] overflow-hidden"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/product/${item.productSlug}`}
                          className="text-sm font-medium text-[#171717] hover:text-[#9A7A45] line-clamp-1 transition-colors"
                        >
                          {item.name}
                        </Link>
                        <p className="text-xs text-[#85817B] mt-0.5">
                          {item.colorName}
                          {item.size ? ` · ${item.size}` : ''} · Qty {item.quantity}
                        </p>
                      </div>
                      <p className="text-xs font-medium text-[#171717] tabular-nums shrink-0">
                        {formatINR(item.unitPrice * item.quantity)}
                      </p>
                    </li>
                  ))}
                </ul>

                <div className="pt-4 border-t border-[#E9E1D5] flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-xs uppercase tracking-[0.14em] text-[#635F5A] hover:text-[#171717] underline underline-offset-4 transition-colors cursor-pointer"
                  >
                    Track another order
                  </button>
                  <Link
                    to="/account"
                    className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-[#171717] hover:text-[#9A7A45] font-medium transition-colors"
                  >
                    Manage in Account
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.6} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Helpful Concierge Footer Note when no order is loaded yet */}
      {!trackedOrder && (
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white border border-[#E9E1D5] p-5 space-y-1.5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#C5A46D] font-medium">
              Where to find your Order ID
            </p>
            <p className="text-xs text-[#635F5A] leading-relaxed">
              Your Order ID (formatted as <span className="font-mono text-[#171717]">AKS-XXXX-XXXX</span>) appears on your checkout confirmation screen and GST order receipt.
            </p>
          </div>
          <div className="bg-white border border-[#E9E1D5] p-5 space-y-1.5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#C5A46D] font-medium">
              Pan-India Insured Dispatch
            </p>
            <p className="text-xs text-[#635F5A] leading-relaxed">
              Orders dispatch within 24 hours from our Mumbai hub via tamper-evident insured couriers with live milestone scans.
            </p>
          </div>
          <div className="bg-white border border-[#E9E1D5] p-5 space-y-1.5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#C5A46D] font-medium">
              Need Concierge Assistance?
            </p>
            <p className="text-xs text-[#635F5A] leading-relaxed">
              Reach our Mumbai client desk at{' '}
              <a
                href="mailto:concierge@aksharalifestyle.in"
                className="text-[#171717] underline underline-offset-2"
              >
                concierge@aksharalifestyle.in
              </a>{' '}
              for delivery updates or address changes prior to dispatch.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
