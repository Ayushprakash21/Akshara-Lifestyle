import type { PaymentMethodId } from '../types/commerce';

/**
 * Payment Service Abstraction for AKSHARA LIFESTYLE
 *
 * Designed for modular deferred integration with Razorpay.
 * In this phase:
 * - PAYMENTS_ENABLED remains false by default.
 * - Checkout never attempts real financial transactions.
 * - Transactions are clearly categorized as 'DEMO' or 'UNPAID / COD_PENDING'.
 * - No server-side Razorpay secrets are ever exposed in client code.
 */

export interface RazorpayOrderOptions {
  amount: number; // in paise (e.g. 10000 = ₹100.00)
  currency: 'INR';
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayPaymentSuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id: string;
  handler: (response: RazorpayPaymentSuccessResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

export interface PaymentIntentResult {
  mode: 'DEMO' | 'LIVE';
  provider: 'razorpay_demo' | 'cod_demo' | 'razorpay_live';
  referenceId: string;
  status: 'demo_authorized' | 'cod_pending' | 'pending' | 'unpaid';
  notice: string;
  amount: number;
  method: PaymentMethodId;
}

export interface PaymentService {
  isPaymentsEnabled: () => boolean;
  createPaymentIntent: (params: {
    amountInr: number;
    method: PaymentMethodId;
    customerEmail: string;
    customerPhone: string;
    orderNumber?: string;
  }) => Promise<PaymentIntentResult>;
  verifyPaymentSignature?: (response: RazorpayPaymentSuccessResponse) => Promise<boolean>;
}

export function isPaymentsEnabled(): boolean {
  // PAYMENTS_ENABLED flag - defaults to false until production backend server is deployed
  return import.meta.env.PAYMENTS_ENABLED === 'true';
}

/**
 * Modular payment service instance
 */
export const paymentService: PaymentService = {
  isPaymentsEnabled,

  async createPaymentIntent({ amountInr, method, customerEmail, customerPhone, orderNumber }) {
    const paymentsActive = isPaymentsEnabled();
    const suffix = Math.floor(100000 + Math.random() * 900000);

    // 1. Cash on Delivery (COD)
    if (method === 'cod') {
      return {
        mode: 'DEMO',
        provider: 'cod_demo',
        referenceId: `COD-${suffix}`,
        status: 'cod_pending',
        amount: amountInr,
        method: 'cod',
        notice: 'Order placed with Cash on Delivery. Payment will be collected upon parcel handover.',
      };
    }

    // 2. When payments are deferred / disabled (current stage)
    if (!paymentsActive) {
      return {
        mode: 'DEMO',
        provider: 'razorpay_demo',
        referenceId: `DEMO-PAY-${method.toUpperCase()}-${suffix}`,
        status: 'demo_authorized',
        amount: amountInr,
        method,
        notice:
          'Payment Gateway Deferred: Order registered in Demo Verification mode. Live Razorpay integration will activate when backend payment keys are provisioned.',
      };
    }

    // 3. Future live Razorpay integration handler (staged)
    return {
      mode: 'LIVE',
      provider: 'razorpay_live',
      referenceId: `RZP-PENDING-${suffix}`,
      status: 'pending',
      amount: amountInr,
      method,
      notice: 'Awaiting Razorpay gateway confirmation.',
    };
  },
};
