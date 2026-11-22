import type { Order, PaymentMethodId, PincodeServiceability, Product } from '../types/commerce';
import { checkPincodeServiceability } from '../utils/commerceLogic';

/**
 * Production Backend & Third-Party Integration Interfaces
 *
 * When environment credentials are absent, AKSHARA LIFESTYLE runs in a clearly
 * labelled local Demo Mode with browser-persisted state. Swap these adapters
 * with live Firebase/Supabase, Razorpay, Shiprocket, Resend, and MSG91 clients
 * once production environment variables are provisioned on the backend.
 */

export interface BackendProviderConfig {
  mode: 'demo' | 'live';
  databaseProvider: 'local-demo' | 'firebase' | 'supabase';
  paymentGateway: 'razorpay-demo' | 'razorpay-live';
  shippingProvider: 'demo-estimator' | 'shiprocket' | 'delhivery';
  emailProvider: 'demo-log' | 'resend' | 'sendgrid';
  smsOtpProvider: 'demo-log' | 'msg91' | 'twilio';
  analyticsProvider: 'demo-local' | 'ga4';
}

export interface PaymentIntentResult {
  mode: 'DEMO' | 'LIVE';
  provider: 'razorpay_demo' | 'cod_demo';
  referenceId: string;
  status: 'demo_authorized' | 'cod_pending';
  notice: string;
}

export interface PaymentGatewayAdapter {
  createCheckoutOrder(params: {
    amountInr: number;
    method: PaymentMethodId;
    customerEmail: string;
    customerPhone: string;
  }): Promise<PaymentIntentResult>;
}

export interface ShippingProviderAdapter {
  checkServiceability(pincode: string, codEligible: boolean): Promise<PincodeServiceability>;
  generateDemoAwb(orderNumber: string): { carrier: string; awbNumber: string };
}

export interface NotificationAdapter {
  sendOrderConfirmation(order: Order): Promise<{ delivered: boolean; mode: 'DEMO' | 'LIVE' }>;
  sendOtp(phone: string): Promise<{ sent: boolean; mode: 'DEMO' | 'LIVE' }>;
}

export interface CatalogRepository {
  providerName: string;
  listProducts(): Promise<Product[]>;
}

export function getActiveIntegrationStatus(): BackendProviderConfig {
  const hasFirebase = Boolean(import.meta.env.VITE_FIREBASE_PROJECT_ID);
  const hasSupabase = Boolean(import.meta.env.VITE_SUPABASE_URL);
  const hasRazorpay = Boolean(import.meta.env.VITE_RAZORPAY_KEY_ID);

  return {
    mode: hasFirebase || hasSupabase ? 'live' : 'demo',
    databaseProvider: hasFirebase
      ? 'firebase'
      : hasSupabase
        ? 'supabase'
        : 'local-demo',
    paymentGateway: hasRazorpay ? 'razorpay-live' : 'razorpay-demo',
    shippingProvider: 'demo-estimator',
    emailProvider: 'demo-log',
    smsOtpProvider: 'demo-log',
    analyticsProvider: import.meta.env.VITE_GA_MEASUREMENT_ID ? 'ga4' : 'demo-local',
  };
}

/**
 * Clearly labelled Demo Payment Adapter. Never pretends to process real bank transactions.
 */
export const paymentGatewayAdapter: PaymentGatewayAdapter = {
  async createCheckoutOrder({ method }) {
    const suffix = Math.floor(100000 + Math.random() * 900000);
    if (method === 'cod') {
      return {
        mode: 'DEMO',
        provider: 'cod_demo',
        referenceId: `DEMO-COD-${suffix}`,
        status: 'cod_pending',
        notice:
          'Demo Checkout Order recorded locally. No real Cash on Delivery dispatch has been scheduled.',
      };
    }

    return {
      mode: 'DEMO',
      provider: 'razorpay_demo',
      referenceId: `DEMO-RZP-${method.toUpperCase()}-${suffix}`,
      status: 'demo_authorized',
      notice:
        'Demo Payment Simulation only. Configure server-side Razorpay keys to accept live Indian UPI, Card, Net Banking, or Wallet payments.',
    };
  },
};

export const shippingProviderAdapter: ShippingProviderAdapter = {
  async checkServiceability(pincode, codEligible) {
    return checkPincodeServiceability(pincode, codEligible);
  },
  generateDemoAwb(orderNumber) {
    const numeric = orderNumber.replace(/\D/g, '').slice(-6) || '104200';
    return {
      carrier: 'BlueDart Priority (Demo Logistics)',
      awbNumber: `BD${numeric}IN`,
    };
  },
};

export const notificationAdapter: NotificationAdapter = {
  async sendOrderConfirmation() {
    return { delivered: false, mode: 'DEMO' };
  },
  async sendOtp() {
    return { sent: false, mode: 'DEMO' };
  },
};
